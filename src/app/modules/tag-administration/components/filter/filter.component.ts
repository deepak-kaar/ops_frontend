import { Component, Input, Output, EventEmitter, OnInit, ChangeDetectorRef } from '@angular/core';
import { FilterService } from '../../services/filter/filter.service';
import { Apps, Orgs } from 'src/app/modules/page-administrator/interfaces/page-administrator';
import { PageAdministratorService } from 'src/app/modules/page-administrator/page-administrator.service';
import { CommonModule } from '@angular/common';
import { PrimeNgModules } from 'src/app/core/modules/primeng.module';
import { TagAdministrationService } from '../../tag-administration.service';
import { debounceTime, Subject } from 'rxjs';

@Component({
  selector: 'app-filter',
  standalone: true,
  templateUrl: './filter.component.html',
  styleUrl: './filter.component.css',
  imports: [CommonModule, PrimeNgModules]
})
export class FilterComponent implements OnInit {

  apps!: Apps[];
  orgs!: Orgs[];
  tags!: any[];

  selectedApp!: any;
  selectedOrg!: any;
  selectedTag: any;

  // ---- Newly Added Dropdowns ----
  type = ['Entity', 'Instance'];
  selectedType: string | null = 'Instance';
  selectedId: string | null = null;
  selectedAttribute: string | null = null;

  listOptions: any[] = [];
  attributesOptions: any[] = [];

  @Input() isHideOrg: boolean = false;
  @Input() isHideApp: boolean = false;
  @Input() isHideTag: boolean = false;

  searchIdInput$ = new Subject<string>();

  isSearching = false;


  constructor(
    private pageAdminService: PageAdministratorService,
    private tagAdminService: TagAdministrationService,
    private filter: FilterService,
    private cdr: ChangeDetectorRef
  ) { }

  ngOnInit(): void {
    this.getApps();
    this.selectedApp = this.filter.currentApp;
    this.selectedType = this.filter.currentType || 'Instance';
    this.selectedId = this.filter.currentTag;
    this.selectedAttribute = this.filter.currentAttribute;

    this.searchIdInput$
      .pipe(debounceTime(300))
      .subscribe(value => {
        this.performIdSearch(value);
      });

    if (this.selectedApp && !this.isHideApp) {
      this.getOrgs(this.selectedApp);
      setTimeout(() => this.selectedOrg = this.filter.currentOrg);
    } else if (this.isHideApp && !this.isHideOrg) {
      this.getOrgsWithoutApp();
      setTimeout(() => this.selectedOrg = this.filter.currentOrg);
    } else if ((!this.isHideApp && !this.isHideOrg) || (this.selectedApp && this.isHideApp)) {
      this.getOrgs(this.selectedApp && this.selectedOrg);
    }

    if (this.selectedType && this.selectedId) {
      this.restoreSelection();
    }
  }

  private restoreSelection(): void {
    if (this.selectedType === 'Entity') {
      this.getEntityAttr(this.selectedId!);
    } else if (this.selectedType === 'Instance') {
      this.getInstanceAttr(this.selectedId!);
    }
  }

  /** ---------------- Existing Filter Logic ---------------- */
  getApps(): void {
    this.pageAdminService.getApps().subscribe({
      next: (res: any) => {
        this.apps = res.apps.map((app: any) => ({
          appId: app.appId,
          appName: app.appName
        }));
      },
      error: (err) => console.error('Failed to fetch applications:', err)
    });
  }

  getOrgs(appId: string): void {
    if (appId) {
      this.pageAdminService.getOrgsByApp(appId).subscribe({
        next: (res: any) => {
          this.orgs = res.orgs.map((org: any) => ({
            orgId: org.orgId,
            orgName: org.orgName
          }));
        },
        error: (err) => console.error('Failed to fetch organizations:', err)
      });
    }
  }

  getOrgsWithoutApp(): void {
    this.pageAdminService.getOrgsWithoutByApp().subscribe({
      next: (res: any) => {
        this.orgs = res.Organization.map((org: any) => ({
          orgId: org.orgId,
          orgName: org.orgName
        }));
      },
      error: (err) => console.error('Failed to fetch organizations:', err)
    });
  }

  onAppChange(event: any): void {
    this.orgs = [];
    if (this.selectedApp === null) {
      this.selectedOrg = null;
      this.filter.updateSelectedOrg(this.selectedOrg);
    }
    if (!this.isHideOrg) {
      this.getOrgs(this.selectedApp.appId);
    }
    this.filter.updateSelectedApp(this.selectedApp);
  }

  onOrgChange(event: any): void {
    this.filter.updateSelectedOrg(event.value);
  }

  onTagChange(event: any): void {
    this.filter.updateSelectedTag(event.value);
  }

  /** ---------------- New Entity / Instance Logic ---------------- */

  onTypeChange(): void {
    this.selectedId = null;
    this.listOptions = [];
    this.attributesOptions = [];
    this.filter.updateSelectedType(this.selectedType);
  }

  // Suggestions for Entity/Instance IDs based on typing
  onIdFilter(event: any): void {
    const query = (event.filter || '').trim();
    this.searchIdInput$.next(query);
  }

