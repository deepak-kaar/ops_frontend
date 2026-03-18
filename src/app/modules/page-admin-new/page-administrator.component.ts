import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { Subscription, filter } from 'rxjs';

@Component({
  selector: 'app-page-administrator',
  standalone: false,
  templateUrl: './page-administrator.component.html',
  styleUrl: './page-administrator.component.css'
})
export class PageAdministratorComponent implements OnInit, OnDestroy {
  mobileSidebarOpen: boolean = false;
  private routerSub!: Subscription;

  constructor(private router: Router) { }

  ngOnInit(): void {
    this.routerSub = this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe();
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
