const path = require('path');

/** Next.js config to set Turbopack workspace root (absolute) and ensure distDir is inside project */
module.exports = {
  turbopack: {
    root: path.resolve(__dirname),
  },
  // Ensure the build output directory is inside the frontend project
  // Use a relative distDir to avoid Turbopack path concatenation issues
  distDir: '.next',
};
