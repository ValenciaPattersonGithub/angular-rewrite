import { Component, Inject, Input, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';

@Component({
    selector: 'dental-records',
    templateUrl: './dental-records.component.html',
    styleUrls: ['./dental-records.component.scss']
})
export class DentalRecordsComponent implements OnInit {

    @Input() dentalRecords: FormGroup;
    state: any;
    states: Array<{ text: string, value: any }> = [];
    isValidPhoneNumber = true;
    isValidEmail = true;
    isValidZipCode = true;
    constructor(
        @Inject('StaticData') private staticData,
        private fb: FormBuilder
    ) { }

    ngOnInit(): void {
        this.initialize();

    }
    initialize = () => {
        this.staticData.States().then(this.StatesOnSuccess);
    }
  
    StatesOnSuccess = (res) => {
        res.Value.forEach((state: any) => {
            this.states.push({
                text: state.Name, value: state.Abbreviation
            });
        });
    }
    isPhoneNumberValid = (event: any) => {
        this.isValidPhoneNumber = this.dentalRecords.controls.PhoneNumber.valid;
    }
    isEmailValid = (event: any) => {
        this.isValidEmail = this.dentalRecords.controls.Email.valid;
    }
    isZipCodeValid = (event: any) => {
        this.isValidZipCode = this.dentalRecords.controls.ZipCode.valid;
    }
}
