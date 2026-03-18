import { Injectable } from '@angular/core';
import * as ExcelJS from 'exceljs';
import * as FileSaver from 'file-saver';

@Injectable({
  providedIn: 'root'
})
export class LockScreenExportService {

  async exportToExcel(categories: any[], filename: string = 'lock-screen-categories'): Promise<void> {
    if (categories.length === 0) return;

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Categories');

    // Define columns
    const columns = [
      { header: '_id', key: '_id', width: 25 },
      { header: 'Category Name', key: 'categoryName', width: 30 },
      { header: 'Category Description', key: 'categoryDescription', width: 40 },
      { header: 'Is Active', key: 'isActive', width: 10 },
      { header: 'Roles', key: 'roles', width: 30 },
      { header: 'Mapped Attributes', key: 'mappedAttributes', width: 50 },
      { header: 'Created On', key: 'createdOn', width: 15 },
      { header: 'Action', key: 'action', width: 15 }
    ];

    worksheet.columns = columns;

    // Add data rows
    categories.forEach(rawCategory => {
      const cat = this.normalizeCategory(rawCategory);
      const rolesStr = this.formatRoles(cat);
      const mappedAttrs = this.formatMappedAttributes(
        cat.attributeMappings ||
        cat.mappedAttributes ||
        cat.attributeMapping ||
        []
      );

      worksheet.addRow({
        _id: cat._id,
        categoryName: cat.categoryName,
        categoryDescription: cat.categoryDescription || '',
        isActive: cat.isActive ? 'Yes' : 'No',
        roles: rolesStr,
        mappedAttributes: mappedAttrs,
        createdOn: cat.createdOn ? new Date(cat.createdOn).toLocaleDateString() : '',
        action: 'No Change'
      });
    });

    // Style header row
    const headerRow = worksheet.getRow(1);
    headerRow.eachCell(cell => {
      cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF2E7D32' } };
      cell.font = { color: { argb: 'FFFFFFFF' }, bold: true };
      cell.alignment = { vertical: 'middle', horizontal: 'center' };
      cell.border = {
        top: { style: 'thin' }, left: { style: 'thin' },
        bottom: { style: 'thin' }, right: { style: 'thin' }
      };
    });
    headerRow.height = 25;

    // Style data rows and add dropdown validation
    worksheet.eachRow((row, rowNumber) => {
      if (rowNumber > 1) {
        row.eachCell((cell, colNumber) => {
          cell.border = {
            top: { style: 'thin' }, left: { style: 'thin' },
            bottom: { style: 'thin' }, right: { style: 'thin' }
          };
          if (colNumber === 6) cell.alignment = { wrapText: true, vertical: 'top' };
          if (colNumber === 8) {
            cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFFF9C4' } };
            cell.font = { bold: true, color: { argb: 'FF333333' } };
            cell.alignment = { vertical: 'middle', horizontal: 'center' };
          }
        });
      }
    });

    // Add dropdown validation for Action column
    for (let rowNum = 2; rowNum <= categories.length + 1; rowNum++) {
      const cell = worksheet.getCell(`H${rowNum}`);
      cell.dataValidation = {
        type: 'list',
        allowBlank: false,
        formulae: ['"No Change,Create,Edit,Delete"'],
        showErrorMessage: true,
        errorStyle: 'error',
        errorTitle: 'Invalid Action',
        error: 'Please select: No Change, Create, Edit, or Delete'
      };
    }

    worksheet.views = [{ state: 'frozen', ySplit: 1 }];

    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    });
    FileSaver.saveAs(blob, `${filename}_${new Date().getTime()}.xlsx`);
  }

  private normalizeCategory(category: any): any {
    if (!category || typeof category !== 'object') return {};

    return (
      category.category ||
      category.data?.category ||
      category.response?.category ||
      category.result?.category ||
      category
    );
  }

  private formatRoles(category: any): string {
    const roleSource =
      category.roles ||
      category.roleNames ||
      category.roleName ||
      category.frozenRoles ||
      [];

    const roles = Array.isArray(roleSource) ? roleSource : [roleSource];

    return roles
      .map((role: any) => {
        if (typeof role === 'string') return role;
        return role?.roleName || role?.name || role?.roleId || '';
      })
      .filter((role: string) => !!role)
      .join(', ');
  }

  private formatMappedAttributes(mappings: any[]): string {
    if (!mappings || mappings.length === 0) return '';
    
    const grouped = mappings.reduce((acc: any, mapping: any) => {
      const page = mapping.pageName || 'Unknown Page';
      if (!acc[page]) acc[page] = [];
      acc[page].push(
        mapping.attributeName ||
        mapping.attributeLabel ||
        mapping.propertyKey ||
        mapping.attributeId ||
        'N/A'
      );
      return acc;
    }, {});

    return Object.entries(grouped)
      .map(([page, attrs]: [string, any]) => `${page}: ${attrs.join(', ')}`)
      .join('\n');
  }

  async parseExcelFile(file: File): Promise<any[]> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = async (e: any) => {
        try {
          const buffer = e.target.result;
          const workbook = new ExcelJS.Workbook();
          await workbook.xlsx.load(buffer);
          const worksheet = workbook.getWorksheet(1);
          if (!worksheet) {
            reject(new Error('No worksheet found'));
            return;
          }
          const jsonData: any[] = [];
          const headers: string[] = [];
          worksheet.eachRow((row, rowNumber) => {
            if (rowNumber === 1) {
              row.eachCell((cell) => headers.push(cell.value?.toString() || ''));
            } else {
              const rowData: any = {};
              row.eachCell((cell, colNumber) => {
                const header = headers[colNumber - 1];
                if (header) rowData[header] = cell.value;
              });
              jsonData.push(rowData);
            }
          });
          resolve(jsonData);
        } catch (error) {
          reject(error);
        }
      };
      reader.onerror = () => reject(reader.error);
      reader.readAsArrayBuffer(file);
    });
  }

  categorizeImportData(importedData: any[], existingCategories: any[]): {
    create: any[]; edit: any[]; delete: any[]; noChange: any[];
  } {
    const result = { create: [] as any[], edit: [] as any[], delete: [] as any[], noChange: [] as any[] };
    const existingMap = new Map(existingCategories.map(cat => [cat._id, cat]));

    importedData.forEach(row => {
      const action = row['Action']?.toString().toLowerCase().trim();
      const id = row['_id'];

      if (action === 'delete') {
        if (id && existingMap.has(id)) result.delete.push({ ...row, _id: id });
      } else if (action === 'create') {
        result.create.push(this.mapRowToCategory(row, true));
      } else if (action === 'edit') {
        if (id && existingMap.has(id)) result.edit.push(this.mapRowToCategory(row, false));
      } else {
        result.noChange.push(row);
      }
    });

    return result;
  }

  private mapRowToCategory(row: any, isCreate: boolean): any {
    const category: any = {
      categoryName: row['Category Name'],
      categoryDescription: row['Category Description'] || '',
      isActive: row['Is Active']?.toString().toLowerCase() === 'yes'
    };

    if (!isCreate && row['_id']) category._id = row['_id'];
    if (row['Roles']) {
      const roleNames = row['Roles'].split(',').map((r: string) => r.trim()).filter((r: string) => r);
      category.roleNames = roleNames;
    }

    return category;
  }
}
