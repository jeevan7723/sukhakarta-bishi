const fs = require('fs');
const path = require('path');

const chromeDir = path.join(process.env.LOCALAPPDATA, 'Google/Chrome/User Data/Default/Local Storage/leveldb');
const files = fs.readdirSync(chromeDir);

for (const f of files) {
  if (f.endsWith('.ldb') || f.endsWith('.log')) {
    const fullPath = path.join(chromeDir, f);
    const buf = fs.readFileSync(fullPath);

    // Look for UTF-16LE encoded 'sukhakarta_bishi_live_v1' or UTF-8
    const keyUtf8 = Buffer.from('sukhakarta_bishi_live_v1', 'utf8');
    const keyUtf16 = Buffer.from('sukhakarta_bishi_live_v1', 'utf16le');

    let pos = buf.indexOf(keyUtf8);
    let isUtf16 = false;
    if (pos === -1) {
      pos = buf.indexOf(keyUtf16);
      isUtf16 = true;
    }

    if (pos !== -1) {
      console.log(`Found key in ${f} at pos ${pos} (utf16=${isUtf16})`);
      // Scan forward for '{' (in utf8 or utf16le)
      // If utf16le, '{' is 0x7B 0x00
      let jsonStart = -1;
      let jsonEnd = -1;
      
      // Let's search in UTF-16LE
      for (let i = pos; i < Math.min(buf.length - 1, pos + 200000); i++) {
        if (buf[i] === 0x7B && buf[i+1] === 0x00) {
          jsonStart = i;
          break;
        }
        if (buf[i] === 0x7B && buf[i+1] !== 0x00) {
          jsonStart = i;
          isUtf16 = false;
          break;
        }
      }

      if (jsonStart !== -1) {
        if (isUtf16) {
          // Decode up to end of buffer or matching closing brace
          let text = buf.subarray(jsonStart).toString('utf16le');
          // Find matching closing brace
          let depth = 0;
          let validEnd = -1;
          for (let c = 0; c < text.length; c++) {
            if (text[c] === '{') depth++;
            else if (text[c] === '}') {
              depth--;
              if (depth === 0) {
                validEnd = c + 1;
                break;
              }
            }
          }
          if (validEnd !== -1) {
            const jsonStr = text.substring(0, validEnd);
            try {
              const parsed = JSON.parse(jsonStr);
              console.log('🎉 SUCCESSFUL PARSE FROM CHROME!');
              console.log('Members count:', parsed.members ? parsed.members.length : 0);
              console.log('Members:', parsed.members ? parsed.members.map(m => m.name + ' (' + m.id + ')') : []);
              console.log('Transactions count:', parsed.transactions ? parsed.transactions.length : 0);
              console.log('Loans count:', parsed.loans ? parsed.loans.length : 0);
              fs.writeFileSync('chrome_extracted_state.json', JSON.stringify(parsed, null, 2), 'utf8');
              console.log('Saved to chrome_extracted_state.json');
            } catch(e) {
              console.log('JSON parse error (partial):', e.message);
            }
          }
        } else {
          let text = buf.subarray(jsonStart).toString('utf8');
          let depth = 0;
          let validEnd = -1;
          for (let c = 0; c < text.length; c++) {
            if (text[c] === '{') depth++;
            else if (text[c] === '}') {
              depth--;
              if (depth === 0) {
                validEnd = c + 1;
                break;
              }
            }
          }
          if (validEnd !== -1) {
            const jsonStr = text.substring(0, validEnd);
            try {
              const parsed = JSON.parse(jsonStr);
              console.log('🎉 SUCCESSFUL PARSE FROM CHROME (UTF8)!');
              console.log('Members count:', parsed.members ? parsed.members.length : 0);
              console.log('Members:', parsed.members ? parsed.members.map(m => m.name + ' (' + m.id + ')') : []);
              fs.writeFileSync('chrome_extracted_state.json', JSON.stringify(parsed, null, 2), 'utf8');
            } catch(e) {
              console.log('JSON parse error (utf8):', e.message);
            }
          }
        }
      }
    }
  }
}
