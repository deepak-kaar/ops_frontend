import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, FormBuilder, Validators } from '@angular/forms';
import { DynamicDialogConfig, DynamicDialogRef, DialogService } from 'primeng/dynamicdialog';
import { OpsinsightDataComponent } from '../../opsinsight-data.component';
import { catchError, finalize, map, Observable, of } from 'rxjs';
import { AttributeMappingComponent } from '../attribute-mapping/attribute-mapping.component';

@Component({
  selector: 'app-manage-customer',
  standalone: false,
  templateUrl: './manage-customer.component.html',
  styleUrl: './manage-customer.component.css'
})
export class ManageCustomerComponent extends OpsinsightDataComponent implements OnInit {
  customerForm: FormGroup;
  mode: string = 'create';
  mappedAttributes: any[] = [];
  availableAttributes$!: Observable<any[]>;

  activeStatus: any[] = [
    {
      name: 'Active',
      value: true
    },
    {
      name: 'Inactive',
      value: false
    }
  ];

  constructor(
    public dialogConfig: DynamicDialogConfig,
    private ref: DynamicDialogRef,
    private fb: FormBuilder,
    protected override dialog: DialogService
  ) {
    super();

    this.customerForm = this.fb.group({
      _id: new FormControl<any>(''),
      consumerName: new FormControl<string>('', [Validators.required]),
      consumerShortName: new FormControl<string>('', [Validators.required]),
      serviceName: new FormControl<string>('', [Validators.required]),
      consumerOrg: new FormControl<string>(''),
      consumerSupport: new FormControl<string>(''),
      isActive: new FormControl<boolean>(true),
    });

    if (this.dialogConfig.data?.mode === 'edit') {
      this.mode = this.dialogConfig.data.mode;
      this.patchValue(this.dialogConfig.data?.customerData);
      this.loadMappedAttributes();
    }
  }

  override ngOnInit(): void {
    super.ngOnInit();
    this.loadAvailableAttributes();
  }

  loadAvailableAttributes(): void {
    this.availableAttributes$ = this.opsinsightDataService.getAttributes().pipe(
      map((res: any) => {
        const attributes = res?.attributes || res?.result || res?.data || [];
        return attributes.filter((attr: any) => {
          return attr.attributeName === 'Code' || (attr.value !== undefined && attr.value !== null);
        }).map((attr: any) => ({
          _id: attr._id,
          attributeId: attr.attributeId,
          attributeName: attr.attributeName || 'N/A',
          value: attr.value,
          code: attr.attributeName === 'Code' ? attr.value : (attr.value || attr.attributeName),
          entityOrInstanceId: attr.entityOrInstanceId,
          isActive: attr.isActive !== undefined ? attr.isActive : true,
          displayName: attr.attributeName || 'N/A'
        }));
      }),
      catchError((err) => {
        console.error('Error loading attributes:', err);
        return of([]);
      })
    );
  }

  loadMappedAttributes(): void {
    const customerId = this.customerForm.get('_id')?.value;
    if (!customerId || this.mode === 'create') {
      this.mappedAttributes = [];
      return;
    }

    this.opsinsightDataService.getCustomerAttributes(customerId).subscribe({
      next: (res: any) => {
        this.mappedAttributes = res?.result || res?.data || [];
      },
      error: (err) => {
        console.error('Error loading mapped attributes:', err);
        this.mappedAttributes = [];
      }
    });
  }

  openAttributeMappingDialog(): void {
    const dialogRef = this.dialog.open(AttributeMappingComponent, {
      header: 'Select Attributes to Map',
      modal: true,
      closable: true,
      width: '80vw',
      data: {
        customerId: this.customerForm.get('_id')?.value || '',
        customerName: this.customerForm.get('consumerName')?.value || '',
        existingAttributes: this.mappedAttributes,
        mode: 'selection' // Indicate this is for selection, not full mapping
      }
    });

    dialogRef.onClose.subscribe((result: any) => {
      if (result?.status && result?.data?.attributes) {
        // Replace all attributes with the selected ones from dialog
        this.mappedAttributes = result.data.attributes;
      }
    });
  }

  deleteAttribute(attribute: any): void {
    const index = this.mappedAttributes.findIndex(
      (attr: any) => (attr.attributeId || attr._id) === (attribute.attributeId || attribute._id)
    );
    if (index > -1) {
      this.mappedAttributes.splice(index, 1);
    }
  }

