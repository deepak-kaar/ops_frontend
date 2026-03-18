import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { Subscription, filter } from 'rxjs';

@Component({
  selector: 'app-config-home',
  standalone: false,
  templateUrl: './config-home.component.html',
  styleUrl: './config-home.component.css'
})
export class ConfigHomeComponent implements OnInit, OnDestroy {
  showRoutingCards: boolean = true;
  mobileSidebarOpen: boolean = false;
  private routerSub!: Subscription;

  constructor(private router: Router) { }

  ngOnInit(): void {
    // Check initial route
    this.checkRoute(this.router.url);

    // Subscribe to route changes
    this.routerSub = this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe((event: any) => {
      this.checkRoute(event.urlAfterRedirects || event.url);
    });
  }

  private checkRoute(url: string): void {
    // Hide routing cards on create/edit/manage pages
    const lowercaseUrl = url.toLowerCase();
    this.showRoutingCards = !lowercaseUrl.includes('create') &&
      !lowercaseUrl.includes('edit') &&
      !lowercaseUrl.includes('manage');
  }

  toggleSidebar(): void {
    this.mobileSidebarOpen = !this.mobileSidebarOpen;
  }

  ngOnDestroy(): void {
    if (this.routerSub) {
      this.routerSub.unsubscribe();
    }
  }
}
