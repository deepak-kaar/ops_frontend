import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ChangeTrackerService {
  /**
   * Compare old and new data to identify which fields changed
   */
  compareData(previousData: any, updatedData: any): {
    changedFields: string[];
    fieldDiff: { [key: string]: { old: any; new: any } };
  } {
    const fieldDiff: { [key: string]: { old: any; new: any } } = {};
    const changedFields: string[] = [];

    if (!previousData || !updatedData) {
      return { changedFields, fieldDiff };
    }

    // Check keys present in the new data
    for (const key of Object.keys(updatedData)) {
      const oldValue = previousData[key];
      const newValue = updatedData[key];

      if (JSON.stringify(oldValue) !== JSON.stringify(newValue)) {
        fieldDiff[key] = { old: oldValue, new: newValue };
        changedFields.push(key);
      }
    }

    // Detect keys removed from the new data
    for (const key of Object.keys(previousData)) {
      if (!(key in updatedData)) {
        fieldDiff[key] = { old: previousData[key], new: undefined };
        changedFields.push(key);
      }
    }

    return { changedFields, fieldDiff };
  }
}

