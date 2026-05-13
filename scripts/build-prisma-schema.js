const fs = require('fs');
const path = require('path');

const PRISMA_DIR = path.join(__dirname, '..', 'prisma');
const MODELS_DIR = path.join(PRISMA_DIR, 'models');
const SCHEMA_FILE = path.join(PRISMA_DIR, 'schema.prisma');

// Base schema content
const baseSchema = `
generator client {
  provider = "prisma-client-js"
  output   = "../src/shared/db/prisma"
}

datasource db {
  provider = "mysql"
  url      = env("DATABASE_URL")
}

`;

// Read all .prisma files from the models directory
const modelFiles = fs.readdirSync(MODELS_DIR)
  .filter(file => file.endsWith('.prisma'))
  .sort(); // Sort to ensure consistent order

// Combine all model files
const modelContent = modelFiles
  .map(file => {
    const content = fs.readFileSync(path.join(MODELS_DIR, file), 'utf8');
    // Remove any import statements from the model files
    const cleanedContent = content.replace(/^import.*$/gm, '');

    // Ensure proper model formatting
    const formattedContent = cleanedContent
      .replace(/\n\s*\n/g, '\n') // Remove multiple empty lines
      .replace(/\s+$/gm, '') // Remove trailing whitespace
      .replace(/\n\s*}/g, '\n}') // Fix closing braces
      .replace(/@default\("([^"]*)"\s*\n/g, '@default("$1")\n') // Fix broken default values
      .replace(/@default\("([^"]*)\n/g, '@default("$1")\n') // Fix unclosed JSON default values
      .replace(/\n\s*@/g, '\n  @') // Fix attribute indentation
      .trim();

    return `// Model from ${file}\n${formattedContent}\n`;
  })
  .join('\n');

// Write the combined schema
fs.writeFileSync(SCHEMA_FILE, baseSchema + modelContent);

console.log('Prisma schema built successfully!'); 