  saveCustomer(): void {
    if (this.customerForm.valid) {
      const formValue = this.customerForm.getRawValue();
      const payload = {
        consumerName: formValue.consumerName,
        consumerShortName: formValue.consumerShortName,
        serviceName: formValue.serviceName,
        consumerOrg: formValue.consumerOrg || '',
        consumerSupport: formValue.consumerSupport || '',
        isActive: formValue.isActive,
        createdBy: this.mode === 'create' ? 'User1' : formValue.createdBy,
        modifiedBy: 'User1'
      };

      if (this.mode === 'create') {
        this.spinner.show();
        this.opsinsightDataService.postCustomer(payload).subscribe({
          next: (res: any) => {
            const customerId = res.result?.insertedId || res.data?._id;
            // Save attributes if any are mapped
            if (this.mappedAttributes.length > 0 && customerId) {
              this.saveAttributes(customerId, () => {
                this.spinner.hide();
                this.showToast('success', 'Success', 'Successfully created customer with attributes', 2000, false);
                this.ref.close({ status: true, data: { ...payload, _id: customerId }, attributes: this.mappedAttributes });
              });
            } else {
              this.spinner.hide();
              this.showToast('success', 'Success', 'Successfully created customer', 2000, false);
              this.ref.close({ status: true, data: { ...payload, _id: customerId } });
            }
          },
          error: (err) => {
            this.spinner.hide();
            this.showToast('error', 'Error', 'Error when creating customer', 2000, false);
          }
        });
      } else {
        const id = this.customerForm.get('_id')?.value;
        this.spinner.show();
        this.opsinsightDataService.putCustomer(payload, id).subscribe({
          next: (res: any) => {
            // Save attributes
            if (this.mappedAttributes.length > 0) {
              this.saveAttributes(id, () => {
                this.spinner.hide();
                this.showToast('success', 'Success', 'Successfully updated customer with attributes', 2000, false);
                this.ref.close({ status: true, data: { ...payload, _id: id }, attributes: this.mappedAttributes });
              });
            } else {
              // Clear attributes if none are mapped
              this.opsinsightDataService.postCustomerAttributes(id, { attributes: [] }).subscribe({
                next: () => {
                  this.spinner.hide();
                  this.showToast('success', 'Success', 'Successfully updated customer', 2000, false);
                  this.ref.close({ status: true, data: { ...payload, _id: id } });
                },
                error: () => {
                  this.spinner.hide();
                  this.showToast('success', 'Success', 'Successfully updated customer', 2000, false);
                  this.ref.close({ status: true, data: { ...payload, _id: id } });
                }
              });
            }
          },
          error: (err) => {
            this.spinner.hide();
            this.showToast('error', 'Error', 'Error when updating customer', 2000, false);
          }
        });
      }
    } else {
      this.showToast('warn', 'Validation', 'Please fill all required fields', 2000, false);
    }
  }

  saveAttributes(customerId: string, callback?: () => void): void {
    const attributesPayload = {
      attributes: this.mappedAttributes.map(attr => ({
        _id: attr._id,
        attributeId: attr.attributeId,
        attributeName: attr.attributeName || attr.displayName,
        value: attr.value,
        code: attr.code || attr.value,
        entityOrInstanceId: attr.entityOrInstanceId,
        isActive: attr.isActive
      }))
    };

    this.opsinsightDataService.postCustomerAttributes(customerId, attributesPayload).subscribe({
      next: () => {
        if (callback) callback();
      },
      error: (err) => {
        console.error('Error saving attributes:', err);
        if (callback) callback();
      }
    });
  }

  patchValue(customerData: any): void {
    if (customerData) {
      this.customerForm.patchValue({
        _id: customerData._id,
        consumerName: customerData.consumerName,
        consumerShortName: customerData.consumerShortName,
        serviceName: customerData.serviceName || '',
        consumerOrg: customerData.consumerOrg || '',
        consumerSupport: customerData.consumerSupport || '',
        isActive: customerData.isActive !== undefined ? customerData.isActive : true,
      });
      // Load mapped attributes for edit mode
      if (customerData._id) {
        this.loadMappedAttributes();
      }
    }
  }

  cancel() {
    this.ref.close({ status: false });
  }
}
