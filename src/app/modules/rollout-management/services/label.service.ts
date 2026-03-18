import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { RolloutService } from './rollout.service';

@Injectable({
  providedIn: 'root'
})
export class LabelService {
  private selectedLabelSubject = new BehaviorSubject<string | null>(null);
  public selectedLabel$ = this.selectedLabelSubject.asObservable();

  constructor(private rolloutService: RolloutService) {
    // Load selected label from localStorage on initialization
    const savedLabel = localStorage.getItem('rollout_selected_label');
    if (savedLabel) {
      this.selectedLabelSubject.next(savedLabel);
    }
  }

  /**
   * Set the currently selected label
   */
  setSelectedLabel(label: string | null): void {
    this.selectedLabelSubject.next(label);
    if (label) {
      localStorage.setItem('rollout_selected_label', label);
    } else {
      localStorage.removeItem('rollout_selected_label');
    }
  }

  /**
   * Get the currently selected label
   */
  getSelectedLabel(): string | null {
    return this.selectedLabelSubject.value;
  }

  /**
   * Get all available labels
   */
  getAllLabels(): Observable<string[]> {
    return this.rolloutService.getAllLabels();
  }

  /**
   * Create a new label
   */
  createLabel(name: string): Observable<any> {
    return this.rolloutService.createLabel(name);
  }
}

