// Configuration Constants
const AVAILABLE_VOICES = [
  { id: 'Puck', name: 'Puck (Padrão - Balanceado)', gender: 'Neutro' },
  { id: 'Charon', name: 'Charon (Masculino Profundo)', gender: 'Masculino' },
  { id: 'Kore', name: 'Kore (Feminino Claro)', gender: 'Feminino' },
  { id: 'Fenrir', name: 'Fenrir (Masculino Robusto)', gender: 'Masculino' },
  { id: 'Aoede', name: 'Aoede (Feminino Expressivo)', gender: 'Feminino' },
  { id: 'Leda', name: 'Leda (Feminino Suave)', gender: 'Feminino' },
  { id: 'Orus', name: 'Orus (Masculino Articulado)', gender: 'Masculino' },
  { id: 'Zephyr', name: 'Zephyr (Leve / Soprado)', gender: 'Feminino' },
  { id: 'Iapetus', name: 'Iapetus (Expressivo)', gender: 'Masculino' },
  { id: 'Umbriel', name: 'Umbriel', gender: 'Feminino' },
  { id: 'Algieba', name: 'Algieba', gender: 'Masculino' },
  { id: 'Despina', name: 'Despina', gender: 'Feminino' }
];

const TONE_PRESETS = [
  { id: 'default', name: 'Normal / Natural', enDesc: 'Speak clearly and naturally at normal speed. English accent.', esDesc: 'Habla de forma clara y natural a velocidad normal. Acento español.' },
  { id: 'calm', name: 'Mais Calma (Calmer / Slower)', enDesc: 'Speak in a very calm, slow, soft-spoken, and peaceful tone. English accent.', esDesc: 'Habla en un tono muy calmado, lento, pausado y tranquilo. Acento español.' },
  { id: 'energetic', name: 'Mais Energética (Energetic / Cheerful)', enDesc: 'Speak in an energetic, enthusiastic, and cheerful tone, with expressive pacing. English accent.', esDesc: 'Habla con mucha energía, entusiasmo, de forma alegre y expresiva. Acento español.' },
  { id: 'patient', name: 'Mais Paciente (Patient / Reassuring)', enDesc: 'Speak in a patient, slow, warm, gentle, and reassuring tone, clearly articulating. English accent.', esDesc: 'Habla de forma muy paciente, lenta, cálida, amable y clara. Acento español.' },
  { id: 'whisper', name: 'Sussurrado (Whispered)', enDesc: 'Speak in a soft, quiet whisper. English accent.', esDesc: 'Habla en un susurro suave y silencioso. Acento español.' },
  { id: 'formal', name: 'Formal / Profissional', enDesc: 'Speak in a formal, professional, serious, and articulate tone. English accent.', esDesc: 'Habla en un tono formal, profesional, serio y bien articulado. Acento español.' }
];

// App State
let appState = {
  serviceMode: 'gemini', // 'free' or 'gemini'
  apiKey: 'AQ.Ab8RN6LHaU87Y0w5nqUWIyZXBJQSelTWqPerw9OY_I6Z3Kl4yw',
  model: 'gemini-3.1-flash-tts-preview',
  enVoice: 'Puck',
  esVoice: 'Kore',
  enPreset: 'default',
  esPreset: 'default',
  enInstruction: 'Speak clearly and naturally at normal speed. English accent.',
  esInstruction: 'Habla de forma clara y natural a velocidad normal. Acento español.',
  concurrency: 2,
  rows: [],
  isGenerating: false,
  abortController: null,
  playingAudio: null // { rowId, lang, audioObj }
};

