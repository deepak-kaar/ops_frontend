import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router, NavigationEnd, ActivatedRoute } from '@angular/router';
import { Subscription, filter } from 'rxjs';
import { LabelService } from 'src/app/modules/rollout-management/services/label.service';

@Component({
  selector: 'app-opsinsight-data-home',
  standalone: false,
  templateUrl: './opsinsight-data-home.component.html',
  styleUrl: './opsinsight-data-home.component.css'
})
export class OpsinsightDataHomeComponent implements OnInit, OnDestroy {
  showRoutingCards: boolean = true;
  mobileSidebarOpen: boolean = false;
  labels: string[] = [];
  selectedLabel: string | null = null;
  private routerSub!: Subscription;
  isDeepAccess: boolean = false;

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private labelService: LabelService
  ) {}

  ngOnInit(): void {
    this.checkRoute(this.router.url);
    this.loadLabels();
    this.isDeepAccess = !!this.route.snapshot.queryParamMap.get('custName');
    
    this.routerSub = this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe((event: any) => {
      this.checkRoute(event.urlAfterRedirects || event.url);
    });

    this.labelService.selectedLabel$.subscribe(label => {
      this.selectedLabel = label;
    });
  }

  private checkRoute(url: string): void {
    const lowercaseUrl = url.toLowerCase();
    this.showRoutingCards = !lowercaseUrl.includes('create') &&
      !lowercaseUrl.includes('edit') &&
      !lowercaseUrl.includes('manage');
  }

  toggleSidebar(): void {
    this.mobileSidebarOpen = !this.mobileSidebarOpen;
    if (this.mobileSidebarOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
  }

  loadLabels(): void {
    this.labelService.getAllLabels().subscribe({
      next: (labels) => {
        this.labels = labels;
      },
      error: (error) => {
        console.error('Error loading labels:', error);
      }
    });
  }

  onLabelChange(): void {
    this.labelService.setSelectedLabel(this.selectedLabel);
  }

  ngOnDestroy(): void {
    if (this.routerSub) {
      this.routerSub.unsubscribe();
    }
    document.body.style.overflow = '';
  }
}
