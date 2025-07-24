
import { Component, OnChanges, OnInit, Input, Inject, OnDestroy, EventEmitter, Output } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import * as moment from 'moment';

@Component({
  selector: 'family-scheduling-search',
  templateUrl: './family-scheduling-search.component.html',
  styleUrls: ['./family-scheduling-search.component.scss']
})
export class FamilySchedulingSearchComponent implements OnInit, OnDestroy {
    public data: Array<any>;

    @Output() selectionChanged: EventEmitter<any> = new EventEmitter<any>();
    @Output() selectionCleared: EventEmitter<any> = new EventEmitter<any>();

    mostRecentPersonsList: any[];
    patientInformation: any;
    allPatients: any;
    showTable: boolean = false;

    constructor(@Inject('toastrFactory') private toastrFactory,
        private translate: TranslateService,
        @Inject('PatientServices') private patientServices) {
        this.data = [];
    }
   
    patientSearchParams = {
        searchFor: '',
        skip: 0,
        take: 45,
        sortyBy: 'LastName',
        includeInactive: false
    };

    ngOnInit() {
    }

    patientServicesGetSuccess = (res) => {
        if (res.Value) {
            //Remove inactive patients if returned in search
            for (var i = res.Value.length; i--;) {
                if (res.Value[i].IsActive === false) {
                    res.Value.splice(i, 1);
                }
            }
            this.data = res.Value;
            for (let i = 0; i < this.data.length; i++) {
                
                if (this.data[i].MiddleName) {
                    this.data[i].Name = this.data[i].FirstName.toString() + ' ' + this.data[i].MiddleName.toString() + ' ' + this.data[i].LastName.toString() + ' (' + this.data[i].PatientCode + ') ';
                } else {
                    this.data[i].Name = this.data[i].FirstName.toString() + ' ' + this.data[i].LastName.toString() + ' (' + this.data[i].PatientCode + ') ';
                }
                 
                //Pipe does not appear to work on the dropdown, so I do this in code
                if (this.data[i].DateOfBirth) {
                    this.data[i].DOB = moment.utc(this.data[i].DateOfBirth).format('MM/DD/YYYY');
                }
            }
        }
    }
        
    patientServicesGetFailure() {
        this.toastrFactory.error(
            this.translate.instant('Failed to retrieve the Patient Information.'),
            this.translate.instant('Server Error'));
    }

    filterByValue(array, string) {
        return array.filter(o => Object.keys(o).some(k => o[k] !== null && o[k].toString().toLowerCase().includes(string.toString().toLowerCase())));
    }

    handlePatientSearch(value) {
        if (value.length > 0) {
            this.patientSearchParams.searchFor = value;
            this.patientServices.Patients.search(this.patientSearchParams, this.patientServicesGetSuccess, this.patientServicesGetFailure);
        } else {
            // emit that the values were cleared out.
            this.selectionCleared.emit(null); // probably do not need to send a value
        }
    }

    handlePatientSelection(value) {
        if (value.length > 0 && this.data.length > 0) {
            const patientData = this.filterByValue(this.data, value);
            if (patientData[0].PatientId) {
                // emit the change to the parent
                this.selectionChanged.emit(patientData[0].PatientId); // probably do not need to send a value
            }
        }
    }

    ngOnDestroy() {
        this.selectionChanged.unsubscribe();
        this.selectionCleared.unsubscribe();
    }
}