// DOM References
const elements = {
  fileInput: document.getElementById('fileInput'),
  btnOpenPasteModal: document.getElementById('btnOpenPasteModal'),
  btnClosePasteModal: document.getElementById('btnClosePasteModal'),
  btnCancelPaste: document.getElementById('btnCancelPaste'),
  btnImportPaste: document.getElementById('btnImportPaste'),
  pasteModal: document.getElementById('pasteModal'),
  pasteInput: document.getElementById('pasteInput'),
  btnAddRow: document.getElementById('btnAddRow'),
  btnClearTable: document.getElementById('btnClearTable'),
  btnToggleSettings: document.getElementById('btnToggleSettings'),
  settingsPanel: document.getElementById('settingsPanel'),
  btnGenerate: document.getElementById('btnGenerate'),
  genSpinner: document.getElementById('genSpinner'),
  btnDownloadZip: document.getElementById('btnDownloadZip'),
  
  apiKeyInput: document.getElementById('apiKey'),
  btnSaveKey: document.getElementById('btnSaveKey'),
  modelSelect: document.getElementById('modelSelect'),
  concurrencySelect: document.getElementById('concurrencySelect'),
  serviceModeSelect: document.getElementById('serviceModeSelect'),
  apiKeyGroup: document.getElementById('apiKeyGroup'),
  modelSelectGroup: document.getElementById('modelSelectGroup'),
  
  enVoiceSelect: document.getElementById('enVoiceSelect'),
  enPresetSelect: document.getElementById('enPresetSelect'),
  enInstruction: document.getElementById('enInstruction'),
  
  esVoiceSelect: document.getElementById('esVoiceSelect'),
  esPresetSelect: document.getElementById('esPresetSelect'),
  esInstruction: document.getElementById('esInstruction'),
  
  statsSection: document.getElementById('statsSection'),
  statTotal: document.getElementById('statTotal'),
  statEnDone: document.getElementById('statEnDone'),
  statEsDone: document.getElementById('statEsDone'),
  statSuccess: document.getElementById('statSuccess'),
  statErrorCard: document.getElementById('statErrorCard'),
  statErrors: document.getElementById('statErrors'),
  
  tableBody: document.getElementById('tableBody'),
  emptyState: document.getElementById('emptyState')
};

// Fallback UUID function for non-HTTPS contexts
function uuidv4() {
  try {
    return window.crypto.randomUUID();
  } catch (e) {
    return 'uuid-' + Math.random().toString(36).substring(2, 15) + '-' + Date.now().toString(36);
  }
}

// Convert Base64 PCM L16 (24kHz, Big-Endian) to standard WAV Blob (Little-Endian)
function pcmToWav(pcmBase64, sampleRate = 24000) {
  const binaryString = window.atob(pcmBase64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }

  const buffer = new ArrayBuffer(44 + len);
  const view = new DataView(buffer);

  // RIFF header
  view.setUint32(0, 0x52494646, false); // "RIFF"
  view.setUint32(4, 36 + len, true);
  view.setUint32(8, 0x57415645, false); // "WAVE"

  // fmt chunk
  view.setUint32(12, 0x666d7420, false); // "fmt "
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true); // PCM linear
  view.setUint16(22, 1, true); // Mono
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, sampleRate * 2, true); // Byte rate
  view.setUint16(32, 2, true); // Block align
  view.setUint16(34, 16, true); // 16-bit

  // data chunk
  view.setUint32(36, 0x64617461, false); // "data"
  view.setUint32(40, len, true);

  // Swap big-endian 16-bit signed PCM samples to little-endian standard signed 16-bit integers
  const numSamples = len / 2;
  for (let i = 0; i < numSamples; i++) {
    const byte1 = bytes[i * 2];
    const byte2 = bytes[i * 2 + 1];
    
    // Read big-endian signed 16-bit integer
    let sample = (byte1 << 8) | byte2;
    if (sample & 0x8000) {
      sample = sample - 0x10000;
    }
    
    // Write little-endian signed 16-bit integer into WAV buffer after header (offset 44)
    view.setInt16(44 + i * 2, sample, true);
  }

  return new Blob([buffer], { type: 'audio/wav' });
}

// Render available options in select fields
function initSelectOptions() {
  // Voices dropdowns
  AVAILABLE_VOICES.forEach(voice => {
    const enOpt = new Option(`${voice.name} (${voice.gender})`, voice.id);
    const esOpt = new Option(`${voice.name} (${voice.gender})`, voice.id);
    elements.enVoiceSelect.add(enOpt);
    elements.esVoiceSelect.add(esOpt);
  });
  
  elements.enVoiceSelect.value = appState.enVoice;
  elements.esVoiceSelect.value = appState.esVoice;

  // Presets dropdowns
  TONE_PRESETS.forEach(preset => {
    const enOpt = new Option(preset.name, preset.id);
    const esOpt = new Option(preset.name, preset.id);
    elements.enPresetSelect.add(enOpt);
    elements.esPresetSelect.add(esOpt);
  });
  
  elements.enPresetSelect.value = appState.enPreset;
  elements.esPresetSelect.value = appState.esPreset;
  
  elements.enInstruction.value = appState.enInstruction;
  elements.esInstruction.value = appState.esInstruction;
  elements.modelSelect.value = appState.model;
}

