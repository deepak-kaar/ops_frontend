import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, of, forkJoin, from } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { environment } from 'src/environments/environment';

export interface ImportAction {
  id?: string;
  module: string;
  action: 'ignore' | 'create' | 'edit' | 'delete';
  label: string;
  data: any;
  oldData?: any;
  timestamp?: string;
  status?: string;
  validationError?: string; // For storing validation errors
}

export interface ImportContext {
  appId?: string | null;
  orgId?: string | null;
}

export interface ImportResult {
  success: boolean;
  action: ImportAction;
  message: string;
  error?: any;
}

export interface ImportSummary {
  total: number;
  successful: number;
  failed: number;
  results: ImportResult[];
  createResults: ImportResult[];
  editResults: ImportResult[];
  deleteResults: ImportResult[];
}

/**
 * Service to handle importing data from Excel files
 * Executes CRUD operations for different modules
 */
@Injectable({
  providedIn: 'root'
})
export class ImportService {
  private http = inject(HttpClient);
  private baseUrl = environment.apiUrl;

  // Module endpoint mappings - keys are normalized (lowercase with spaces/hyphens)
  private moduleEndpoints: { [key: string]: { create: string; update: string; delete: string; idField: string } } = {
    'webservice administration': {
      create: 'webService/ws',
      update: 'webService/ws',
      delete: 'webService/ws',
      idField: '_id'
    },
    'datasource administration': {
      create: 'datasource/postDataSource',
      update: 'datasource/updateDataSource',
      delete: 'datasource/deleteDataSource',
      idField: '_id'
    },
    'schedulerjob administration': {
      create: 'scheduler/job',
      update: 'scheduler/job',
      delete: 'scheduler/job',
      idField: '_id'
    },
    'datapoint administration': {
      create: 'entity/createEntity',
      update: 'entity/updateEntity',
      delete: 'entity/deleteEntity',
      idField: '_id'
    },
    'organization administration': {
      create: 'organization/createOrg',
      update: 'organization/updateOrg',
      delete: 'organization/deleteOrg',
      idField: '_id'
    },
    'pi administration': {
      create: 'pi/send',
      update: 'pi/send',
      delete: 'pi/send',
      idField: '_id'
    },
    'config administration': {
      create: 'config/postConfig',
      update: 'config/updateConfig',
      delete: 'config/deleteConfig',
      idField: '_id'
    },
    'database administration': {
      create: 'database/postQuery',
      update: 'database/updateQuery',
      delete: 'database/deleteQuery',
      idField: '_id'
    },
    'email administration': {
      create: 'email/postEmail',
      update: 'email/updateEmail',
      delete: 'email/deleteEmail',
      idField: '_id'
    }
  };

  /**
   * Normalize module name for endpoint lookup
   */
  private normalizeModuleName(module: string): string {
    return module.toLowerCase().replace(/-/g, ' ').trim();
  }

  /**
   * Execute all import actions asynchronously
   * Each action is independent - failures don't affect other actions
   * @param actions - List of import actions to execute
   * @param context - Optional context with appId and orgId to include in payloads
   */
  executeImportActions(actions: ImportAction[], context?: ImportContext): Observable<ImportSummary> {
    if (actions.length === 0) {
      return of({
        total: 0,
        successful: 0,
        failed: 0,
        results: [],
        createResults: [],
        editResults: [],
        deleteResults: []
      });
    }

    // Create observables for each action
    const actionObservables = actions.map(action => this.executeAction(action, context));

    // Execute all actions in parallel (async)
    return forkJoin(actionObservables).pipe(
      map(results => {
        const summary: ImportSummary = {
          total: results.length,
          successful: results.filter(r => r.success).length,
          failed: results.filter(r => !r.success).length,
          results: results,
          createResults: results.filter(r => r.action.action === 'create'),
          editResults: results.filter(r => r.action.action === 'edit'),
          deleteResults: results.filter(r => r.action.action === 'delete')
        };
        return summary;
      })
    );
  }

  /**
   * Execute a single action based on its type
   */
  private executeAction(action: ImportAction, context?: ImportContext): Observable<ImportResult> {
    const skipHeaders = new HttpHeaders().set('x-rollout-skip', '1');

    switch (action.action) {
      case 'create':
        return this.executeCreate(action, skipHeaders, context);
      case 'edit':
        return this.executeEdit(action, skipHeaders, context);
      case 'delete':
        return this.executeDelete(action, skipHeaders, context);
      default:
        return of({
          success: false,
          action,
          message: `Unknown action type: ${action.action}`
        });
    }
  }

