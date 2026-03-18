/**
 * Shared constants for datapoint-administration-new module
 * Centralizes all constant values to avoid duplication
 */

import { breakPointForToastComponent } from 'src/app/core/utils/breakpoint-utils';

// Re-export for convenience
export { breakPointForToastComponent };

/**
 * Default pagination settings
 */
export const PAGINATION_CONFIG = {
  rows: 20,
  rowsPerPageOptions: [20, 30, 50],
  showCurrentPageReport: true,
  currentPageReportTemplate: 'Showing {first} to {last} of {totalRecords} entries'
} as const;

/**
 * Route paths
 */
export const ROUTES = {
  // Entity routes
  ENTITY_LIST: '/datapointAdminV2/home/entityNew',
  ENTITY_CREATE: '/datapointAdminV2/home/createEntityNew',
  ENTITY_EDIT: '/datapointAdminV2/home/editEntityNew',
  ENTITY_DATA: '/datapointAdminV2/home/entityDataNew',
  
  // Instance routes
  INSTANCE_LIST: '/datapointAdminV2/home/instanceNew',
  INSTANCE_CREATE: '/datapointAdminV2/home/createInstanceNew',
  
  // Tags/Attributes routes
  TAGS_LIST: '/datapointAdminV2/home/attributeNew',
  
  // Flags routes
  FLAGS_LIST: '/datapointAdminV2/home/flagsNew',
  FLAGS_CREATE: '/datapointAdminV2/home/createFlagsNew',
  
  // Events routes
  EVENTS_LIST: '/datapointAdminV2/home/eventsNew',
  EVENTS_CREATE: '/datapointAdminV2/home/createEventsNew',
  
  // Notifications routes
  NOTIFICATIONS_LIST: '/datapointAdminV2/home/notificationsNew',
  NOTIFICATIONS_CREATE: '/datapointAdminV2/home/createNotificationNew'
} as const;

/**
 * Toast message configurations
 */
export const TOAST_MESSAGES = {
  DELETE_SUCCESS: (itemType: string) => ({
    severity: 'success' as const,
    summary: 'Success',
    detail: `${itemType} deleted successfully`
  }),
  DELETE_ERROR: (itemType: string) => ({
    severity: 'error' as const,
    summary: 'Error',
    detail: `Failed to delete ${itemType}`
  }),
  CREATE_SUCCESS: (itemType: string) => ({
    severity: 'success' as const,
    summary: 'Success',
    detail: `${itemType} created successfully`
  }),
  UPDATE_SUCCESS: (itemType: string) => ({
    severity: 'success' as const,
    summary: 'Success',
    detail: `${itemType} updated successfully`
  }),
  ERROR: (message: string) => ({
    severity: 'error' as const,
    summary: 'Error',
    detail: message
  })
} as const;

/**
 * Debounce time for filter operations (ms)
 */
export const FILTER_DEBOUNCE_TIME = 300;

/**
 * Status options for entities
 */
export const ENTITY_STATUSES = ['Application', 'OpsInsight'] as const;

/**
 * Severity options for flags
 */
export const FLAG_SEVERITIES = ['Red', 'Orange', 'Yellow', 'Green'] as const;
