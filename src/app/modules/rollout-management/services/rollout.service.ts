import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { BaseApiService } from '../../../core/services/base-api/base-api.service';

export interface StagedChange {
  id: string;
  module: string;
  action: 'create' | 'edit' | 'delete';
  label: string;
  rolloutLabel?: string; // The label under which this change is grouped
  data: any;
  oldData?: any; // Old data for edit/delete operations
  changedFields?: string[];
  fieldDiff?: { [key: string]: { old: any; new: any } };
  timestamp: Date;
  status: 'staged' | 'committed' | 'conflict';
  commitMessage?: string;
  commitId?: string;
  committedBy?: string;
  committedAt?: Date;
}

export interface Commit {
  id: string;
  commitId: string;
  message: string;
  timestamp: Date;
  changes: StagedChange[];
  committedBy: string;
  changesCount?: number;
}

interface ApiResponse<T> {
  token: string;
  response?: string;
  [key: string]: any;
}

interface PaginatedResponse<T> {
  token: string;
  changes?: T[];
  commits?: Commit[];
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

@Injectable({
  providedIn: 'root'
})
export class RolloutService extends BaseApiService {
  private readonly API_ENDPOINT = '/rollout';

  /**
   * Track a change (create, edit, delete operation)
   */
  trackChange(
    module: string,
    action: 'create' | 'edit' | 'delete',
    label: string,
    data: any,
    oldData?: any,
    changedFields?: string[],
    fieldDiff?: { [key: string]: { old: any; new: any } },
    rolloutLabel?: string
  ): Observable<any> {
    const payload: any = { module, action, label, data, oldData, rolloutLabel };
    if (changedFields && changedFields.length > 0) {
      payload.changedFields = changedFields;
    }
    if (fieldDiff && Object.keys(fieldDiff).length > 0) {
      payload.fieldDiff = fieldDiff;
    }

    return this.post<ApiResponse<any>>(`${this.API_ENDPOINT}/track`, payload).pipe(
      map(response => {
        if (response.token === '200') {
          return { success: true };
        }
        throw new Error(response.response || 'Failed to track change');
      }),
      catchError(error => {
        console.error('Error tracking change:', error);
        throw error;
      })
    );
  }

  /**
   * Get all staged changes
   */
  getStagedChanges(page: number = 1, limit: number = 50, module?: string, action?: string, label?: string): Observable<StagedChange[]> {
    const params: any = { page: page.toString(), limit: limit.toString() };
    if (module) params.module = module;
    if (action) params.action = action;
    if (label) params.label = label;

    return this.get<PaginatedResponse<StagedChange>>(`${this.API_ENDPOINT}/staged`, { params }).pipe(
      map(response => {
        if (response.token === '200' && response.changes) {
          return response.changes.map(change => ({
            ...change,
            timestamp: new Date(change.timestamp)
          }));
        }
        return [];
      }),
      catchError(error => {
        console.error('Error fetching staged changes:', error);
        return [];
      })
    );
  }

  /**
   * Unstage a change
   */
  unstageChange(changeId: string): Observable<any> {
    return this.delete<ApiResponse<any>>(`${this.API_ENDPOINT}/unstage/${changeId}`).pipe(
      map(response => {
        if (response.token === '200') {
          return { success: true, response: response.response };
        }
        const errorMsg = response.response || 'Failed to unstage change';
        console.error('Unstage failed:', errorMsg, response);
        throw new Error(errorMsg);
      }),
      catchError(error => {
        console.error('Error unstaging change:', error);
        // Extract error message from HTTP error response
        const errorMessage = error?.error?.response || error?.error?.message || error?.message || 'Failed to remove change from database';
        throw { ...error, message: errorMessage, error: error.error };
      })
    );
  }

  /**
   * Commit changes
   */
  commitChanges(changes: StagedChange[], message: string): Observable<any> {
    const changeIds = changes.map(c => c.id);

    return this.post<ApiResponse<any>>(`${this.API_ENDPOINT}/commit`, {
      changeIds,
      message: message.trim()
    }).pipe(
      map(response => {
        if (response.token === '200') {
          return {
            success: true,
            commitId: response['commit']?.id || response['commitId']
          };
        }
        throw new Error(response.response || 'Failed to commit changes');
      }),
      catchError(error => {
        console.error('Error committing changes:', error);
        throw error;
      })
    );
  }