  /**
   * Deep clean object to remove all _id and id fields (for create operations)
   * Also removes MongoDB-specific fields that shouldn't be copied
   */
  private cleanDataForCreate(data: any): any {
    if (data === null || data === undefined) {
      return data;
    }

    if (Array.isArray(data)) {
      return data.map(item => this.cleanDataForCreate(item));
    }

    if (typeof data === 'object') {
      const cleaned: any = {};
      for (const key of Object.keys(data)) {
        // Skip MongoDB-specific fields that shouldn't be copied
        if (key === '_id' || key === 'id' || key === '__v' || key === 'createdAt' || key === 'updatedAt') {
          continue;
        }
        cleaned[key] = this.cleanDataForCreate(data[key]);
      }
      return cleaned;
    }

    return data;
  }

  /**
   * Execute CREATE action
   */
  private executeCreate(action: ImportAction, headers: HttpHeaders, context?: ImportContext): Observable<ImportResult> {
    const endpoint = this.getEndpoint(action.module, 'create');
    if (!endpoint) {
      return of({
        success: false,
        action,
        message: `No endpoint configured for module: ${action.module}`
      });
    }

    // Deep clean data for create operations - remove all ID fields
    // This removes _id, id, __v, createdAt, updatedAt from the data
    // so a completely new record is created with a fresh ID
    let createData = this.cleanDataForCreate(action.data);

    // Add appId and orgId from context if provided
    if (context?.appId) {
      createData = { ...createData, appId: context.appId };
    }
    if (context?.orgId) {
      createData = { ...createData, orgId: context.orgId };
    }

    // Log what we're creating for debugging
    console.log(`Creating new record for module: ${action.module}`, createData);

    return this.http.post(`${this.baseUrl}${endpoint}`, createData, { headers }).pipe(
      map((response: any) => ({
        success: true,
        action,
        message: `Successfully created: ${action.label}`
      })),
      catchError(error => of({
        success: false,
        action,
        message: `Failed to create: ${action.label}`,
        error: error?.error?.response || error?.error?.message || error?.message || 'Unknown error'
      }))
    );
  }

  /**
   * Clean data for update operations - removes immutable fields
   * MongoDB doesn't allow modifying _id field, so we must exclude it from the payload
   */
  private cleanDataForUpdate(data: any): any {
    if (data === null || data === undefined) {
      return data;
    }

    if (Array.isArray(data)) {
      return data.map(item => this.cleanDataForUpdate(item));
    }

    if (typeof data === 'object') {
      const cleaned: any = {};
      for (const key of Object.keys(data)) {
        // Skip _id and id fields - these are immutable in MongoDB
        // Also skip __v (version key) as it's managed by MongoDB
        if (key === '_id' || key === 'id' || key === '__v') {
          continue;
        }
        cleaned[key] = this.cleanDataForUpdate(data[key]);
      }
      return cleaned;
    }

    return data;
  }

  /**
   * Execute EDIT/UPDATE action
   */
  private executeEdit(action: ImportAction, headers: HttpHeaders, context?: ImportContext): Observable<ImportResult> {
    const endpoint = this.getEndpoint(action.module, 'update');
    if (!endpoint) {
      return of({
        success: false,
        action,
        message: `No endpoint configured for module: ${action.module}`
      });
    }

    const normalizedModule = this.normalizeModuleName(action.module);
    const idField = this.moduleEndpoints[normalizedModule]?.idField || '_id';
    const id = action.data[idField] || action.data._id || action.data.id ||
               action.oldData?.[idField] || action.oldData?._id || action.oldData?.id;

    if (!id) {
      return of({
        success: false,
        action,
        message: `No ID found for edit operation: ${action.label}`
      });
    }

    // IMPORTANT: Clean the update data to remove _id and other immutable fields
    // MongoDB throws error "Performing an update on the path '_id' would modify the immutable field '_id'"
    // if _id is included in the update payload
    let updateData = this.cleanDataForUpdate(action.data);

    // Add appId and orgId from context if provided
    if (context?.appId) {
      updateData = { ...updateData, appId: context.appId };
    }
    if (context?.orgId) {
      updateData = { ...updateData, orgId: context.orgId };
    }

    // Construct the update URL - append ID for modules that need it in URL
    let updateUrl = `${this.baseUrl}${endpoint}`;

    // These modules need ID in URL for update
    const modulesWithIdInUrl = ['webservice administration', 'datasource administration', 'schedulerjob administration',
                                'config administration', 'database administration', 'email administration', 'pi administration'];
    if (modulesWithIdInUrl.includes(normalizedModule)) {
      updateUrl = `${updateUrl}/${id}`;
    }

    console.log(`Updating record for module: ${action.module}, ID: ${id}`, updateData);

    return this.http.put(updateUrl, updateData, { headers }).pipe(
      map((response: any) => ({
        success: true,
        action,
        message: `Successfully updated: ${action.label}`
      })),
      catchError(error => of({
        success: false,
        action,
        message: `Failed to update: ${action.label}`,
        error: error?.error?.response || error?.error?.message || error?.message || 'Unknown error'
      }))
    );
  }