// Load configurations
function loadConfig() {
  const savedKey = localStorage.getItem('hl_gemini_key') || 'AQ.Ab8RN6LHaU87Y0w5nqUWIyZXBJQSelTWqPerw9OY_I6Z3Kl4yw';
  appState.apiKey = savedKey;
  elements.apiKeyInput.value = savedKey;

  const savedMode = localStorage.getItem('hl_service_mode') || 'gemini';
  appState.serviceMode = savedMode;
  elements.serviceModeSelect.value = savedMode;
  updateServiceModeUI();
}

// Save API key
elements.btnSaveKey.addEventListener('click', () => {
  const key = elements.apiKeyInput.value.trim();
  localStorage.setItem('hl_gemini_key', key);
  appState.apiKey = key;
  alert('Chave API salva com sucesso!');
});

// Settings Event Listeners
elements.btnToggleSettings.addEventListener('click', () => {
  elements.settingsPanel.classList.toggle('hidden');
});

elements.serviceModeSelect.addEventListener('change', (e) => {
  const mode = e.target.value;
  appState.serviceMode = mode;
  localStorage.setItem('hl_service_mode', mode);
  updateServiceModeUI();
});

function updateServiceModeUI() {
  const isFree = appState.serviceMode === 'free';
  if (isFree) {
    elements.apiKeyGroup.classList.add('hidden');
    elements.modelSelectGroup.classList.add('hidden');
  } else {
    elements.apiKeyGroup.classList.remove('hidden');
    elements.modelSelectGroup.classList.remove('hidden');
  }
}

elements.modelSelect.addEventListener('change', (e) => {
  appState.model = e.target.value;
});

elements.concurrencySelect.addEventListener('change', (e) => {
  appState.concurrency = parseInt(e.target.value);
});

elements.enVoiceSelect.addEventListener('change', (e) => {
  appState.enVoice = e.target.value;
});

elements.esVoiceSelect.addEventListener('change', (e) => {
  appState.esVoice = e.target.value;
});

elements.enPresetSelect.addEventListener('change', (e) => {
  const presetId = e.target.value;
  appState.enPreset = presetId;
  const p = TONE_PRESETS.find(x => x.id === presetId);
  if (p) {
    appState.enInstruction = p.enDesc;
    elements.enInstruction.value = p.enDesc;
  }
});

elements.esPresetSelect.addEventListener('change', (e) => {
  const presetId = e.target.value;
  appState.esPreset = presetId;
  const p = TONE_PRESETS.find(x => x.id === presetId);
  if (p) {
    appState.esInstruction = p.esDesc;
    elements.esInstruction.value = p.esDesc;
  }
});

elements.enInstruction.addEventListener('input', (e) => {
  appState.enInstruction = e.target.value;
});

elements.esInstruction.addEventListener('input', (e) => {
  appState.esInstruction = e.target.value;
});

// Modal Events
elements.btnOpenPasteModal.addEventListener('click', () => {
  elements.pasteModal.classList.remove('hidden');
});

const closeModal = () => {
  elements.pasteModal.classList.add('hidden');
  elements.pasteInput.value = '';
};

elements.btnClosePasteModal.addEventListener('click', closeModal);
elements.btnCancelPaste.addEventListener('click', closeModal);

