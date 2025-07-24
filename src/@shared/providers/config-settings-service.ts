import { HttpClient, HttpParams } from '@angular/common/http';
import { Inject, Injectable } from '@angular/core';
import { Params } from '@angular/router';
import { CDTCodeModel } from '../../business-center/service-code/cdtcodepickermodel';
import { ConfigSettingsModel } from '../../business-center/service-code/configsettingsmodel';

@Injectable({
    providedIn: 'root'
})
export class ConfigSettingsService {

    constructor(private httpClient: HttpClient,
        @Inject('SoarConfig') private soarConfig,
        @Inject('toastrFactory') private toastrFactory,
        @Inject('localize') private localize) { }

    get = () => {
        return new Promise((resolve, reject) => {
            let url = this.soarConfig.domainUrl + '/configsettings';
            this.httpClient.get<ConfigSettingsModel[]>(url)
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