  /**
   * Get all commits
   */
  getCommits(page: number = 1, limit: number = 20): Observable<Commit[]> {
    return this.get<PaginatedResponse<Commit>>(`${this.API_ENDPOINT}/commits`, {
      params: { page: page.toString(), limit: limit.toString() }
    }).pipe(
      map(response => {
        if (response.token === '200' && response.commits) {
          return response.commits.map(commit => ({
            ...commit,
            id: commit.commitId || commit.id,
            timestamp: new Date(commit.timestamp),
            changes: commit.changes.map(change => ({
              ...change,
              timestamp: new Date(change.timestamp),
              committedAt: change.committedAt ? new Date(change.committedAt) : undefined
            }))
          }));
        }
        return [];
      }),
      catchError(error => {
        console.error('Error fetching commits:', error);
        return [];
      })
    );
  }

  /**
   * Get committed changes (flattened from commits)
   */
  getCommittedChanges(page: number = 1, limit: number = 50): Observable<StagedChange[]> {
    return this.get<PaginatedResponse<StagedChange>>(`${this.API_ENDPOINT}/committed`, {
      params: { page: page.toString(), limit: limit.toString() }
    }).pipe(
      map(response => {
        if (response.token === '200' && response.changes) {
          return response.changes.map(change => ({
            ...change,
            timestamp: new Date(change.timestamp),
            committedAt: change.committedAt ? new Date(change.committedAt) : undefined
          }));
        }
        return [];
      }),
      catchError(error => {
        console.error('Error fetching committed changes:', error);
        return [];
      })
    );
  }

  /**
   * Rollback a change
   */
  rollbackChange(change: StagedChange): Observable<any> {
    return this.delete<ApiResponse<any>>(`${this.API_ENDPOINT}/rollback/change/${change.id}`).pipe(
      map(response => {
        if (response.token === '200') {
          return { success: true };
        }
        throw new Error(response.response || 'Failed to rollback change');
      }),
      catchError(error => {
        console.error('Error rolling back change:', error);
        throw error;
      })
    );
  }

  /**
   * Rollback an entire commit
   */
  rollbackCommit(commitId: string): Observable<any> {
    return this.delete<ApiResponse<any>>(`${this.API_ENDPOINT}/rollback/commit/${commitId}`).pipe(
      map(response => {
        if (response.token === '200') {
          return { success: true };
        }
        throw new Error(response.response || 'Failed to rollback commit');
      }),
      catchError(error => {
        console.error('Error rolling back commit:', error);
        throw error;
      })
    );
  }

  /**
   * Clear all staged changes
   */
  clearAllStaged(): Observable<any> {
    return this.delete<ApiResponse<any>>(`${this.API_ENDPOINT}/clear`).pipe(
      map(response => {
        if (response.token === '200') {
          return { success: true };
        }
        throw new Error(response.response || 'Failed to clear staged changes');
      }),
      catchError(error => {
        console.error('Error clearing staged changes:', error);
        throw error;
      })
    );
  }

  /**
   * Get all labels
   */
  getAllLabels(): Observable<string[]> {
    return this.get<ApiResponse<string[]>>(`${this.API_ENDPOINT}/labels`).pipe(
      map(response => {
        if (response.token === '200' && response['labels']) {
          return response['labels'];
        }
        return [];
      }),
      catchError(error => {
        console.error('Error fetching labels:', error);
        return [];
      })
    );
  }

  /**
   * Create a new label
   */
  createLabel(name: string): Observable<any> {
    return this.post<ApiResponse<any>>(`${this.API_ENDPOINT}/labels`, { name }).pipe(
      map(response => {
        if (response.token === '200') {
          return { success: true, label: response['label'] };
        }
        throw new Error(response.response || 'Failed to create label');
      }),
      catchError(error => {
        console.error('Error creating label:', error);
        throw error;
      })
    );
  }
}
