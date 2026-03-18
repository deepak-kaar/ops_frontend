import { Component, OnInit } from '@angular/core';
import { ResponsiveService } from 'src/app/core/utils/responsive.service';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-logging',
  standalone: false,
  templateUrl: './logging.component.html',
  styleUrl: './logging.component.css'
})
export class LoggingComponent implements OnInit {
  isMobile$!: Observable<boolean>;
  isTablet$!: Observable<boolean>;

  constructor(private responsive: ResponsiveService) {}

  ngOnInit(): void {
    this.isMobile$ = this.responsive.isMobile$();
    this.isTablet$ = this.responsive.isTablet$();
  }
}
