import { Component, ViewEncapsulation, NgZone, OnDestroy, Input, inject, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { Observable } from 'rxjs';
import { ResponsiveService } from 'src/app/core/utils/responsive.service';
import { LandingPageService } from './landing-page.service';
import { RolePermissionService } from 'src/app/core/services/role-permission/role-permission.service';

@Component({
  selector: 'app-landing-page',
  standalone: false,
  templateUrl: './landing-page.component.html',
  styleUrl: './landing-page.component.css',
  encapsulation: ViewEncapsulation.None,
  // changeDetection: ChangeDetectionStrategy.OnPush
})
export class LandingPageComponent implements OnDestroy {

  responsiveOptions: any[] | undefined;

  onEditorInit(quill: any) {
    // Hide toolbar (if any) and set default format
    const toolbar = quill.editor
      .container.previousSibling;
    // if (toolbar) {
    //   toolbar.style.display = 'none';
    // }

    // Start editor with bullet list mode
    const editor = quill.getModule('keyboard');
    quill.format('list', 'bullet');
  }

  products: any[] = [
    {
      id: '1000',
      code: 'f230fh0g3',
      name: 'Bamboo Watch',
      description: 'Product Description',
      image: 'bamboo-watch.jpg',
      price: 65,
      category: 'Accessories',
      quantity: 24,
      inventoryStatus: 'INSTOCK',
      rating: 5
    },
    {
      id: '1001',
      code: 'nvklal433',
      name: 'Black Watch',
      description: 'Product Description',
      image: 'black-watch.jpg',
      price: 72,
      category: 'Accessories',
      quantity: 61,
      inventoryStatus: 'OUTOFSTOCK',
      rating: 4
    },
    {
      id: '1002',
      code: 'zz21cz3c1',
      name: 'Blue Band',
      description: 'Product Description',
      image: 'blue-band.jpg',
      price: 79,
      category: 'Fitness',
      quantity: 2,
      inventoryStatus: 'LOWSTOCK',
      rating: 3
    },
    {
      id: '1003',
      code: '244wgerg2',
      name: 'Blue T-Shirt',
      description: 'Product Description',
      image: 'blue-t-shirt.jpg',
      price: 29,
      category: 'Clothing',
      quantity: 25,
      inventoryStatus: 'INSTOCK',
      rating: 5
    },
    {
      id: '1004',
      code: 'h456wer53',
      name: 'Bracelet',
      description: 'Product Description',
      image: 'bracelet.jpg',
      price: 15,
      category: 'Accessories',
      quantity: 73,
      inventoryStatus: 'INSTOCK',
      rating: 4
    },
  ];

  /**
    * @property {boolean} isExpand - stores the boolean value to expand and collapse the top area.
    */
  isExpand: boolean = false

  /**
   * @property {Observable<boolean>} isMobile$ - Stores the application view mode status indicating whether it's accessed on a mobile device or web.
   */
  isMobile$!: Observable<boolean>;
  wellCount: number = 0;
  hasAdminAccess: boolean = true;

  private wellCountSubscription?: any;
  @Input() wellCountAttributeId?: string;
  private responsive = inject(ResponsiveService);
  private ngZone = inject(NgZone);
  protected landingPageService = inject(LandingPageService);
  private cdr = inject(ChangeDetectorRef);
  private rolePermissionService = inject(RolePermissionService);


  ngOnInit() {
    this.responsiveOptions = [
      {
        breakpoint: '1400px',
        numVisible: 1,
        numScroll: 1
      },
      {
        breakpoint: '1199px',
        numVisible: 1,
        numScroll: 1
      },
      {
        breakpoint: '767px',
        numVisible: 1,
        numScroll: 1,
      },
      {
        breakpoint: '575px',
        numVisible: 1,
        numScroll: 1,
      }
    ]
    this.isMobile$ = this.responsive.isMobile$()
    
    this.rolePermissionService.rolePermission$.subscribe(permission => {
      if (permission.role === 'Admin') {
        this.hasAdminAccess = permission.hasAccess;
      } else {
        this.hasAdminAccess = true;
      }
    });
    // this.initializeWellCountSse()
  }

  private initializeWellCountSse(): void {
    const attributeId = this.wellCountAttributeId || '679f6d3c67eb886c9bf152f5';
    this.landingPageService.getWellCount(attributeId).subscribe({
      next: (notification) => {
        this.wellCount = notification[0].value;
        this.cdr.detectChanges();
      },
      error: (error) => {
        console.error('Notification error:', error);
      },
      complete: () => {
        console.log('SSE connection closed');
      }
    });

    // this.wellCountSubscription = this.attributeService.openAttributeSse(attributeId).subscribe((count) => {
    //   this.wellCount = count
    // })
  }

  ngOnDestroy(): void {
    if (this.wellCountSubscription) {
      this.wellCountSubscription.unsubscribe()
      this.wellCountSubscription = undefined
    }
  }

}
