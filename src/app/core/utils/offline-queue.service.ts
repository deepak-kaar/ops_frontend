import { Injectable } from '@angular/core';
import { NetworkStatusService } from './network-status.service';
import { IndexedDbService } from './indexed-db.service';
import { environment } from 'src/environments/environment';
import { HttpClient } from '@angular/common/http';
import { debounceTime, filter } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class OfflineQueueService {
  private isProcessing = false;
  constructor(
    private networkService: NetworkStatusService,
    private dbService: IndexedDbService,
    private http: HttpClient
  ) {
    // Subscribe to network changes
    this.networkService.getNetworkStatus()
    .pipe(
      debounceTime(1000), // wait 1 second to avoid online/offline bounce
      filter(status => status === true) // only when online
    )
    .subscribe(async () => {
      if (this.isProcessing) return;

      this.isProcessing = true;
      try {
        await this.processPendingRequests();
      } finally {
        this.isProcessing = false;
      }
    });
  }

  async queueRequest(url: string, formData: any): Promise<void> {
 
    const payload = this.formDataToJson(formData);

    const requestData = {
      url,
      payload,
      timestamp: new Date().toISOString()
    };

    if (this.networkService.isOnlineNow()) {
      // For now, just log (later replace with actual API call)
      console.log('Submitting online:', requestData);
    } else {
      
      await this.dbService.addRequest(requestData);
      console.log('Stored offline request:', requestData);
    }
  }

  private async processPendingRequests(): Promise<void> {
    const requests = await this.dbService.getAllRequests();
    if (requests.length > 0) {
      console.log(`Processing ${requests.length} offline requests...`);
      console.log("converting payload to form data");
      for (const req of requests) {
        console.log('Replaying request:', req);
        const formData = this.objectToFormData(req.payload);
        console.log(formData.get("appName"));
        var url = environment.apiUrl+req.url;

        try {
          // Perform HTTP POST request
          const response = await this.http.post(url, formData).toPromise();
          console.log('Request successful:', response);
  
          // Remove from IndexedDB after successful sync
          // await this.dbService.deleteRequest(req.id);
          // console.log(`Request with id ${req.id} removed from offline queue.`);
          await this.dbService.deleteRequest(req.id);
      console.log('Offline requests cleared after processing');
        } catch (error) {
          console.error(`Failed to sync request ${req.id}:`, error);
          // optionally, break or continue depending on retry logic
        }
        



      };
      // await this.dbService.clearRequests();
      // console.log('Offline requests cleared after processing');
    }
  }

  private formDataToJson(formData: FormData): any {
    const obj: any = {};
    formData.forEach((value, key) => {
      if (value instanceof File) {
        // Optional: handle file separately
        obj[key] = value.name;
      } else {
        obj[key] = value;
      }
    });
    return obj;
  }

  private objectToFormData(obj: any):FormData{

    const formData = new FormData();
    for (const key in obj) {
      formData.append(key, obj[key]);
    }

    return formData;

  }
}
