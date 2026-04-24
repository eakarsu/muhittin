const fs = require('fs');
const path = require('path');

const pagesDir = path.join(__dirname, '../frontend/src/pages');

function transform(file) {
  const filePath = path.join(pagesDir, file);
  let content = fs.readFileSync(filePath, 'utf8');

  if (!content.includes('table-container')) return false;
  if (content.includes('SortableTable')) return false; // already done

  // Add import
  if (content.includes("import { useAuth }")) {
    content = content.replace(
      "import { useAuth } from '../context/AuthContext';",
      "import { useAuth } from '../context/AuthContext';\nimport SortableTable from '../components/SortableTable';"
    );
  }

  fs.writeFileSync(filePath, content);
  console.log(`Added import to ${file}`);
  return true;
}

// Add imports to all files that need it
const files = fs.readdirSync(pagesDir).filter(f => f.endsWith('.jsx'));
for (const f of files) {
  transform(f);
}
