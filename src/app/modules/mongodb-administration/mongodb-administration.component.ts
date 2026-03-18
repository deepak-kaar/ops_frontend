import { Component, OnInit } from '@angular/core';
import { ResponsiveService } from 'src/app/core/utils/responsive.service';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-mongodb-administration',
  standalone: false,
  templateUrl: './mongodb-administration.component.html',
  styleUrl: './mongodb-administration.component.css'
})
export class MongodbAdministrationComponent implements OnInit {
  isMobile$!: Observable<boolean>;
  isTablet$!: Observable<boolean>;

  constructor(private responsive: ResponsiveService) {}

  ngOnInit(): void {
    this.isMobile$ = this.responsive.isMobile$();
    this.isTablet$ = this.responsive.isTablet$();
  }
}
