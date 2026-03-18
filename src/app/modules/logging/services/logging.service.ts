import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class LoggingService {

  private BASE_URLS = {
    mongoAdmin: "http://localhost:8080/mongoAdmin",
    tagUtilization: "http://localhost:8080/tagUtilization",
    attributeSearch: "http://localhost:8080/attributeSearch",
    dataPoint: "http://localhost:8080/dataPoint",
    schedulerJob: "http://localhost:8080/schedulerJob",
    email: "http://localhost:8080/emailAdmin",
    reportImage: "http://localhost:8080/reportImageAdmin",
    config: "http://localhost:8080/configAdmin",
    piAdmin: "http://localhost:8080/piAdmin",
    databaseAdmin: "http://localhost:8080/databaseAdmin",
    datasourceAdmin: "http://localhost:8080/datasourceAdmin",
    logger: "http://localhost:8080/logger"
  };

  // Module constants for consistent logging
  readonly MODULES = {
    MONGODB_ADMIN: "MongoDB Administration",
    ATTRIBUTE_SEARCH: "Attribute Search",
    TAG_SEARCH: "Tag Utilization",
    DATAPOINT: "Datapoint Administration",
    SCHEDULERJOB: "SchedulerJob Administration",
    EMAIL: "Email Administration",
    REPORT_IMAGE: "ReportImage Administration",
    CONFIG: "Config Administration",
    PI_ADMIN: "PI Administration",
    DATABASE_ADMIN: "Database Administration",
    DATASOURCE_ADMIN: "DataSource Administration"
  };

  constructor(private http: HttpClient) { }

  getLogs(collection: string, source: string = 'mongoAdmin') {
    const baseUrl = this.BASE_URLS[source as keyof typeof this.BASE_URLS] || this.BASE_URLS.mongoAdmin;
    return this.http.get<any>(`${baseUrl}/category/${collection}`);
  }

  getAllSummaries(source: string = 'mongoAdmin') {
    const baseUrl = this.BASE_URLS[source as keyof typeof this.BASE_URLS] || this.BASE_URLS.mongoAdmin;
    return this.http.get<any>(`${baseUrl}/logger/summary`);
  }


  getAudit(params: { module?: string; entity?: string; entityId?: string; userId?: string; from?: string; to?: string; limit?: number; }) {
    const query = new URLSearchParams();
    Object.entries(params || {}).forEach(([k, v]) => {
      if (v !== undefined && v !== null && v !== '') query.append(k, String(v));
    });
    const qs = query.toString();
    return this.http.get<any>(`${this.BASE_URLS.logger}/audit${qs ? `?${qs}` : ''}`);
  }

  // Simple SSE client for real-time
  connectStream(): EventSource {
    return new EventSource(`${this.BASE_URLS.logger}/stream`);
  }

  getOverview() {
    return this.http.get<any>('http://localhost:8080/loggingOverview/overview');
  }

  getModules() {
    return this.http.get<any>('http://localhost:8080/loggingOverview/modules');
  }

  getCollectionLogs(collection: string, module?: string) {
    const params = module ? `?module=${module}` : '';
    return this.http.get<any>(`http://localhost:8080/loggingOverview/collection/${collection}${params}`);
  }

  // Database Metrics APIs
  getDbHealth() {
    return this.http.get<any>(`${this.BASE_URLS.logger}/db/health`);
  }

  getDbPool() {
    return this.http.get<any>(`${this.BASE_URLS.logger}/db/pool`);
  }

  getCpuMetrics() {
    return this.http.get<any>(`${this.BASE_URLS.logger}/system/cpu`);
  }

  getDbAnalysis() {
    return this.http.get<any>(`${this.BASE_URLS.logger}/db/analysis`);
  }

  getDbSummary() {
    return this.http.get<any>(`${this.BASE_URLS.logger}/db/summary`);
  }

  // Metrics Configuration APIs
  getMetricsConfig() {
    return this.http.get<any>(`${this.BASE_URLS.logger}/metrics/config`);
  }

  updateMetricsConfig(metrics: any) {
    return this.http.put<any>(`${this.BASE_URLS.logger}/metrics/config`, { metrics });
  }

  resetMetricsConfig() {
    return this.http.post<any>(`${this.BASE_URLS.logger}/metrics/config/reset`, {});
  }

  evaluateMetrics() {
    return this.http.get<any>(`${this.BASE_URLS.logger}/metrics/evaluate`);
  }

}
