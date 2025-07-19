module.exports = {
  // TypeScript and JavaScript files
  '**/*.{js,jsx,ts,tsx}': [
    'eslint --fix',
    'prettier --write',
  ],
  
  // JSON files
  '**/*.json': [
    'prettier --write',
  ],
  
  // CSS and styling files
  '**/*.{css,scss,sass}': [
    'prettier --write',
  ],
  
  // YAML files
  '**/*.{yml,yaml}': [
    'prettier --write',
  ],
  
} 