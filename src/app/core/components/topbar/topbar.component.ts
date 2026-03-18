import { Component } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { InputText } from 'primeng/inputtext';
import { IconField } from "primeng/iconfield";
import { InputIcon } from "primeng/inputicon";
import { RouterModule } from '@angular/router';
import { Observable } from 'rxjs';
import { ResponsiveService } from '../../utils/responsive.service';
import { AsyncPipe } from '@angular/common';

@Component({
  selector: 'app-topbar',
  standalone: true,
  templateUrl: './topbar.component.html',
  styleUrl: './topbar.component.css',
  imports: [ButtonModule, InputText, IconField, InputIcon, RouterModule, AsyncPipe]
})
export class TopbarComponent {
  /**
   * @property {Observable<boolean>} isMobile$ - Stores the application view mode status indicating whether it's accessed on a mobile device or web.
   */
  isMobile$!: Observable<boolean>;

  constructor(private responsive: ResponsiveService) { }

  ngOnInit(): void {
    this.isMobile$ = this.responsive.isMobile$();
  }

}
