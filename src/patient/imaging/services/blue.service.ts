import { Inject, Injectable } from '@angular/core';
import { HttpBackend, HttpClient, HttpHeaders, HttpResponse } from '@angular/common/http';
import { MicroServiceApiService } from 'src/security/providers';
import * as moment from 'moment';
import { DomSanitizer } from '@angular/platform-browser';
import { IndexedDbCacheService } from 'src/@shared/providers/indexed-db-cache.service';

declare let _: any;

@Injectable()
export class BlueImagingService {

    private blueImagingUrl: string;
    private http: HttpClient;

    private featurePromise: Promise<boolean>;

    constructor(
        @Inject('patAuthenticationService') private tokenService,
        @Inject('applicationService') private applicationService,
        @Inject('practiceService') private practiceService,
        @Inject('platformSessionCachingService') private platformSessionCachingService,
        @Inject('SoarConfig') private soarConfig,
        microServiceApiService: MicroServiceApiService,
        httpBackend: HttpBackend,
        private sanitizer: DomSanitizer,
        private indexedDbCacheService: IndexedDbCacheService,
        
    ) {
        this.blueImagingUrl = microServiceApiService.getBlueImagingApiUrl();
        this.http = new HttpClient(httpBackend);

        this.featurePromise = Promise.resolve(soarConfig.enableBlue === 'true');
    }

    async seeIfProviderIsReady(): Promise<any> {
        const featureEnabled = await this.featurePromise;
        if (!featureEnabled) {
            throw new Error('Blue Imaging is not enabled in this environment');
        }
        return true;
    }

    async getPatientByPDCOPatientId(patientId: string, thirdPartyId: string): Promise<any> {
        if (!patientId || patientId === '') {
            return null;
        }
        return this.http.get(
            `${this.blueImagingUrl}/api/imagingintegration/patientinfo?patId=${patientId}`,
            { headers: this.getHeaders() }
        ).toPromise();
    }

    async getUrlForPatientByPatientId(externalPatientId: string, fusePatientId: string, patientData: any): Promise<string> {
        try {
            const urlResult = await this.http.get(
                `${this.blueImagingUrl}/api/imagingintegration/url/patient?&patId=${fusePatientId}`,
                {
                    headers: this.getHeaders(),
                    responseType: 'text'
                }
            ).toPromise();

            const token = this.tokenService.getCachedToken();
            const appId = this.applicationService.getApplicationId();

            const currentPractice = this.practiceService.getCurrentPractice();

            let practiceId = 0;
            if (currentPractice) {
                practiceId = currentPractice.id;
            }

            let userId = '';
            const userContext = this.platformSessionCachingService.userContext.get();
            if (userContext && userContext.Result && userContext.Result.User) {
                userId = userContext.Result.User.UserId;
            }

            const birthDateString = patientData.birthDate ? `&patBirthdate=${this.formatBirthDate(patientData.birthDate)}` : '';            
            // tslint:disable-next-line: max-line-length
            return `${urlResult}?accessToken=${token}&practiceId=${practiceId}&applicationId=${appId}&empId=${userId}&&patId=${fusePatientId}&patFirstName=${encodeURIComponent(patientData.firstName)}&patLastName=${encodeURIComponent(patientData.lastName)}${birthDateString}&patGender=${patientData.gender}&patLocId=${patientData.primLocation}&patNorm=5`;
        } catch(e) {
            console.log(e);
            return '';
        }
    }

    updatePatientData(data: any): Promise<any> {
        // tslint:disable-next-line: max-line-length
        // return this.http.get<any[]>(`${this.dcaUrl}/UpdatePatient?integrationId=${this.integrationId}&patientId=${data.patientId}&lastName=${encodeURIComponent(data.lastName)}&firstName=${encodeURIComponent(data.firstName)}&gender=${data.gender}&birthdate=${data.birthDate}`).toPromise();
        throw new Error('Not implemented');
    }

