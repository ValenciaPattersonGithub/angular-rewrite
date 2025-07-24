import { HttpClient, HttpParams } from '@angular/common/http';
import { Inject, Injectable } from '@angular/core';
import { Params } from '@angular/router';
import { CDTCodeModel } from '../../business-center/service-code/cdtcodepickermodel';

@Injectable({
  providedIn: 'root'
})
export class CdtCodeService {

    constructor(private httpClient: HttpClient,
        @Inject('SoarConfig') private soarConfig,
        @Inject('toastrFactory') private toastrFactory,
        @Inject('localize') private localize) { }

    getList = () => {
        return new Promise((resolve, reject) => {            
                let url = this.soarConfig.domainUrl + '/cdtcodes';
                this.httpClient.get<CDTCodeModel[]>(url)
                    .toPromise()
                    .then(res => {
                        resolve(res);
                    }, err => { // Error
                        this.toastrFactory.error(this.localize.getLocalizedString('Failed to retrieve the list of {0}. Refresh the page to try again.', ['CdtCodes']), this.localize.getLocalizedString('Error'));
                        reject(err);
                    })
        });
    }

    search = (searchParams) => {
        return new Promise((resolve, reject) => {
            let queryParams: Params = {};
            if (searchParams) {
                queryParams = this.setParameter(searchParams);
            }
            let url = this.soarConfig.domainUrl + '/cdtcodes/search';
            this.httpClient.get<CDTCodeModel[]>(url, { params: queryParams })
                .toPromise()
                .then(res => {
                    resolve(res);
                }, err => { // Error
                    this.toastrFactory.error(this.localize.getLocalizedString('Failed to retrieve the list of {0}. Refresh the page to try again.', ['CdtCodes']), this.localize.getLocalizedString('Error'));
                    reject(err);
                })
        });
    }

    IsValid = (Code) => {
        return new Promise((resolve, reject) => {           
            let url = this.soarConfig.domainUrl + '/cdtcodes/IsValid';
            let queryParams: Params = {};
            if (Code) {
                queryParams = this.setParameter(Code);
            }
            this.httpClient.get<CDTCodeModel[]>(url, { params: queryParams })
                .toPromise()
                .then(res => {
                    resolve(res);
                }, err => { // Error
                    this.toastrFactory.error(this.localize.getLocalizedString('Failed to retrieve the list of {0}. Refresh the page to try again.', ['CdtCodes']), this.localize.getLocalizedString('Error'));
                    reject(err);
                })
        });
    }

    private setParameter(routerParams: Params): HttpParams {
        let queryParams = new HttpParams();
        for (const key in routerParams) {
            queryParams = queryParams.set(key, routerParams[key]);
        }
        return queryParams;
    }
}
