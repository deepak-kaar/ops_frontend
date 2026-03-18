import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { PrimeNgModules } from 'src/app/core/modules/primeng.module';
import { environment } from 'src/environments/environment';
import { catchError, timeout } from 'rxjs/operators';
import { of } from 'rxjs';

@Component({
  selector: 'app-filter',
  standalone: true,
  templateUrl: './filter.component.html',
  styleUrls: ['./filter.component.css'],
  imports: [CommonModule, PrimeNgModules],
})
export class FilterComponent implements OnInit {
  collections: any[] = [];
  selectedCollection: string | null = null;

  @Output() collectionChanged = new EventEmitter<string>();

  private baseUrl = environment.apiUrl;
  private collectionUrl = this.baseUrl + 'mongoAdmin/collections';

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.getCollections();
  }

  getCollections(): void {
    this.http.get<any>(this.collectionUrl).pipe(
      timeout(20000),
      catchError((error) => {
        console.error('Error fetching collections:', error);
        return of({ data: [] });
      })
    ).subscribe((res) => {
      if (res?.data && Array.isArray(res.data)) {
        this.collections = res.data.map((name: string) => ({
          label: name,
          value: name,
        }));
      }
    });
  }

  onCollectionChange(): void {
    this.collectionChanged.emit(this.selectedCollection || '');
  }
}
