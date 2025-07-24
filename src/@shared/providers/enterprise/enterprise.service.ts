import { HttpClient } from '@angular/common/http';
import { Inject, Injectable } from '@angular/core';
import { Enterprise } from 'src/@shared/models/enterprise';
import { MicroServiceApiService } from 'src/security/providers';
import { LegacyLocationService } from '../../../@core/data-services/legacy-location.service';

@Injectable()
export class EnterpriseService {

    private entApiUrl: string;    
    private practiceId: number;
    private locationEntIds: { [locationId: number]: number } = {};
    private entLocationIds: { [enterpriseId: number]: number } = {};

    private practiceEnterprisePromise: Promise<Enterprise> = null;

    constructor(
        @Inject('practiceService') private practiceService,        
        private httpClient: HttpClient,
        microServiceApis: MicroServiceApiService,
        private legacylocationService: LegacyLocationService,
    ) {
        this.entApiUrl = microServiceApis.getEnterpriseApiUrl();
    }

    async getLegacyPracticeEnterprisePromise(): Promise<Enterprise> {
        if (this.practiceEnterprisePromise) {
            return this.practiceEnterprisePromise;
        }

        let currentPractice = this.practiceService.getCurrentPractice();        
        this.practiceId = 0;
        if (currentPractice !== null) {
            this.practiceId = currentPractice.id;
        }
        else {
            console.error('EnterpriseService->Current practiceId is null')
        }
              
            // put system enterprise id into config
            this.practiceEnterprisePromise = this.httpClient.get<Enterprise>(
                `${this.entApiUrl}/api/v1/enterprises/legacypracticeid/${this.practiceId}`,
                { headers: { 'enterpriseid': '1' } }
            ).toPromise();
            return this.practiceEnterprisePromise;        

    }

    // move to angularJS location change handling and cache results
    async getEnterpriseIdForLocation(locationId: number): Promise<number> {
        if (this.locationEntIds[locationId]) {
            return this.locationEntIds[locationId];
        }

        let entId = this.legacylocationService.getLocationEnterpriseId(locationId);

        this.locationEntIds[locationId] = entId;
        this.entLocationIds[entId] = locationId;

        return entId;
    }

    async getEnterpriseIdsForLocations(locations: { legacyId: number, enterpriseId: number}[]): Promise<number[]> {
        return await Promise.all(locations.map(async loc => {
            if (this.locationEntIds[loc.legacyId]) {
                return this.locationEntIds[loc.legacyId];
            }

            let entId = loc.enterpriseId || await this.getEnterpriseIdForLocation(loc.legacyId);

            this.locationEntIds[loc.legacyId] = entId;
            this.entLocationIds[entId] = loc.legacyId;
            return entId;
        }));
    }

    async getLegacyIdsForRxEnterprises(rxEnterprises: any[]): Promise<Enterprise[]> {
        let practiceEnt = await this.getLegacyPracticeEnterprisePromise();

        return await Promise.all(rxEnterprises.map(async rxEnt => {
            if (this.entLocationIds[rxEnt.enterpriseID]) {
                return {
                    id: rxEnt.enterpriseID,
                    legacy_LocationID: this.entLocationIds[rxEnt.enterpriseID]
                };
            }

            let ent = await this.httpClient.get<Enterprise>(
                `${this.entApiUrl}/api/v1/enterprises/${rxEnt.enterpriseID}`,
                { headers: { 'enterpriseid': practiceEnt.id.toString() }}
            ).toPromise()

            this.locationEntIds[ent.legacy_LocationID] = rxEnt.enterpriseID;
            this.entLocationIds[rxEnt.enterpriseID] = ent.legacy_LocationID;
            return ent;
        }));
    }
}
