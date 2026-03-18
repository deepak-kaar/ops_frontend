import { Component, Input } from '@angular/core';
import { Table } from 'primeng/table';
import { Observable } from 'rxjs';
import { ResponsiveService } from 'src/app/core/utils/responsive.service';
import { Assignment } from 'src/app/modules/page-administrator/interfaces/page-administrator';

@Component({
  selector: 'app-role-assignement',
  standalone: false,
  templateUrl: './role-assignement.component.html',
  styleUrl: './role-assignement.component.css'
})
export class RoleAssignementComponent {
  clear(_t17: Table) {
    throw new Error('Method not implemented.');
  }
  @Input() app!: string;
  @Input() org!: string;
  @Input() reportType!: string;
  availableRoles: Assignment[] = [];
  selectedRoles: any;
  searchValue: any;

  assignedRoles: Assignment[] = [];
  unSelectedRoles: any

  /**
    * @property {Observable<boolean>} isMobile$ - Stores the application view mode status indicating whether it's accessed on a mobile device or web.
    */
  isMobile$!: Observable<boolean>;

  constructor(private responsive: ResponsiveService) {
  
    }
    ngOnInit() {
      this.isMobile$ = this.responsive.isMobile$()
    }


}
