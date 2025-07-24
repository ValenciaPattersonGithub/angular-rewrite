import { Component, OnInit, Inject } from '@angular/core';

import cloneDeep from 'lodash/cloneDeep';
import { TreatmentConsentModel } from '../models/treatment-consent.model';
import escape from 'lodash/escape';
import { TreatmentConsentService } from 'src/@shared/providers/treatment-consent.service';

@Component({
  selector: 'treatment-consent',
  templateUrl: './treatment-consent.component.html',
  styleUrls: ['./treatment-consent.component.scss']
})
export class TreatmentConsentComponent implements OnInit {

  treatmentConsentTextDto: TreatmentConsentModel;
  treatmentConsentTextDtoBackup: TreatmentConsentModel;
  styles = {
    wrapperClass: 'treatmentConsent',
    headerClass: 'treatmentConsent__header',
    titleClass: 'treatmentConsent__title',
    bodyClass: 'treatmentConsent__body',
    textareaClass: 'treatmentConsent__text',
    textareaId: 'treatmentConsentText',
    textareaName: 'treatmentConsentMessage',
    cancelButtonId: 'btnCancelTreatmentConsent',
    saveButtonId: 'btnSaveTreatmentConsent',
  };
  hasChanges: boolean = false;
  dynamicAmfa: string;

  constructor(@Inject('patSecurityService') private patSecurityService,
    @Inject('ModalFactory') private modalFactory,
    @Inject('toastrFactory') private toastrFactory,
    private treatmentConsentService: TreatmentConsentService,
    @Inject('localize') private localize) { }

  ngOnInit(): void {
    this.get();
  }

  // get api call
  get = () => {
    if (this.patSecurityService.IsAuthorizedByAbbreviation('soar-biz-tpmsg-view')) {
      this.treatmentConsentService.getConsent().then(
        (res:TreatmentConsentModel) => {
          if (res) {
             this.updateDtos(res.Value)
          }
        }, (error) => {
          this.getTreatmentConsentFailure();
        });
    }
  }


  getTreatmentConsentFailure() {
    this.toastrFactory.error(this.localize.getLocalizedString('{0} {1}', ['Treatment consent letter', 'failed to load.']), this.localize.getLocalizedString('Server Error'));
  }


  // resets treatmentConsentTextDto and treatmentConsentTextDtoBackup
  updateDtos = (value) => {
      this.treatmentConsentTextDto = value || { Text: '' };
      this.treatmentConsentTextDtoBackup = cloneDeep(this.treatmentConsentTextDto);    
  }

  // save button handler, creates, updates, and deletes
  saveChanges = () => {
    if (!this.treatmentConsentTextDto.DateModified && this.patSecurityService.IsAuthorizedByAbbreviation('soar-biz-tpmsg-add')) {
      // creating a new one
      this.treatmentConsentService.createConsent(this.treatmentConsentTextDto).then((res: TreatmentConsentModel) => {
        this.updateDtos(res);
        this.goToPracticeSettings();
      });
    } else if (this.patSecurityService.IsAuthorizedByAbbreviation('soar-biz-tpmsg-edit')) {
      // updating an existing message
      this.treatmentConsentService.updateConsent(this.treatmentConsentTextDto).then((res: TreatmentConsentModel) => {
        this.updateDtos(res);
        this.goToPracticeSettings();
      });
    }
  }

  goToPracticeSettings() {
    window.location.href = escape('#/BusinessCenter/PracticeSettings/');
  }

  // warning modal logic
  showWarningModal = () => {
    this.modalFactory.WarningModal().then(
      (result) => {
        if (result === true) {
          this.resetData();
          this.goToPracticeSettings();
        }
      }
    );
  }
  //#endregion

  // cancel button handler, show warning if there are changes
  cancel = () => {
    if (this.hasChanges) {
      this.showWarningModal();
    } else {
      this.goToPracticeSettings();
    }
  }

  // need this method to dynamically set the appropriate amfa for the save button, also tracking hasChanges for discard warning, etc.
  treatmentConsentMessageChange = (consentMessage) => {

    this.treatmentConsentTextDto.Text = consentMessage.trim();
    this.hasChanges = this.treatmentConsentTextDto.Text !== this.treatmentConsentTextDtoBackup.Text;

    if (!this.treatmentConsentTextDto.DateModified) {
      this.dynamicAmfa = 'soar-biz-tpmsg-add';
    } else {
      this.dynamicAmfa = 'soar-biz-tpmsg-edit';
    }
  }

  // resetting to original state of data
  resetData = () => {
    this.updateDtos(this.treatmentConsentTextDtoBackup);
  }
  //#endregion

}
