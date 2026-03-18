import { Component, OnDestroy, OnInit, ViewEncapsulation } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { filter } from 'rxjs/operators';

interface EventItem {
  status?: string;
  date?: string;
  icon?: string;
  color?: string;
  image?: string;
}

@Component({
  selector: 'app-inbox',
  standalone: false,
  templateUrl: './inbox.component.html',
  styleUrl: './inbox.component.css',
  encapsulation: ViewEncapsulation.None
})
export class InboxComponent implements OnInit, OnDestroy {
  private static readonly APP_MODE_KEY = 'appSidebarMode';
  isAppMode = false;
  private routerSub?: Subscription;
  events: EventItem[];

  constructor(private router: Router) {
    this.events = [
      { status: 'Ordered', date: '15/10/2020 10:30', icon: 'pi pi-shopping-cart', color: '#9C27B0', image: 'game-controller.jpg' },
      { status: 'Processing', date: '15/10/2020 14:00', icon: 'pi pi-cog', color: '#673AB7' },
      { status: 'Shipped', date: '15/10/2020 16:15', icon: 'pi pi-shopping-cart', color: '#FF9800' },
      { status: 'Delivered', date: '16/10/2020 10:00', icon: 'pi pi-check', color: '#607D8B' }
    ];
  }

  ngOnInit(): void {
    this.updateAppMode();
    this.routerSub = this.router.events
      .pipe(filter((event) => event instanceof NavigationEnd))
      .subscribe(() => this.updateAppMode());
  }

  ngOnDestroy(): void {
    this.routerSub?.unsubscribe();
  }

  private updateAppMode(): void {
    const queryParams = this.router.parseUrl(this.router.url).queryParams;
    const appQueryParam = queryParams['app'];

    if (appQueryParam === '1' || appQueryParam === 'true') {
      this.isAppMode = true;
      sessionStorage.setItem(InboxComponent.APP_MODE_KEY, '1');
      return;
    }

    if (appQueryParam === '0' || appQueryParam === 'false') {
      this.isAppMode = false;
      sessionStorage.removeItem(InboxComponent.APP_MODE_KEY);
      return;
    }

    this.isAppMode = sessionStorage.getItem(InboxComponent.APP_MODE_KEY) === '1';
  }
}
