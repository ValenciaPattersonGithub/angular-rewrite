import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, Inject } from '@angular/core';
import { Params } from '@angular/router';
import { Message } from '../message';

@Injectable({
    providedIn: 'root'
})
export class AccountStatementMessagesService {

    constructor(private httpClient: HttpClient,
        @Inject('SoarConfig') private soarConfig) { }

    all = () => {
        return new Promise((resolve, reject) => {
            let url = this.soarConfig.domainUrl + '/accounts/accountstatementmessage';
            this.httpClient.get<Message[]>(url)
                .toPromise()
                .then(res => {
                    resolve(res);
                }, err => { // Error
                    reject(err);
                })
        })
    }

    save = (messagesDto) => {
        return new Promise((resolve, reject) => {
            let url = this.soarConfig.domainUrl + '/accounts/accountstatementmessage';
            this.httpClient.post(url, messagesDto)
                .toPromise()
                .then(res => {
                    resolve(res);
                }, err => { // Error
                    reject(err);
                })
        });
    }

    update = (messagesDto) => {
        return new Promise((resolve, reject) => {
            let url = this.soarConfig.domainUrl + '/accounts/accountstatementmessage';
            this.httpClient.put(url, messagesDto)
                .toPromise()
                .then(res => {
                    resolve(res);
                }, err => { // Error
                    reject(err);
                })
        });
    }

    getDuplicate = (messageName) => {
        return new Promise((resolve, reject) => {
            let url = this.soarConfig.domainUrl + '/accounts/accountstatementmessage/duplicates';
            let queryParams: Params = {};
            if (messageName) {
                queryParams = this.setParameter(messageName);
            }
            this.httpClient.get<Message[]>(url, { params: queryParams })
                .toPromise()
                .then(res => {
                    resolve(res);
                }, err => { // Error
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
