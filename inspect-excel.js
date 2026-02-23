const ExcelJS = require('exceljs');
const path = require('path');

async function inspectExcel() {
    const workbook = new ExcelJS.Workbook();
    const filePath = '/Users/sonbn/.gemini/antigravity/scratch/nextjs-ecommerce/public/templates/buildpc.xlsx';

    try {
        await workbook.xlsx.readFile(filePath);
        const worksheet = workbook.getWorksheet(1);

        console.log(`Worksheet Name: ${worksheet.name}`);

        // Log first 30 rows to find headers
        for (let i = 1; i <= 30; i++) {
            const row = worksheet.getRow(i);
            const values = row.values;
            if (values.length > 0) {
                console.log(`Row ${i}: ${JSON.stringify(values)}`);
            }
        }
    } catch (err) {
        console.error('Error reading excel:', err);
    }
}

inspectExcel();
