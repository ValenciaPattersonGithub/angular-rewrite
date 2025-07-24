import { Component, OnInit, Inject, Input } from '@angular/core';
import cloneDeep from 'lodash/cloneDeep';
import escape from 'lodash/escape';
import { InformedConsentMessageService } from 'src/@shared/providers/informed-consent-message.service';
import { InformedConsentModel } from 'src/business-center/practice-settings/models/informed-consent.model';

@Component({
  selector: 'informed-consent-setup',
  templateUrl: './informed-consent-setup.component.html',
  styleUrls: ['./informed-consent-setup.component.scss']
})
export class InformedConsentSetupComponent implements OnInit {

  access;
  informedConsentMessage: InformedConsentModel = new InformedConsentModel();
  informedConsentMessageBackup: InformedConsentModel = new InformedConsentModel();
  dataHasChanged: boolean = false;
  styles = {
    wrapperClass: 'informedConsentMessage',
    headerClass: 'informedConsentMessage__header',
    titleClass: 'informedConsentMessage__title',
    bodyClass: 'informedConsentMessage__body',
    textareaClass: 'informedConsentMessage__text',
    textareaId: 'informedConsentText',
    textareaName: 'informedConsentMessage',
    cancelButtonId: 'btnCancelInformedConsentMessage',
    saveButtonId: 'btnSaveInformedConsentMessage',
  };

  constructor(@Inject('toastrFactory') private toastrFactory,
    @Inject('patSecurityService') private patSecurityService,
    @Inject('$location') private $location,
    @Inject('ModalFactory') private modalFactory,
    private informedConsentMessageService: InformedConsentMessageService) { }

  ngOnInit(): void {
    this.checkAccess();
    this.loadInformedConsentMessage();
  }

  //#region access
  checkAccess() {
    this.access = this.informedConsentMessageService.access();

    if (!this.access.View) {
      this.toastrFactory.error(this.patSecurityService.generateMessage('soar-biz-icmsg-view'), 'Not Authorized');
      this.$location.path(encodeURIComponent('/'));
    }
  }
  //#endregion

  //#region crud

  
  loadInformedConsentMessage = () => {
    this.informedConsentMessageService.getInformedConsentMessage().then((res: InformedConsentModel) => {
      this.informedConsentMessage = new InformedConsentModel();
      if(res?.Value){
        this.informedConsentMessage = <InformedConsentModel>res?.Value;
      }
      this.informedConsentMessageBackup = cloneDeep(this.informedConsentMessage);
      this.dataHasChanged = false;
    })
  };

  saveInformedConsentMessage = () => {
    if (this.access.Edit) {
      this.informedConsentMessageService.save(this.informedConsentMessage).then((res: InformedConsentModel) => {
        this.informedConsentMessage = new InformedConsentModel();
        this.informedConsentMessage = <InformedConsentModel>res?.Value;
        window.location.href = escape('#/BusinessCenter/PracticeSettings/');
      });
    };
  };

  //#endregion    

  //#region reset data
  cancelChanges = () => {
    if (this.dataHasChanged) {
      this.modalFactory.CancelModal().then(() => this.cancel());
    } else {
      this.cancel();
    }
  }

  cancel = () => {
    // set variables to defaults
    this.dataHasChanged = false;
    window.location.href = escape('#/BusinessCenter/PracticeSettings/');
  }

  //#endregion

  // set dataHasChanged based on backup and current informedConsentMessage.Text

  informedConsentMessageChange = (consentMessage) => {
    this.informedConsentMessage.Text = consentMessage.trim();
    this.dataHasChanged = this.informedConsentMessage.Text !== this.informedConsentMessageBackup.Text;
  }
  //#endregion  

}