  performIdSearch(query: string): void {
    console.log("searching")
    this.isSearching = true;
    if (!query || !this.selectedType) {
      if (!this.selectedId) {
        this.listOptions = [];
      }
      this.isSearching = false;
      return;
    }

    if (this.selectedType === 'Entity') {
      this.searchEntityIds(query);
    } else if (this.selectedType === 'Instance') {
      this.searchInstanceIds(query);
    }
  }


  onTypeNameChange(event?: any): void {
    if (!this.selectedType || !this.selectedId) return;
    this.filter.updateSelectedTag(this.selectedId);

    if (this.selectedType === 'Entity') {
      this.getEntityAttr(this.selectedId);
    } else if (this.selectedType === 'Instance') {
      this.getInstanceAttr(this.selectedId);
    }
  }

  //  @Output() attributeSelected = new EventEmitter<string>(); // ✅ added
  @Output() attributeSelected = new EventEmitter<{ id: string; name: string }>();

  onAttributeChange(event: any): void {
    console.log(event.value);
    const selected = event.value;
    if (!selected) return;

    this.selectedAttribute = selected;
    this.filter.updateSelectedAttribute(selected);

    const selectedAttr = this.attributesOptions.find(attr => attr.id === selected);
    const attributeName = selectedAttr ? selectedAttr.name : selected;

    this.attributeSelected.emit({
      id: selected,
      name: attributeName
    });
  }

  /** ----- API CALLS from ManageAttributeComponent ----- */
  getEntityList(): void {
    const payload = { appId: null, orgId: null };
    this.tagAdminService.getEntityList(payload).subscribe({
      next: (res: any) => {
        this.listOptions = res.Entity_Attributes.map((r: any) => ({
          name: r.entityName,
          id: r.entityId
        }));
      },
      error: (err: any) => console.error('Error fetching entity list:', err)
    });
  }

  getInstanceList(): void {
    const payload = { appId: null, orgId: null };
    this.tagAdminService.getInstanceList(payload).subscribe({
      next: (res: any) => {
        this.listOptions = res.Instances.map((r: any) => ({
          name: r.instanceName,
          id: r.instanceId
        }));
      },
      error: (err: any) => console.error('Error fetching instance list:', err)
    });
  }

  private getEntityAttr(entityId: string): void {
    this.tagAdminService.getEntityDetailsById(entityId).subscribe({
      next: (res: any) => {
        const entityName =
          res.entityName ||
          res.entityDocuments?.entityName ||
          entityId;
        const selectedOption = { name: entityName, id: entityId };
        const existingIndex = this.listOptions.findIndex(opt => opt.id === entityId);
        if (existingIndex >= 0) {
          this.listOptions[existingIndex] = selectedOption;
        } else {
          this.listOptions = [selectedOption, ...this.listOptions];
        }
        this.attributesOptions = res.attributes.map((r: any) => ({
          name: r.attributeName,
          id: r.attributeId
        }));
      },
      error: (err: any) => console.error('Error loading entity attributes:', err)
    });
  }

  private getInstanceAttr(instanceId: string): void {
    this.tagAdminService.getInstanceDetailsById(instanceId).subscribe({
      next: (res: any) => {
        const instanceName =
          res.instanceName ||
          res.instanceDocuments?.instanceName ||
          instanceId; // fallback

        const selectedOption = { name: instanceName, id: instanceId };
        const existingIndex = this.listOptions.findIndex(opt => opt.id === instanceId);
        if (existingIndex >= 0) {
          this.listOptions[existingIndex] = selectedOption;
        } else {
          this.listOptions = [selectedOption, ...this.listOptions];
        }
        console.log(this.listOptions);
        this.attributesOptions = res.attributes.map((r: any) => ({
          name: r.attributeName,
          id: r.attributeId
        }));
      },
      error: (err: any) => console.error('Error loading instance attributes:', err)
    });
  }

  private searchEntityIds(query: string): void {
    const payload = {
      appId: null,          // or this.selectedApp?.appId if you want it scoped
      orgId: null,          // or this.selectedOrg?.orgId
      search: query         // 👈 string user typed
    };

    this.tagAdminService.searchEntityList(payload).subscribe({
      next: (res: any) => {
        // map to dropdown format
        this.listOptions = (res.Entity_Attributes || []).map((r: any) => ({
          name: r.entityName,
          id: r.entityId
        }));
        this.isSearching = false;
      },
      error: (err: any) => {
        console.error('Error searching entity list:', err);
        this.isSearching = false;
      }
    });
  }

  private searchInstanceIds(query: string): void {
    const payload = {
      appId: null,
      orgId: null,
      search: query
    };

    this.tagAdminService.searchInstanceList(payload).subscribe({
      next: (res: any) => {
        this.listOptions = (res.Instances || []).map((r: any) => ({
          name: r.instanceName,
          id: r.instanceId
        }));
        this.isSearching = false;
      },
      error: (err: any) => {
        console.error('Error searching instance list:', err);
        this.isSearching = false;
      }
    });
  }

}
