import { Component, Input, OnInit } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';

@Component({
    selector: 'patient-contact',
    templateUrl: './patient-contact.component.html',
    styleUrls: ['./patient-contact.component.scss']
})
export class PatientContactComponent implements OnInit {
    @Input() patientProfile: any;
    primaryEmail: any;
    primaryPhone: any;
    responsibleParty: any;
    address: any = '';
    displayCityStateZipCode: any = '';
    primaryPhoneType: any;

    constructor(private translate: TranslateService) { }

    ngOnInit() {
        if (this.patientProfile) {
            if (this.patientProfile.EmailAddress) {
                this.primaryEmail = this.patientProfile.EmailAddress;
            }
            if (this.patientProfile.PhoneNumber) {
                this.primaryPhone = this.patientProfile.PhoneNumber;
                if (this.patientProfile.PhoneType) {
                    this.primaryPhoneType = `(${this.patientProfile.PhoneType[0].toUpperCase()})`;
                }
            }
            if (this.patientProfile) {
                this.responsibleParty = this.patientProfile.ResponsiblePersonName;
                this.address = '';
                if (this.patientProfile.AddressLine1) {
                    this.address = `${this.patientProfile.AddressLine1} `;
                }
                if (this.patientProfile.AddressLine2) {
                    this.address += `${this.patientProfile.AddressLine2} `;
                }
                if (this.patientProfile.City) {
                    this.displayCityStateZipCode = `${this.patientProfile.City}`;
                }
                if (this.patientProfile.City && (this.patientProfile.State || this.patientProfile.ZipCode)) {
                    this.displayCityStateZipCode += `, `
                }
                if (this.patientProfile.State) {
                    this.displayCityStateZipCode += `${this.patientProfile.State} `;
                }
                if (this.patientProfile.ZipCode) {
                    this.displayCityStateZipCode += `${this.patientProfile.ZipCode}`;
                }

                if (!this.address && !this.displayCityStateZipCode) {
                    this.address = this.translate.instant('No Address on File');
                }
            }
        }
    }

}
