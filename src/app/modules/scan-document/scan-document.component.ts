import { Component } from '@angular/core';

@Component({
  selector: 'app-scan-document',
  standalone: false,
  templateUrl: './scan-document.component.html',
  styleUrl: './scan-document.component.css'
})
export class ScanDocumentComponent {
  mobileSidebarOpen = false;

  toggleSidebar(): void {
    this.mobileSidebarOpen = !this.mobileSidebarOpen;
  }
}
