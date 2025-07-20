/** @type {import('tailwindcss').Config} */
const crossPlatformConfig = require('../cross_platform/config/tailwind.js')

module.exports = {
  ...crossPlatformConfig,
  content: [
    './src/**/*.{js,ts,jsx,tsx,mdx}',
    '../cross_platform/src/**/*.{js,ts,jsx,tsx,mdx}',
  ],
} 