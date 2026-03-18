import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class IndexedDbService {

  private db: IDBDatabase | null = null;

  constructor() {
    this.init();
  }

  private init(): void {
    const request = indexedDB.open('OfflineDB', 1);

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains('requests')) {
        const store = db.createObjectStore('requests', { keyPath: 'id', autoIncrement: true });
        store.createIndex('url', 'url', { unique: false });
        store.createIndex('timestamp', 'timestamp', { unique: false });
      }
    };

    request.onsuccess = () => {
      this.db = request.result;
      console.log('IndexedDB initialized');
    };

    request.onerror = () => {
      console.error('Error opening IndexedDB', request.error);
    };
  }

  addRequest(requestData: any): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!this.db) return reject('DB not initialized');
      const tx = this.db.transaction(['requests'], 'readwrite');
      const store = tx.objectStore('requests');
      store.add(requestData);
      tx.oncomplete = () => {
        console.log('✅ Request added successfully to IndexedDB');
        resolve()
      };
      tx.onerror = () => reject(tx.error);
    });
  }

  getAllRequests(): Promise<any[]> {
    return new Promise((resolve, reject) => {
      if (!this.db) return resolve([]);
      const tx = this.db.transaction(['requests'], 'readonly');
      const store = tx.objectStore('requests');
      const req = store.getAll();
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => reject(req.error);
    });
  }

  deleteRequest(id: number): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!this.db) return reject('DB not initialized');
      const tx = this.db.transaction(['requests'], 'readwrite');
      const store = tx.objectStore('requests');
      const req = store.delete(id);
  
      req.onsuccess = () => {
        console.log(`🗑️ Request with id ${id} deleted from IndexedDB`);
        resolve();
      };
      req.onerror = () => {
        console.error(`❌ Failed to delete request with id ${id}`, req.error);
        reject(req.error);
      };
    });
  }
  clearRequests(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!this.db) return reject('DB not initialized');
      const tx = this.db.transaction(['requests'], 'readwrite');
      const store = tx.objectStore('requests');
      store.clear();
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  }
}