elements.btnImportPaste.addEventListener('click', () => {
  const text = elements.pasteInput.value.trim();
  if (!text) {
    alert('Por favor, cole algum texto.');
    return;
  }

  const lines = text.split(/\r?\n/);
  const imported = [];

  lines.forEach(line => {
    let parts = line.split('\t');
    if (parts.length < 2) parts = line.split(';');
    if (parts.length < 2) parts = line.split(',');

    const enText = parts[0]?.trim() || '';
    const esText = parts[1]?.trim() || '';

    if (enText || esText) {
      imported.push({
        id: uuidv4(),
        enText,
        esText,
        enStatus: 'idle',
        esStatus: 'idle',
        enAudioUrl: null,
        esAudioUrl: null
      });
    }
  });

  if (imported.length > 0) {
    appState.rows = [...appState.rows, ...imported];
    closeModal();
    renderTable();
  } else {
    alert('Nenhum texto separado em duas colunas identificado.');
  }
});

// File Upload Parser
elements.fileInput.addEventListener('change', (e) => {
  const file = e.target.files?.[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = (event) => {
    try {
      const data = new Uint8Array(event.target.result);
      const workbook = XLSX.read(data, { type: 'array' });
      const firstSheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[firstSheetName];
      const json = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

      const startIndex = (json[0]?.[0]?.toLowerCase()?.includes('ing') || json[0]?.[0]?.toLowerCase()?.includes('en') || json[0]?.[1]?.toLowerCase()?.includes('es')) ? 1 : 0;

      const imported = [];
      for (let i = startIndex; i < json.length; i++) {
        const enVal = String(json[i]?.[0] || '').trim();
        const esVal = String(json[i]?.[1] || '').trim();
        if (enVal || esVal) {
          imported.push({
            id: uuidv4(),
            enText: enVal,
            esText: esVal,
            enStatus: 'idle',
            esStatus: 'idle',
            enAudioUrl: null,
            esAudioUrl: null
          });
        }
      }

      if (imported.length > 0) {
        appState.rows = [...appState.rows, ...imported];
        renderTable();
      } else {
        alert('Nenhuma célula com dados encontrada na planilha.');
      }
    } catch (err) {
      alert('Erro ao carregar a planilha: ' + err.message);
    }
  };
  reader.readAsArrayBuffer(file);
  e.target.value = '';
});

// Grid Modifiers
elements.btnAddRow.addEventListener('click', () => {
  appState.rows.push({
    id: uuidv4(),
    enText: '',
    esText: '',
    enStatus: 'idle',
    esStatus: 'idle',
    enAudioUrl: null,
    esAudioUrl: null
  });
  renderTable();
});

elements.btnClearTable.addEventListener('click', () => {
  if (appState.rows.length === 0) return;
  if (confirm('Deseja realmente limpar todos os registros da tabela?')) {
    appState.rows.forEach(r => {
      if (r.enAudioUrl) URL.revokeObjectURL(r.enAudioUrl);
      if (r.esAudioUrl) URL.revokeObjectURL(r.esAudioUrl);
    });
    appState.rows = [];
    renderTable();
  }
});

function deleteRow(id) {
  const r = appState.rows.find(x => x.id === id);
  if (r) {
    if (r.enAudioUrl) URL.revokeObjectURL(r.enAudioUrl);
    if (r.esAudioUrl) URL.revokeObjectURL(r.esAudioUrl);
  }
  appState.rows = appState.rows.filter(x => x.id !== id);
  renderTable();
}

function updateCell(id, lang, value) {
  const row = appState.rows.find(x => x.id === id);
  if (row) {
    const textKey = lang === 'en' ? 'enText' : 'esText';
    const statusKey = lang === 'en' ? 'enStatus' : 'esStatus';
    const audioKey = lang === 'en' ? 'enAudioUrl' : 'esAudioUrl';
    
    if (row[audioKey]) {
      URL.revokeObjectURL(row[audioKey]);
    }
    
    row[textKey] = value;
    row[statusKey] = 'idle';
    row[audioKey] = null;
    
    // Quick local status update without rendering full table
    updateStatsSummary();
  }
}

// Call Gemini API REST
async function generateFreeSpeech(text, lang, signal) {
  const cleanText = encodeURIComponent(text);
  const googleTtsUrl = `https://translate.google.com/translate_tts?ie=UTF-8&q=${cleanText}&tl=${lang}&client=tw-ob`;
  const proxyUrl = `https://corsproxy.io/?url=${encodeURIComponent(googleTtsUrl)}`;

  const response = await fetch(proxyUrl, { signal });
  if (!response.ok) {
    throw new Error(`Erro ao obter áudio do servidor gratuito: HTTP ${response.status}`);
  }

  const blob = await response.blob();
  return URL.createObjectURL(blob);
}

async function generateSpeech(text, lang, voiceName, instruction, signal) {
  if (appState.serviceMode === 'free') {
    return generateFreeSpeech(text, lang, signal);
  } else {
    return generateGeminiSpeech(text, voiceName, instruction, signal);
  }
}

async function generateGeminiSpeech(text, voiceName, instruction, signal) {
  if (!appState.apiKey) {
    throw new Error('Chave API não configurada. Defina nas configurações.');
  }

  const prompt = `Read the following text out loud. Voice instruction: ${instruction}. Do not add any introductory or concluding comments. Read only the text exactly as written: "${text}"`;

  const body = {
    contents: [
      {
        role: 'user',
        parts: [{ text: prompt }]
      }
    ],
    generationConfig: {
      responseModalities: ['AUDIO'],
      speechConfig: {
        voiceConfig: {
          prebuiltVoiceConfig: {
            voiceName: voiceName
          }
        }
      }
    }
  };

  const url = `https://generativelanguage.googleapis.com/v1beta/models/${appState.model}:generateContent?key=${appState.apiKey}`;

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(body),
    signal
  });

  if (!response.ok) {
    const errObj = await response.json().catch(() => ({}));
    const errMsg = errObj?.error?.message || `Erro HTTP ${response.status}`;
    throw new Error(`Gemini API: ${errMsg}`);
  }

  const result = await response.json();
  const part = result.candidates?.[0]?.content?.parts?.[0];

  if (part?.inlineData?.data) {
    const mimeType = part.inlineData.mimeType || 'audio/l16;rate=24000';
    const base64Data = part.inlineData.data;
    const mimeLower = mimeType.toLowerCase();

    if (mimeLower.includes('l16') || mimeLower.includes('pcm')) {
      const rateMatch = mimeLower.match(/rate=(\d+)/);
      const rate = rateMatch ? parseInt(rateMatch[1], 10) : 24000;
      const blob = pcmToWav(base64Data, rate);
      return URL.createObjectURL(blob);
    } else {
      const binary = window.atob(base64Data);
      const bytes = new Uint8Array(binary.length);
      for (let i = 0; i < binary.length; i++) {
        bytes[i] = binary.charCodeAt(i);
      }
      const blob = new Blob([bytes], { type: mimeType });
      return URL.createObjectURL(blob);
    }
  } else if (part?.text) {
    throw new Error(`O modelo retornou texto explicativo em vez de áudio: "${part.text}"`);
  } else {
    throw new Error('Formato retornado pela API inválido.');
  }
}

