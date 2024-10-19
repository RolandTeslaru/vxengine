import { readFile, writeFile } from 'fs/promises';
import { resolve } from 'path';

// Path to your Webpack output file
const indexPath = resolve('./dist/index.js');

// CSS import statement
const cssImport = `import './globals.css';\n`;
const scssImport = `import './mini.css';\n`;

try {
  // Read the current contents of index.js
  const data = await readFile(indexPath, 'utf8');

  // Check if the CSS import already exists
  if (!data.includes(cssImport)) {
    // Add the CSS import at the beginning of the file
    const result = cssImport + scssImport + data;

    // Write the updated content back to index.js
    await writeFile(indexPath, result, 'utf8');
    console.log('CSS import added to index.js');
  } else {
    console.log('CSS import already exists in index.js');
  }
} catch (error) {
  console.error('Error modifying index.js:', error);
}