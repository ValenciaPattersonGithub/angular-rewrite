import { Injectable } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { CommunicationCategory, CommunicationReason, CommunicationType } from 'src/patient/common/models/enums';
@Injectable()
export class CommunicationConstants {
    constructor(private translate: TranslateService) {

    }
    public CommunicationTypes = [
        { text: this.translate.instant('Email'), value: CommunicationType.Email },
        { text: this.translate.instant('In Person'), value: CommunicationType.InPerson },
        { text: this.translate.instant('Other'), value: CommunicationType.Other },
        { text: this.translate.instant('Phone'), value: CommunicationType.Phone },
        { text: this.translate.instant('Text'), value: CommunicationType.Text },
        { text: this.translate.instant('US Mail'), value: CommunicationType.USMail }
    ];
    public CommunicationCategories = [
        { text: this.translate.instant('Account'), value: CommunicationCategory.Account },
        { text: this.translate.instant('Insurance'), value: CommunicationCategory.Insurance },
        { text: this.translate.instant('Misc Communication'), value: CommunicationCategory.MiscCommunication },
        { text: this.translate.instant('Patient Care'), value: CommunicationCategory.PatientCare }
    ];
    public CommunicationReasons = [
        { text: this.translate.instant('Account Note'), value: CommunicationReason.AccountNote, category: CommunicationCategory.Account },
        { text: this.translate.instant('Account Letter'), value: CommunicationReason.AccountLetter, category: CommunicationCategory.Account },
        { text: this.translate.instant('Other Insurance'), value: CommunicationReason.OtherInsurance, category: CommunicationCategory.Insurance },
        { text: this.translate.instant('Insurance Letter'), value: CommunicationReason.InsuranceLetter, category: CommunicationCategory.Insurance },
        { text: this.translate.instant('General Note'), value: CommunicationReason.GeneralNote, category: CommunicationCategory.MiscCommunication },
        { text: this.translate.instant('General Letter'), value: CommunicationReason.GeneralLetter, category: CommunicationCategory.MiscCommunication },
        { text: this.translate.instant('Other Patient Care'), value: CommunicationReason.OtherPatientCare, category: CommunicationCategory.PatientCare },
        { text: this.translate.instant('Appointments'), value: CommunicationReason.Appointments, category: CommunicationCategory.PatientCare },
        { text: this.translate.instant('Preventive Care'), value: CommunicationReason.PreventiveCare, category: CommunicationCategory.PatientCare },
        { text: this.translate.instant('Treatment Plan'), value: CommunicationReason.TreatmentPlan, category: CommunicationCategory.PatientCare }
    ];
    public confirmationModalData = {
        header: this.translate.instant('Discard'),
        message: this.translate.instant('Are you sure you want to discard changes?'),
        confirm: this.translate.instant('Yes'),
        cancel: this.translate.instant('No'),
        height: 170,
        width: 350,
        formdata: null
    };
    public editAccountNoteconfirmationModalData = {
        header: this.translate.instant('Warning '),
        message: this.translate.instant('The Communication you have selected is larger than 500 characters. Account Notes cannot exceed 500 characters. If you continue, your Communication will be truncated to 500 characters. Do you wish to continue?'),
        confirm: this.translate.instant('Yes'),
        cancel: this.translate.instant('No'),
        height: 180,
        width: 750,
        oldFormData: null,
        isAccount: true
    };
    public  deleteConfirmationModalData = {
        header: this.translate.instant('Communication Center'),
        message: this.translate.instant('Are you sure you want to delete this communication?'),
        confirm: this.translate.instant('Yes'),
        cancel: this.translate.instant('No'),
        height: 160,
        width: 500
      };
      public  deleteToDoConfirmationModalData = {
        header: this.translate.instant('Communication Center'),
        message: this.translate.instant('Are you sure you want to delete this To-Do communication?'),
        confirm: this.translate.instant('Yes'),
        cancel: this.translate.instant('No'),
        height: 160,
        width: 500
      };
      public GenerateLetterCommunicationReasons = [
        { text: this.translate.instant('Account Letter'), value: CommunicationReason.AccountLetter, category: CommunicationCategory.Account },
        { text: this.translate.instant('Account Note'), value: CommunicationReason.AccountNote, category: CommunicationCategory.Account },
        { text: this.translate.instant('Insurance Letter'), value: CommunicationReason.InsuranceLetter, category: CommunicationCategory.Insurance },
        { text: this.translate.instant('Other Insurance'), value: CommunicationReason.OtherInsurance, category: CommunicationCategory.Insurance },
        { text: this.translate.instant('General Letter'), value: CommunicationReason.GeneralLetter, category: CommunicationCategory.MiscCommunication },
        { text: this.translate.instant('General Note'), value: CommunicationReason.GeneralNote, category: CommunicationCategory.MiscCommunication },
        { text: this.translate.instant('Other Patient Care'), value: CommunicationReason.OtherPatientCare, category: CommunicationCategory.PatientCare },
        { text: this.translate.instant('Appointments'), value: CommunicationReason.Appointments, category: CommunicationCategory.PatientCare },
        { text: this.translate.instant('Preventive Care'), value: CommunicationReason.PreventiveCare, category: CommunicationCategory.PatientCare },
        { text: this.translate.instant('Treatment Plan'), value: CommunicationReason.TreatmentPlan, category: CommunicationCategory.PatientCare },       
    ];
}
