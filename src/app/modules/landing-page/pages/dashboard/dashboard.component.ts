import { Component, OnDestroy, OnInit, ViewEncapsulation } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-dashboard',
  standalone: false,
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css',
  encapsulation:ViewEncapsulation.None
})
export class DashboardComponent implements OnInit, OnDestroy {
  private static readonly POIS_MODE_KEY = 'poisSidebarMode';
  isPoisOnlyMode = false;
  private routerSub?: Subscription;

  constructor(private router: Router) {}

  ngOnInit(): void {
    this.updatePoisOnlyMode();
    this.routerSub = this.router.events
      .pipe(filter((event) => event instanceof NavigationEnd))
      .subscribe(() => this.updatePoisOnlyMode());
  }

  ngOnDestroy(): void {
    this.routerSub?.unsubscribe();
  }

  private updatePoisOnlyMode(): void {
    const queryParams = this.router.parseUrl(this.router.url).queryParams;
    const poisQueryParam = queryParams['pois'];

    if (poisQueryParam === '1' || poisQueryParam === 'true') {
      this.isPoisOnlyMode = true;
      sessionStorage.setItem(DashboardComponent.POIS_MODE_KEY, '1');
      return;
    }

    if (poisQueryParam === '0' || poisQueryParam === 'false') {
      this.isPoisOnlyMode = false;
      sessionStorage.removeItem(DashboardComponent.POIS_MODE_KEY);
      return;
    }

    this.isPoisOnlyMode = sessionStorage.getItem(DashboardComponent.POIS_MODE_KEY) === '1';
  }

}
