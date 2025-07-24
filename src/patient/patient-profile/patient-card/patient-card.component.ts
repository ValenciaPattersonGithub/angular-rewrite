import { Component, Inject, Input, OnInit, SecurityContext } from '@angular/core';
import { Gender } from 'src/patient/common/models/enums';
import { HttpClientModule } from '@angular/common/http';
import { HttpClient } from '@angular/common/http';
import { BlueImagingService } from '../../imaging/services/blue.service';
import { DomSanitizer } from '@angular/platform-browser';
import { ImagingProviderService } from '../../imaging/services/imaging-provider.service';
import { ImagingMasterService } from '../../imaging/services/imaging-master.service';
import { FeatureService } from '../../../../v1.0/App/Common/services/common-services/featureService.js';
import { FuseFlag } from '../../../@core/feature-flags';
import { FeatureFlagService } from '../../../featureflag/featureflag.service';

@Component({
    selector: 'app-patient-card',
    templateUrl: './patient-card.component.html',
    styleUrls: ['./patient-card.component.scss']
})
export class PatientCardComponent implements OnInit {

    patientDetails: any;
    patientName: any;
    patientInitials: any;
    Gender = Gender;
    responsiblePerson: any;
    signatureOnFile: any;
    gender: any;
    weight: any;
    heightInches: any;
    heightFeet: any;
    heightweight: any;
    @Input() patientProfile: any;
    editAuthAbbreviation='soar-per-perdem-modify';
    editAppointmentAbbreviation='soar-sch-sptapt-edit';
    hasEditAccess=false;
    hasAppointmentEditAccess=false;
    hasImage = false;
    imageUrl: any;
    displayFlex: boolean;
    isPatientPhotoEnabled: boolean = true;
    editPersonProfileMFE: boolean;

    constructor(
        @Inject('patSecurityService') private patSecurityService,
        @Inject('FeatureService') private featureService,
        @Inject('$routeParams') public routeParams,
        private blueImagingService: BlueImagingService,
        private sanitizer: DomSanitizer,
        private imagingMasterService: ImagingMasterService,
        private featureFlagService: FeatureFlagService)
        {

    }

    ngOnInit(): void {
        if (this.patientProfile) {
            this.patientDetails = this.patientProfile;
            if (this.patientDetails) {
                if (this.patientDetails.Sex === 'F') {
                    this.gender = 'Female';
                }
                if (this.patientDetails.Sex === 'M') {
                    this.gender = 'Male';
                }
                if (this.patientDetails.ResponsiblePersonName === 'Self') {
                    this.responsiblePerson = this.patientDetails.ResponsiblePersonName;
                } else {
                    let responsiblePersonName;
                    if (this.patientDetails.ResponsibleLastName) {
                        responsiblePersonName = this.patientDetails.ResponsibleLastName;
                    }
                    if (this.patientDetails.ResponsibleFirstName) {
                        responsiblePersonName += ', ' + this.patientDetails.ResponsibleFirstName;
                    }
                    if (this.patientDetails.ResponsibleMiddleName) {
                        responsiblePersonName += ' ' + this.patientDetails.ResponsibleMiddleName;
                    }
                    if (responsiblePersonName) {
                        this.responsiblePerson = responsiblePersonName;
                    }
                }
                if (this.patientDetails.SignatureOnFile) {
                    this.signatureOnFile = 'Yes';
                } else {
                    this.signatureOnFile = 'No';
                }
                let name = this.patientDetails.LastName;
                if (this.patientDetails.Suffix) {
                    name += ' ' + this.patientDetails.Suffix;
                }
                name += ', ' + this.patientDetails.FirstName;
                if (this.patientDetails.MiddleName) {
                    name += ' ' + this.patientDetails.MiddleName[0];
                }
                if (this.patientDetails.PreferredName) {
                    name += ' (' + this.patientDetails.PreferredName + ')';
                }
                this.weight = !this.patientDetails.Weight ? '0lbs' : this.patientDetails.Weight + 'lbs';
                this.heightFeet = !this.patientDetails.HeightFeet ? '0' : this.patientDetails.HeightFeet;
                this.heightInches = !this.patientDetails.HeightInches ? '0' : this.patientDetails.HeightInches;
                this.heightweight = `${this.heightFeet}'${this.heightInches} | ${this.weight}`;
                this.patientName = name;
                this.patientInitials = `${this.patientDetails.FirstName[0].toUpperCase()}${this.patientDetails.LastName[0].toUpperCase()}`;
                
                this.imagingMasterService.getServiceStatus().then(res => {
                    if (res["blue"]["status"] === "ready") {
                        this.getBlueImage();
                    }else {
                        console.log("Blue Imaging is Off");
                    }
                }).catch(error => { console.log(error); });
            }
        }
        this.authAccess();
        this.checkFeatureFlags();
    }
    getBlueImage = () => {
        this.blueImagingService.getImageThumbnailByPatientId(this.patientDetails.PatientId)
            .then(result => {
                const objectURL = URL.createObjectURL(result);
                this.imageUrl = this.sanitizer.bypassSecurityTrustUrl(objectURL);
                this.hasImage = true;
                this.displayFlex = false;
            })
            .catch(error => {
                console.log("Patient photo not found in Dolphin Blue Imaging")
            });
    }
    updatePerson = () => {
        const patientId = this.patientDetails?.PatientId ?? this.routeParams.patientId;
        let url = `#/Patient/${patientId}/Person?sectionId=1`;
        if(this.editPersonProfileMFE) {
            url = url.replace('#/Patient/', '#/patientv2/');
        }
        window.location.href = this.sanitizer.sanitize(SecurityContext.URL, url);
    }
    authAccessByType = (authtype: string) => {
        const result = this.patSecurityService.IsAuthorizedByAbbreviation(authtype);
        return result;
    }
    authAccess = () => {
        this.hasEditAccess = this.authAccessByType(this.editAuthAbbreviation);
        this.hasAppointmentEditAccess=this.authAccessByType(this.editAppointmentAbbreviation);
    }

    checkFeatureFlags() {  
      this.featureFlagService.getOnce$(FuseFlag.EnableEditProfileMFEPage).subscribe((value) => {
          this.editPersonProfileMFE = value;
      });
    };
}
