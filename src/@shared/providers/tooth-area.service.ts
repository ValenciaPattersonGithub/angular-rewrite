import { Injectable, Inject, OnInit } from '@angular/core';
import { from, BehaviorSubject } from 'rxjs';
import { EventEmitter } from 'events';
import { ToothAreaData } from './tooth-area-data.model';
import { ToothAreaDataService } from './tooth-area-data.service';
import cloneDeep from 'lodash/cloneDeep';

//@Injectable({
//    providedIn: 'root'
//})
@Injectable()
export class ToothAreaService {

    toothAreaData: ToothAreaData;

    teeth: any[] = [];
    roots: any[] = [];
    surfaces: any[] = [];
    serviceCodeId: any;
    serviceCode: any;



    constructor(
        private toothAreaDataService: ToothAreaDataService
    ) { }

    async toothChange(tooth) {
        this.toothAreaData.toothSelection = tooth;
        this.toothAreaData = await this.toothAreaDataService.toothChange(this.toothAreaData);

        // Set all areas selected only for root codes
        if (this.toothAreaData.serviceCode.AffectedAreaId === 3) {
            this.toothAreaData.areaSelection = cloneDeep(this.toothAreaData.availableAreas);
        }

        return this.toothAreaData;
    }


    async areaChange(area) {
        this.toothAreaData.areaSelection = area;
        this.toothAreaData = await this.toothAreaDataService.areaChange(this.toothAreaData);
        return this.toothAreaData;
    }

    setValuesOnServiceTransaction(service, toothAreaData) {
        return this.toothAreaDataService.setValuesOnServiceTransaction(service, toothAreaData);
    }



}