// Single Cell Generator
async function generateCellAudio(rowId, lang) {
  const row = appState.rows.find(x => x.id === rowId);
  if (!row) return;

  const text = lang === 'en' ? row.enText : row.esText;
  if (!text.trim()) {
    alert('O texto está vazio.');
    return;
  }

  const statusKey = lang === 'en' ? 'enStatus' : 'esStatus';
  const errorKey = lang === 'en' ? 'enError' : 'esError';
  const audioKey = lang === 'en' ? 'enAudioUrl' : 'esAudioUrl';

  row[statusKey] = 'loading';
  row[errorKey] = null;
  updateRowDOM(row);

  try {
    const voice = lang === 'en' ? appState.enVoice : appState.esVoice;
    const inst = lang === 'en' ? appState.enInstruction : appState.esInstruction;
    const url = await generateSpeech(text, lang, voice, inst);
    
    row[audioKey] = url;
    row[statusKey] = 'success';
  } catch (err) {
    row[statusKey] = 'error';
    row[errorKey] = err.message;
  }

  updateRowDOM(row);
  updateStatsSummary();
}

// Batch Generation Engine
async function startBatchGeneration() {
  if (appState.serviceMode === 'gemini' && !appState.apiKey) {
    alert('Por favor, configure sua chave API do Gemini antes de iniciar.');
    elements.settingsPanel.classList.remove('hidden');
    return;
  }

  const queue = [];
  appState.rows.forEach(r => {
    if (r.enText.trim() && r.enStatus !== 'success') {
      queue.push({ rowId: r.id, lang: 'en', text: r.enText, voice: appState.enVoice, inst: appState.enInstruction });
    }
    if (r.esText.trim() && r.esStatus !== 'success') {
      queue.push({ rowId: r.id, lang: 'es', text: r.esText, voice: appState.esVoice, inst: appState.esInstruction });
    }
  });

  if (queue.length === 0) {
    alert('Todos os áudios já foram gerados com sucesso!');
    return;
  }

  appState.isGenerating = true;
  appState.abortController = new AbortController();
  updateButtonStates();

  // Reset statuses of queue items to loading shortly
  appState.rows = appState.rows.map(r => {
    let copy = { ...r };
    const qItems = queue.filter(q => q.rowId === r.id);
    qItems.forEach(q => {
      copy[q.lang === 'en' ? 'enStatus' : 'esStatus'] = 'idle';
    });
    return copy;
  });
  renderTable();

  let index = 0;
  const runWorker = async () => {
    while (index < queue.length && !appState.abortController.signal.aborted) {
      const task = queue[index++];
      const row = appState.rows.find(x => x.id === task.rowId);
      if (!row) continue;

      const statusKey = task.lang === 'en' ? 'enStatus' : 'esStatus';
      const audioKey = task.lang === 'en' ? 'enAudioUrl' : 'esAudioUrl';
      const errorKey = task.lang === 'en' ? 'enError' : 'esError';

      row[statusKey] = 'loading';
      updateRowDOM(row);
      updateStatsSummary();

      try {
        const url = await generateSpeech(task.text, task.lang, task.voice, task.inst, appState.abortController.signal);
        row[audioKey] = url;
        row[statusKey] = 'success';
      } catch (err) {
        if (err.name !== 'AbortError') {
          row[statusKey] = 'error';
          row[errorKey] = err.message;
        }
      }
      updateRowDOM(row);
      updateStatsSummary();
    }
  };

  const workers = [];
  const limit = Math.min(appState.concurrency, queue.length);
  for (let i = 0; i < limit; i++) {
    workers.push(runWorker());
  }

  await Promise.all(workers);
  appState.isGenerating = false;
  appState.abortController = null;
  updateButtonStates();
  renderTable(); // final tidy render
}

