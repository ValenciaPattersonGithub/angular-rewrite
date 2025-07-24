import { Component, Inject, OnInit, ViewChild } from '@angular/core';
import { DialogContentBase, DialogRef } from '@progress/kendo-angular-dialog';
import { PatientOverview } from '../../../common/models/patient-overview.model';

@Component({
    selector: 'referral-patient-details',
    templateUrl: './referral-patient-details.component.html',
    styleUrls: ['./referral-patient-details.component.scss']
})
export class ReferralPatientDetailsComponent extends DialogContentBase implements OnInit {
    @ViewChild('providerSelector', { static: false })
    patientProfile: PatientOverview;
    profileDetails = {};
    addOrEditReferral: string;
    title: string;
    constructor(public dialog: DialogRef,
        @Inject('$routeParams') public routeParams
    ) {
        super(dialog);
    }

    ngOnInit(): void {
        this.addOrEditReferral = this.dialog.content?.instance?.AddOrEditReferral;
        if (this.addOrEditReferral == 'editReferral')
            this.title = 'Edit Referral';
        else this.title = 'Create Referral';
        this.getPatientInformation();        
    }

    getPatientInformation = () => {
        if (this.dialog.content?.instance) {
            var patientProfile = this.dialog.content.instance.PatientProfile;
            var patientName = '';
            var patientInitials = '';
            if (patientProfile.PatientId) {
                if (patientProfile.Suffix) {
                    patientName += ` ${patientProfile.Suffix as string},`;
                }
                if (patientProfile.FirstName) {
                    patientName += !patientProfile.Suffix ? `${patientProfile.FirstName as string}` : `${patientProfile.FirstName as string}`
                }
                if (patientProfile.MiddleName) {
                    patientName += ` ${patientProfile.MiddleName as string}`;
                }

                if (patientProfile.LastName) {
                    patientName += ` ${patientProfile.LastName as string}`;
                }

                patientInitials = `${patientProfile.FirstName[0].toUpperCase() as string}${patientProfile.LastName[0].toUpperCase() as string}`;
            }
            this.profileDetails = {
                patientName: patientName,
                patientInitials: patientInitials,
                dateOfBirth: patientProfile.DateOfBirth,
                height: patientProfile?.HeightFeet + "'" + patientProfile?.HeightInches,
                gender: patientProfile.Sex == 'M' ? 'Male' : (patientProfile.Sex == 'F' ? 'Female' : ''),
                signatureOnFile: patientProfile.SignatureOnFile == false ? 'No' : 'Yes',
                responsibleParty: patientProfile.ResponsiblePersonName,
                status: patientProfile.IsActive == 0 ? 'Inactive' : 'Active',
                weight: patientProfile.Weight,
                imageUrl: patientProfile.imageUrl,
                hasImage: patientProfile.hasImage,
                alerts: patientProfile.alerts,
                phone: patientProfile.phone,
                email: patientProfile.email,
                workphone: patientProfile.workphone,
                isMobile: patientProfile.isMobile
            };
        }
    }
}