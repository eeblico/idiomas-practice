const fs = require('fs');
const path = require('path');

const expressions = [
  "come over to my house",
  "make yourself at home",
  "how are you doing",
  "what do you mean",
  "let me know if",
  "have a good time",
  "I don't think so",
  "by the way",
  "good to see you",
  "take care of yourself"
];

const userAgent = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';
const csrfToken = 'cmf6ALYjeK3Xxi1Wobc1dIitdPqz+IjROylUqKHePZ+HQCkfROzIedaKmgSWlbgJogBBpd5HpkcmvFLF';
const chunksDir = path.join(__dirname, 'chunks');

function sanitizeFilename(name) {
  return name.replace(/[\\/:*?"<>|]/g, '');
}

async function downloadFile(url, destPath) {
  const res = await fetch(url, {
    headers: {
      'User-Agent': userAgent,
      'Referer': 'https://www.playphrase.me/'
    }
  });
  if (!res.ok) {
    throw new Error(`Failed to download ${url}: ${res.status} ${res.statusText}`);
  }
  const buffer = await res.arrayBuffer();
  fs.writeFileSync(destPath, Buffer.from(buffer));
}

async function main() {
  console.log('Starting PlayPhrase.me expressions downloader...');

  // Create chunks folder if it does not exist
  if (!fs.existsSync(chunksDir)) {
    console.log(`Creating directory: ${chunksDir}`);
    fs.mkdirSync(chunksDir, { recursive: true });
  }

  // Get session cookie from homepage
  console.log('Fetching playphrase.me homepage to obtain session cookies...');
  let cookieHeader = '';
  try {
    const homeRes = await fetch('https://www.playphrase.me/', {
      headers: { 'User-Agent': userAgent }
    });
    const cookies = homeRes.headers.get('set-cookie');
    if (cookies) {
      cookieHeader = cookies.split(',').map(c => c.split(';')[0].trim()).join('; ');
      console.log('Successfully retrieved session cookie.');
    } else {
      console.log('No session cookie returned, proceeding with empty cookies.');
    }
  } catch (err) {
    console.warn('Warning: Failed to fetch homepage. Proceeding without cookies.', err.message);
  }

  const referenceData = [];

  for (let i = 0; i < expressions.length; i++) {
    const expr = expressions[i];
    const exprIndex = i + 1;
    console.log(`\n==================================================`);
    console.log(`Processing Chunk [${exprIndex}/10]: "${expr}"`);
    console.log(`==================================================`);

    const searchUrl = `https://www.playphrase.me/api/v1/phrases/search?q=${encodeURIComponent(expr)}&limit=5&skip=0&language=en`;
    console.log(`Querying API: ${searchUrl}`);

    let data;
    try {
      const res = await fetch(searchUrl, {
        headers: {
          'User-Agent': userAgent,
          'x-csrf-token': csrfToken,
          'Cookie': cookieHeader,
          'Referer': 'https://www.playphrase.me/'
        }
      });
      if (!res.ok) {
        console.error(`Error: Search API returned status ${res.status} ${res.statusText}`);
        continue;
      }
      data = await res.json();
    } catch (err) {
      console.error(`Error querying search API for "${expr}":`, err.message);
      continue;
    }

    const phrases = data.phrases || [];
    console.log(`Found ${phrases.length} clips for "${expr}".`);

    if (phrases.length === 0) {
      console.log(`No clips found for "${expr}". Skipping.`);
      continue;
    }

    // Process up to 5 clips
    const clipsToDownload = phrases.slice(0, 5);
    for (let j = 0; j < clipsToDownload.length; j++) {
      const phrase = clipsToDownload[j];
      const clipIndex = j + 1;
      const videoUrl = phrase['video-url'];
      
      if (!videoUrl) {
        console.warn(`Clip ${clipIndex} has no video-url field. Skipping.`);
        continue;
      }

      // Naming format: X.Y - <expression>.mp4
      const sanitizedExpr = sanitizeFilename(expr);
      const filename = `${exprIndex}.${clipIndex} - ${sanitizedExpr}.mp4`;
      const destPath = path.join(chunksDir, filename);

      console.log(`Downloading Clip [${clipIndex}/${clipsToDownload.length}] to "${filename}"...`);
      try {
        await downloadFile(videoUrl, destPath);
        console.log(`-> Successfully downloaded: ${filename}`);

        // Add to reference index metadata
        const movieInfo = phrase['video-info'] || {};
        referenceData.push({
          filename,
          expr,
          originalText: phrase.text || '',
          movieName: movieInfo.info || 'Unknown Movie',
          imdbUrl: movieInfo['source-url'] || ''
        });
      } catch (err) {
        console.error(`-> Failed to download clip ${clipIndex}:`, err.message);
      }
    }
    
    // Politeness delay between searches (1.5 seconds)
    await new Promise(resolve => setTimeout(resolve, 1500));
  }

  // Generate reference.md file
  console.log('\nGenerating reference.md index file...');
  const refPath = path.join(chunksDir, 'reference.md');
  let mdContent = `# PlayPhrase Chunks Reference Index\n\n`;
  mdContent += `This index maps each downloaded chunk (video clip) to its expression, transcript, and movie source details.\n\n`;
  mdContent += `| File | Expression | Original Sentence | Movie/Show | IMDb Link |\n`;
  mdContent += `| --- | --- | --- | --- | --- |\n`;

  for (const item of referenceData) {
    const imdbLink = item.imdbUrl ? `[IMDb](${item.imdbUrl})` : 'N/A';
    mdContent += `| \`${item.filename}\` | ${item.expr} | "${item.originalText}" | ${item.movieName} | ${imdbLink} |\n`;
  }

  try {
    fs.writeFileSync(refPath, mdContent);
    console.log(`reference.md generated successfully at: ${refPath}`);
  } catch (err) {
    console.error('Failed to write reference.md:', err.message);
  }

  console.log('\nDownload process finished! All chunks saved under the "chunks" folder.');
}

main();
