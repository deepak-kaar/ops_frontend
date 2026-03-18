import { Component, OnInit } from '@angular/core';
import { ReportimageAdministrationComponent } from '../../reportimage-administration.component';

@Component({
  selector: 'app-reportimage-home',
  standalone: false,
  templateUrl: './reportimage-home.component.html',
  styleUrl: './reportimage-home.component.css'
})
export class ReportimageHomeComponent extends ReportimageAdministrationComponent implements OnInit {
  mobileSidebarVisible = false;

  override ngOnInit(): void {
    super.ngOnInit();
  }

  toggleMobileSidebar(): void {
    this.mobileSidebarVisible = !this.mobileSidebarVisible;
  }
}
