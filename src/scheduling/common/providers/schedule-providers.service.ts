// service for pulling off transforms as we move logic out of the schedule for appointment formatting -- this is an initial idea.
import { Injectable, Inject } from '@angular/core';

@Injectable()
export class ScheduleProvidersService {
    providers: any[];

    constructor() { }

    findByUserId(id: string) {
        if (this.providers) {
            // look at foreach typescript and check performance between them ... 
            for (let i = 0; i < this.providers.length; i++) {
                if (this.providers[i]['UserId'] === id || this.providers[i]['ProviderId'] === id) {
                    return this.providers[i];
                }
            }
        }
        return null;
    }

    findByUserCode(usercode: string) {
        if (this.providers) {
            // look at foreach typescript and check performance between them ... 
            for (let i = 0; i < this.providers.length; i++) {
                if (this.providers[i]['UserCode'] === usercode) {
                    return this.providers[i];
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
