import '@testing-library/jest-dom';

// Polyfill for TextEncoder/TextDecoder needed by react-router-dom
// biome-ignore lint/style/useNodejsImportProtocol: test setup
global.TextEncoder = require('util').TextEncoder;
// biome-ignore lint/style/useNodejsImportProtocol: test setup
global.TextDecoder = require('util').TextDecoder;