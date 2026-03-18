import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class WebService {
/**
   * @property {BehaviorSubject<any>} selectedWSSource - Internal `BehaviorSubject` that holds the current selected web service.
    * Internal `BehaviorSubject` that holds the current selected system.
    * Initialized to `null`.
    */
  private selectedWSSource: BehaviorSubject<any> = new BehaviorSubject<any>(null);

  /**
   * Observable stream of the selected web service.
   * Components can subscribe to this observable to be notified whenever the 
   * selected system is updated.
   * @method selectedWS$
   * @returns Observable<any>
   * @example
   * this.filterService.selectedWS$.subscribe(app => {
   *   // React to application selection changes
   * });
   */
  public readonly selectedWS$: Observable<any> = this.selectedWSSource.asObservable();

  /**
   * Updates the currently selected web service.
   * 
   * This method triggers a change on the `selectedWS$` stream so all
   * subscribers are notified of the new value.
   *
   * @param app - The new system object to set as selected.
   */
  public updateSelectedWS(app: any): void {
    this.selectedWSSource.next(app);
  }

  /**
   * Retrieves the currently selected web service without subscribing.
   * Useful in scenarios where you need to access the current value synchronously,
   * such as inside route guards or service logic.
   * @method currentWS
   * @returns The current webservice object or `null` if none is selected.
   */
  public get currentWS(): any {
    return this.selectedWSSource.getValue();
  }

  /**
   * Clears the selected web service.
   * @method clearFilters
   * @returns void
   * This is useful for resetting the state, such as when the user navigates  away from a filtered view or presses a "Clear Filters" button.
   * away from a filtered view or presses a "Clear Filters" button.
   * @example
   * this.filterService.clearFilters();
   */
  public clearFilters(): void {
    this.selectedWSSource.next(null);
  }
}
