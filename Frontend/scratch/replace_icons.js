const fs = require('fs');
const path = require('path');

const srcDir = path.join(__dirname, '../src');

function walk(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach(function(file) {
    file = path.join(dir, file);
    const stat = fs.statSync(file);
    if (stat && stat.isDirectory()) { 
      results = results.concat(walk(file));
    } else { 
      if (file.endsWith('.js') || file.endsWith('.jsx')) {
        results.push(file);
      }
    }
  });
  return results;
}

const files = walk(srcDir);

files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  if (content.includes('lucide-react')) {
    // Extract imports
    const importRegex = /import\s*\{\s*([^}]+)\s*\}\s*from\s*["']lucide-react["']/g;
    let match;
    let icons = [];
    while ((match = importRegex.exec(content)) !== null) {
      icons = icons.concat(match[1].split(',').map(s => s.trim()).filter(s => s));
    }

    if (icons.length > 0) {
      // Replace import statement
      const newImport = `import { ${icons.map(i => `Lu${i}`).join(', ')} } from "react-icons/lu";`;
      content = content.replace(/import\s*\{\s*[^}]+\s*\}\s*from\s*["']lucide-react["'];?/g, newImport);

      // Replace usage
      icons.forEach(icon => {
        // Replace component usage: <Icon -> <LuIcon
        const tagRegex = new RegExp(`<${icon}(\\s|>)`, 'g');
        content = content.replace(tagRegex, `<Lu${icon}$1`);
        
        // Replace ending tag: </Icon> -> </LuIcon>
        const endTagRegex = new RegExp(`</${icon}>`, 'g');
        content = content.replace(endTagRegex, `</Lu${icon}>`);

        // Replace passing as prop/variable (like `icon: Icon`)
        const propRegex = new RegExp(`(\\b|\\W)${icon}(\\b|\\W)`, 'g');
        // Be careful not to replace parts of strings or other words.
        // It's safer to use regex that matches whole words.
        content = content.replace(new RegExp(`\\b${icon}\\b`, 'g'), `Lu${icon}`);
      });

      fs.writeFileSync(file, content, 'utf8');
      console.log(`Updated ${file}`);
    }
  }
});
