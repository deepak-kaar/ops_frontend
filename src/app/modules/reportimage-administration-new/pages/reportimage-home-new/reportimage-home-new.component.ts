import { Component, OnInit } from '@angular/core';
import { ReportimageAdministrationNewComponent } from '../../reportimage-administration-new.component';

@Component({
  selector: 'app-reportimage-home-new',
  standalone: false,
  templateUrl: './reportimage-home-new.component.html',
  styleUrl: './reportimage-home-new.component.css'
})
export class ReportimageHomeNewComponent extends ReportimageAdministrationNewComponent implements OnInit {
  mobileSidebarVisible = false;

  override ngOnInit(): void {
    super.ngOnInit();
  }

  toggleMobileSidebar(): void {
    this.mobileSidebarVisible = !this.mobileSidebarVisible;
  }
}
