import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { Component, inject, OnInit } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { Router } from '@angular/router';
import { map, Observable, shareReplay } from 'rxjs';
import { ResponsiveService } from 'src/app/core/utils/responsive.service';

/**
 *
 */
@Component({
    selector: 'app-activity-home',
    standalone: false,
    templateUrl: './activity-home.component.html',
    styleUrl: './activity-home.component.css'
})
export class ActivityHomeComponent implements OnInit {

    mobileSidebarVisible = false;
    isMobile$!: Observable<boolean>;
    isTablet$!: Observable<boolean>;
    toggleMobileSidebar() { this.mobileSidebarVisible = !this.mobileSidebarVisible; }


    ngOnInit(): void {
        this.isMobile$ = this.responsive.isMobile$();
        this.isTablet$ = this.responsive.isTablet$();
    }
    constructor(private responsive: ResponsiveService, private BreakpointObserver: BreakpointObserver) {
        this.isMobile$ = this.BreakpointObserver.observe([Breakpoints.Handset]).pipe(
            map(result => result.matches),
            shareReplay()
        );
    }
    cardList = [{
        name: 'Function Models',
        svg: `<svg width="45" height="45" viewBox="0 0 50 51" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <rect x="18" y="14" width="14" height="23" rx="2" ry="2" fill="var(--p-primary-color)" />
                            <rect x="19.5" y="16.5" width="11" height="16" rx="1" ry="1" fill="white" opacity="0.9" />
                            <circle cx="25" cy="35" r="1.5" fill="white" opacity="0.7" />

                            <path d="M15 22 L17 22" stroke="var(--p-primary-color)" stroke-width="2" fill="none"
                                stroke-linecap="round" />
                            <path d="M16 21 L17 22 L16 23" stroke="var(--p-primary-color)" stroke-width="2" fill="none"
                                stroke-linecap="round" />

                            <!-- Function box with f(x) -->
                            <rect x="21" y="20" width="8" height="4" rx="0.5" fill="var(--p-primary-color)"
                                opacity="0.8" />
                            <text x="25" y="22.8" text-anchor="middle" font-family="serif" font-size="3" fill="white"
                                font-style="italic">f(x)</text>

                            <!-- Neural network layers inside screen -->
                            <g opacity="0.6">
                                <!-- Layer 1 -->
                                <circle cx="22.5" cy="26" r="0.8" fill="var(--p-primary-color)" />
                                <circle cx="22.5" cy="28" r="0.8" fill="var(--p-primary-color)" />
                                <circle cx="22.5" cy="30" r="0.8" fill="var(--p-primary-color)" />

                                <!-- Layer 2 -->
                                <circle cx="25" cy="25" r="0.8" fill="var(--p-primary-color)" />
                                <circle cx="25" cy="27" r="0.8" fill="var(--p-primary-color)" />
                                <circle cx="25" cy="29" r="0.8" fill="var(--p-primary-color)" />
                                <circle cx="25" cy="31" r="0.8" fill="var(--p-primary-color)" />

                                <!-- Layer 3 -->
                                <circle cx="27.5" cy="26" r="0.8" fill="var(--p-primary-color)" />
                                <circle cx="27.5" cy="28" r="0.8" fill="var(--p-primary-color)" />
                                <circle cx="27.5" cy="30" r="0.8" fill="var(--p-primary-color)" />

                                <!-- Connections -->
                                <line x1="23.3" y1="26" x2="24.2" y2="25" stroke="var(--p-primary-color)"
                                    stroke-width="0.3" opacity="0.5" />
                                <line x1="23.3" y1="26" x2="24.2" y2="27" stroke="var(--p-primary-color)"
                                    stroke-width="0.3" opacity="0.5" />
                                <line x1="23.3" y1="28" x2="24.2" y2="27" stroke="var(--p-primary-color)"
                                    stroke-width="0.3" opacity="0.5" />
                                <line x1="23.3" y1="28" x2="24.2" y2="29" stroke="var(--p-primary-color)"
                                    stroke-width="0.3" opacity="0.5" />
                                <line x1="25.8" y1="27" x2="26.7" y2="26" stroke="var(--p-primary-color)"
                                    stroke-width="0.3" opacity="0.5" />
                                <line x1="25.8" y1="29" x2="26.7" y2="28" stroke="var(--p-primary-color)"
                                    stroke-width="0.3" opacity="0.5" />
                            </g>

                            <!-- Output arrow -->
                            <path d="M33 22 L35 22" stroke="var(--p-primary-color)" stroke-width="2" fill="none"
                                stroke-linecap="round" />
                            <path d="M34 21 L35 22 L34 23" stroke="var(--p-primary-color)" stroke-width="2" fill="none"
                                stroke-linecap="round" />

                            <!-- Model indicators (small dots showing it's a model) -->
                            <circle cx="37" cy="18" r="1" fill="var(--p-primary-color)" opacity="0.7" />
                            <circle cx="39" cy="20" r="1" fill="var(--p-primary-color)" opacity="0.5" />
                            <circle cx="37" cy="22" r="1" fill="var(--p-primary-color)" opacity="0.7" />
                        </svg>`
    },
    //   {
    //     name: 'Activity Steps',
    //     svg: `<svg width="45" height="45" viewBox="0 0 50 51" fill="none" xmlns="http://www.w3.org/2000/svg">
    //                             <!-- Main device body -->
    //                             <rect x="18" y="14" width="14" height="23" rx="2" ry="2" fill="var(--p-primary-color)" />

    //                             <!-- Screen area -->
    //                             <rect x="19.5" y="16.5" width="11" height="16" rx="1" ry="1" fill="white" opacity="0.9" />

    //                             <!-- Home button -->
    //                             <circle cx="25" cy="35" r="1.5" fill="white" opacity="0.7" />

    //                             <!-- Steps representation inside screen -->
    //                             <!-- Step 1 -->
    //                             <rect x="21" y="18.5" width="8" height="2.5" rx="0.5" fill="var(--p-primary-color)"
    //                                 opacity="0.8" />
    //                             <circle cx="21.8" cy="19.75" r="0.6" fill="white" />
    //                             <text x="21.8" y="20.1" text-anchor="middle" font-family="sans-serif" font-size="1.2"
    //                                 fill="var(--p-primary-color)" font-weight="bold">1</text>

    //                             <!-- Step 2 -->
    //                             <rect x="21" y="22" width="8" height="2.5" rx="0.5" fill="var(--p-primary-color)"
    //                                 opacity="0.7" />
    //                             <circle cx="21.8" cy="23.25" r="0.6" fill="white" />
    //                             <text x="21.8" y="23.6" text-anchor="middle" font-family="sans-serif" font-size="1.2"
    //                                 fill="var(--p-primary-color)" font-weight="bold">2</text>

    //                             <!-- Step 3 -->
    //                             <rect x="21" y="25.5" width="8" height="2.5" rx="0.5" fill="var(--p-primary-color)"
    //                                 opacity="0.6" />
    //                             <circle cx="21.8" cy="26.75" r="0.6" fill="white" />
    //                             <text x="21.8" y="27.1" text-anchor="middle" font-family="sans-serif" font-size="1.2"
    //                                 fill="var(--p-primary-color)" font-weight="bold">3</text>

    //                             <!-- Step 4 -->
    //                             <rect x="21" y="29" width="8" height="2.5" rx="0.5" fill="var(--p-primary-color)"
    //                                 opacity="0.5" />
    //                             <circle cx="21.8" cy="30.25" r="0.6" fill="white" />
    //                             <text x="21.8" y="30.6" text-anchor="middle" font-family="sans-serif" font-size="1.2"
    //                                 fill="var(--p-primary-color)" font-weight="bold">4</text>

    //                             <!-- Connecting lines between steps -->
    //                             <path d="M25 21 L25 22" stroke="var(--p-primary-color)" stroke-width="1" opacity="0.4" />
    //                             <path d="M25 24.5 L25 25.5" stroke="var(--p-primary-color)" stroke-width="1"
    //                                 opacity="0.4" />
    //                             <path d="M25 28 L25 29" stroke="var(--p-primary-color)" stroke-width="1" opacity="0.4" />

    //                             <!-- Progress indicator outside device -->
    //                             <!-- Vertical progress bar -->
    //                             <rect x="34" y="17" width="3" height="16" rx="1.5" fill="var(--p-surface-300)" />
    //                             <rect x="34" y="17" width="3" height="8" rx="1.5" fill="var(--p-primary-color)"
    //                                 opacity="0.7" />

    //                             <!-- Step indicators on the side -->
    //                             <circle cx="39" cy="18" r="1.2" fill="var(--p-primary-color)" opacity="0.8" />
    //                             <circle cx="39" cy="21" r="1.2" fill="var(--p-primary-color)" opacity="0.6" />
    //                             <circle cx="39" cy="24" r="1.2" fill="var(--p-primary-color)" opacity="0.4" />
    //                             <circle cx="39" cy="27" r="1.2" fill="var(--p-primary-color)" opacity="0.3" />

    //                             <!-- Checkmark in completed step -->
    //                             <path d="M38.2 17.5 L38.8 18.1 L39.8 17.1" stroke="white" stroke-width="0.6" fill="none"
    //                                 stroke-linecap="round" stroke-linejoin="round" />
    //                         </svg>`
    //   },
    {
        name: 'Activity Templates',
        svg: `<svg width="45" height="45" viewBox="0 0 50 51" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <!-- Main template document -->
                            <rect x="16" y="12" width="18" height="24" rx="2" ry="2" fill="var(--p-primary-color)" />

                            <!-- Document content area -->
                            <rect x="17.5" y="14" width="15" height="20" rx="1" ry="1" fill="white" opacity="0.95" />

                            <!-- Template header section -->
                            <rect x="19" y="16" width="11" height="2" rx="0.5" fill="var(--p-primary-color)"
                                opacity="0.8" />

                            <!-- Template placeholder lines -->
                            <rect x="19" y="19" width="8" height="0.8" rx="0.4" fill="var(--p-primary-color)"
                                opacity="0.4" />
                            <rect x="19" y="20.5" width="11" height="0.8" rx="0.4" fill="var(--p-primary-color)"
                                opacity="0.3" />
                            <rect x="19" y="22" width="6" height="0.8" rx="0.4" fill="var(--p-primary-color)"
                                opacity="0.4" />

                            <!-- Template sections/boxes -->
                            <rect x="19" y="24" width="5" height="3" rx="0.5" fill="var(--p-primary-color)"
                                opacity="0.2" />
                            <rect x="25" y="24" width="5" height="3" rx="0.5" fill="var(--p-primary-color)"
                                opacity="0.2" />

                            <!-- More placeholder content -->
                            <rect x="19" y="28" width="9" height="0.8" rx="0.4" fill="var(--p-primary-color)"
                                opacity="0.3" />
                            <rect x="19" y="29.5" width="7" height="0.8" rx="0.4" fill="var(--p-primary-color)"
                                opacity="0.4" />
                            <rect x="19" y="31" width="10" height="0.8" rx="0.4" fill="var(--p-primary-color)"
                                opacity="0.3" />

                            <!-- Template corner indicator -->
                            <path d="M32 12 L34 12 L34 14" stroke="var(--p-primary-color)" stroke-width="1.5"
                                fill="none" stroke-linecap="round" />

                            <!-- Duplicate/copy indicators showing it's a template -->
                            <rect x="18" y="10" width="18" height="24" rx="2" ry="2" fill="none"
                                stroke="var(--p-primary-color)" stroke-width="1" opacity="0.4" />
                            <rect x="20" y="8" width="18" height="24" rx="2" ry="2" fill="none"
                                stroke="var(--p-primary-color)" stroke-width="1" opacity="0.3" />

                            <!-- Template T icon in corner -->
                            <circle cx="38" cy="16" r="3" fill="var(--p-primary-color)" opacity="0.8" />
                            <text x="38" y="17.2" text-anchor="middle" font-family="serif" font-size="3.5" fill="white"
                                font-weight="bold">T</text>

                            <!-- Small dots indicating customizable elements -->
                            <circle cx="28" cy="16.5" r="0.4" fill="var(--p-primary-color)" opacity="0.6" />
                            <circle cx="29.5" cy="16.5" r="0.4" fill="var(--p-primary-color)" opacity="0.6" />
                            <circle cx="31" cy="16.5" r="0.4" fill="var(--p-primary-color)" opacity="0.6" />
                        </svg>`
    },
    {
        name: 'Activity Instance',
        svg: `<svg width="45" height="45" viewBox="0 0 50 51" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <!-- Main document -->
                            <rect x="16" y="12" width="18" height="24" rx="2" ry="2" fill="var(--p-primary-color)" />

                            <!-- Document content area -->
                            <rect x="17.5" y="14" width="15" height="20" rx="1" ry="1" fill="white" opacity="0.95" />

                            <!-- Filled header section (actual content, not placeholder) -->
                            <rect x="19" y="16" width="11" height="2" rx="0.5" fill="var(--p-primary-color)"
                                opacity="1" />

                            <!-- Filled content lines (actual data, not placeholders) -->
                            <rect x="19" y="19" width="11" height="0.8" rx="0.4" fill="var(--p-primary-color)"
                                opacity="0.8" />
                            <rect x="19" y="20.5" width="9" height="0.8" rx="0.4" fill="var(--p-primary-color)"
                                opacity="0.8" />
                            <rect x="19" y="22" width="10" height="0.8" rx="0.4" fill="var(--p-primary-color)"
                                opacity="0.8" />

                            <!-- Filled sections/boxes with actual content -->
                            <rect x="19" y="24" width="5" height="3" rx="0.5" fill="var(--p-primary-color)"
                                opacity="0.7" />
                            <rect x="25" y="24" width="5" height="3" rx="0.5" fill="var(--p-primary-color)"
                                opacity="0.7" />

                            <!-- More filled content -->
                            <rect x="19" y="28" width="8" height="0.8" rx="0.4" fill="var(--p-primary-color)"
                                opacity="0.8" />
                            <rect x="19" y="29.5" width="11" height="0.8" rx="0.4" fill="var(--p-primary-color)"
                                opacity="0.8" />
                            <rect x="19" y="31" width="7" height="0.8" rx="0.4" fill="var(--p-primary-color)"
                                opacity="0.8" />

                            <!-- Corner fold -->
                            <path d="M32 12 L34 12 L34 14" stroke="var(--p-primary-color)" stroke-width="1.5"
                                fill="none" stroke-linecap="round" />

                            <!-- Connection line to template (showing derivation) -->
                            <path d="M12 18 L16 18" stroke="var(--p-primary-color)" stroke-width="1.5"
                                stroke-dasharray="2,2" opacity="0.6" />
                            <path d="M14 17 L16 18 L14 19" stroke="var(--p-primary-color)" stroke-width="1.5"
                                fill="none" stroke-linecap="round" opacity="0.6" />

                            <!-- Template source indicator (small template icon) -->
                            <rect x="8" y="16" width="6" height="4" rx="0.5" fill="var(--p-primary-color)"
                                opacity="0.4" />
                            <rect x="8.5" y="16.5" width="5" height="3" rx="0.3" fill="white" opacity="0.8" />
                            <rect x="9" y="17" width="2" height="0.3" rx="0.15" fill="var(--p-primary-color)"
                                opacity="0.3" />
                            <rect x="9" y="17.7" width="3" height="0.3" rx="0.15" fill="var(--p-primary-color)"
                                opacity="0.3" />
                            <rect x="9" y="18.4" width="2.5" height="0.3" rx="0.15" fill="var(--p-primary-color)"
                                opacity="0.3" />

                            <!-- Instance identifier (number or ID badge) -->
                            <circle cx="38" cy="16" r="3" fill="var(--p-primary-color)" opacity="0.9" />
                            <text x="38" y="17.2" text-anchor="middle" font-family="sans-serif" font-size="2.8"
                                fill="white" font-weight="bold">#1</text>

                            <!-- Completion/filled indicator -->
                            <circle cx="42" cy="20" r="2" fill="var(--p-primary-color)" opacity="0.8" />
                            <path d="M41 19.5 L41.7 20.2 L43 18.9" stroke="white" stroke-width="0.8" fill="none"
                                stroke-linecap="round" stroke-linejoin="round" />

                            <!-- Data visualization elements (showing it has real data) -->
                            <rect x="22" y="25" width="0.5" height="1.5" fill="var(--p-primary-color)" opacity="0.9" />
                            <rect x="23" y="24.8" width="0.5" height="1.7" fill="var(--p-primary-color)"
                                opacity="0.9" />
                            <rect x="23.5" y="25.3" width="0.5" height="1.2" fill="var(--p-primary-color)"
                                opacity="0.9" />

                            <rect x="27" y="25.2" width="0.5" height="1.3" fill="var(--p-primary-color)"
                                opacity="0.9" />
                            <rect x="27.5" y="24.5" width="0.5" height="2" fill="var(--p-primary-color)"
                                opacity="0.9" />
                            <rect x="28" y="25.8" width="0.5" height="0.7" fill="var(--p-primary-color)"
                                opacity="0.9" />
                        </svg>`
    },

    ]
    activeCardIndex: number = 0;
    private readonly router = inject(Router);
    protected readonly sanitizer = inject(DomSanitizer);

    change(id: number) {
        const routes: any = {
            0: 'fuctionModels',
            //   1: 'activitySteps',
            1: 'activityTemplates',
            2: 'activityInstances',
        };

        if (id in routes) {
            this.router.navigateByUrl(`/activityEngine/home/${routes[id]}`);
        }

        this.activeCardIndex = id;
    }

    getCardClass(idx: number): string {
        return `w-auto${this.activeCardIndex === idx ? ' border-b-4 border-b-[var(--p-primary-color)]' : ''}`;
    }
}
