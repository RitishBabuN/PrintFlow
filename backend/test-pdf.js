const pdfParse = require('pdf-parse');
console.log('typeof default:', typeof pdfParse.default);
if (typeof pdfParse === 'function') console.log('pdfParse is a function');
console.log('all keys:', Object.keys(pdfParse).filter(k => typeof pdfParse[k] === 'function'));