    async updatePatientLocation(patientId: any, locationId: any): Promise<any> {

        let patient = await this.getPatientByPDCOPatientId(patientId, null);
        if (!patient || patient.Value == null) {
            return null;
        }
        
        return this.http.post(
            `${this.blueImagingUrl}/api/Patient/Location?patId=${patientId}&patLocId=${locationId}`,
            null,
            { headers: this.getHeaders() }
        ).toPromise();      
    }

    async getUrlForPreferences(): Promise<string> {
        try {
            const urlResult = await this.http.get(
                `${this.blueImagingUrl}/api/imagingintegration/url/settings`,
                {
                    headers: this.getHeaders(),
                    responseType: 'text'
                }
            ).toPromise();

            const token = this.tokenService.getCachedToken();
            const appId = this.applicationService.getApplicationId();

            const currentPractice = this.practiceService.getCurrentPractice();

            let practiceId = 0;
            if (currentPractice) {
                practiceId = currentPractice.id;
            }

            let userId = '';
            const userContext = this.platformSessionCachingService.userContext.get();
            if (userContext && userContext.Result && userContext.Result.User) {
                userId = userContext.Result.User.UserId;
            }
            return `${urlResult}?accessToken=${token}&practiceId=${practiceId}&applicationId=${appId}&empId=${userId}`;
        } catch (e) {
            console.log(e);
            return '';
        }
    }

    async getUrlForNewPatient(data: any): Promise<string> {
        try{
            const urlResult = await this.http.get(
                // tslint:disable-next-line: max-line-length
                `${this.blueImagingUrl}/api/imagingintegration/url/capture?&patientId=${data.patientId}&lastName=${encodeURIComponent(data.lastName)}&firstName=${encodeURIComponent(data.firstName)}&dateOfBirth=${data.birthDate}&otherId=${data.patientId}`,
                {
                    headers: this.getHeaders(),
                    responseType: 'text'
                }
            ).toPromise();

            const token = this.tokenService.getCachedToken();
            const appId = this.applicationService.getApplicationId();

            const currentPractice = this.practiceService.getCurrentPractice();

            let practiceId = 0;
            if (currentPractice) {
                practiceId = currentPractice.id;
            }

            let userId = '';
            const userContext = this.platformSessionCachingService.userContext.get();
            if (userContext && userContext.Result && userContext.Result.User) {
                userId = userContext.Result.User.UserId;
            }

            const examName = 'Exam';
            const examDate = moment().format('YYYY-MM-DD');
            
            const birthDateString = data.birthDate ? `&patBirthdate=${this.formatBirthDate(data.birthDate)}` : '';            
            // tslint:disable-next-line: max-line-length
            return `${urlResult}?accessToken=${token}&practiceId=${practiceId}&applicationId=${appId}&empId=${userId}&patId=${data.patientId}&patFirstName=${encodeURIComponent(data.firstName)}&patLastName=${encodeURIComponent(data.lastName)}${birthDateString}&patGender=${data.gender}&patLocId=${data.primLocation}&patNorm=5&initTpName=${examName}&initTpDate=${examDate}`;
        } catch(e) {
            console.log(e);
            return '';
        }
    }

    getAllByPatientId(externalPatientId: string): Promise<any> {
        if (!externalPatientId || externalPatientId === '') {
            return null;
        }
        return this.http.get(
            `${this.blueImagingUrl}/api/imagingintegration/study?patId=${externalPatientId}`,
            { headers: this.getHeaders() }
        ).toPromise();
    }

    getUrlForPatientByImageId(imageId: string, patientId: string, encoding: string): string {
    //     // sidexis images retrieved in <patient id>;<image id> format per DCA
    //     const patientImageId = patientId + ';' + imageId;
    //     // tslint:disable-next-line: max-line-length
    //     return `${this.dcaUrl}/GetThumbnail?integrationId=${this.integrationId}&imageId=${patientImageId}&encoding=${encoding}`;
        throw new Error('Not implemented');
    }

    getImageBitmapByImageId(imageId: string, patientId: string): Promise<any> {
        if (!imageId || imageId === '') {
            return null;
        }
        return this.http.get(
            `${this.blueImagingUrl}/api/imagingintegration/bitmap2?patId=${patientId}&imageId=${imageId}`,
            {
                headers: this.getHeaders(),
                responseType: 'arraybuffer'
            }
        ).toPromise();
    }

