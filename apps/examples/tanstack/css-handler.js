/**
 * This module helps Node.js handle CSS imports in ESM
 */
export function load(url, context, nextLoad) {
  // Check if the file is a CSS file
  if (url.endsWith('.css')) {
    // Return empty CSS module for Node.js environment
    return {
      format: 'module',
      shortCircuit: true,
      source: 'export default {}',
    };
  }
  
  // Let Node.js handle all other files
  return nextLoad(url, context);
}