  /**
   * Execute DELETE action
   */
  private executeDelete(action: ImportAction, headers: HttpHeaders, context?: ImportContext): Observable<ImportResult> {
    const endpoint = this.getEndpoint(action.module, 'delete');
    if (!endpoint) {
      return of({
        success: false,
        action,
        message: `No endpoint configured for module: ${action.module}`
      });
    }

    const normalizedModule = this.normalizeModuleName(action.module);
    const idField = this.moduleEndpoints[normalizedModule]?.idField || '_id';
    const id = action.data?.[idField] || action.data?._id || action.data?.id ||
               action.oldData?.[idField] || action.oldData?._id || action.oldData?.id;

    if (!id) {
      return of({
        success: false,
        action,
        message: `No ID found for delete operation: ${action.label}`
      });
    }

    const deleteUrl = `${this.baseUrl}${endpoint}/${id}`;

    console.log(`Deleting record for module: ${action.module}, ID: ${id}`, context ? `with context appId: ${context.appId}, orgId: ${context.orgId}` : '');

    return this.http.delete(deleteUrl, { headers }).pipe(
      map((response: any) => ({
        success: true,
        action,
        message: `Successfully deleted: ${action.label}`
      })),
      catchError(error => of({
        success: false,
        action,
        message: `Failed to delete: ${action.label}`,
        error: error?.error?.response || error?.error?.message || error?.message || 'Unknown error'
      }))
    );
  }

  /**
   * Get the appropriate endpoint for a module and operation type
   */
  private getEndpoint(module: string, operation: 'create' | 'update' | 'delete'): string | null {
    const moduleKey = this.normalizeModuleName(module);
    const config = this.moduleEndpoints[moduleKey];
    if (!config) {
      console.warn(`No endpoint configuration for module: ${module} (normalized: ${moduleKey})`);
      return null;
    }
    return config[operation];
  }

  /**
   * Detect Excel format based on header row
   * Format A (staged changes export): ID, Module, Label, Timestamp, Status, Data, OldData, Action
   * Format B (import results export): ID, Module, Label, OriginalAction, ImportStatus, Response, Data, OldData, Action
   */
  private detectExcelFormat(headerRow: any[]): 'staged' | 'results' {
    // Check if column 8 (index 8) exists and column 5 header contains "Response"
    // Or check if we have 9 columns vs 8 columns
    if (headerRow && headerRow.length >= 9) {
      const col5Header = headerRow[5]?.toString()?.toLowerCase() || '';
      if (col5Header.includes('response')) {
        return 'results';
      }
    }
    return 'staged';
  }