function stopBatchGeneration() {
  if (appState.abortController) {
    appState.abortController.abort();
    appState.isGenerating = false;
    appState.rows = appState.rows.map(r => ({
      ...r,
      enStatus: r.enStatus === 'loading' ? 'idle' : r.enStatus,
      esStatus: r.esStatus === 'loading' ? 'idle' : r.esStatus
    }));
    updateButtonStates();
    renderTable();
  }
}

elements.btnGenerate.addEventListener('click', () => {
  if (appState.isGenerating) {
    stopBatchGeneration();
  } else {
    startBatchGeneration();
  }
});

// ZIP Downloader
async function downloadAllAsZip() {
  const zip = new JSZip();
  let count = 0;
  let csv = 'ID,Idioma,Texto Original,Nome do Arquivo\n';

  const promises = appState.rows.map(async (row, idx) => {
    const idxStr = String(idx + 1).padStart(3, '0');
    const ext = appState.serviceMode === 'free' ? 'mp3' : 'wav';
    
    if (row.enAudioUrl && row.enStatus === 'success') {
      const filename = `audio_${idxStr}_ingles.${ext}`;
      const res = await fetch(row.enAudioUrl);
      const blob = await res.blob();
      zip.file(filename, blob);
      csv += `${idxStr},ingles,"${row.enText.replace(/"/g, '""')}",${filename}\n`;
      count++;
    }

    if (row.esAudioUrl && row.esStatus === 'success') {
      const filename = `audio_${idxStr}_espanhol.${ext}`;
      const res = await fetch(row.esAudioUrl);
      const blob = await res.blob();
      zip.file(filename, blob);
      csv += `${idxStr},espanhol,"${row.esText.replace(/"/g, '""')}",${filename}\n`;
      count++;
    }
  });

  try {
    await Promise.all(promises);
    if (count === 0) {
      alert('Nenhum áudio gerado com sucesso disponível para exportar.');
      return;
    }

    zip.file('mapa_de_audios.csv', csv);
    
    const content = await zip.generateAsync({ type: 'blob' });
    const url = URL.createObjectURL(content);

    const a = document.createElement('a');
    a.href = url;
    a.download = `lote_audios_gemini_${new Date().toISOString().split('T')[0]}.zip`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  } catch (err) {
    alert('Erro ao compactar arquivos: ' + err.message);
  }
}

