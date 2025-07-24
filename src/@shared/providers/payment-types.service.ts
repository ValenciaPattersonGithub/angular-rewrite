import { Inject, Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { PaymentTypes } from 'src/business-center/payment-types/payment-types.model';
import { Params } from '@angular/router';
import { of } from 'rxjs';
import { cache } from 'src/browser-cache/cache-operators';
import { IndexedDBCacheProvider } from 'src/browser-cache/indexed-db-cache.provider';
import { Duration } from 'src/browser-cache/duration';

@Injectable({
  providedIn: 'root'
})
export class PaymentTypesService {

  constructor(private httpClient: HttpClient,
    @Inject('SoarConfig') private soarConfig,
    @Inject('patSecurityService') private patSecurityService,
    private cacheProvider: IndexedDBCacheProvider
  ) { }

  getAllPaymentTypes = () => {
    if (this.patSecurityService.IsAuthorizedByAbbreviation('soar-biz-ailoc-view')) {
      return new Promise((resolve, reject) => {
        const url = `${String(this.soarConfig.domainUrl)}/paymenttypes`;
        this.httpClient.get<PaymentTypes[]>(url)
          .toPromise()
          .then(res => {
            resolve(res);
          }, err => { // Error
            reject(err);
          })
      })
    }
  }

  update = (paymentType: PaymentTypes) => {
    if (paymentType) {
      return new Promise((resolve, reject) => {
        const url = `${String(this.soarConfig.domainUrl)}/paymenttypes`;
        this.httpClient.put<PaymentTypes>(url, paymentType)
          .toPromise()
          .then(res => {
            resolve(res);
          }, err => { // Error
            reject(err);
          })
      });
    }
  }

  deletePaymentTypeById = (paymentTypeId: string) => {
    if (paymentTypeId) {
      return new Promise((resolve, reject) => {
        const url = `${String(this.soarConfig.domainUrl)}/paymenttypes/${String(paymentTypeId)}`;
        this.httpClient.delete(url)
          .toPromise()
          .then(res => {
            resolve(res);
          }, err => { // Error
            reject(err);
          })
      });
    }
  }

  save = (paymentType: PaymentTypes) => {
    if (paymentType) {
      return new Promise((resolve, reject) => {
        const url = `${String(this.soarConfig.domainUrl)}/paymenttypes`;
        this.httpClient.post<PaymentTypes>(url, paymentType)
          .toPromise()
          .then(res => {
            resolve(res);
          }, err => { // Error
            reject(err);
          })
      });
    }
  }

  getAllPaymentTypesMinimal = (isActive, paymentTypeCategory: number) => {
    if (this.patSecurityService.IsAuthorizedByAbbreviation('soar-biz-ailoc-view')) {
      return new Promise((resolve, reject) => {
        let queryParams: Params = {};
        queryParams = this.setParameter({ isActive: isActive, paymentTypeCategory: paymentTypeCategory });
        const url = `${String(this.soarConfig.domainUrl)}/paymenttypes/minimal`;
        this.httpClient.get<PaymentTypes[]>(url, { params: queryParams })
          .toPromise()
          .then(res => {
            resolve(res);
          }, err => { // Error
            reject(err);
          })
      })
    }
  }

  getPaymentTypeById = (paymentTypeId: string) => {
    if (paymentTypeId) {
      return new Promise((resolve, reject) => {
        const url = `${String(this.soarConfig.domainUrl)}/paymenttypes/${String(paymentTypeId)}`;
        this.httpClient.get(url)
          .toPromise()
          .then(res => {
            resolve(res);
          }, err => { // Error
            reject(err);
          })
      });
    }
  }

  /**
   * Update payment type options.
   * 
   * @param options 
   * @returns 
   */
  updatePaymentTypeOptions(options: Partial<PaymentTypes>) {
    return this.httpClient.put<PaymentTypes>(`${String(this.soarConfig.domainUrl)}/paymenttypes/options`, options);
  }

  /**
   * Check if the location and then practice have Weave Payments integration.
   * 
   * Returns true if the location/practice has Weave Payments integration, otherwise false.
   * 
   * Response will be cached for 5 minutes.
   * 
   * @param locationId 
   * @returns 
   */
  hasWeavePaymentsIntegration(locationId: number) {
    const path = `/api/locations/${locationId}/integration-control/features/AppointmentReminders/vendors/Weave/check`;
    return this.httpClient.get<{ Result: boolean; }>(`${String(this.soarConfig.webApiUrl)}${path}`)
      .pipe(
        cache(this.cacheProvider, path, Duration.fromMinutes(5).toMilliseconds())
      );
  }

  private setParameter(routerParams: Params): HttpParams {
    let queryParams = new HttpParams();
    for (const key in routerParams) {
      queryParams = queryParams.set(key, routerParams[key]);
    }
    return queryParams;
  }
}
