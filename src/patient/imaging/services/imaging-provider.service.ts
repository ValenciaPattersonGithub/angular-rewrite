import { Injectable, Inject } from '@angular/core';
import { ImagingProvider } from './imaging-enums';
import { BehaviorSubject } from 'rxjs';
import { SidexisImagingService } from './sidexis.service';
import { BlueImagingService } from './blue.service';

declare let _: any;

/*
 *  Can remove non-multiple implementation when all usages are converted to the ImagingMasterService
*/

@Injectable()
export class ImagingProviderService {

    constructor(
        @Inject('apteryxImagingService') private apteryxImagingService,
        @Inject('apteryxImagingService2') private apteryxImagingService2,
        @Inject('platformSessionService') private platformSessionService,
        private sidexisImagingService: SidexisImagingService,
        private blueImagingService: BlueImagingService
    ) { }

    private activeServicesSource = new BehaviorSubject([]);

    // Observable streams
    activeServices$ = this.activeServicesSource.asObservable();

    resolve() {        
        let provider = '';        
        provider = this.pickImagingVendor();                

        return this.selectService(provider);
    }

    resolveSpecific(requestedProvider: string) {
        //AHA!  This is where the magic happens.  This is where we can control which imaging provider is used.
        let provider = '';        
        provider = this.pickSpecificImagingVendor(requestedProvider);        
        
        return this.selectService(provider);
    }

    private selectService(provider: string) {
        //By now, we have checked to see if the provider is available.
        //If it is, we return the service.If not, we return null.
        switch (provider) {
            case ImagingProvider.Apteryx:
                return this.apteryxImagingService;
            case ImagingProvider.Apteryx2:
                return this.apteryxImagingService2;
            case ImagingProvider.Blue:
                return this.blueImagingService;
            default:
                console.log('No Imaging Provider is turned on for this practice.');
                return null;
        }
    }

    resolveMultiple(providers?: string[]) {
        if (_.isEmpty(providers)) {
            providers = this.pickMultipleImagingVendors();
        }

        const services = [];
        providers.forEach(provider => {
            switch (provider) {
                case ImagingProvider.Apteryx:
                    services.push({ name: provider, service: this.apteryxImagingService });
                    break;
                case ImagingProvider.Apteryx2:
                    services.push({ name: provider, service: this.apteryxImagingService2 });
                    break;
                case ImagingProvider.Sidexis:
                    services.push({ name: provider, service: this.sidexisImagingService });
                    break;
                case ImagingProvider.Blue:
                    services.push({ name: provider, service: this.blueImagingService });
                    break;
            }
        });

        services.forEach(service => service.service.seeIfProviderIsReady().catch(() => { }));

        const previousValue = this.activeServicesSource.value;
        if ((previousValue && previousValue.length > 0) || (services.length > 0)) {
            this.activeServicesSource.next(services);
        }

        return services;
    }

    private pickImagingVendor(): ImagingProvider {
        const vendors = this.platformSessionService.getSessionStorage('practiceImagingVendors');

        // Get Apteryx versions ... check which ones are active ...
        // if 2 is enabled ... run 2 else check apteryx 1.

        if (_.some(vendors, { VendorId: 5 })) {
            return ImagingProvider.Blue;
        }

        // apteryx 2
        if (_.some(vendors, { VendorId: 3 })) {
            return ImagingProvider.Apteryx2;
        }

        // apteryx 1
        if (_.some(vendors, { VendorId: 1 })) {
            return ImagingProvider.Apteryx;
        }

        return null; // nothing found ... so return null.        

    }
    

    private pickSpecificImagingVendor(requestedProvider: string): ImagingProvider {
        const vendors = this.platformSessionService.getSessionStorage('practiceImagingVendors');        
        
        if (requestedProvider == ImagingProvider.Blue && _.some(vendors, { VendorId: 5 })) {
            return ImagingProvider.Blue;
        }
        else if (requestedProvider == ImagingProvider.Apteryx2 && _.some(vendors, { VendorId: 3 })) {
            return ImagingProvider.Apteryx2;
        }
        else if (requestedProvider == ImagingProvider.Apteryx && _.some(vendors, { VendorId: 1 })) {
            return ImagingProvider.Apteryx;
        }

        return null
    }

    private pickMultipleImagingVendors(): ImagingProvider[] {
        const providers: ImagingProvider[] = [];

        const vendors = this.platformSessionService.getSessionStorage('practiceImagingVendors');

        // apteryx 2
        if (_.some(vendors, { VendorId: 3 })) {
            providers.push(ImagingProvider.Apteryx2);
        } else if (_.some(vendors, { VendorId: 1 })) { // apteryx 1
            providers.push(ImagingProvider.Apteryx);
        }

        // sidexis
        if (_.some(vendors, { VendorId: 4 })) {
            providers.push(ImagingProvider.Sidexis);
        }

        // blue
        if (_.some(vendors, { VendorId: 5 })) {
            providers.push(ImagingProvider.Blue);
        }

        return providers;
    }
}
