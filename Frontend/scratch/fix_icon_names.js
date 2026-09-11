const fs = require('fs');
const path = require('path');

const srcDir = path.join(__dirname, '../src');

// Mapping of wrong names to correct names
const fixes = {
  'LuCheckCircle': 'LuCircleCheck',
  'LuXCircle': 'LuCircleX',
  'LuLoader2': 'LuLoader',
  'LuAlertTriangle': 'LuTriangleAlert',
  'LuImageIcon': 'LuImage',
  'LuXIcon': 'LuX',
  'LuChevronDownIcon': 'LuChevronDown',
  'LuCheckIcon': 'LuCheck',
  'LuChevronUpIcon': 'LuChevronUp',
  'LuChevronRightIcon': 'LuChevronRight',
  'LuHome': 'LuHouse',
};

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
let totalFixes = 0;

files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  let changed = false;
  
  for (const [wrong, correct] of Object.entries(fixes)) {
    if (content.includes(wrong)) {
      // Use global replace to catch all occurrences
      content = content.split(wrong).join(correct);
      changed = true;
      totalFixes++;
    }
  }

  // Fix corrupted aria-labels and text that contain "LuCopy" instead of "Copy"
  if (content.includes('"LuCopy ')) {
    content = content.replace(/"LuCopy /g, '"Copy ');
    changed = true;
  }
  
  if (changed) {
    fs.writeFileSync(file, content, 'utf8');
    console.log(`Fixed: ${file}`);
  }
});

console.log(`Total files with fixes: ${totalFixes}`);
