import { Component, Inject, OnInit } from '@angular/core';
import { defaultMessages } from '../models/default-messages.model';
import cloneDeep from 'lodash/cloneDeep';
import { BillingMessagesService } from './billing-messages.service';

@Component({
    selector: 'default-messages',
    templateUrl: './default-messages.component.html',
    styleUrls: ['./default-messages.component.scss']
})
export class DefaultMessagesComponent implements OnInit {
    breadCrumbs: { name: string, path: string, title: string }[] = [];
    defaultMessagesDto: defaultMessages = new defaultMessages();
    defaultMessagesDtoBackup: defaultMessages = new defaultMessages();
    dataForCrudOperation = {
        BreadCrumbs: []
    };
    hasChanges: boolean;
    dynamicAmfa: string = 'soar-biz-bilmsg-add';

    constructor(
        @Inject('localize') private localize,
        @Inject('ModalFactory') private modalFactory,
        @Inject('patSecurityService') private patSecurityService,
        private billingMessagesService: BillingMessagesService,
        @Inject('toastrFactory') private toastrFactory,
    ) {

    }

    ngOnInit(): void {
        this.getPageNavigation();
        this.hasChanges = false;
        this.get();
    }

    getPageNavigation = () => {
        this.breadCrumbs = [
            {
                name: this.localize.getLocalizedString('Practice Settings'),
                path: '#/BusinessCenter/PracticeSettings',
                title: 'Practice Settings'
            },
            {
                name: this.localize.getLocalizedString('Default Billing Messages'),
                path: '/BusinessCenter/Settings/DefaultMessages/',
                title: 'Default Billing Messages'
            }
        ];
        this.dataForCrudOperation.BreadCrumbs = this.breadCrumbs;

    }

    // resets defaultMessagesDto and defaultMessagesDtoBackup
    updateDtos = (value) => {
        value = value !== null ? value : { InvoiceMessage: '' };
        this.defaultMessagesDto = value;
        this.defaultMessagesDtoBackup = cloneDeep(this.defaultMessagesDto);
        this.onValueChanged(this.defaultMessagesDto?.InvoiceMessage);
    };

    onValueChanged = (event) => {
        if (this.defaultMessagesDto && this.defaultMessagesDtoBackup) {
            this.hasChanges = this.defaultMessagesDto?.InvoiceMessage !== this.defaultMessagesDtoBackup?.InvoiceMessage;
        }
        if (!this.defaultMessagesDto?.DateModified) {
            this.dynamicAmfa = 'soar-biz-bilmsg-add';
        }
        else {
            this.dynamicAmfa = 'soar-biz-bilmsg-edit';
        }
    }
    // change url
    changePath = (path) => {
        window.location.href = path;
    }

    // get api call
    get = () => {
        if (this.patSecurityService.IsAuthorizedByAbbreviation('soar-biz-bilmsg-view')) {
            this.billingMessagesService.get().then((res: defaultMessages) => {
                this.updateDtos(res.Value);
            },
                (error) => {
                    this.toastrFactory.error(this.localize.getLocalizedString('Failed to retrieve the {0}. Refresh the page to try again.', ['Billing Messages']), this.localize.getLocalizedString('Server Error') + error?.data?.Message);
                });
        }
    }


    // warning modal logic
    showWarningModal = (path) => {
        this.modalFactory.WarningModal().then(
            (result) => {
                if (result === true) {
                    this.resetData();
                    this.changePath(path);
                }
            }
        );
    }

    // save button handler, creates, updates, and deletes
    save = () => {
        if (!this.defaultMessagesDto?.DateModified && this.patSecurityService.IsAuthorizedByAbbreviation('soar-biz-bilmsg-add')) {
            // creating a new one
            this.billingMessagesService.save(this.defaultMessagesDto).then((res: defaultMessages) => {
                if (res != null && res != undefined) {
                    this.toastrFactory.success(this.localize.getLocalizedString('Your Billing Message has been created.'), this.localize.getLocalizedString('Success'));
                    this.updateDtos(res.Value);                  
                    this.changePath(this.dataForCrudOperation?.BreadCrumbs[0].path);
                }
            },
                (error) => {
                    this.toastrFactory.error(this.localize.getLocalizedString('Save was unsuccessful. Please retry your save.'), this.localize.getLocalizedString('Server Error') + error?.data?.Message);
                });
        }
        else if (this.patSecurityService.IsAuthorizedByAbbreviation('soar-biz-bilmsg-edit')) {
            // updating an existing message
            this.billingMessagesService.update(this.defaultMessagesDto).then((res: defaultMessages) => {
                if (res != null && res != undefined) {
                    this.toastrFactory.success(this.localize.getLocalizedString('Your Billing Message has been updated.'), this.localize.getLocalizedString('Success'));
                    this.updateDtos(res.Value);
                    this.changePath(this.dataForCrudOperation?.BreadCrumbs[0].path);
                }
            },
                (error) => {
                    this.toastrFactory.error(this.localize.getLocalizedString('Update was unsuccessful. Please retry your update.'), this.localize.getLocalizedString('Server Error') + error?.data?.Message);
                });
        }
    }

    // cancel button handler, show warning if there are changes
    cancel = (path) => {
        if (this.hasChanges) {
            this.showWarningModal(path);
        }
        else {
            this.changePath(path);
        }
    }

    // resetting to original state of data
    resetData = () => {
        this.updateDtos(this.defaultMessagesDtoBackup);
    };
}
