import { Component, HostListener } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { NavigationEnd, Router } from '@angular/router';
import { Observable, Subscription } from 'rxjs';
import { filter } from 'rxjs/operators';
import { ResponsiveService } from 'src/app/core/utils/responsive.service';
import { LabelService } from 'src/app/modules/rollout-management/services/label.service';

@Component({
    selector: 'app-organization-administration',
    standalone: false,
    templateUrl: './organization-administration.component.html',
    styleUrl: './organization-administration.component.css'
})
export class OrganizationAdministrationComponent {

    cardList = [{
        name: 'Application',
        svg: `<svg width="42" height="41" viewBox="0 0 42 41" fill="none" xmlns="http://www.w3.org/2000/svg">
              <ellipse opacity="0.07" cx="21" cy="20.5" rx="21" ry="20" fill="var(--p-surface-300)" />
                        <g clip-path="url(#clip0_1002_7972)">
                            <path
                                d="M27.3 13.5654H14.7001C14.1826 13.5654 13.7631 13.8761 13.7631 14.2594V27.741C13.7631 28.1243 14.1826 28.435 14.7001 28.435H27.3C27.8174 28.435 28.2369 28.1243 28.2369 27.741V14.2594C28.2369 13.8761 27.8174 13.5654 27.3 13.5654Z"
                                stroke="var(--p-primary-color)" stroke-miterlimit="10" />
                            <path
                                d="M20.9517 17.0348C20.3987 16.7701 19.7387 16.6561 19.0847 16.7122C18.4307 16.7683 17.8234 16.991 17.3666 17.3422C16.9099 17.6934 16.6322 18.1513 16.581 18.6374C16.5298 19.1236 16.7084 19.6078 17.0861 20.0072"
                                stroke="var(--p-primary-color)" stroke-linecap="round" stroke-linejoin="round" />
                            <path
                                d="M24.8164 20.0071C25.1949 19.6078 25.3741 19.1235 25.3233 18.6371C25.2725 18.1507 24.9949 17.6926 24.538 17.3412C24.0811 16.9898 23.4734 16.767 22.8191 16.7111C22.1648 16.6552 21.5046 16.7696 20.9517 17.0347"
                                stroke="var(--p-primary-color)" stroke-linecap="round" stroke-linejoin="round" />
                            <path d="M20.9567 22.6916C20.9567 22.6916 17.9373 20.9928 17.0911 20.0068"
                                stroke="var(--p-primary-color)" stroke-linecap="round" stroke-linejoin="round" />
                            <path d="M20.9559 22.691C20.9559 22.691 23.9736 20.9922 24.8215 20.0068"
                                stroke="var(--p-primary-color)" stroke-linecap="round" stroke-linejoin="round" />
                            <path
                                d="M16.7969 19.4664H18.6784L19.4967 17.9717L20.3293 20.8292L21.4138 18.4515L22.2422 20.387L22.8798 19.4664H25.0886"
                                stroke="var(--p-primary-color)" stroke-width="0.5" stroke-linecap="round"
                                stroke-linejoin="round" />
                            <path d="M16.6205 25.2607H25.3048" stroke="var(--p-primary-color)" stroke-linecap="round"
                                stroke-linejoin="round" />
                        </g>
                        <defs>
                            <clipPath id="clip0_1002_7972">
                                <rect width="16" height="16" fill="white" transform="translate(13 13)" />
                            </clipPath>
                        </defs>
                    </svg>`
    },
    {
        name: 'Roles',
        svg: `<svg width="42" height="41" viewBox="0 0 42 41" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <ellipse opacity="0.07" cx="21" cy="20.5" rx="21" ry="20" fill="var(--p-surface-300)" />
                        <path fill-rule="evenodd" clip-rule="evenodd"
                            d="M15 15.5C14.7239 15.5 14.5 15.7239 14.5 16V17C14.5 17.2761 14.7239 17.5 15 17.5H16C16.2761 17.5 16.5 17.2761 16.5 17V16C16.5 15.7239 16.2761 15.5 16 15.5H15ZM16 16H15V17H16V16Z"
                            fill="var(--p-primary-color)" />
                        <path
                            d="M18 16.5C18 16.2239 18.2239 16 18.5 16H27.5C27.7761 16 28 16.2239 28 16.5C28 16.7761 27.7761 17 27.5 17H18.5C18.2239 17 18 16.7761 18 16.5Z"
                            fill="var(--p-primary-color)" />
                        <path
                            d="M18.5 20C18.2239 20 18 20.2239 18 20.5C18 20.7761 18.2239 21 18.5 21H27.5C27.7761 21 28 20.7761 28 20.5C28 20.2239 27.7761 20 27.5 20H18.5Z"
                            fill="var(--p-primary-color)" />
                        <path
                            d="M18.5 24C18.2239 24 18 24.2239 18 24.5C18 24.7761 18.2239 25 18.5 25H27.5C27.7761 25 28 24.7761 28 24.5C28 24.2239 27.7761 24 27.5 24H18.5Z"
                            fill="var(--p-primary-color)" />
                        <path fill-rule="evenodd" clip-rule="evenodd"
                            d="M14.5 20C14.5 19.7239 14.7239 19.5 15 19.5H16C16.2761 19.5 16.5 19.7239 16.5 20V21C16.5 21.2761 16.2761 21.5 16 21.5H15C14.7239 21.5 14.5 21.2761 14.5 21V20ZM15 20H16V21H15V20Z"
                            fill="var(--p-primary-color)" />
                        <path fill-rule="evenodd" clip-rule="evenodd"
                            d="M15 23.5C14.7239 23.5 14.5 23.7239 14.5 24V25C14.5 25.2761 14.7239 25.5 15 25.5H16C16.2761 25.5 16.5 25.2761 16.5 25V24C16.5 23.7239 16.2761 23.5 16 23.5H15ZM16 24H15V25H16V24Z"
                            fill="var(--p-primary-color)" />
                    </svg>`
    },
        // {
        //     name: 'Users',
        //     svg: `<svg width="42" height="41" viewBox="0 0 42 41" fill="none" xmlns="http://www.w3.org/2000/svg">
        //                     <ellipse opacity="0.07" cx="21" cy="20.5" rx="21" ry="20" fill="var(--p-surface-300)" />
        //                     <path
        //                         d="M25.5 27C25.5 27 26.5 27 26.5 26C26.5 25 25.5 22 21.5 22C17.5 22 16.5 25 16.5 26C16.5 27 17.5 27 17.5 27H25.5ZM17.5223 26C17.5189 25.9996 17.514 25.999 17.5081 25.998C17.5054 25.9975 17.5027 25.997 17.5 25.9965C17.5015 25.7325 17.6669 24.9669 18.2593 24.2758C18.8133 23.6294 19.7827 23 21.5 23C23.2173 23 24.1867 23.6294 24.7407 24.2758C25.3331 24.9669 25.4985 25.7325 25.5 25.9965C25.4973 25.997 25.4946 25.9975 25.4919 25.998C25.486 25.999 25.4811 25.9996 25.4777 26H17.5223Z"
        //                         fill="var(--p-primary-color)" />
        //                     <path
        //                         d="M21.5 20C22.6046 20 23.5 19.1046 23.5 18C23.5 16.8954 22.6046 16 21.5 16C20.3954 16 19.5 16.8954 19.5 18C19.5 19.1046 20.3954 20 21.5 20ZM24.5 18C24.5 19.6569 23.1569 21 21.5 21C19.8431 21 18.5 19.6569 18.5 18C18.5 16.3431 19.8431 15 21.5 15C23.1569 15 24.5 16.3431 24.5 18Z"
        //                         fill="var(--p-primary-color)" />
        //                 </svg>`
        // }
    ]
    /**
     * @property {boolean} isSidebarOpen - Indicates whether the sidebar menu is currently open or closed.
     */
    isSidebarOpen: boolean = false;

