const fs = require('fs');
const path = require('path');
const lu = require('react-icons/lu');

function scanDir(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach(file => {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    if (stat && stat.isDirectory()) {
      results = results.concat(scanDir(fullPath));
    } else if (file.endsWith('.js') || file.endsWith('.jsx')) {
      results.push(fullPath);
    }
  });
  return results;
}

const files = scanDir(path.resolve(__dirname, 'src'));
const badImports = [];

files.forEach(file => {
  const content = fs.readFileSync(file, 'utf8');
  const regex = /import\s*\{([^}]+)\}\s*from\s*['"]react-icons\/lu['"]/g;
  let match;
  while ((match = regex.exec(content)) !== null) {
    const names = match[1].split(',').map(s => s.trim()).filter(Boolean);
    names.forEach(name => {
      const actualName = name.split(/\s+as\s+/)[0].trim();
      if (typeof lu[actualName] !== 'function') {
        badImports.push({ file: path.relative(__dirname, file), icon: actualName });
      }
    });
  }
});

console.log('Bad icons count:', badImports.length);
console.log(JSON.stringify(badImports, null, 2));
