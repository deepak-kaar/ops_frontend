import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { Subscription, filter } from 'rxjs';
import { LabelService } from 'src/app/modules/rollout-management/services/label.service';

@Component({
  selector: 'app-pi-home-new',
  standalone: false,
  templateUrl: './pi-home-new.component.html',
  styleUrl: './pi-home-new.component.css'
})
export class PiHomeNewComponent implements OnInit, OnDestroy {
  showRoutingCards: boolean = true;
  mobileSidebarOpen: boolean = false;
  private routerSub!: Subscription;
  labels: string[] = [];
  selectedLabel: string | null = null;
  private labelSub!: Subscription;

  constructor(private router: Router, private labelService: LabelService) {}

  ngOnInit(): void {
    this.checkRoute(this.router.url);
    
    this.routerSub = this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe((event: any) => {
      this.checkRoute(event.urlAfterRedirects || event.url);
    });

    this.labelSub = this.labelService.selectedLabel$.subscribe(label => {
      this.selectedLabel = label;
    });

    this.loadLabels();
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
    if (this.labelSub) {
      this.labelSub.unsubscribe();
    }
    document.body.style.overflow = '';
  }
}
