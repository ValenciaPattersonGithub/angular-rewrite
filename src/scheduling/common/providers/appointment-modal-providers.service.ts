// service for pulling off transforms as we move logic out of the schedule for appointment formatting -- this is an initial idea.
import { Injectable, Inject } from '@angular/core';

@Injectable()
export class AppointmentModalProvidersService {
    modalProviders: any[];

    constructor() { }

    findByUserId(id: string) {
        if (this.modalProviders) {
            // look at foreach typescript and check performance between them ... 
            for (let i = 0; i < this.modalProviders.length; i++) {
                if (this.modalProviders[i]['UserId'] === id) {
                    return this.modalProviders[i];
                }
            }
        }
        return null;
    }

    findByUserCode(usercode: string) {
        if (this.modalProviders) {
            // look at foreach typescript and check performance between them ... 
            for (let i = 0; i < this.modalProviders.length; i++) {
                if (this.modalProviders[i]['UserCode'] === usercode) {
                    return this.modalProviders[i];
                }
            }
        }
        return null;
    }

    findAndformatProviderName(id, defaultEmptyText) {
        let provider = this.findByUserId(id);
        let name = provider && provider.Name != null ? provider.Name : defaultEmptyText;
        return name;
    }
}
