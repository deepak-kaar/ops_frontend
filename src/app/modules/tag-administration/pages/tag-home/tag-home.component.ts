import { Component, OnInit } from '@angular/core';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { Observable, map, shareReplay } from 'rxjs';
import { TagAdministrationService } from '../../tag-administration.service';
import { DialogService, DynamicDialogRef } from 'primeng/dynamicdialog';
import { Router, ActivatedRoute, NavigationEnd } from '@angular/router';
import { Location } from '@angular/common';
import { filter } from 'rxjs/operators';
import { FilterService } from '../../services/filter/filter.service';
import { AttributeDialogComponent } from '../../components/attribute-dialog/attribute-dialog.component';

@Component({
  selector: 'app-tag-home',
  standalone: false,
  templateUrl: './tag-home.component.html',
  styleUrls: ['./tag-home.component.css']
})
export class TagHomeComponent implements OnInit {
  mobileSidebarVisible = false;
  // Add this property
isTablet$!: Observable<boolean>;
  isMobile$!: Observable<boolean>;

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

  selectionOptions: string[] = ["Calculation Details", "Calculation Mapping", "Calculation Test Run"];
  selectedOption: string = this.selectionOptions[0];
  dialogRef!: DynamicDialogRef;

  constructor(
    private breakpointObserver: BreakpointObserver,
    private tagAdminService: TagAdministrationService,
    private dialog: DialogService,
    private router: Router,
    private route: ActivatedRoute,
    private filter: FilterService,
    private location: Location
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
    const attributeId = this.filter.currentAttribute;
    if (attributeId) {
      this.selectedAttributeId = attributeId;
      this.getTagSearchResults(attributeId);
    }
  }

  toggleMobileSidebar(): void {
    this.mobileSidebarVisible = !this.mobileSidebarVisible;
  }

  onAttributeSelected(event: { id: string; name: string }): void {
    this.selectedAttributeId = event.id;
    this.selectedAttributeName = event.name;
    this.filter.updateSelectedAttribute(event.id);
    console.log('Selected Attribute ID:', event.id);
    console.log('Selected Attribute Name:', event.name);
  }

  onSearch(): void {
    if (!this.selectedAttributeId) {
      this.errorMessage = 'Please select an attribute first.';
      return;
    }
    this.getTagSearchResults(this.selectedAttributeId);
  }

  /** Fetch data for all 4 tables */
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

  openAttributeDetails(attributeDetails: any): void {
    this.dialogRef = this.dialog.open(AttributeDialogComponent, {
      data: {
        id: 0,
        attributeValue: { ...attributeDetails, dataType: attributeDetails.dataPointID, nullable: attributeDetails.isNull, attrList: [], showRemoveButton: true },
        // attributeValue: {
        //   "attributeName": "Pump Speed",
        //   "dataType": {
        //     "dataType": "Character",
        //     "dataTypeId": "67694bbab0cbf29a59031b07"
        //   },
        //   "minValue": "",
        //   "maxValue": "",
        //   "defaults": [],
        //   "isLookup": false,
        //   "validationRule": "",
        //   "acceptedQuality": "",
        //   "unique": false,
        //   "nullable": true,
        //   "decimalPlaces": "",
        //   "engineeringUnit": "",
        //   "comments": "Attribute for country name",
        //   "dataSource": "",
        //   "lookupId": "",
        //   "collection": false,
        //   "timeSeries": true,
        //   "timeFrequency": [
        //     "Current",
        //     "Hourly"
        //   ],
        //   "calculationTotal": [
        //     "Current",
        //     "Hourly"
        //   ],
        //   "calculationAverage": [
        //     "Current",
        //     "Hourly"
        //   ],
        //   "displayComponent": [],
        //   "lookupAttribute": "",
        //   "alias": "Country_Pump Speed",
        //   "order": 0,
        //   "attrList": [],
        //   "showRemoveButton": true,
        //   "tag": "",
        //   "dataTypeType": null,
        //   "attributes": []
        // },
        appId: this.filter.currentApp?.appId,
        orgId: this.filter.currentOrg?.orgId
      },
      header: 'More Actions',
      width: '75rem',
      height: '60rem',
      contentStyle: { overflow: 'auto' },
      baseZIndex: 10000,
      modal: true,
      closable: true
    });
    this.dialogRef.onClose.subscribe((res: any) => {
      if (res?.status) {
        console.log(res);
      }
    });
  }
}