elements.btnDownloadZip.addEventListener('click', downloadAllAsZip);

// Play Audio Player
function playAudio(rowId, lang, url) {
  if (appState.playingAudio && appState.playingAudio.rowId === rowId && appState.playingAudio.lang === lang) {
    // Toggle pause
    appState.playingAudio.audioObj.pause();
    appState.playingAudio = null;
    updateAudioButtons();
  } else {
    // Stop currently playing
    if (appState.playingAudio) {
      appState.playingAudio.audioObj.pause();
    }

    const audioObj = new Audio(url);
    appState.playingAudio = { rowId, lang, audioObj };
    
    audioObj.play().catch(() => {
      appState.playingAudio = null;
      updateAudioButtons();
    });

    audioObj.onended = () => {
      appState.playingAudio = null;
      updateAudioButtons();
    };

    updateAudioButtons();
  }
}

function updateAudioButtons() {
  document.querySelectorAll('.btn-play').forEach(btn => {
    const id = btn.getAttribute('data-row-id');
    const lang = btn.getAttribute('data-lang');
    
    const isPlaying = appState.playingAudio && appState.playingAudio.rowId === id && appState.playingAudio.lang === lang;
    
    btn.className = `btn-play ${isPlaying ? 'playing' : ''}`;
    btn.innerHTML = `<i data-lucide="${isPlaying ? 'pause' : 'play'}"></i>`;
  });
  lucide.createIcons();
}

// Download individual cell
function downloadIndividualCell(text, url, lang, idx) {
  const ext = appState.serviceMode === 'free' ? 'mp3' : 'wav';
  const filename = `linha_${String(idx + 1).padStart(2, '0')}_${lang}_${text.substring(0, 15).replace(/[^a-z0-9]/gi, '_').toLowerCase()}.${ext}`;
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
}

// DOM Rendering logic
function renderTable() {
  elements.tableBody.innerHTML = '';
  
  if (appState.rows.length === 0) {
    elements.emptyState.classList.remove('hidden');
    elements.statsSection.classList.add('hidden');
    elements.btnDownloadZip.disabled = true;
    return;
  }

  elements.emptyState.classList.add('hidden');
  elements.statsSection.classList.remove('hidden');

  appState.rows.forEach((row, index) => {
    const tr = document.createElement('tr');
    tr.id = `row-${row.id}`;
    tr.innerHTML = `
      <td class="row-index-td">${index + 1}</td>
      <td>
        <textarea placeholder="Texto em inglês..." rows="2" oninput="updateCell('${row.id}', 'en', this.value)">${row.enText}</textarea>
        <div class="audio-status-row" id="status-en-${row.id}"></div>
      </td>
      <td>
        <textarea placeholder="Texto em espanhol..." rows="2" oninput="updateCell('${row.id}', 'es', this.value)">${row.esText}</textarea>
        <div class="audio-status-row" id="status-es-${row.id}"></div>
      </td>
      <td style="text-align: center; vertical-align: middle;">
        <button class="btn-delete-row" onclick="deleteRow('${row.id}')" title="Excluir linha">
          <i data-lucide="trash"></i>
        </button>
      </td>
    `;
    elements.tableBody.appendChild(tr);
    updateCellDOM(row, 'en');
    updateCellDOM(row, 'es');
  });

  updateStatsSummary();
  updateButtonStates();
  lucide.createIcons();
}

function updateRowDOM(row) {
  updateCellDOM(row, 'en');
  updateCellDOM(row, 'es');
  lucide.createIcons();
}

