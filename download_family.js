const fs = require('fs');
const path = require('path');

const expressions = [
  "my mother said",
  "my father told me",
  "brother and sister",
  "with my family",
  "my wife and I",
  "husband and wife",
  "my little sister",
  "my older brother",
  "my big brother",
  "my baby sister",
  "me and my mom",
  "my mom and dad",
  "my father-in-law",
  "my mother-in-law",
  "my son and daughter",
  "love my family",
  "my whole family",
  "for my family",
  "my family is here",
  "with my parents",
  "meet my family",
  "tell my wife",
  "ask my husband",
  "my aunt and uncle",
  "my own family",
  "my parents are here",
  "go see my parents",
  "my oldest son",
  "protect my family",
  "support my family"
];

const userAgent = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';
const csrfToken = 'cmf6ALYjeK3Xxi1Wobc1dIitdPqz+IjROylUqKHePZ+HQCkfROzIedaKmgSWlbgJogBBpd5HpkcmvFLF';
const familyDir = path.join(__dirname, 'family');

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
  console.log('Starting PlayPhrase.me family expressions downloader...');

  // Create family folder if it does not exist
  if (!fs.existsSync(familyDir)) {
    console.log(`Creating directory: ${familyDir}`);
    fs.mkdirSync(familyDir, { recursive: true });
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
    console.log(`Processing Family Chunk [${exprIndex}/30]: "${expr}"`);
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
      const destPath = path.join(familyDir, filename);

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
  const refPath = path.join(familyDir, 'reference.md');
  let mdContent = `# PlayPhrase Family Chunks Reference Index\n\n`;
  mdContent += `This index maps each downloaded family chunk (video clip) to its expression, transcript, and movie source details.\n\n`;
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

  // Generate transcricoes.txt file
  console.log('\nGenerating transcricoes.txt transcript file...');
  const txtPath = path.join(familyDir, 'transcricoes.txt');
  
  let txtContent = '';
  let currentExpr = '';
  for (const item of referenceData) {
    if (item.expr !== currentExpr) {
      if (currentExpr !== '') {
        txtContent += '\n';
      }
      currentExpr = item.expr;
      txtContent += `Expressão: ${currentExpr}\n`;
    }
    txtContent += `${item.filename}: "${item.originalText}"\n`;
  }

  try {
    fs.writeFileSync(txtPath, txtContent);
    console.log(`transcricoes.txt generated successfully at: ${txtPath}`);
  } catch (err) {
    console.error('Failed to write transcricoes.txt:', err.message);
  }

  console.log('\nDownload process finished! All family chunks saved under the "family" folder.');
}

main();