  /**
   * Parse actions from Excel data
   * Handles action types: ignore, create, edit, delete
   * Rows with 'ignore' action are skipped
   * Supports both staged changes export format and import results export format
   */
  parseExcelData(worksheetData: any[], moduleName: string): ImportAction[] {
    const actions: ImportAction[] = [];

    if (worksheetData.length === 0) return actions;

    // Detect format from header row
    const headerRow = worksheetData[0];
    const format = this.detectExcelFormat(headerRow);
    console.log(`Detected Excel format: ${format}`);

    // Column mappings based on format
    // Format 'staged': 0: ID, 1: Module, 2: Label, 3: Timestamp, 4: Status, 5: Data, 6: OldData, 7: Action
    // Format 'results': 0: ID, 1: Module, 2: Label, 3: OriginalAction, 4: ImportStatus, 5: Response, 6: Data, 7: OldData, 8: Action
    const colMapping = format === 'results'
      ? { id: 0, module: 1, label: 2, data: 6, oldData: 7, action: 8 }
      : { id: 0, module: 1, label: 2, data: 5, oldData: 6, action: 7 };

    // Skip header row (index 0)
    for (let i = 1; i < worksheetData.length; i++) {
      const row = worksheetData[i];
      if (!row || row.length === 0) continue;

      const actionValue = row[colMapping.action]?.toString()?.toLowerCase()?.trim();

      // Skip rows with 'ignore' action or empty/invalid actions
      if (!actionValue || actionValue === 'ignore') {
        console.log(`Skipping row ${i + 1}: Action is "${actionValue || 'empty'}"`);
        continue;
      }

      // Only process valid actions: create, edit, delete
      if (!['create', 'edit', 'delete'].includes(actionValue)) {
        console.warn(`Skipping row ${i + 1}: Invalid action value "${actionValue}"`);
        continue;
      }

      let data: any = {};
      let oldData: any = null;
      let validationError: string | undefined;

      try {
        if (row[colMapping.data]) {
          data = typeof row[colMapping.data] === 'string' ? JSON.parse(row[colMapping.data]) : row[colMapping.data];
        }
      } catch (e) {
        console.warn(`Failed to parse data JSON at row ${i + 1}:`, e);
        validationError = 'Invalid JSON in Data column';
      }

      try {
        if (row[colMapping.oldData]) {
          oldData = typeof row[colMapping.oldData] === 'string' ? JSON.parse(row[colMapping.oldData]) : row[colMapping.oldData];
        }
      } catch (e) {
        console.warn(`Failed to parse oldData JSON at row ${i + 1}:`, e);
      }

      // Validate based on action type
      const actionValidation = this.validateAction(actionValue as 'create' | 'edit' | 'delete', data, oldData);
      if (actionValidation) {
        validationError = validationError ? `${validationError}; ${actionValidation}` : actionValidation;
      }

      actions.push({
        id: row[colMapping.id]?.toString() || undefined,
        module: moduleName || row[colMapping.module]?.toString() || 'Unknown',
        label: row[colMapping.label]?.toString() || `Row ${i + 1}`,
        action: actionValue as 'create' | 'edit' | 'delete',
        data,
        oldData,
        validationError
      });
    }

    return actions;
  }

  /**
   * Validate action based on type
   * - CREATE: Data required (any existing _id will be stripped and new record created)
   * - EDIT: Must have _id to identify which record to update
   * - DELETE: Must have _id to identify which record to delete
   */
  private validateAction(action: 'create' | 'edit' | 'delete', data: any, oldData: any): string | undefined {
    const id = data?._id || data?.id || oldData?._id || oldData?.id;

    switch (action) {
      case 'create':
        // Create will strip any existing ID and create a fresh record
        // This is valid - we just need some data to create
        if (!data || Object.keys(data).length === 0) {
          return 'Create action requires data';
        }
        // Check if there's meaningful data beyond just _id and __v
        const meaningfulKeys = Object.keys(data).filter(k => !['_id', 'id', '__v', 'createdAt', 'updatedAt'].includes(k));
        if (meaningfulKeys.length === 0) {
          return 'Create action requires meaningful data (not just ID fields)';
        }
        return undefined;

      case 'edit':
        if (!id) {
          return 'Edit action requires an ID (_id or id field in data or oldData)';
        }
        if (!data || Object.keys(data).length === 0) {
          return 'Edit action requires data to update';
        }
        return undefined;

      case 'delete':
        if (!id) {
          return 'Delete action requires an ID (_id or id field in data or oldData)';
        }
        return undefined;

      default:
        return `Unknown action: ${action}`;
    }
  }

  /**
   * Get validation summary for import preview
   */
  getValidationSummary(actions: ImportAction[]): { valid: ImportAction[]; invalid: ImportAction[] } {
    const valid = actions.filter(a => !a.validationError);
    const invalid = actions.filter(a => !!a.validationError);
    return { valid, invalid };
  }
}
