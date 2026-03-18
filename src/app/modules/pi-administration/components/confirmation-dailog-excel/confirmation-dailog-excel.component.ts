// import-confirmation-dialog.component.ts
import { Component, OnInit } from '@angular/core';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import { ExcelImportResult } from 'src/app/core/services/export.service';
import { CommonModule } from '@angular/common';
import { AccordionModule } from 'primeng/accordion';
import { TableModule } from 'primeng/table';
import { DividerModule } from 'primeng/divider';
import { ButtonModule } from 'primeng/button';
import { TagModule } from 'primeng/tag';
import { DynamicDialogModule } from 'primeng/dynamicdialog';

interface GroupedChanges {
  addNew: ExcelImportResult[];
  edit: ExcelImportResult[];
  delete: ExcelImportResult[];
  noChange: ExcelImportResult[];
}

@Component({
  selector: 'app-import-confirmation-dialog',
  template: `
    <div class="flex flex-col gap-4">
      <div class="text-lg font-semibold">
        Import Summary
      </div>

      <div class="flex flex-col gap-2 text-sm">
        <div class="flex justify-between p-2 bg-blue-50 rounded">
          <span>Total Rows:</span>
          <span class="font-semibold">{{ totalRows }}</span>
        </div>
        <div class="flex justify-between p-2 bg-green-50 rounded">
          <span>Add New:</span>
          <span class="font-semibold text-green-700">{{ groupedChanges.addNew.length }}</span>
        </div>
        <div class="flex justify-between p-2 bg-yellow-50 rounded">
          <span>Edit:</span>
          <span class="font-semibold text-yellow-700">{{ groupedChanges.edit.length }}</span>
        </div>
        <div class="flex justify-between p-2 bg-red-50 rounded">
          <span>Delete:</span>
          <span class="font-semibold text-red-700">{{ groupedChanges.delete.length }}</span>
        </div>
        <div class="flex justify-between p-2 bg-gray-50 rounded">
          <span>No Change:</span>
          <span class="font-semibold text-gray-700">{{ groupedChanges.noChange.length }}</span>
        </div>
      </div>

      <p-divider />

      <div class="text-base font-semibold">Changes to be Applied:</div>

      <!-- Add New Section -->
      @if(groupedChanges.addNew.length > 0) {
        <p-accordion [multiple]="true">
          <p-accordionTab [header]="'Add New Records (' + groupedChanges.addNew.length + ')'">
            <div class="max-h-60 overflow-auto">
              <p-table [value]="groupedChanges.addNew" styleClass="p-datatable-sm">
                <ng-template pTemplate="header">
                  <tr>
                    <th>Row #</th>
                    @for(col of displayColumns; track col.field) {
                      <th>{{ col.header }}</th>
                    }
                    <th>Action</th>
                  </tr>
                </ng-template>
                <ng-template pTemplate="body" let-item>
                  <tr>
                    <td>{{ item.rowIndex }}</td>
                    @for(col of displayColumns; track col.field) {
                      <td>{{ item.rowData[col.field] || '-' }}</td>
                    }
                    <td>
                      <p-tag [value]="item.action" [severity]="getSeverity(item.action)" />
                    </td>
                  </tr>
                </ng-template>
              </p-table>
            </div>
          </p-accordionTab>
        </p-accordion>
      }

      <!-- Edit Section -->
      @if(groupedChanges.edit.length > 0) {
        <p-accordion [multiple]="true">
          <p-accordionTab [header]="'Edit Records (' + groupedChanges.edit.length + ')'">
            <div class="max-h-60 overflow-auto">
              <p-table [value]="groupedChanges.edit" styleClass="p-datatable-sm">
                <ng-template pTemplate="header">
                  <tr>
                    <th>Row #</th>
                    @for(col of displayColumns; track col.field) {
                      <th>{{ col.header }}</th>
                    }
                    <th>Action</th>
                  </tr>
                </ng-template>
                <ng-template pTemplate="body" let-item>
                  <tr>
                    <td>{{ item.rowIndex }}</td>
                    @for(col of displayColumns; track col.field) {
                      <td>{{ item.rowData[col.field] || '-' }}</td>
                    }
                    <td>
                      <p-tag [value]="item.action" [severity]="getSeverity(item.action)" />
                    </td>
                  </tr>
                </ng-template>
              </p-table>
            </div>
          </p-accordionTab>
        </p-accordion>
      }

      <!-- Delete Section -->
      @if(groupedChanges.delete.length > 0) {
        <p-accordion [multiple]="true">
          <p-accordionTab [header]="'Delete Records (' + groupedChanges.delete.length + ')'">
            <div class="max-h-60 overflow-auto">
              <p-table [value]="groupedChanges.delete" styleClass="p-datatable-sm">
                <ng-template pTemplate="header">
                  <tr>
                    <th>Row #</th>
                    @for(col of displayColumns; track col.field) {
                      <th>{{ col.header }}</th>
                    }
                    <th>Action</th>
                  </tr>
                </ng-template>
                <ng-template pTemplate="body" let-item>
                  <tr>
                    <td>{{ item.rowIndex }}</td>
                    @for(col of displayColumns; track col.field) {
                      <td>{{ item.rowData[col.field] || '-' }}</td>
                    }
                    <td>
                      <p-tag [value]="item.action" [severity]="getSeverity(item.action)" />
                    </td>
                  </tr>
                </ng-template>
              </p-table>
            </div>
          </p-accordionTab>
        </p-accordion>
      }

      <p-divider />

      <div class="flex justify-end gap-2">
        <p-button
          label="Cancel"
          severity="secondary"
          [outlined]="true"
          (onClick)="onCancel()" />
        <p-button
          label="Confirm & Import"
          severity="primary"
          (onClick)="onConfirm()"
          [disabled]="totalChanges === 0" />
      </div>
    </div>
  `,
  standalone: true,
  imports: [CommonModule, AccordionModule, TableModule, DividerModule, ButtonModule, TagModule, DynamicDialogModule]
})
export class ConfirmationDailogExcelComponent implements OnInit {
  importData: ExcelImportResult[] = [];
  groupedChanges: GroupedChanges = {
    addNew: [],
    edit: [],
    delete: [],
    noChange: []
  };
  totalRows = 0;
  totalChanges = 0;
  displayColumns: { header: string, field: string }[] = [];

  constructor(
    public ref: DynamicDialogRef,
    public config: DynamicDialogConfig
  ) { }

  ngOnInit() {
    this.importData = this.config.data?.importData || [];
    this.displayColumns = this.config.data?.displayColumns || [
      { header: 'Attribute Name', field: 'attributeName' },
      { header: 'PI Tag Number', field: 'tagNumber' }
    ];
    this.processImportData();
  }

  processImportData() {
    this.totalRows = this.importData.length;

    this.groupedChanges = {
      addNew: this.importData.filter(item => item.action === 'Add New'),
      edit: this.importData.filter(item => item.action === 'Edit'),
      delete: this.importData.filter(item => item.action === 'Delete'),
      noChange: this.importData.filter(item => item.action === 'No Change')
    };

    this.totalChanges =
      this.groupedChanges.addNew.length +
      this.groupedChanges.edit.length +
      this.groupedChanges.delete.length;
  }

  getSeverity(action: string): 'success' | 'warn' | 'danger' | 'secondary' {
    switch (action) {
      case 'Add New': return 'success';
      case 'Edit': return 'warn';
      case 'Delete': return 'danger';
      default: return 'secondary';
    }
  }

  onConfirm() {
    this.ref.close({ confirmed: true, data: this.groupedChanges });
  }

  onCancel() {
    this.ref.close({ confirmed: false });
  }
}
