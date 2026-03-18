import { Component, Input, Output, EventEmitter, OnDestroy, OnInit, AfterViewInit, DestroyRef, ElementRef, ViewChild, inject } from '@angular/core';
import { NgClass } from '@angular/common';
import { PrimeNgModules } from '../../modules/primeng.module';
import { NavigationEnd, NavigationStart, Router, RouterModule } from '@angular/router';
import { ThemeConfigComponent } from '../theme-config/theme-config.component';
import { Subscription } from 'rxjs';
import { filter } from 'rxjs/operators';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { AuthService } from '../../services/auth/auth.service';

@Component({
  selector: 'app-sidebar-new',
  standalone: true,
  templateUrl: './sidebar-new.component.html',
  styleUrl: './sidebar-new.component.css',
  imports: [NgClass, ThemeConfigComponent, PrimeNgModules, RouterModule]
})
export class SidebarNewComponent implements OnInit, OnDestroy, AfterViewInit {
  private static readonly APP_MODE_KEY = 'appSidebarMode';
  active = 'datapoint';
  isAppMode = false;
  private routerSub?: Subscription;

  @ViewChild('sidebarScroll') sidebarScrollRef?: ElementRef<HTMLDivElement>;
  private readonly destroyRef = inject(DestroyRef);
  private readonly sidebarScrollKey = 'opsinsight.sidebar.scrollTop';

  constructor(private router: Router, private authService: AuthService) {}

  ngOnInit(): void {
    this.updateAppMode();
    this.routerSub = this.router.events
      .pipe(filter((event) => event instanceof NavigationEnd))
      .subscribe(() => this.updateAppMode());
  }

  ngOnDestroy(): void {
    this.routerSub?.unsubscribe();
  }

  @Input() set option(value: string) {
    if (value === 'collapse') {
      this.collapsed = true;
      this.showToggle = true;
    } else {
      this.collapsed = false;
      this.showToggle = false;
    }
  }

  @Output() collapsedChange = new EventEmitter<boolean>();

  collapsed = false;
  showToggle = false;

  setActive(name: string) {
    this.active = name;
  }

  toggleCollapsed(): void {
    this.collapsed = !this.collapsed;
    this.collapsedChange.emit(this.collapsed);
  }

  onLogout(): void {
    this.authService.logout();
  }

  get isAppAdminActive(): boolean {
    const path = this.router.url.split('?')[0];
    return path.startsWith('/orgAdmin/appAdmin') || path.startsWith('/orgAdmin/opsAdmin');
  }

  private updateAppMode(): void {
    const queryParams = this.router.parseUrl(this.router.url).queryParams;
    const appQueryParam = queryParams['app'];

    if (appQueryParam === '1' || appQueryParam === 'true') {
      this.isAppMode = true;
      sessionStorage.setItem(SidebarNewComponent.APP_MODE_KEY, '1');
      return;
    }

    if (appQueryParam === '0' || appQueryParam === 'false') {
      this.isAppMode = false;
      sessionStorage.removeItem(SidebarNewComponent.APP_MODE_KEY);
      return;
    }

    this.isAppMode = sessionStorage.getItem(SidebarNewComponent.APP_MODE_KEY) === '1';
  }

  ngAfterViewInit(): void {
    // Restore scroll once on initial load only
    setTimeout(() => this.restoreSidebarScroll(), 0);

    // Save scroll position BEFORE navigation starts (no blink)
    this.router.events
      .pipe(
        filter((e): e is NavigationStart => e instanceof NavigationStart),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe(() => this.saveSidebarScroll());
  }

  // Save on every scroll
  onSidebarScroll(event: Event): void {
    const target = event.target as HTMLElement;
    sessionStorage.setItem(this.sidebarScrollKey, String(target.scrollTop));
  }

  private saveSidebarScroll(): void {
    const el = this.sidebarScrollRef?.nativeElement;
    if (!el) return;
    sessionStorage.setItem(this.sidebarScrollKey, String(el.scrollTop));
  }

  private restoreSidebarScroll(): void {
    const el = this.sidebarScrollRef?.nativeElement;
    if (!el) return;
    const saved = sessionStorage.getItem(this.sidebarScrollKey);
    if (saved !== null) {
      el.scrollTop = Number(saved);
    }
  }
}
