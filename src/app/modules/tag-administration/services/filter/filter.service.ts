import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

/**
 * `FilterService` is an Angular singleton service used to manage and share
 * filtering criteria (such as selected application, organization, and tag)
 * across multiple components in the tag administration module.
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
   * Internal `BehaviorSubject` that holds the current selected tag.
   * Initialized to `null`.
   */
  private selectedTagSource: BehaviorSubject<any> = new BehaviorSubject<any>(null);

  /**
   * Internal `BehaviorSubject` that holds the current selected type (Entity/Instance).
   * Initialized to `null`.
   */
  private selectedTypeSource: BehaviorSubject<any> = new BehaviorSubject<any>(null);

  /**
   * Internal `BehaviorSubject` that holds the current selected attribute.
   * Initialized to `null`.
   */
  private selectedAttributeSource: BehaviorSubject<any> = new BehaviorSubject<any>(null);

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
   * Observable stream of the selected tag.
   *
   * Components can subscribe to this observable to be notified whenever the
   * selected tag is updated.
   */
  public readonly selectedTag$: Observable<any> = this.selectedTagSource.asObservable();

  /**
   * Observable stream of the selected type.
   *
   * Components can subscribe to this observable to be notified whenever the
   * selected type is updated.
   */
  public readonly selectedType$: Observable<any> = this.selectedTypeSource.asObservable();

  /**
   * Observable stream of the selected attribute.
   *
   * Components can subscribe to this observable to be notified whenever the
   * selected attribute is updated.
   */
  public readonly selectedAttribute$: Observable<any> = this.selectedAttributeSource.asObservable();

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
   * Updates the currently selected tag.
   *
   * This method triggers a change on the `selectedTag$` stream so all
   * subscribers are notified of the new value.
   *
   * @param tag - The new tag object to set as selected.
   */
  public updateSelectedTag(tag: any): void {
    this.selectedTagSource.next(tag);
  }

  /**
   * Updates the currently selected type (Entity/Instance).
   *
   * This method triggers a change on the `selectedType$` stream so all
   * subscribers are notified of the new value.
   *
   * @param type - The new type to set as selected.
   */
  public updateSelectedType(type: any): void {
    this.selectedTypeSource.next(type);
  }

  /**
   * Updates the currently selected attribute.
   *
   * This method triggers a change on the `selectedAttribute$` stream so all
   * subscribers are notified of the new value.
   *
   * @param attribute - The new attribute object to set as selected.
   */
  public updateSelectedAttribute(attribute: any): void {
    this.selectedAttributeSource.next(attribute);
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
   * Retrieves the currently selected tag without subscribing.
   *
   * @returns The current tag object or `null` if none is selected.
   */
  public get currentTag(): any {
    return this.selectedTagSource.getValue();
  }

  /**
   * Retrieves the currently selected type without subscribing.
   *
   * @returns The current type or `null` if none is selected.
   */
  public get currentType(): any {
    return this.selectedTypeSource.getValue();
  }

  /**
   * Retrieves the currently selected attribute without subscribing.
   *
   * @returns The current attribute object or `null` if none is selected.
   */
  public get currentAttribute(): any {
    return this.selectedAttributeSource.getValue();
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
    this.selectedTagSource.next(null);
    this.selectedTypeSource.next(null);
    this.selectedAttributeSource.next(null);
  }
}
