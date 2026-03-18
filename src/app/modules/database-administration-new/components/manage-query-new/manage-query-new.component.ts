import { Component } from '@angular/core';
import { DatabaseAdministrationNewComponent } from '../../database-administration-new.component';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { DynamicDialogConfig, DynamicDialogRef, DialogService } from 'primeng/dynamicdialog';
import { MessageService } from 'primeng/api';
import { NgxSpinnerService } from 'ngx-spinner';
import { SystemFilterService } from 'src/app/modules/database-administration/services/system/system-filter.service';
import { DatabaseAdministrationService } from 'src/app/modules/database-administration/services/database-administration.service';
import { BreakpointObserver } from '@angular/cdk/layout';

@Component({
  selector: 'app-manage-query-new',
  standalone: false,
  templateUrl: './manage-query-new.component.html',
  styleUrl: './manage-query-new.component.css'
})
export class ManageQueryNewComponent extends DatabaseAdministrationNewComponent {
  dbQueryForm: FormGroup;
  mode: string = 'create';
  languageOptions = ['sql', 'json', 'javascript'];
  editorOptions!: any;

  constructor(
    dialog: DialogService,
    messageService: MessageService,
    spinner: NgxSpinnerService,
    filterService: SystemFilterService,
    databaseAdministrationService: DatabaseAdministrationService,
    breakpointObserver: BreakpointObserver,
    public dialogConfig: DynamicDialogConfig,
    private ref: DynamicDialogRef,
    private fb: FormBuilder
  ) {
    super(dialog, messageService, spinner, filterService, databaseAdministrationService, breakpointObserver);
    this.dbQueryForm = this.fb.group({
      queryId: new FormControl<string>('', [Validators.required]),
      sysId: new FormControl<string>('', [Validators.required]),
      sysName: new FormControl<string>('', [Validators.required]),
      query: new FormControl<string>('', [Validators.required]),
      queryLanguage: new FormControl<string>('sql', [Validators.required]),
      active: new FormControl<boolean>(true),
      description: new FormControl<string>('', []),
    });

    if (this.dialogConfig?.data.mode === 'create') {
      this.dbQueryForm.patchValue({
        sysId: this.dialogConfig.data?.systemData._id,
        sysName: this.dialogConfig.data?.systemData.sysName
      });
    }

    this.editorOptions = {
      theme: 'vs-dark',
      language: this.dbQueryForm.get('queryLanguage')?.value,
      automaticLayout: true,
      minimap: { enabled: false },
      scrollBeyondLastLine: false
    };

    if (this.dialogConfig.data.mode === 'edit') {
      this.mode = this.dialogConfig.data.mode;
      this.patchValue(this.dialogConfig.data?.queryData);
    }
  }

  saveDBQuery(): void {
    if (!this.dbQueryForm.valid) return;

    const formValue = this.dbQueryForm.getRawValue();
    let queryValue = formValue.query;

    if (formValue.queryLanguage === 'json') {
      try {
        queryValue = JSON.parse(formValue.query);
      } catch {
        this.messageService.add({
          severity: 'error',
          summary: 'Invalid JSON',
          detail: 'Query is not valid JSON format.',
          life: 3000
        });
        return;
      }
    }

    const payload = {
      query: queryValue,
      queryId: formValue.queryId,
      sysId: formValue.sysId,
      sysName: formValue.sysName,
      description: formValue.description,
      queryLanguage: formValue.queryLanguage,
      active: formValue.active
    };

    if (this.mode === 'create') {
      this.databaseAdministrationService.postDatabase(payload).subscribe({
        next: () => this.ref.close({ status: true }),
        error: () => {
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: 'Error while creating query',
            life: 3000
          });
        }
      });
    } else {
      const databaseId = this.dialogConfig.data?.queryData?._id;
      this.databaseAdministrationService.putDatabase(payload, databaseId).subscribe({
        next: () => this.ref.close({ status: true }),
        error: () => {
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: 'Error while updating query',
            life: 3000
          });
        }
      });
    }
  }

  patchValue(queryData: any): void {
    this.dbQueryForm.patchValue({
      query: queryData.query,
      queryId: queryData.queryId,
      sysId: queryData.sysId,
      sysName: queryData.sysName,
      description: queryData.description,
      queryLanguage: queryData.queryLanguage,
    });
    this.onLanguageChange();
  }

  onLanguageChange() {
    this.editorOptions = {
      ...this.editorOptions,
      language: this.dbQueryForm.get('queryLanguage')?.value
    };
  }

  cancel() {
    this.ref.close({ status: false });
  }
}
