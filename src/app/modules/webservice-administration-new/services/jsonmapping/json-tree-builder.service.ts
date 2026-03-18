import { Injectable } from '@angular/core';
import { TreeNode } from 'primeng/api';

@Injectable({
  providedIn: 'root'
})
export class JsonTreeBuilderService {

  buildTreeFromArray(dataArray: any[]): TreeNode[] {
    if (!Array.isArray(dataArray) || dataArray.length === 0) return [];

    // Merge all keys across all objects
    const schema = this.mergeObjects(dataArray);
    const rootNode: TreeNode = {
      label: 'root',
      children: this.buildTree(schema)
    };
    return [rootNode];
  }

  private mergeObjects(objects: any[]): any {
    const result: any = {};
    for (const obj of objects) {
      for (const key in obj) {
        if (!obj.hasOwnProperty(key)) continue;

        const value = obj[key];
        if (Array.isArray(value)) {
          // Handle array of objects
          result[key] = [this.mergeObjects(value)];
        } else if (value && typeof value === 'object') {
          // Nested object
          result[key] = this.mergeObjects([result[key] || {}, value]);
        } else {
          result[key] = null;
        }
      }
    }
    return result;
  }

  private buildTree(schema: any): TreeNode[] {
    return Object.keys(schema).map((key) => {
      const value = schema[key];
      const node: TreeNode = { label: key };

      if (Array.isArray(value)) {
        node.label = key + '[]';
        node.children = this.buildTree(value[0] || {});
      } else if (value && typeof value === 'object') {
        node.children = this.buildTree(value);
      }

      return node;
    });
  }
}