function updateCellDOM(row, lang) {
  const container = document.getElementById(`status-${lang}-${row.id}`);
  if (!container) return;

  const status = lang === 'en' ? row.enStatus : row.esStatus;
  const text = lang === 'en' ? row.enText : row.esText;
  const audioUrl = lang === 'en' ? row.enAudioUrl : row.esAudioUrl;
  const err = lang === 'en' ? row.enError : row.esError;

  if (!text.trim()) {
    container.innerHTML = '';
    return;
  }

  if (status === 'idle') {
    container.innerHTML = `
      <button class="btn-cell-gen ${lang}" onclick="generateCellAudio('${row.id}', '${lang}')">
        <i data-lucide="sparkles"></i>
        <span>Gerar Áudio</span>
      </button>
    `;
  } else if (status === 'loading') {
    container.innerHTML = `
      <span class="loading-text">
        <i data-lucide="refresh-cw" class="spin-anim"></i> Gerando...
      </span>
    `;
  } else if (status === 'success' && audioUrl) {
    const isPlaying = appState.playingAudio && appState.playingAudio.rowId === row.id && appState.playingAudio.lang === lang;
    container.innerHTML = `
      <div class="success-block">
        <button class="btn-play ${isPlaying ? 'playing' : ''}" data-row-id="${row.id}" data-lang="${lang}" onclick="playAudio('${row.id}', '${lang}', '${audioUrl}')">
          <i data-lucide="${isPlaying ? 'pause' : 'play'}"></i>
        </button>
        <button class="btn-download-cell" onclick="downloadIndividualCell('${text.replace(/'/g, "\\'")}', '${audioUrl}', '${lang}', ${appState.rows.findIndex(x => x.id === row.id)})" title="Baixar WAV">
          <i data-lucide="download"></i>
        </button>
        <span class="done-badge">
          <i data-lucide="check-circle"></i> Pronto
        </span>
      </div>
    `;
  } else if (status === 'error') {
    container.innerHTML = `
      <span class="error-text" title="${err.replace(/"/g, '&quot;')}">
        <i data-lucide="alert-circle"></i> Erro de Geração
      </span>
    `;
  }
}

function updateStatsSummary() {
  const total = appState.rows.length;
  const doneEn = appState.rows.filter(r => r.enStatus === 'success').length;
  const doneEs = appState.rows.filter(r => r.esStatus === 'success').length;
  const totalSuccess = doneEn + doneEs;
  const errors = appState.rows.filter(r => r.enStatus === 'error' || r.esStatus === 'error').length;

  elements.statTotal.textContent = total;
  elements.statEnDone.textContent = `${doneEn} / ${total}`;
  elements.statEsDone.textContent = `${doneEs} / ${total}`;
  elements.statSuccess.textContent = totalSuccess;

  if (errors > 0) {
    elements.statErrorCard.classList.remove('hidden');
    elements.statErrors.textContent = errors;
  } else {
    elements.statErrorCard.classList.add('hidden');
  }

  // Disable download ZIP button if no audios generated
  elements.btnDownloadZip.disabled = totalSuccess === 0;
}

function updateButtonStates() {
  if (appState.isGenerating) {
    elements.btnGenerate.className = 'btn btn-danger-soft';
    elements.btnGenerate.innerHTML = `<i data-lucide="pause"></i><span>Parar Geração</span>`;
    elements.genSpinner.classList.add('hidden');
  } else {
    elements.btnGenerate.className = 'btn btn-accent';
    elements.btnGenerate.innerHTML = `<i data-lucide="refresh-cw" id="genSpinner"></i><span>Gerar Pendentes</span>`;
    elements.btnGenerate.disabled = appState.rows.length === 0;
  }
  
  elements.btnDownloadZip.disabled = appState.rows.filter(r => r.enStatus === 'success' || r.esStatus === 'success').length === 0;
}

// App Initialization
window.onload = () => {
  loadConfig();
  initSelectOptions();
  
  // Create first row
  appState.rows.push({
    id: uuidv4(),
    enText: 'Welcome to this language learning tool.',
    esText: 'Bienvenido a esta ferramenta de aprendizaje de idiomas.',
    enStatus: 'idle',
    esStatus: 'idle',
    enAudioUrl: null,
    esAudioUrl: null
  });
  
  renderTable();
};
