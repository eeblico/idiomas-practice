const fs = require('fs');
const path = require('path');

const expressions = [
  "my grandmother said",
  "my grandfather said",
  "my stepmother",
  "my stepfather",
  "my little brother",
  "my older sister",
  "my big sister",
  "my baby brother",
  "me and my dad",
  "parents and children",
  "my daughter-in-law",
  "my son-in-law",
  "about my family",
  "to my family",
  "like my father",
  "like my mother",
  "with my wife",
  "with my husband",
  "my husband and I",
  "my children are",
  "my youngest son",
  "my oldest daughter",
  "my youngest daughter",
  "meet my parents",
  "tell my husband",
  "ask my wife",
  "visit my family",
  "my family name",
  "my family history",
  "part of my family"
];

const userAgent = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';
const csrfToken = 'cmf6ALYjeK3Xxi1Wobc1dIitdPqz+IjROylUqKHePZ+HQCkfROzIedaKmgSWlbgJogBBpd5HpkcmvFLF';
const familyDir = path.join(__dirname, 'family');

const startIndex = 31; // Continue from index 31

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
  console.log(`Starting PlayPhrase.me family expressions downloader Part 2 (indices ${startIndex} to ${startIndex + expressions.length - 1})...`);

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
    const exprIndex = i + startIndex;
    console.log(`\n==================================================`);
    console.log(`Processing Family Chunk [${exprIndex}/${startIndex + expressions.length - 1}]: "${expr}"`);
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

  // Append to reference.md file
  console.log('\nAppending new records to reference.md...');
  const refPath = path.join(familyDir, 'reference.md');
  let mdContent = '';
  
  if (fs.existsSync(refPath)) {
    mdContent = fs.readFileSync(refPath, 'utf8').trim() + '\n';
  } else {
    mdContent = `# PlayPhrase Family Chunks Reference Index\n\n`;
    mdContent += `This index maps each downloaded family chunk (video clip) to its expression, transcript, and movie source details.\n\n`;
    mdContent += `| File | Expression | Original Sentence | Movie/Show | IMDb Link |\n`;
    mdContent += `| --- | --- | --- | --- | --- |\n`;
  }

  for (const item of referenceData) {
    const imdbLink = item.imdbUrl ? `[IMDb](${item.imdbUrl})` : 'N/A';
    mdContent += `| \`${item.filename}\` | ${item.expr} | "${item.originalText}" | ${item.movieName} | ${imdbLink} |\n`;
  }

  try {
    fs.writeFileSync(refPath, mdContent);
    console.log(`reference.md updated successfully at: ${refPath}`);
  } catch (err) {
    console.error('Failed to update reference.md:', err.message);
  }

  // Append to transcricoes.txt file
  console.log('\nAppending new records to transcricoes.txt...');
  const txtPath = path.join(familyDir, 'transcricoes.txt');
  let txtContent = '';

  if (fs.existsSync(txtPath)) {
    txtContent = fs.readFileSync(txtPath, 'utf8').trim() + '\n\n';
  }

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
    console.log(`transcricoes.txt updated successfully at: ${txtPath}`);
  } catch (err) {
    console.error('Failed to update transcricoes.txt:', err.message);
  }

  console.log('\nDownload process finished! All family chunks part 2 saved under the "family" folder.');
}

main();
