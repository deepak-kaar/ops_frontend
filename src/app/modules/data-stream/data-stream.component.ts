import { Component } from '@angular/core';

@Component({
  selector: 'app-data-stream',
  standalone: false,
  templateUrl: './data-stream.component.html',
  styleUrl: './data-stream.component.css'
})
export class DataStreamComponent  {
  mobileSidebarOpen = false;

  toggleSidebar(): void {
    this.mobileSidebarOpen = !this.mobileSidebarOpen;
  }
}
