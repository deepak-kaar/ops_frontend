import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { catchError, map, Observable, of, timeout } from 'rxjs';
import { API_ENDPOINTS } from 'src/app/core/config/api-endpoint.config';
import { BaseApiService } from 'src/app/core/services/base-api/base-api.service';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class CorrelationEngineService extends BaseApiService {

  private operations: Record<string, { json: any; docs: string }> = {
    findOne: {
      json: {
        function: 'findOne',
        collection: 'orders',
        filter: { orderId: '$params.id' },
        projection: { _id: 0, customerId: 1 },
        output: 'orderDoc'
      },
      docs: `
      /**
       * function: MongoDB function to execute.
       * collection: Target collection (orders).
       * filter: Query filter, here matching by orderId.
       * projection: Fields to return (excluding _id, including customerId).
       * output: Variable name to store the result.
       */
      `
    },

    find: {
      json: {
        function: 'find',
        collection: 'logs',
        filter: { level: 'error' },
        projection: { _id: 0, msg: 1 },
        sort: { timestamp: -1 },
        limit: 5,
        output: 'recentErrors'
      },
      docs: `
      /**
       * function: MongoDB function to execute.
       * collection: Target collection (logs).
       * filter: Filters logs with level = "error".
       * projection: Return only the msg field.
       * sort: Sort by timestamp descending.
       * limit: Restrict results to 5.
       * output: Variable name to store the result.
       */
      `
    },
    aggregate: {
      json: {
        function: "aggregate",
        collection: "events",
        pipeline: [
          { $match: { severity: "high" } },
          { $group: { _id: "$type", total: { $sum: 1 } } }
        ],
        output: "severitySummary"
      },
      docs: `
  /**
   * function: Aggregate pipeline execution.
   * collection: Target collection (events).
   * pipeline: Series of stages.
   *   $match: Filters events with severity = "high".
   *   $group: Groups by event type and counts total.
   * output: Variable name to store the summary.
   */
  `
    },

    lookup: {
      json: {
        function: "lookup",
        from: "invoices",
        localField: "$orderDoc.customerId",
        foreignField: "customerId",
        pipelineFilter: {
          status: "pending",
          issuedDate: {
            $gte: {
              $dateSubtract: {
                startDate: "$$NOW",
                unit: "day",
                amount: 30
              }
            }
          }
        },
        projection: { _id: 0, invoiceId: 1 },
        output: "openInvoices"
      },
      docs: `
  /**
   * function: Lookup (similar to SQL join).
   * from: Collection to join (invoices).
   * localField: Field in source ($orderDoc.customerId).
   * foreignField: Field in target (customerId).
   * pipelineFilter: Filters invoices (pending, issued in last 30 days).
   * projection: Return only invoiceId.
   * output: Variable name to store open invoices.
   */
  `
    },

    graphLookup: {
      json: {
        params: { startId: "E1" },
        steps: [
          {
            id: "chainWalk",
            function: "graphLookup",
            collection: "employees",
            from: "employees",
            startWith: "$params.startId",
            connectFromField: "managerId",
            connectToField: "employeeId",
            as: "managementChain",
            depthField: "level"
          }
        ]
      },
      docs: `
  /**
   * function: Graph lookup (recursive relationship traversal).
   * params: Input params (startId).
   * steps:
   *   id: Step identifier.
   *   collection: employees collection.
   *   from: Source collection.
   *   startWith: Starting employee ID.
   *   connectFromField: Field linking upwards (managerId).
   *   connectToField: Field linking downwards (employeeId).
   *   as: Output array of chain (managementChain).
   *   depthField: Level of recursion.
   */
  `
    },

    sum: {
      json: {
        steps: [
          {
            id: "totalPaid",
            function: "sum",
            collection: "orders",
            field: "amount",
            filter: { status: "paid" },
            output: "paidAmount"
          }
        ]
      },
      docs: `
  /**
   * function: Sum calculation.
   * steps:
   *   id: Step identifier.
   *   collection: orders collection.
   *   field: Field to sum (amount).
   *   filter: Include only paid orders.
   *   output: Variable storing total paid amount.
   */
  `
    },

    count: {
      json: {
        steps: [
          {
            id: "openIssues",
            function: "count",
            collection: "issues",
            filter: { status: "open" },
            output: "openIssueCount"
          }
        ]
      },
      docs: `
  /**
   * function: Count documents.
   * steps:
   *   id: Step identifier.
   *   collection: issues collection.
   *   filter: Include only open issues.
   *   output: Variable storing total count.
   */
  `
    },

    joinAttributes: {
      json: {
        id: "enrichedAttributes",
        function: "joinAttributes",
        left: "$attributeSets",
        right: "$attributeSets1",
        localField: "Owner Org",
        foreignField: "Name",
        mergeFields: ["CPH", "Parent"],
        output: "enrichedAttributes"
      },
      docs: `  /**
 * function: Join attributes between two sets.
 * id: Step identifier.
 * left: Left dataset ($attributeSets).
 * right: Right dataset ($attributeSets1).
 * localField: Field from left (Owner Org).
 * foreignField: Field from right (Name).
 * mergeFields: Fields to bring from right (CPH, Parent).
 * output: Variable storing enriched attributes.
 */`
    }

  };



  /**
   * Fetches the list of apps.
   *
   * @returns An Observable of the response containing all the apps.
   * @throws {Error} Throws an error if the request fails or times out.
   */
  getCorrelationEngine(filters: any): Observable<any> {
    return this.post(API_ENDPOINTS.CORRELATION_ENGINE.TEMPLATE.GET_LIST, filters)
  }

  /**
   * Returns the list of Available Correlation Object as response from the operation object.
   *
   * @returns An Observable of the response containing all the functions.
   */
  getAvailableOperations(): Observable<string[]> {
    return of(Object.keys(this.operations));
  }

  /**
   * Returns corresponding Correlation Object as response from the operation object for a type.
   * @param {string} key Function name
   * @returns An Observable of the response containing the Correlation Object.
   */
  getOperation(key: any): Observable<{ json: any; docs: string } | null> {
    return of(this.operations[key] || null);
  }

  createCorrelation(payload: any): Observable<any> {
    return this.post(API_ENDPOINTS.CORRELATION_ENGINE.TEMPLATE.CREATE, payload);
  }

  getPreviewCorrelationStages(payload: any): Observable<any> {
    return this.post(API_ENDPOINTS.CORRELATION_ENGINE.EXCUETION.PREVIEW, payload);
  }
}
