import { Component } from '@angular/core';
import { DynamicDialogRef } from 'primeng/dynamicdialog';
import { OrganizationAdministrationService } from '../../../organization-administration.service';
import { firstValueFrom } from 'rxjs';
import { MessageService } from 'primeng/api';

@Component({
  selector: 'app-post-logs',
  standalone: false,
  templateUrl: './post-logs.component.html',
  styleUrl: './post-logs.component.css'
})
export class PostLogsComponent {

  logs: string = '';

  constructor(private adminService: OrganizationAdministrationService,
    private message: MessageService, private ref: DynamicDialogRef) {}

  async post() {
    if (this.logs) {
      const paylaod = {
        message: this.logs
      }
      try {
        await firstValueFrom(this.adminService.postLogs(paylaod));
        this.message.add({ severity: 'success', summary: 'Success', detail: 'Logs Posted Successfully' })
      }
      catch (err) {
        console.log(err)
      }
      finally {
        this.ref.close();
      }
    }
  }
}
