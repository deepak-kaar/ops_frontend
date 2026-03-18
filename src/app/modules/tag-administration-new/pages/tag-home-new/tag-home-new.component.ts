import { Component, OnInit } from '@angular/core';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { Observable, map, shareReplay } from 'rxjs';
import { TagAdministrationService } from 'src/app/modules/tag-administration/tag-administration.service';
import { DialogService, DynamicDialogRef } from 'primeng/dynamicdialog';
import { Router, ActivatedRoute } from '@angular/router';
import { FilterService } from 'src/app/modules/tag-administration/services/filter/filter.service';
import { ResponsiveService } from 'src/app/core/utils/responsive.service';
import { LabelService } from 'src/app/modules/rollout-management/services/label.service';

@Component({
  selector: 'app-tag-home-new',
  standalone: false,
  templateUrl: './tag-home-new.component.html',
  styleUrl: './tag-home-new.component.css'
})
export class TagHomeNewComponent implements OnInit {
  mobileSidebarVisible = false;
  isTablet$!: Observable<boolean>;
  isMobile$!: Observable<boolean>;
  labels: string[] = [];
  selectedLabel: string | null = null;

  tableData: any[] = [];
  calculationData: any[] = [];
  correlationData: any[] = [];
  activityData: any[] = [];
  idtData: any[] = [];
  attributeDetails: any = null;
  appDetails: any = null;
  orgDetails: any = null;
  entityDetails: any = null;
  instanceDetails: any = null;

  isLoading = false;
  errorMessage = '';
  selectedAttributeId: string | null = null;
  selectedAttributeName: string | null = null;

  dialogRef!: DynamicDialogRef;

  constructor(
    private breakpointObserver: BreakpointObserver,
    private tagAdminService: TagAdministrationService,
    private dialog: DialogService,
    private router: Router,
    private route: ActivatedRoute,
    private filter: FilterService,
    private responsive: ResponsiveService,
    private labelService: LabelService
  ) {
    this.isTablet$ = this.breakpointObserver.observe([Breakpoints.Tablet]).pipe(
      map(result => result.matches),
      shareReplay()
    );
    this.isMobile$ = this.breakpointObserver.observe([Breakpoints.Handset]).pipe(
      map(result => result.matches),
      shareReplay()
    );
  }

  ngOnInit(): void {
    this.isMobile$ = this.responsive.isMobile$();
    this.isTablet$ = this.responsive.isTablet$();
    this.loadLabels();

    this.labelService.selectedLabel$.subscribe(label => {
      this.selectedLabel = label;
    });

    const attributeId = this.filter.currentAttribute;
    if (attributeId) {
      this.selectedAttributeId = attributeId;
      this.getTagSearchResults(attributeId);
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

  toggleMobileSidebar(): void {
    this.mobileSidebarVisible = !this.mobileSidebarVisible;
  }

  onAttributeSelected(event: { id: string; name: string }): void {
    this.selectedAttributeId = event.id;
    this.selectedAttributeName = event.name;
    this.filter.updateSelectedAttribute(event.id);
  }

  onSearch(): void {
    if (!this.selectedAttributeId) {
      this.errorMessage = 'Please select an attribute first.';
      return;
    }
    this.getTagSearchResults(this.selectedAttributeId);
  }

  getTagSearchResults(id: string): void {
    this.isLoading = true;
    this.errorMessage = '';

    this.tagAdminService.getTagSearchResults(id).subscribe({
      next: (response) => {
        this.isLoading = false;
        if (response?.isData && response?.searchResults) {
          const results = response.searchResults;
          this.attributeDetails = results.attributeDetails || null;
          this.appDetails = results.appData || null;
          this.orgDetails = results.orgData || null;
          this.entityDetails = results.entityData || null;
          this.instanceDetails = results.instanceData || null;
          this.calculationData = results.calculationData || [];
          this.correlationData = results.correlationData || [];
          this.activityData = results.activityData || [];
          this.idtData = results.idtData || [];
        } else {
          this.attributeDetails = null;
          this.entityDetails = null;
          this.instanceDetails = null;
          this.calculationData = [];
          this.correlationData = [];
          this.activityData = [];
          this.idtData = [];
          this.errorMessage = 'No data available.';
        }
      },
      error: (error) => {
        console.error('Error fetching tag search results:', error);
        this.errorMessage = 'Failed to load data.';
        this.isLoading = false;
      }
    });
  }

  editCalculation(item: any) {
    this.router.navigate(['engine-table'], {
      relativeTo: this.route,
      state: {
        type: 'calculation',
        data: this.calculationData
      }
    });
  }

  editCorrelation(item: any) {
    this.router.navigate(['engine-table'], {
      relativeTo: this.route,
      state: {
        type: 'correlation',
        data: this.correlationData
      }
    });
  }

  editActivity(item: any) {
    this.router.navigate(['engine-table'], {
      relativeTo: this.route,
      state: {
        type: 'activity',
        data: this.activityData
      }
    });
  }

  editIdt(item: any) {
    this.router.navigate(['engine-table'], {
      relativeTo: this.route,
      state: {
        type: 'idt',
        data: this.idtData
      }
    });
  }
}
