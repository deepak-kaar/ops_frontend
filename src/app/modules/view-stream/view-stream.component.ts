import { Component } from '@angular/core';

@Component({
  selector: 'app-view-stream',
  standalone: false,
  templateUrl: './view-stream.component.html',
  styleUrl: './view-stream.component.css'
})
export class ViewStreamComponent {
  mobileSidebarOpen = false;

  toggleSidebar(): void {
    this.mobileSidebarOpen = !this.mobileSidebarOpen;
  }
}
