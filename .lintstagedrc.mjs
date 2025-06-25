export default {
  '**/*.{js,jsx,ts,tsx,json,md,css}': ['prettier . --write'],
  'src/**/*.{js,jsx}': ['eslint . --fix --no-warn-ignored'],
};
