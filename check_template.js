const ExcelJS = require('exceljs');

async function check() {
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.readFile('/Users/sonbn/.gemini/antigravity/scratch/nextjs-ecommerce/public/templates/buildpc.xlsx');
    const ws = workbook.getWorksheet(1);
    
    console.log("Row 10 C align:", ws.getCell('C10').alignment);
    console.log("Row 11 C align:", ws.getCell('C11').alignment);
    console.log("Row 12 C align:", ws.getCell('C12').alignment);
    console.log("Row 13 C align:", ws.getCell('C13').alignment);

    // See what unmerge does
    try { ws.unMergeCells('C10:D10'); } catch(e) {}
    try { ws.unMergeCells('C11:D11'); } catch(e) {}
    console.log("Row 10 C align after unmerge:", ws.getCell('C10').alignment);
    console.log("Row 11 C align after unmerge:", ws.getCell('C11').alignment);
}
check();