    /**
     * @property {boolean} mobileSidebarVisible - Determines whether the sidebar is visible on mobile devices.
     */
    mobileSidebarVisible = false;

    isMobile$!: Observable<boolean>;
    isTablet$!: Observable<boolean>;

    /**
     * @property {boolean} isOpsAdmin - stores the boolean value.
     * It helps to hide the create App and roles segment for appAdmins.
     */
    isOpsAdmin: boolean = false;

    /**
       * @property {string} url - stores the url path.
       * It helps to hide the create App and roles segment for appAdmins.
       */
    url: string = '';

    /**
    * @property {string} option - stores the sidebar state.
    * It helps to hide the collapse the sidebar.
    */
    option: string = '';

    activeCardIndex: number = 0;

    /** Rollout label properties */
    private labelSub!: Subscription;
    private routeSub?: Subscription;
    labels: string[] = [];
    selectedLabel: string | null = null;

    constructor(public sanitizer: DomSanitizer, private router: Router, private responsive: ResponsiveService, private labelService: LabelService) {
        const url = this.router.url.split('/')[2];
        if (url === 'opsAdmin') {
            this.isOpsAdmin = true;
        }
    }

    ngOnInit(): void {
        if (window.innerWidth <= 640)
            this.option = 'collapse';
        this.isMobile$ = this.responsive.isMobile$();
        this.isTablet$ = this.responsive.isTablet$();

        // Rollout label subscription
        this.labelSub = this.labelService.selectedLabel$.subscribe(label => {
            this.selectedLabel = label;
        });
        this.loadLabels();

        this.syncActiveCardWithRoute(this.router.url);
        this.routeSub = this.router.events
            .pipe(filter((event): event is NavigationEnd => event instanceof NavigationEnd))
            .subscribe((event) => this.syncActiveCardWithRoute(event.urlAfterRedirects));
    }

    ngOnDestroy(): void {
        if (this.labelSub) {
            this.labelSub.unsubscribe();
        }
        this.routeSub?.unsubscribe();
        document.body.style.overflow = '';
    }

    toggleMobileSidebar() {
        this.mobileSidebarVisible = !this.mobileSidebarVisible;
    }

    change(id: number) {
        if (id === 0) {
            this.router.navigateByUrl('/orgAdmin/appAdmin/home/appsManager');
        }
        else if (id === 1) {
            this.router.navigateByUrl('/orgAdmin/appAdmin/home/rolesManager');
        }
        this.activeCardIndex = id;
    }

    getCardClass(idx: number): string {
        const activeClass = 'border-b-4 border-b-[var(--p-primary-color)]';
        return this.activeCardIndex === idx ? activeClass : '';
    }

    private syncActiveCardWithRoute(url: string): void {
        const path = url.split('?')[0];
        if (path.includes('/rolesManager')) {
            this.activeCardIndex = 1;
            return;
        }
        if (path.includes('/appsManager') || path.includes('/appDetail/') || path.includes('/apps/create') || path.includes('/apps/edit/')) {
            this.activeCardIndex = 0;
        }
    }

    // ==================== ROLLOUT LABELS ====================

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
}
