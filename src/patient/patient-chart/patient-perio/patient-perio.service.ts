import { Injectable, Inject, OnInit } from '@angular/core';

@Injectable({
    providedIn: 'root'
})
export class PatientPerioService {    

    loadPreviousExamReading: boolean;

    constructor(        
    ) { }

    setLoadPreviousOption(loadPrevious) {
        this.loadPreviousExamReading = loadPrevious;
    }
           
       

}
