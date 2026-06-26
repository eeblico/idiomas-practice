const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Load environment variables (support local .env file if present)
const dotenvPath = path.resolve(process.cwd(), '.env');
if (fs.existsSync(dotenvPath)) {
  const envConfig = fs.readFileSync(dotenvPath, 'utf-8');
  envConfig.split('\n').forEach(line => {
    const parts = line.split('=');
    if (parts.length === 2) {
      process.env[parts[0].trim()] = parts[1].trim();
    }
  });
}

const SUPABASE_URL = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL || 'https://placeholder.supabase.co';
// Use Service Role key on the server to bypass RLS policies and update catalog data
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY || 'placeholder-key';
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

// Tiny valid 44-byte WAV header in base64 to serve as a mock silent audio file
const MOCK_WAV_BASE64 = 'UklGRigAAABXQVZFZm10IBIAAAABAAEARKwAAIhYAQACABAAAABkYXRhAAAAAA==';

async function processQueueItem(item) {
  console.log(`\n[Queue Worker] Processing item ${item.id} for text: "${item.text}"`);
  
  // 1. Update status to processing
  await supabase
    .from('audio_generation_queue')
    .update({ status: 'processing', error_log: null })
    .eq('id', item.id);

  try {
    let audioBuffer;
    let fileName = `audio_${item.phrase_id}.wav`;

    if (GEMINI_API_KEY && GEMINI_API_KEY !== 'sua-chave-aqui') {
      console.log(`[Gemini API] Generating speech using voice "${item.voice_name}" and speed ${item.speed}x...`);
      
      const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`;
      
      const prompt = `Say the following sentence exactly as it is written, with natural pronunciation and appropriate intonation: "${item.text}"`;
      
      const response = await fetch(geminiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [
            {
              parts: [{ text: prompt }]
            }
          ],
          generationConfig: {
            responseModalities: ["AUDIO"],
            speechConfig: {
              voiceConfig: {
                prebuiltVoiceConfig: {
                  voiceName: item.voice_name // Puck, Fenrir, Kore, Aoede, Charon
                }
              }
            }
          }
        })
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Gemini API returned status ${response.status}: ${errorText}`);
      }

      const responseData = await response.json();
      
      // Extract base64 bytes from candidates[0].content.parts[0].inlineData.data
      const part = responseData.candidates?.[0]?.content?.parts?.[0];
      if (part && part.inlineData && part.inlineData.data) {
        const base64Data = part.inlineData.data;
        audioBuffer = Buffer.from(base64Data, 'base64');
        console.log(`[Gemini API] Successfully generated audio (${audioBuffer.length} bytes)`);
      } else {
        throw new Error('Gemini API response did not contain inline audio data. Verify prompt parameters.');
      }
    } else {
      console.warn('[Warning] GEMINI_API_KEY not configured. Using mock silent audio WAV buffer.');
      audioBuffer = Buffer.from(MOCK_WAV_BASE64, 'base64');
    }

    // 2. Upload WAV buffer to Supabase Storage
    console.log(`[Supabase Storage] Uploading ${fileName} to bucket 'phrase-audios'...`);
    const { data: uploadData, error: uploadErr } = await supabase.storage
      .from('phrase-audios')
      .upload(fileName, audioBuffer, {
        contentType: 'audio/wav',
        upsert: true
      });

    if (uploadErr) {
      // If bucket doesn't exist, log instructions to create it
      if (uploadErr.message?.includes('not found') || uploadErr.message?.includes('Bucket')) {
        throw new Error(`Supabase Bucket 'phrase-audios' not found. Please create a public bucket named 'phrase-audios' in your Supabase dashboard.`);
      }
      throw uploadErr;
    }

    const publicPath = uploadData.path; // usually matches fileName

    // 3. Update phrase's audio_url
    console.log(`[Supabase Database] Linking audio path to phrase ${item.phrase_id}...`);
    const { error: dbErr } = await supabase
      .from('phrases')
      .update({ audio_url: publicPath })
      .eq('id', item.phrase_id);

    if (dbErr) throw dbErr;

    // 4. Mark queue item as completed
    await supabase
      .from('audio_generation_queue')
      .update({ status: 'completed', error_log: null })
      .eq('id', item.id);

    console.log(`[Queue Worker] Successfully processed phrase ${item.phrase_id}`);

  } catch (err) {
    console.error(`[Queue Worker Error] Failed to process queue item:`, err.message);
    
    // Mark queue item as failed with error log details
    await supabase
      .from('audio_generation_queue')
      .update({ 
        status: 'failed', 
        error_log: err.message || String(err) 
      })
      .eq('id', item.id);
  }
}

async function runWorker() {
  console.log('==================================================');
  console.log('HyperLingua IA Audio Queue Worker is running...');
  console.log(`Supabase URL: ${SUPABASE_URL}`);
  console.log(`Gemini Key Status: ${GEMINI_API_KEY ? 'CONFIGURED' : 'MOCK MODE (No Key)'}`);
  console.log('Polling public.audio_generation_queue every 5s...');
  console.log('==================================================');

  // Continuously poll the queue
  while (true) {
    try {
      const { data: pendingItems, error } = await supabase
        .from('audio_generation_queue')
        .select('*')
        .eq('status', 'pending')
        .order('created_at', { ascending: true })
        .limit(1);

      if (error) {
        console.error('[Database Error] Failed to check queue:', error.message);
      } else if (pendingItems && pendingItems.length > 0) {
        // Process next item in line
        await processQueueItem(pendingItems[0]);
      }
    } catch (e) {
      console.error('[Worker Error] Loop encountered an exception:', e);
    }
    
    // Wait for 5 seconds before checking again
    await new Promise(resolve => setTimeout(resolve, 5000));
  }
}

// Start processing loop
runWorker();
