const pdfjs = require('pdf-parse'); // user aliased pdfjs-dist
async function test() {
    try {
        const doc = await pdfjs.getDocument('uploads/1774172523154-Assess-2-notes.pdf').promise;
        console.log("Pages:", doc.numPages);
    } catch(e) {
        console.error(e);
    }
}
test();
