import { Injectable } from '@angular/core';
import * as ExcelJS from 'exceljs';
import * as FileSaver from 'file-saver';

export interface ExcelImportResult {
  rowData: any;
  action: 'No Change' | 'Add New' | 'Edit' | 'Delete';
  rowIndex: number;
}

@Injectable({
  providedIn: 'root'
})
export class ExportService {

  constructor() {}

  async exportExcel(data: any[], fileName: string): Promise<void> {
    if (!data || data.length === 0) return;

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('data');

    const columns = Object.keys(data[0]).map(key => ({
      header: key,
      key,
      width: 25
    }));

    columns.push({
      header: 'Actions',
      key: 'Actions',
      width: 18
    });

    worksheet.columns = columns;

    data.forEach(row => {
      worksheet.addRow({
        ...row,
        Actions: 'No Change'
      });
    });

    const headerRow = worksheet.getRow(1);
    headerRow.eachCell(cell => {
      cell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FF2E7D32' }
      };
      cell.font = {
        color: { argb: 'FFFFFFFF' },
        bold: true
      };
      cell.alignment = {
        vertical: 'middle',
        horizontal: 'center'
      };
      cell.border = {
        top: { style: 'thin' },
        left: { style: 'thin' },
        bottom: { style: 'thin' },
        right: { style: 'thin' }
      };
    });
    headerRow.height = 25;

    worksheet.eachRow((row, rowNumber) => {
      if (rowNumber === 1) return;
      row.getCell('Actions').dataValidation = {
        type: 'list',
        allowBlank: false,
        formulae: ['"No Change,Add New,Edit,Delete"'],
        showErrorMessage: true,
        errorTitle: 'Invalid Action',
        error: 'Select a value from dropdown only'
      };
    });

    worksheet.views = [{ state: 'frozen', ySplit: 1 }];

    const buffer = await workbook.xlsx.writeBuffer();
    FileSaver.saveAs(
      new Blob([buffer]),
      `${fileName}_export_${Date.now()}.xlsx`
    );
  }

  async importExcel(file: File): Promise<ExcelImportResult[]> {
    const workbook = new ExcelJS.Workbook();
    const buffer = await file.arrayBuffer();

    await workbook.xlsx.load(buffer);
    const worksheet = workbook.worksheets[0];

    const headers: string[] = [];
    const results: ExcelImportResult[] = [];
    const validActions = ['No Change', 'Add New', 'Edit', 'Delete'];

    worksheet.getRow(1).eachCell((cell, colNumber) => {
      headers[colNumber] = String(cell.value ?? '').trim();
    });

    worksheet.eachRow((row, rowNumber) => {
      if (rowNumber === 1) return;

      const rowData: any = {};
      let action: any = 'No Change';

      row.eachCell((cell, colNumber) => {
        const key = headers[colNumber];
        if (!key) return;

        if (key === 'Actions') {
          action = validActions.includes(String(cell.value))
            ? cell.value
            : 'No Change';
        } else {
          rowData[key] = cell.value;
        }
      });

      results.push({
        rowData,
        action,
        rowIndex: rowNumber
      });
    });

    return results;
  }

  async exportTemplate(columns: string[], fileName: string, sampleRows = 5): Promise<void> {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('data');

    worksheet.columns = [
      ...columns.map(col => ({ header: col, key: col, width: 25 })),
      { header: 'Actions', key: 'Actions', width: 18 }
    ];

    for (let i = 0; i < sampleRows; i++) {
      worksheet.addRow({ Actions: 'No Change' });
    }

    const headerRow = worksheet.getRow(1);
    headerRow.eachCell(cell => {
      cell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FF2E7D32' }
      };
      cell.font = {
        color: { argb: 'FFFFFFFF' },
        bold: true
      };
      cell.alignment = {
        vertical: 'middle',
        horizontal: 'center'
      };
    });
    headerRow.height = 25;

    worksheet.eachRow((row, rowNumber) => {
      if (rowNumber === 1) return;
      row.getCell('Actions').dataValidation = {
        type: 'list',
        allowBlank: false,
        formulae: ['"No Change,Add New,Edit,Delete"']
      };
    });

    // 5. Write and Save
    const buffer = await workbook.xlsx.writeBuffer();
    FileSaver.saveAs(
      new Blob([buffer]),
      `${fileName}_template_${Date.now()}.xlsx`
    );
  }
}