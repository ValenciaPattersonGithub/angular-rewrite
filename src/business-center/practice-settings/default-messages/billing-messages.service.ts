import { HttpClient } from '@angular/common/http';
import { Inject, Injectable } from '@angular/core';
import { defaultMessages } from '../models/default-messages.model';

@Injectable({
    providedIn: 'root'
})
export class BillingMessagesService {

    constructor(private httpClient: HttpClient,
        @Inject('SoarConfig') private soarConfig) { }

    get = () => {
        return new Promise((resolve, reject) => {
            let url = this.soarConfig.domainUrl + '/practicesettings/billingmessages';
            this.httpClient.get<defaultMessages>(url)
                .toPromise()
                .then(res => {
                    resolve(res);
                }, err => { // Error
                    reject(err);
                })
        })
    }

    save = (defaultMessagesDto) => {
        return new Promise((resolve, reject) => {
            let url = this.soarConfig.domainUrl + '/practicesettings/billingmessages';
            this.httpClient.post(url, defaultMessagesDto)
                .toPromise()
                .then(res => {
                    resolve(res);
                }, err => { // Error
                    reject(err);
                })
        });
    }

    update = (defaultMessagesDto) => {
        return new Promise((resolve, reject) => {
            let url = this.soarConfig.domainUrl + '/practicesettings/billingmessages';
            this.httpClient.put(url, defaultMessagesDto)
                .toPromise()
                .then(res => {
                    resolve(res);
                }, err => { // Error
                    reject(err);
                })
        });
    }

    deleteMessage = (accountStatementMessage) => {
        return new Promise((resolve, reject) => {
            let url = this.soarConfig.domainUrl + '/accounts/accountstatementmessage/' + accountStatementMessage?.accountStatementMessageId;
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
