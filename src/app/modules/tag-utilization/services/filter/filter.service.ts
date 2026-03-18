import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

/**
 * `FilterService` is an Angular singleton service used to manage and share
 * filtering criteria (such as selected application, organization, and date range)
 * across multiple components in the tag utilization module.
 *
 * This service uses RxJS `BehaviorSubject` to maintain and broadcast the current
 * filter state, allowing components to reactively respond to changes. It also
 * provides getter methods to retrieve the current values without subscribing.
 *
 * Typically used in dashboard or list-detail views where multiple components
 * need to remain in sync with user-selected filters.
 */
@Injectable({
  providedIn: 'root'
})
export class FilterService {

  /**
   * Internal `BehaviorSubject` that holds the current selected application.
   * Initialized to `null`.
   */
  private selectedAppSource: BehaviorSubject<any> = new BehaviorSubject<any>(null);

  /**
   * Internal `BehaviorSubject` that holds the current selected organization.
   * Initialized to `null`.
   */
  private selectedOrgSource: BehaviorSubject<any> = new BehaviorSubject<any>(null);

  /**
   * Internal `BehaviorSubject` that holds the current from date.
   * Initialized to `null`.
   */
  private fromDateSource: BehaviorSubject<Date | null> = new BehaviorSubject<Date | null>(null);

  /**
   * Internal `BehaviorSubject` that holds the current to date.
   * Initialized to `null`.
   */
  private toDateSource: BehaviorSubject<Date | null> = new BehaviorSubject<Date | null>(null);

  /**
   * Observable stream of the selected application.
   *
   * Components can subscribe to this observable to be notified whenever the
   * selected application is updated.
   *
   * @example
   * this.filterService.selectedApp$.subscribe(app => {
   *   // React to application selection changes
   * });
   */
  public readonly selectedApp$: Observable<any> = this.selectedAppSource.asObservable();

  /**
   * Observable stream of the selected organization.
   *
   * Components can subscribe to this observable to be notified whenever the
   * selected organization is updated.
   *
   * @example
   * this.filterService.selectedOrg$.subscribe(org => {
   *   // React to organization selection changes
   * });
   */
  public readonly selectedOrg$: Observable<any> = this.selectedOrgSource.asObservable();

  /**
   * Observable stream of the from date.
   *
   * Components can subscribe to this observable to be notified whenever the
   * from date is updated.
   */
  public readonly fromDate$: Observable<Date | null> = this.fromDateSource.asObservable();

  /**
   * Observable stream of the to date.
   *
   * Components can subscribe to this observable to be notified whenever the
   * to date is updated.
   */
  public readonly toDate$: Observable<Date | null> = this.toDateSource.asObservable();

  /**
   * Updates the currently selected application.
   *
   * This method triggers a change on the `selectedApp$` stream so all
   * subscribers are notified of the new value.
   *
   * @param app - The new application object to set as selected.
   */
  public updateSelectedApp(app: any): void {
    this.selectedAppSource.next(app);
  }

  /**
   * Updates the currently selected organization.
   *
   * This method triggers a change on the `selectedOrg$` stream so all
   * subscribers are notified of the new value.
   *
   * @param org - The new organization object to set as selected.
   */
  public updateSelectedOrg(org: any): void {
    this.selectedOrgSource.next(org);
  }

  /**
   * Updates the from date.
   *
   * This method triggers a change on the `fromDate$` stream so all
   * subscribers are notified of the new value.
   *
   * @param date - The new from date to set.
   */
  public updateFromDate(date: Date | null): void {
    this.fromDateSource.next(date);
  }

  /**
   * Updates the to date.
   *
   * This method triggers a change on the `toDate$` stream so all
   * subscribers are notified of the new value.
   *
   * @param date - The new to date to set.
   */
  public updateToDate(date: Date | null): void {
    this.toDateSource.next(date);
  }

  /**
   * Updates the date range (both from and to dates).
   *
   * @param fromDate - The new from date to set.
   * @param toDate - The new to date to set.
   */
  public updateDateRange(fromDate: Date | null, toDate: Date | null): void {
    this.fromDateSource.next(fromDate);
    this.toDateSource.next(toDate);
  }

  /**
   * Retrieves the currently selected application without subscribing.
   *
   * Useful in scenarios where you need to access the current value synchronously,
   * such as inside route guards or service logic.
   *
   * @returns The current application object or `null` if none is selected.
   */
  public get currentApp(): any {
    return this.selectedAppSource.getValue();
  }

  /**
   * Retrieves the currently selected organization without subscribing.
   *
   * Useful in scenarios where you need to access the current value synchronously,
   * such as inside route guards or service logic.
   *
   * @returns The current organization object or `null` if none is selected.
   */
  public get currentOrg(): any {
    return this.selectedOrgSource.getValue();
  }

  /**
   * Retrieves the current from date without subscribing.
   *
   * @returns The current from date or `null` if none is set.
   */
  public get currentFromDate(): Date | null {
    return this.fromDateSource.getValue();
  }

  /**
   * Retrieves the current to date without subscribing.
   *
   * @returns The current to date or `null` if none is set.
   */
  public get currentToDate(): Date | null {
    return this.toDateSource.getValue();
  }

  /**
   * Clears all the selected filters.
   *
   * This is useful for resetting the state, such as when the user navigates
   * away from a filtered view or presses a "Clear Filters" button.
   *
   * @example
   * this.filterService.clearFilters();
   */
  public clearFilters(): void {
    this.selectedAppSource.next(null);
    this.selectedOrgSource.next(null);
    this.fromDateSource.next(null);
    this.toDateSource.next(null);
  }
}
