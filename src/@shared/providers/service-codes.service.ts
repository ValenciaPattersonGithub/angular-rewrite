import { HttpClient, HttpParams } from '@angular/common/http';
import { Inject, Injectable } from '@angular/core';
import { Params } from '@angular/router';
import { ServiceCodeModel } from 'src/business-center/service-code/service-code-model';

@Injectable({
  providedIn: 'root'
})
export class ServiceCodesService {

  constructor(
    private httpClient: HttpClient,
    @Inject('SoarConfig') private soarConfig) { }

  search = (searchParams) => {
    return new Promise((resolve, reject) => {
      let queryParams: Params = {};
      if (searchParams) {
        queryParams = this.setParameter(searchParams);
      }
      const url = `${String(this.soarConfig.domainUrl)}/servicecodes/search`;
      this.httpClient.get<ServiceCodeModel[]>(url, { params: queryParams })
        .toPromise()
        .then(res => {
          resolve(res);
        }, err => { // Error
          reject(err);
        })
    });
  }

  updateServiceCodes = (ServiceCodeModel) => {
    return new Promise((resolve, reject) => {
      const url = `${String(this.soarConfig.domainUrl)}/servicecodes/array`;
      this.httpClient.put(url, ServiceCodeModel)
        .toPromise()
        .then(res => {
          resolve(res);
        }, err => { // Error
          reject(err);
        })
    });
  };

  containingSwiftCodes = (serviceCodeId) => {
    return new Promise((resolve, reject) => {
      const url = `${String(this.soarConfig.domainUrl)}/servicecodes/swiftpickcodes/${String(serviceCodeId.serviceCodeId)}`;      
      let queryParams: Params = {};
      if (serviceCodeId) {
        queryParams = this.setParameter(serviceCodeId);
      }
      this.httpClient.get<ServiceCodeModel[]>(url, { params: queryParams })
        .toPromise()
        .then(res => {
          resolve(res);
        }, () => { // Error
          reject();
          
        })
    });
  }

  checkServiceCodeUsage = (serviceCodeId) => {
    return new Promise((resolve, reject) => {
      const url = `${String(this.soarConfig.domainUrl)}/servicecodes/${String(serviceCodeId.serviceCodeId)}/usage`;
      let queryParams: Params = {};
      if (serviceCodeId) {
        queryParams = this.setParameter(serviceCodeId);
      }
      this.httpClient.get<ServiceCodeModel[]>(url, { params: queryParams })
        .toPromise()
        .then(res => {
          resolve(res);
        }, () => { // Error
          reject();
        })
    });
  }

  UpdateServiceCodes = (serviceCodes) => {
    return new Promise((resolve, reject) => {
      this.updateServiceCodes(serviceCodes).then( (res) => {
        resolve(res);
       }, () => {
          reject();
          })
        });
  }

  getSwiftCodesAttachedToServiceCode = (serviceCodeId) => {
    return new Promise((resolve, reject) => {
        this.containingSwiftCodes({ serviceCodeId: serviceCodeId })
            .then((res) => {
                resolve(res);
            },() => {
              reject();
            })
    });
  }
  
  checkForServiceCodeUsage = (serviceCodeId) => {
    return new Promise((resolve,reject) => {
        this.checkServiceCodeUsage({ serviceCodeId: serviceCodeId })
            .then((res) => {
                resolve(res);
            },() => {
              reject();
            })
      });
  }

  CheckForAffectedAreaChanges = (serviceTransationList, codes, setObjectState) => {
    const serviceCodesThatNeedUpdated: string[] = [];
    // helper for this function
    const push = (code) => {
      if (serviceCodesThatNeedUpdated?.indexOf(code) === -1) {
        serviceCodesThatNeedUpdated?.push(code);
      }
    };
    serviceTransationList?.forEach((st) => {
      const associatedServiceCode = codes?.find(x => x.ServiceCodeId == st?.ServiceCodeId)
      if (associatedServiceCode) {
        switch (associatedServiceCode?.AffectedAreaId) {
          case 1:
            // mouth
            st.$$ObjectWasUpdated = st?.Roots || st?.RootSummaryInfo || st?.Tooth || st?.Surface || st?.SurfaceSummaryInfo ? true : false;
            st.Roots = null;
            st.RootSummaryInfo = null;
            st.Tooth = null;
            st.Surface = null;
            st.SurfaceSummaryInfo = null;
            break;
          case 3:
            // root
            if (!st?.Roots || !st?.Tooth) {
              push(st?.Code);
            }
            else {
              st.$$ObjectWasUpdated = st?.Surface || st?.SurfaceSummaryInfo ? true : false;
              st.Surface = null;
              st.SurfaceSummaryInfo = null;
            }
            break;
          case 4:
            // surface
            if (!st?.Surface || !st?.Tooth) {
              push(st?.Code);
            }
            else {
              st.$$ObjectWasUpdated = st?.Roots || st?.RootSummaryInfo ? true : false;
              st.Roots = null;
              st.RootSummaryInfo = null;
            }
            break;
          case 5:
            // tooth
            if (!st?.Tooth) {
              push(st?.Code);
            }
            else {
              st.$$ObjectWasUpdated = st?.Roots || st?.RootSummaryInfo || st?.Surface || st?.SurfaceSummaryInfo ? true : false;
              st.Roots = null;
              st.RootSummaryInfo = null;
              st.Surface = null;
              st.SurfaceSummaryInfo = null;
            }
            break;
        }
        if (st?.$$ObjectWasUpdated && setObjectState) {
          st.ObjectState = 'Update';
        }
      }
    });
    return serviceCodesThatNeedUpdated;
  }

  private setParameter(routerParams: Params): HttpParams {
    let queryParams = new HttpParams();
    for (const key in routerParams) {
      queryParams = queryParams.set(key, routerParams[key]);
    }
    return queryParams;
  }

}
