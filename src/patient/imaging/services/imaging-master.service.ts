import { Injectable } from '@angular/core';
import { ImagingProvider, ImagingProviderStatus } from './imaging-enums';
import { ImagingProviderService } from './imaging-provider.service';

declare let _: any;

/*
 *  Can remove non-multiple implementation when all usages are converted to this service
*/

@Injectable()
export class ImagingMasterService {

    private status: any;
    private serviceInitializationPromises: Promise<any>[] = [];

    constructor(
        private imagingProviderService: ImagingProviderService
    ) {
        this.status = {};
        this.status[ImagingProvider.Apteryx] = { status: ImagingProviderStatus.None };
        this.status[ImagingProvider.Apteryx2] = { status: ImagingProviderStatus.None };
        this.status[ImagingProvider.Sidexis] = { status: ImagingProviderStatus.None };
        this.status[ImagingProvider.Blue] = { status: ImagingProviderStatus.None };

        imagingProviderService.activeServices$.subscribe((services) => this.initializeServices(services));
    }

    private initializeServices(services: any[]) {
        this.status[ImagingProvider.Apteryx].status = ImagingProviderStatus.NotAvailable;
        this.status[ImagingProvider.Apteryx2].status = ImagingProviderStatus.NotAvailable;
        this.status[ImagingProvider.Sidexis].status = ImagingProviderStatus.NotAvailable;
        this.status[ImagingProvider.Blue].status = ImagingProviderStatus.NotAvailable;

        if (!services || services.length === 0) {
            this.imagingProviderService.resolveMultiple();
            return;
        }

        services.forEach((service) => {
            const serviceStatus = this.status[service.name];
            if (serviceStatus) {
                serviceStatus.status = ImagingProviderStatus.Initializing;
                serviceStatus.service = service.service;
                this.serviceInitializationPromises.push(new Promise((resolve) => {
                    service.service.seeIfProviderIsReady()
                        .then(() => {
                            serviceStatus.status = ImagingProviderStatus.Ready;
                            resolve(null);
                        }).catch((err) => {
                            serviceStatus.status = ImagingProviderStatus.Error;
                            serviceStatus.message = err || 'An error occurred initializing the imaging service';
                            resolve(null);
                        });
                }));
            }
        })
    }

    async getServiceStatus(): Promise<any[]> {
        await Promise.all(this.serviceInitializationPromises)
        return this.status
    }

    async getReadyServices(): Promise<any[]> {
        const serviceStatus = await this.getServiceStatus();

        return _.pickBy(serviceStatus, service => service.status === ImagingProviderStatus.Ready);
    }

    async getPatientByFusePatientId(patientId: string, thirdPartyId: string, providers: string[]): Promise<any> {
        return await this.callServices(providers, (provider) => provider.getPatientByPDCOPatientId(patientId, thirdPartyId));
    }

    async getUrlForPatientByExternalPatientId(
        externalPatientId: string, fusePatientId: string, providerName: string, patientData: any
    ): Promise<any> {
        const results = await this.callServices([providerName],
            async (provider) => await provider.getUrlForPatientByPatientId(externalPatientId, fusePatientId, patientData));
        return results[providerName];
    }

    async updatePatientData(data: any, providerName: string): Promise<any>{
        const results = await (this.callServices([providerName], async (provider) => await provider.updatePatientData(data)));
        return results[providerName];
    }    

    async getUrlForNewPatient(data: any, providerName: string): Promise<any>{
        const results = await (this.callServices([providerName], async (provider) => await provider.getUrlForNewPatient(data)));
        return results[providerName];
    }

    async getAllByPatientId(externalPatientId: string, providerName: string): Promise<any> {
        // tslint:disable-next-line: max-line-length
        const results = await this.callServices([providerName], async (provider) => await provider.getAllByPatientId(externalPatientId));
        return results[providerName];
    }

    async getUrlForPatientByImageId( imageId: string, providerName: string, patientId: string, encoding: string ): Promise<any> {
        // tslint:disable-next-line: max-line-length
        const results = await this.callServices([providerName], async (provider) => await provider.getUrlForPatientByImageId(imageId, patientId, encoding));
        return results[providerName];
    }

    async getImageBitmapByImageId(imageId: string, providerName: string, patientId: string, encoding: string ): Promise<any> {
        // tslint:disable-next-line: max-line-length
       const results = await this.callServices([providerName], async (provider) => await provider.getImageBitmapByImageId(imageId, patientId, encoding));
       return results[providerName];
   }

    async getImageThumbnailByImageId(imageId: string, providerName: string, patientId: string, encoding: string ): Promise<any> {
         // tslint:disable-next-line: max-line-length
        const results = await this.callServices([providerName], async (provider) => await provider.getImageThumbnailByImageId(imageId, patientId, encoding));
        return results[providerName];
    }

    async getUrlForExamByPatientIdExamId(patientId: string, providerName: string, examId: string, patientData: any): Promise<any> {
        // tslint:disable-next-line: max-line-length
       const results = await this.callServices([providerName], async (provider) => await provider.getUrlForExamByPatientIdExamId(patientId, examId, patientData));
       return results[providerName];
    }

    private async callServices(providers: string[], executor: (provider) => Promise<any>): Promise<any> {
        const resultsByProvider = {};
        const promises = [];
        _.forIn(await this.getReadyServices(), (serviceStatus, name) => {
            if (!providers || providers.length === 0 || providers.includes(name)) {
                promises.push(executor(serviceStatus.service)
                    .then((res) => resultsByProvider[name] = { success: true, result: res })
                    .catch((err) => resultsByProvider[name] = { success: false, error: err })
                );
            }
        });
        await Promise.all(promises);
        return resultsByProvider;
    }

}
