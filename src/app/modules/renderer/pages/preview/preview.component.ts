import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-preview',
  standalone: false,
  templateUrl: './preview.component.html',
  styleUrl: './preview.component.css'
})
export class PreviewComponent {

  /**
   * @property {any} pageData - Defines the pageData at which the grid json data loads.
   */
  pageData: any;

  constructor(private router: Router) {

    const page: any = this.router.getCurrentNavigation()?.extras.state;
    this.pageData = page.pageData
    console.log(this.pageData);
  }
}
