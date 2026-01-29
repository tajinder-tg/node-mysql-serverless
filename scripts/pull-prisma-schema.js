const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

// Get the absolute path to the prisma directory
const prismaDir = path.join(__dirname, '..', 'prisma');
const modelsDir = path.join(prismaDir, 'models');
const rootDir = path.join(__dirname, '..');

// Compatible types that can be converted between each other
const COMPATIBLE_TYPES = {
  'Int': ['BigInt'],
  'BigInt': ['Int'],
  'String': ['UUID', 'VarChar'],
  'UUID': ['String'],
  'VarChar': ['String']
};

try {
  console.log('🔄 Pulling Prisma schema from database...');
  
  // Run prisma db pull command
  execSync('npx prisma db pull', {
    stdio: 'inherit'
  });

  console.log('✅ Successfully pulled schema from database');
  
  // Read the updated schema
  const schemaPath = path.join(prismaDir, 'schema.prisma');
  let schemaContent = fs.readFileSync(schemaPath, 'utf8');
  
  // Process the schema to fix any type mismatches
  console.log('🔄 Processing schema for type compatibility...');
  schemaContent = processSchema(schemaContent);
  
  // Write the processed schema back
  fs.writeFileSync(schemaPath, schemaContent);
  
  // Split the schema into model definitions
  console.log('🔄 Splitting models into separate files...');
  const modelRegex = /model\s+\w+\s*{[^}]+}/g;
  const models = schemaContent.match(modelRegex) || [];
  
  // Create models directory if it doesn't exist
  if (!fs.existsSync(modelsDir)) {
    fs.mkdirSync(modelsDir, { recursive: true });
  }
  
  // Write each model to its own file
  models.forEach(modelContent => {
    const modelName = modelContent.match(/model\s+(\w+)/)[1];
    const fileName = `${modelName.toLowerCase()}.prisma`;
    fs.writeFileSync(path.join(modelsDir, fileName), modelContent + '\n');
  });
  
  console.log('✅ Successfully updated model files');
  
  // Generate Prisma Client
  console.log('🔄 Generating Prisma Client...');
  execSync(`npx prisma generate --schema=${schemaPath}`, {
    stdio: 'inherit',
    env: {
      ...process.env,
      PRISMA_CLIENT_OUTPUT_DIR: path.join(rootDir, 'node_modules/@prisma/client')
    }
  });
  
  console.log('✅ Successfully generated Prisma Client');
} catch (error) {
  console.error('❌ Error:', error.message);
  process.exit(1);
}

function processSchema(schemaContent) {
  const models = parseModels(schemaContent);
  
  return schemaContent.replace(/model\s+\w+\s*{[^}]+}/g, (modelBlock) => {
    return modelBlock.replace(/@relation\([^)]*\)/g, (match) => {
      const sourceTable = modelBlock.match(/model\s+(\w+)/)[1];
      const targetTable = match.match(/references:\s*\[([^\]]+)\]/)?.[1];
      const fieldName = match.match(/fields:\s*\[([^\]]+)\]/)?.[1];
      
      if (!targetTable || !fieldName) {
        return match;
      }
      
      // Get field types
      const sourceFieldType = getFieldType(models, sourceTable, fieldName);
      const targetFieldType = getFieldType(models, targetTable, 'id');
      
      // Check type compatibility
      if (sourceFieldType && targetFieldType && !areTypesCompatible(sourceFieldType, targetFieldType)) {
        console.warn(`⚠️ Type mismatch in relation: ${sourceTable}.${fieldName} (${sourceFieldType}) -> ${targetTable}.id (${targetFieldType})`);
        
        if (COMPATIBLE_TYPES[targetFieldType]?.includes(sourceFieldType)) {
          console.log(`🔄 Converting ${sourceTable}.${fieldName} from ${sourceFieldType} to ${targetFieldType}`);
          modelBlock = fixFieldType(modelBlock, sourceTable, fieldName, targetFieldType);
        }
      }
      
      return match;
    });
  });
}

function parseModels(schema) {
  const models = {};
  const modelRegex = /model\s+(\w+)\s*{([^}]+)}/g;
  let match;
  
  while ((match = modelRegex.exec(schema)) !== null) {
    const modelName = match[1];
    const modelBody = match[2];
    models[modelName] = {
      name: modelName,
      fields: parseFields(modelBody),
      body: modelBody
    };
  }
  
  return models;
}

function parseFields(modelBody) {
  const fields = {};
  const fieldRegex = /(\w+)\s+([\w\?]+)(\s+@\w+.*)?/g;
  let match;
  
  while ((match = fieldRegex.exec(modelBody)) !== null) {
    const fieldName = match[1];
    const fieldType = match[2].replace('?', '');
    fields[fieldName] = {
      name: fieldName,
      type: fieldType
    };
  }
  
  return fields;
}

function getFieldType(models, modelName, fieldName) {
  return models[modelName]?.fields[fieldName]?.type || null;
}

function areTypesCompatible(type1, type2) {
  if (!type1 || !type2) return false;
  if (type1 === type2) return true;
  return COMPATIBLE_TYPES[type1]?.includes(type2) || COMPATIBLE_TYPES[type2]?.includes(type1);
}

function fixFieldType(schema, modelName, fieldName, newType) {
  const regex = new RegExp(`(model\\s+${modelName}\\s*{[^}]*?\\s*${fieldName}\\s+)([^\\s]+)`, 's');
  return schema.replace(regex, (match, p1, p2) => {
    const isOptional = p2.endsWith('?');
    return `${p1}${newType}${isOptional ? '?' : ''}`;
  });
}