    getImageThumbnailByImageId(imageId: string, patientId: string): Promise<any> {
        if (!imageId || imageId === '') {
            return null;
        }
        return this.http.get(
            `${this.blueImagingUrl}/api/imagingintegration/bitmap/thumbnail2?patId=${patientId}&imageId=${imageId}`,
            {
                headers: this.getHeaders(),
                responseType: 'arraybuffer'
            }
        ).toPromise();
    }

    // Patient Patient photo Thumbnail by PatientID
    async getImageThumbnailByPatientId(PatId: string): Promise<Blob | null> {
        if (!PatId || PatId === '') {
            return null;
        }
        return await this.indexedDbCacheService.getOrAdd(`PatientPhotoThumbnail:${PatId}`, async () => {
            try {
                const response = await this.http.get(
                `${this.blueImagingUrl}/api/ThumbnailImage/ImageOnly?patId=${PatId}`,
                    {
                        headers: this.getHeaders(),
                        responseType: 'blob'     
                    }
                ).toPromise();
                return response;
            } catch (error) {
                // Check if the error is a 404 or 500 response
                if (error.status === 404 || error.status === 500) {
                    console.log('Patient photo not found in Dolphin Blue Imaging');
                } else {    // Check if the error is something else 
                    console.log('Error fetching Patient photo');
                }
                return null; // Return null in case of an error
            }
        }, 60 * 10 * 1000);
    }

    async getUrlForExamByPatientIdExamId( patientId: string, examId: string, patientData: any): Promise<string> {
        try {
            const urlResult = await this.http.get(
                `${this.blueImagingUrl}/api/imagingintegration/url/study?studyId=${examId}`,
                {
                    headers: this.getHeaders(),
                    responseType: 'text'
                }
            ).toPromise();

            const token = this.tokenService.getCachedToken();
            const appId = this.applicationService.getApplicationId();

            const currentPractice = this.practiceService.getCurrentPractice();

            let practiceId = 0;
            if (currentPractice) {
                practiceId = currentPractice.id;
            }

            let userId = '';
            const userContext = this.platformSessionCachingService.userContext.get();
            if (userContext && userContext.Result && userContext.Result.User) {
                userId = userContext.Result.User.UserId;
            }
            
            const birthDateString = patientData.birthDate ? `&patBirthdate=${this.formatBirthDate(patientData.birthDate)}` : '';            
            // tslint:disable-next-line: max-line-length
            return `${urlResult}?accessToken=${token}&practiceId=${practiceId}&applicationId=${appId}&empId=${userId}&patId=${patientId}&patFirstName=${encodeURIComponent(patientData.firstName)}&patLastName=${encodeURIComponent(patientData.lastName)}${birthDateString}&patGender=${patientData.gender}&patLocId=${patientData.primLocation}&patNorm=5&initTpId=${examId}`;
        } catch(e) {
            console.log(e);
            return '';
        }
    }

    private getHeaders(): HttpHeaders {
        const headers = new HttpHeaders();

        const token = this.tokenService.getCachedToken();
        const appId = this.applicationService.getApplicationId();

        const currentPractice = this.practiceService.getCurrentPractice();

        let practiceId = 0;
        if (currentPractice) {
            practiceId = currentPractice.id;
        }

        let userId = '';
        const userContext = this.platformSessionCachingService.userContext.get();
        if (userContext && userContext.Result && userContext.Result.User) {
            userId = userContext.Result.User.UserId;
        }

        return headers
            .set('Authorization', `Bearer ${token}`)
            .set('pat-practice-id', practiceId.toString())
            .set('application-id', appId.toString())
            .set('employee-id', userId);
    }

    private formatBirthDate(birthDate) {        
        if (birthDate[birthDate.length - 1] === 'Z') {
            birthDate = birthDate.slice(0, -1);
        }
        return moment(birthDate).format('YYYY-MM-DD')                
    }
}
