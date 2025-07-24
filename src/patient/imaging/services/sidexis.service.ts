import { Injectable, Inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable()
export class SidexisImagingService {

    private dcaUrl: string;
    private readyPromise: Promise<any>;
    private integrationId: string;

    constructor(
        @Inject('DcaConfig') private dcaConfig,
        private http: HttpClient
    ) {
        this.dcaUrl = dcaConfig.dcaUrl;
    }

    async seeIfProviderIsReady(): Promise<any> {
        if (!this.readyPromise) {
            if (this.integrationId) {
                return await this.integrationId;
            }

            this.readyPromise = new Promise((resolve, reject) => {
                this.http.get<any[]>(`${this.dcaUrl}/getintegrations`).subscribe(
                    (results) => {
                        let sidexisIntegration = results.find(
                            (integration) => integration.Name === this.dcaConfig.sidexisPluginName);

                        if (!sidexisIntegration) {
                            reject('Sidexis DCA plugin unavailable');
                            return;
                        }

                        this.http.get<boolean>(`${this.dcaUrl}/isintegrationavailable?integrationId=${sidexisIntegration.Id}`).subscribe(
                            (result) => {
                                if (result === true) {
                                    this.integrationId = sidexisIntegration.Id;
                                    resolve(sidexisIntegration);
                                } else {
                                    reject('Sidexis DCA plugin connection failure or Sidexis not installed');
                                }
                            },
                            (error) => reject('DCA unavailable')
                        );
                    },
                    (error) => reject('DCA unavailable')
                );
            }).finally(() => this.readyPromise = null);
        }

        return this.readyPromise;
    }

    async getPatientByPDCOPatientId(patientId: string, thirdPartyId: string): Promise<any> {
        if (!thirdPartyId || thirdPartyId === '')
            return null;
        return this.http.get(`${this.dcaUrl}/PatientInfo?integrationId=${this.integrationId}&primaryId=S-${thirdPartyId}`).toPromise();
    }

    getUrlForPatientByPatientId(externalPatientId: string, fusePatientId: string): string {
        return `${this.dcaUrl}/ViewPatient?integrationId=${this.integrationId}&patientId=S-${fusePatientId}`;
    }

    updatePatientData(data: any): Promise<any> {
        // tslint:disable-next-line: max-line-length
        return this.http.get<any[]>(`${this.dcaUrl}/UpdatePatient?integrationId=${this.integrationId}&patientId=${data.patientId}&lastName=${encodeURIComponent(data.lastName)}&firstName=${encodeURIComponent(data.firstName)}&gender=${data.gender}&birthdate=${data.birthDate}`).toPromise();
    }

    getUrlForNewPatient(data: any): string {
        // tslint:disable-next-line: max-line-length
        return `${this.dcaUrl}/CaptureImage?integrationId=${this.integrationId}&patientId=${data.patientId}&lastName=${encodeURIComponent(data.lastName)}&firstName=${encodeURIComponent(data.firstName)}&gender=${data.gender}&birthdate=${data.birthDate}&autoCapture=false&autoClose=false`;
    }

    getAllByPatientId(externalPatientId: string): Promise<any> {
        // tslint:disable-next-line: max-line-length
        return this.http.get<any[]>(`${this.dcaUrl}/Studies?integrationId=${this.integrationId}&patientId=${externalPatientId}`).toPromise();
    }

    getUrlForPatientByImageId(imageId: string, patientId: string, encoding: string): string {
        // sidexis images retrieved in <patient id>;<image id> format per DCA
        const patientImageId = patientId + ';' + imageId;
        // tslint:disable-next-line: max-line-length
        return `${this.dcaUrl}/GetThumbnail?integrationId=${this.integrationId}&imageId=${patientImageId}&encoding=${encoding}`;
    }

    getImageBitmapByImageId(imageId: string, patientId: string, encoding: string): string {
        // images retrieved in <patient id>;<image id> format per DCA
        const patientImageId = patientId + ';' + imageId;
        // tslint:disable-next-line: max-line-length
        return `${this.dcaUrl}/GetBitmap?integrationId=${this.integrationId}&imageId=${patientImageId}&encoding=${encoding}`;
    }

    getImageThumbnailByImageId(imageId: string, patientId: string, encoding: string): Promise<ArrayBuffer> {
        // images retrieved in <patient id>;<image id> format per DCA
        const patientImageId = patientId + ';' + imageId;
        // tslint:disable-next-line: max-line-length
        return this.http.get<ArrayBuffer>(`${this.dcaUrl}/GetThumbnail?integrationId=${this.integrationId}&imageId=${patientImageId}&encoding=${encoding}`).toPromise();
    }

    getUrlForExamByPatientIdExamId( patientId: string, imageId: string): string {
        // images retrieved in <patient id>;<image id> format per DCA
        const patientImageId = patientId + ';' + imageId;
        // tslint:disable-next-line: max-line-length
        return `${this.dcaUrl}/ViewImage?integrationId=${this.integrationId}&imageId=S-${patientImageId}`;
    }
}
