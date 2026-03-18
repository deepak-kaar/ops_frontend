/**
 * Shared interfaces for datapoint-administration-new module
 */

/**
 * Base filter payload interface
 */
export interface FilterPayload {
  appId?: string | null;
  orgId?: string | null;
}

/**
 * Base list item with common properties
 */
export interface BaseListItem {
  [key: string]: any;
}

/**
 * Entity interface
 */
export interface Entity extends BaseListItem {
  entityId: string;
  entityName: string;
  entityDesc?: string;
  entityLevel?: string;
  InstanceCount?: number;
}

/**
 * Instance interface
 */
export interface Instance extends BaseListItem {
  instanceId: string;
  instanceName: string;
  instanceDesc?: string;
  instanceLocation?: string;
  entityName?: string;
  appName?: string;
  orgName?: string;
}

/**
 * Flag interface
 */
export interface Flag extends BaseListItem {
  flagId: string;
  flagName: string;
  flagDesc?: string;
  flagSeverity?: string;
}

/**
 * Event phase configuration (Start / Ongoing / End)
 */
export interface EventPhaseConfig {
  actionTypes: string[];
  notificationTemplateId?: string | null;
  workflowId?: string | null;
}

/**
 * Event interface
 */
export interface EventItem extends BaseListItem {
  eventId: string;
  eventName: string;
  eventDescription?: string;
  flagID?: string;
  flagName?: string;
  flagSeverity?: string;
  isActive?: boolean;
  eventStart?: EventPhaseConfig;
  eventOngoing?: EventPhaseConfig;
  eventEnd?: EventPhaseConfig;
}

/**
 * Notification interface
 */
export interface Notification extends BaseListItem {
  notificationId: string;
  notificationName: string;
  notificationDescription?: string;
  notificationType?: string;
}

/**
 * Tag/Attribute interface
 */
export interface Tag extends BaseListItem {
  attributeId: string;
  attributeName: string;
  alias?: string;
  createdOn?: Date;
  decimalPlaces?: number;
  dataPointID?: {
    dataType: string;
  };
}

/**
 * Navigation state interface
 */
export interface NavigationState {
  appId?: string | null;
  orgId?: string | null;
  isEdit?: boolean;
  [key: string]: any;
}

/**
 * Delete confirmation config
 */
export interface DeleteConfirmConfig {
  itemType: string;
  itemName?: string;
  message?: string;
}

/**
 * API response wrapper
 */
export interface ApiResponse<T> {
  data?: T;
  message?: string;
  success?: boolean;
  [key: string]: any;
}
