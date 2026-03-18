import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { BehaviorSubject, Observable, map, timeout, catchError } from 'rxjs';
import { environment } from 'src/environments/environment';
@Injectable({
  providedIn: 'root'
})
export class WidgetService {
  url: string = environment.apiUrl; // base api_url
  get_data: string = this.url + 'idt/entityMapping'; // url to fetch the entity list
  post_data: string = this.url + 'idt/saveTemplateMappingValues'; // url to post the data
  get_drd_data: string = this.url + 'entity/getAttrValue'; // url to fetch the entity list
  get_attr_logs: string = this.url + 'entity/getAttributeLogs/'
  post_daily_target: string = this.url + 'entity/postMonthlyTargetAttr';
  get_daily_target: string = this.url + 'entity/getFreqValuesByDate';
  update_daily_target: string = this.url + 'entity/updateFreqValueById'
  get_attribute_graph: string = this.url + 'entity/getFreqValues';
  get_attribute_excel: string = this.url + 'entity/getFreqExcels';
  get_multi_freq_excel: string = this.url + 'entity/getMultiFreqExcels';
  get_multi_freq_graph: string = this.url + 'entity/getMultiFreqValues'
  // Map to hold BehaviorSubjects for different widgets/events
  private subjectsMap = new Map<string, BehaviorSubject<any>>();
  // spinner = inject(NgxSpinnerService);

  private formDataSubject = new BehaviorSubject<{ [key: string]: any }>({});
  private formDataMap: { [key: string]: any } = {};




  constructor(private http: HttpClient) { }

  /**
   * Method to get the BehaviorSubject for a specific widget/event
   */
  getSubject(key: string): BehaviorSubject<any> {
    if (!this.subjectsMap.has(key)) {
      // Create a new subject if it doesn't exist for the given key
      this.subjectsMap.set(key, new BehaviorSubject<any>(null));
    }
    return this.subjectsMap.get(key)!;
  }

  /**
   * Method to update the value of a specific widget/event
   */
  updateValue(key: string, value: any): void {
    const subject = this.getSubject(key);
    subject.next(value);
  }


  getFormData(): Observable<{ [key: string]: any }> {
    return this.formDataSubject.asObservable();
  }


  updateFormData(key: string, value: any): void {
    this.formDataMap[key] = value;
    // console.log(this.formDataMap);
    this.formDataSubject.next({ ...this.formDataMap });
  }


  getAllFormData(): { [key: string]: any } {
    return this.formDataMap;
  }

  getData(payload: any): Observable<any> {
    return this.http.post(this.get_data, payload).pipe(
      map((res: any) => {
        return res;
      }),
      timeout(20000),
      catchError((err) => {
        throw err;
      })
    );
  }

  submitFormData(id?: string, date?: string) {
    console.log(this.formDataMap);
    const payload = {
      id: id || null,
      attributeValues: this.formDataMap,
      date: date || null
    }
    return this.http.post(this.post_data, payload).pipe(
      map((res: any) => {
        console.log(res);
        return res;
      }),
      timeout(20000),
      catchError((err) => {
        throw err;
      })
    );
  }

  getDrdData(attrId: string): Observable<any> {
    return this.http.post(this.get_drd_data, { attributeId: attrId }).pipe(
      map((res: any) => {
        console.log(res);
        return res;
      }),
      timeout(20000),
      catchError((err) => {
        throw err;
      })
    );
  }

  getAttributeLogs(id: string) {
    return this.http.get(this.get_attr_logs + id).pipe(
      map((res: any) => {
        return res;
      }),
      timeout(20000),
      catchError((err) => {
        throw err;
      })
    );
  }

  postDailyTarget(payload: any) {
    return this.http.post(this.post_daily_target, payload).pipe(
      map((res: any) => {
        return res;
      }),
      timeout(20000),
      catchError((err) => {
        throw err;
      })
    );
  }

  getTargetValues(payload: any) {
    return this.http.post(this.get_daily_target, payload).pipe(
      map((res: any) => {
        return res;
      }),
      timeout(20000),
      catchError((err) => {
        throw err;
      })
    );
  }

  updateTargetValues(payload: any) {
    return this.http.post(this.update_daily_target, payload).pipe(
      map((res: any) => {
        return res;
      }),
      timeout(20000),
      catchError((err) => {
        throw err;
      })
    );
  }

  getAttributeGraph(payload: any) {
    return this.http.post(this.get_attribute_graph, payload).pipe(
      map((res: any) => {
        return res;
      }),
      timeout(20000),
      catchError((err) => {
        throw err;
      })
    );
  }

  getMultiAttributeGraph(payload: any) {
    return this.http.post(this.get_multi_freq_graph, payload).pipe(
      map((res: any) => {
        return res;
      }),
      timeout(20000),
      catchError((err) => {
        throw err;
      })
    );
  }

  getMultiAttributeExcel(payload: any) {
    return this.http.post(this.get_multi_freq_excel, payload, { responseType: 'blob' }).pipe(
      map((res: any) => {
        return res;
      }),
      timeout(20000),
      catchError((err) => {
        throw err;
      })
    );
  }

  getExcel(payload: any) {
    return this.http.post(this.get_attribute_excel, payload, { responseType: 'blob' }).pipe(
      map((res: any) => {
        return res;
      }),
      timeout(20000),
      catchError((err) => {
        throw err;
      })
    );
  }

}
