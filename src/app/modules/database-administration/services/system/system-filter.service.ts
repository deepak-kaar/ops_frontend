import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class SystemFilterService {

  /**
   * @property {BehaviorSubject<any>} selectedSystemSource - Internal `BehaviorSubject` that holds the current selected system.
    * Internal `BehaviorSubject` that holds the current selected system.
    * Initialized to `null`.
    */
  private selectedSystemSource: BehaviorSubject<any> = new BehaviorSubject<any>(null);

  /**
   * Observable stream of the selected system.
   * Components can subscribe to this observable to be notified whenever the 
   * selected system is updated.
   * @method selectedSystem$
   * @returns Observable<any>
   * @example
   * this.filterService.selectedSystem$.subscribe(app => {
   *   // React to application selection changes
   * });
   */
  public readonly selectedSystem$: Observable<any> = this.selectedSystemSource.asObservable();

  /**
   * Updates the currently selected system.
   * 
   * This method triggers a change on the `selectedSystem$` stream so all
   * subscribers are notified of the new value.
   *
   * @param app - The new system object to set as selected.
   */
  public updateSelectedSystem(app: any): void {
    this.selectedSystemSource.next(app);
  }

  /**
   * Retrieves the currently selected system without subscribing.
   * Useful in scenarios where you need to access the current value synchronously,
   * such as inside route guards or service logic.
   * @method currentSystem
   * @returns The current system object or `null` if none is selected.
   */
  public get currentSystem(): any {
    return this.selectedSystemSource.getValue();
  }

  /**
   * Clears the selected system.
   * @method clearFilters
   * @returns void
   * This is useful for resetting the state, such as when the user navigates  away from a filtered view or presses a "Clear Filters" button.
   * away from a filtered view or presses a "Clear Filters" button.
   * @example
   * this.filterService.clearFilters();
   */
  public clearFilters(): void {
    this.selectedSystemSource.next(null);
  }
}
