const fs = require('fs');
const path = require('path');

function getPlayphraseLink(expr, clipIndex) {
  const pos = parseInt(clipIndex, 10) - 1;
  const encodedQuery = encodeURIComponent(expr).replace(/%20/g, '+');
  return `https://www.playphrase.me/#/search?q=${encodedQuery}&pos=${pos}&language=en`;
}

function processDirectory(dirName) {
  const dirPath = path.join(__dirname, dirName);
  const refPath = path.join(dirPath, 'reference.md');
  const txtPath = path.join(dirPath, 'transcricoes.txt');

  console.log(`Processing directory: ${dirPath}`);

  // 1. Process reference.md
  if (fs.existsSync(refPath)) {
    console.log(`Updating ${refPath}...`);
    const refContent = fs.readFileSync(refPath, 'utf8');
    const lines = refContent.split(/\r?\n/);
    const newLines = [];

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      if (i === 4) {
        // Table header row
        if (!line.includes('PlayPhrase Link')) {
          newLines.push(line.trim() + ' PlayPhrase Link |');
        } else {
          newLines.push(line);
        }
      } else if (i === 5) {
        // Table separator row
        if (!line.includes('---')) {
          newLines.push(line);
        } else if (line.split('|').length <= 7) {
          newLines.push(line.trim() + ' --- |');
        } else {
          newLines.push(line);
        }
      } else if (line.trim().startsWith('| `')) {
        // Table data row
        const parts = line.split('|');
        if (parts.length >= 6) {
          const filePart = parts[1].trim();
          const expr = parts[2].trim();
          
          const match = filePart.match(/`(\d+)\.(\d+)/);
          if (match) {
            const clipIndex = match[2];
            const link = getPlayphraseLink(expr, clipIndex);
            
            if (parts.length <= 6 || !parts[parts.length - 2].includes('playphrase.me')) {
              const newRow = line.trim() + ` [PlayPhrase](${link}) |`;
              newLines.push(newRow);
            } else {
              newLines.push(line);
            }
          } else {
            newLines.push(line);
          }
        } else {
          newLines.push(line);
        }
      } else {
        newLines.push(line);
      }
    }
    fs.writeFileSync(refPath, newLines.join('\n'));
    console.log(`-> Updated reference.md successfully.`);
  } else {
    console.warn(`Warning: reference.md not found in ${dirName}`);
  }

  // 2. Process transcricoes.txt
  if (fs.existsSync(txtPath)) {
    console.log(`Updating ${txtPath}...`);
    const txtContent = fs.readFileSync(txtPath, 'utf8');
    const lines = txtContent.split(/\r?\n/);
    const newLines = [];
    let currentExpr = '';

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      if (line.startsWith('Expressão: ')) {
        currentExpr = line.substring('Expressão: '.length).trim();
        newLines.push(line);
      } else if (line.match(/^\d+\.\d+\s+-\s+.*\.mp4:/)) {
        newLines.push(line);
        
        const match = line.match(/^(\d+)\.(\d+)\s+-\s+(.*)\.mp4:/);
        if (match && currentExpr) {
          const clipIndex = match[2];
          const link = getPlayphraseLink(currentExpr, clipIndex);
          newLines.push(`Link: ${link}`);
        }
      } else if (line.startsWith('Link: ')) {
        continue;
      } else {
        newLines.push(line);
      }
    }
    fs.writeFileSync(txtPath, newLines.join('\n'));
    console.log(`-> Updated transcricoes.txt successfully.`);
  } else {
    console.warn(`Warning: transcricoes.txt not found in ${dirName}`);
  }
}

processDirectory('chunks');
processDirectory('family');
console.log('Link updates complete.');
