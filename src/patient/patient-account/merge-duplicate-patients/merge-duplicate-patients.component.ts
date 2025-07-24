import { Component, OnInit, Input, Inject, ViewChild, ViewContainerRef } from '@angular/core';
import * as moment from 'moment';
import { ZipCodePipe } from '../../../@shared/pipes/zipCode/zip-code.pipe';
import { OrderByPipe } from '../../../@shared/pipes';
import { PhoneNumberPipe } from '../../../@shared/pipes/phone-number/phone-number.pipe';
import { TranslateService } from '@ngx-translate/core';
import { DialogService, DialogRef, DialogCloseResult } from '@progress/kendo-angular-dialog';
import { MergeDuplicatePatientsDialogComponent } from '../merge-duplicate-patients-dialog/merge-duplicate-patients-dialog.component';
import { BestPracticePatientNamePipe } from '../../../@shared/pipes/best-practice/best-practice-patient-name.pipe';
import { MergeToAccountDialogComponent } from '../merge-to-account-dialog/merge-to-account-dialog.component';

@Component({
    // tslint:disable-next-line: component-selector
    selector: 'merge-duplicate-patients',
    templateUrl: './merge-duplicate-patients.component.html',
    styleUrls: ['./merge-duplicate-patients.component.scss']
})
export class MergeDuplicatePatientsComponent implements OnInit {
    @ViewChild('container', { read: ViewContainerRef, static: false })
    public containerRef: ViewContainerRef;
    @Input() accountId: any;

    constructor(private translate: TranslateService,
                @Inject('PatientServices') private patientServices,
                @Inject('toastrFactory') private toastrFactory,
                private zipCode: ZipCodePipe,
                private phoneNumberPipe: PhoneNumberPipe,
                private dialogService: DialogService,
                @Inject('patSecurityService') private patSecurityService,
                private bestPracticePatientNamePipe: BestPracticePatientNamePipe,
                // private authAccess: AuthAccess,
    ) { }
    accountMembers: any[] = [];
    primaryAccountMembers: any[] = [];
    duplicateAccountMembers: any[] = [];
    loaded = false;
    isDescending: boolean;
    sortColumnName: string;
    sortDirection: number;
    allSelected: boolean;
    enableCombine: boolean;
    orderBy = {
        field: 'IsResponsiblePerson',
        asc: 1
    };

    hasViewAccess: boolean;
    hasEditAccess: boolean;
    dialog: DialogRef;
    patientSearchList: any[] = [];
    checkingForDuplicates = false;
    mergeInProgress = false;
    
    private messages: { [key: string]: string} = {       
        DefaultCannotMerge: 'The selected person cannot be merged.',
        DefaultMerge: 'Are you sure you want to merge the selected person to the current account?',
        Duplicate: "The patient account you've selected is linked as a duplicate of another account. If you transfer this account, it will no longer be a duplicate for that patient.",
        Inactive: 'The selected person is not active and cannot be merged.',
        PrimaryDuplicate: "The patient account you've selected has linked duplicate accounts. These accounts will also be merged into this account member group.",
        ResponsibleParty: 'The selected person is the responsible party for one or more persons and cannot be merged.'
    }

    ngOnInit() {
        this.authAccess();
        this.enableCombine = false;
        this.getAccountMembersWithDuplicates(this.accountId).then((res: any) => {
            this.addDynamicProperties();
            this.filterForPrimaryAccountMembers(false);
        });
        this.allSelected = false;
    }

    authAccess() {
        this.hasViewAccess = this.patSecurityService.IsAuthorizedByAbbreviation('soar-per-perdem-view');
        this.hasEditAccess = this.patSecurityService.IsAuthorizedByAbbreviation('soar-per-perdem-modify');
    }

    changeSortingForGrid(field: string) {
        this.orderBy.asc = (this.orderBy.field === field) ? (this.orderBy.asc === 1) ? -1 : 1 : this.orderBy.asc = -1;
        this.orderBy.field = field;
        this.sortAccountMembers();
    }

    sortAccountMembers() {
        const orderPipe = new OrderByPipe();
        orderPipe.transform(this.primaryAccountMembers, {
            sortColumnName: this.orderBy.field, sortDirection: this.orderBy.asc
        });
    }

    getAccountMembersWithDuplicates(id) {
        return new Promise((resolve, reject) => {
            this.patientServices.Account.getAccountMembersWithDuplicates({ accountId: id }).$promise.then((res) => {
                this.accountMembers = res.Value;
                resolve(res.Value);
            }, (ex) => {
                // tslint:disable-next-line: max-line-length
                this.toastrFactory.error(this.translate.instant('Failed to retrieve the Account Members. Refresh the page to try again.'),
                this.translate.get('Server Error'));
                reject();
            });
        });
    }

    toggleSelected(member) {
        member.IsSelected = member.IsSelected === true ? false : true;
        if (member.IsSelected === true) {
            this.patientSearchList.push(member);
        } else {
            // remove patient if in search list
            this.patientSearchList = this.patientSearchList.filter(item => item !== member);
        }
        this.allowCombine();
        this.checkingForDuplicates = false;
    }

    toggleAllSelected() {
        this.allSelected = this.allSelected === true ? false : true;
        this.primaryAccountMembers.forEach(member => {
            member.IsSelected = this.allSelected;
            if (member.IsSelected === true) {
                this.patientSearchList.push(member);
            } else {
                this.patientSearchList = this.patientSearchList.filter(item => item !== member);
            }
        });
        this.allowCombine();
        this.checkingForDuplicates = false;
    }


    checkForDuplicates = () => {
        this.checkingForDuplicates = true;
    }

    allowCombine() {
        const rowsSelected =  this.primaryAccountMembers.filter(member => member.IsSelected === true);
        this.enableCombine = rowsSelected.length > 1;
    }

    addDynamicProperties() {
        this.accountMembers.forEach( member => {
            const bestPracticePatientName =  this.bestPracticePatientNamePipe.transform(member);
            member.Name = bestPracticePatientName ? ' ' + bestPracticePatientName : '';
            // status
            if (member.IsActive === true) {
                member.StatusName = member.IsPatient === true ? 'Active Patient' : 'Active Non-Patient';
            } else {
                member.StatusName = member.IsPatient === true ? 'Inactive Patient' : 'Inactive Non-Patient';
            }
            // date of birth display
            member.DateOfBirthDisplay = member.DateOfBirth ? moment.utc(member.DateOfBirth).format('MM/DD/YYYY') : '';
            // address
            member.FullAddress = member.AddressLine1 ? member.AddressLine1 + ' ' : '';
            member.FullAddress += member.City ? member.City : '';
            member.FullAddress += member.State ? ', ' + member.State : '';
            const formattedZipCode = this.zipCode.transform(member.ZipCode);
            member.FullAddress += formattedZipCode ? ' ' + formattedZipCode : '';
            const formattedPhoneNumber =  this.phoneNumberPipe.transform(member.PhoneNumber);
            member.PhoneNumberFormatted = formattedPhoneNumber ? ' ' + formattedPhoneNumber : '';
            // checkbox indicating primary duplicate when checked on dialog
            member.IsPrimaryDuplicate = false;
            // list of duplicates for this patient
            member.DuplicatePatients = [];
        });
        this.sortAccountMembers();
        this.loaded = true;
    }

    // refresh list after update
    refreshAccountMembers(updatedAccountMembers) {
        updatedAccountMembers.forEach( updatedMember => {
            const match = this.accountMembers.find((member) => {
                return member.PatientId === updatedMember.PatientId;
            });
            if (match) {
                match.PrimaryDuplicatePatientId = updatedMember.PrimaryDuplicatePatientId;
                match.IsSelected = false;
                match.DataTag = updatedMember.DataTag;
                // status
                if (updatedMember.IsActive === true) {
                    match.StatusName = updatedMember.IsPatient === true ? 'Active Patient' : 'Active Non-Patient';
                } else {
                    match.StatusName = updatedMember.IsPatient === true ? 'Inactive Patient' : 'Inactive Non-Patient';
                }
            }
        });
        this.filterForPrimaryAccountMembers(true);
        this.allSelected = false;
    }

    // open dialog to select primary for a list of duplicates
    combineAsDuplicate() {
        if (this.hasEditAccess === true) {
            const selectedAccountMembers = this.primaryAccountMembers.filter(member => member.IsSelected === true);
            this.dialog = this.dialogService.open({ appendTo: this.containerRef, content: MergeDuplicatePatientsDialogComponent });
            this.dialog.content.instance.title = 'Select the Primary Account';
            this.dialog.content.instance.accountMembers = selectedAccountMembers;
            this.dialog.result.subscribe((accountMemberResults: any) => {
                if (accountMemberResults.length > 0) {
                    this.refreshAccountMembers(accountMemberResults);
                    this.enableCombine = false;
                } else {
                    this.primaryAccountMembers.forEach( member => {
                       member.IsSelected = false;
                    });
                    this.enableCombine = false;
                }
            });
        }
    }

    showDuplicates(member) {
        member.showDuplicates = !member.showDuplicates;
    }

    //#region remove duplicate relationship

    removeRelationship(duplicatePatient) {
        duplicatePatient.PrimaryDuplicatePatientId = null;
        if (this.hasEditAccess === true) {
            this.updatePatientDuplicate(duplicatePatient).then((res) => {
                if (res) {
                    this.refreshAccountMembers(res);
                    this.enableCombine = false;
                } else {
                    this.primaryAccountMembers.forEach( member => {
                       member.IsSelected = false;
                    });
                    this.enableCombine = false;
                }
            });
        }
    }

    updatePatientDuplicate(duplicatePatient) {
        return new Promise((resolve, reject) => {
            this.patientServices.PatientDuplicates.update([duplicatePatient]).$promise.then((res) => {
                console.log(res);
                this.toastrFactory.success(
                    this.translate.instant('Your Duplicate patient relationship has been removed.'),
                    this.translate.get('Success'));
                resolve(res.Value);
            }, (ex) => {
                // tslint:disable-next-line: max-line-length
                this.toastrFactory.error(this.translate.instant('Failed to remove duplicate patients. Refresh the page to try again.'),
                this.translate.get('Server Error'));
                reject();
            });
        });
    }

    //#endregion


    // creates primaryAccountMembers and a list of their duplicates
    filterForPrimaryAccountMembers(showDuplicates) {
        this.primaryAccountMembers = [];
        this.duplicateAccountMembers = [];
        this.accountMembers.forEach( member => {
            member.DuplicatePatients = [];
            if (member.PrimaryDuplicatePatientId === null || member.PrimaryDuplicatePatientId === '') {
                member.showDuplicates = showDuplicates;
                this.primaryAccountMembers.push(member);
                // tslint:disable-next-line: triple-equals
                // tslint:disable-next-line: max-line-length
                const duplicates = this.accountMembers.filter(x => x.PrimaryDuplicatePatientId !== null && x.PrimaryDuplicatePatientId.toLowerCase() === member.PatientId.toLowerCase());
                if (duplicates) {
                    const orderPipe = new OrderByPipe();
                    orderPipe.transform(duplicates, {
                        sortColumnName: 'Name', sortDirection: true
                    });
                    duplicates.forEach( duplicatePatient => {
                        duplicatePatient.StatusName = 'Duplicate';
                        member.DuplicatePatients.push(duplicatePatient);
                    });
                }
            }
        });
    }

    duplicateSelected(duplicate) {
        if (this.mergeInProgress) {
            return;
        }

        if (!duplicate) {
            return;
        }

        if (!duplicate.IsActive) {
            this.showMergeToAccountDialog('Unable to merge', this.messages.Inactive, false);
            return;
        }

        this.mergeInProgress = true;
        this.patientServices.PatientAccountTransfer
            .canMerge({ personId: duplicate.PatientId }).$promise.then((result) => this.canMergeSuccess(result, duplicate.PatientId), this.canMergeFailure);
    }

    private canMergeSuccess = (result: CanMergeResult, patientId) => {
        if (!result || result.Value == null) {
            this.canMergeFailure();
        } else if (result.Value.CanMerge) {
            let message: string;
            if (result.Value.Warning === true) {
                message = this.messages[result.Value.Reason];
            }
            this.showMergeToAccountDialog('Merge accounts', message || this.messages.DefaultMerge, true, () => {
                this.mergePatientToAccount(patientId);
            });
        } else {
            let message = this.messages[result.Value.Reason];
            this.showMergeToAccountDialog('Unable to merge', message || this.messages.DefaultCannotMerge, false);
        }
    };

    private canMergeFailure = () => {
        this.toastrFactory.error(this.translate.instant('Failed to check merge status. Refresh the page to try again.'));
        this.mergeInProgress = false;
    };

    private showMergeToAccountDialog(title: string, message: string, okAndCancel: boolean, okCallback: Function = null) {
        this.dialog = this.dialogService.open({ appendTo: this.containerRef, content: MergeToAccountDialogComponent });
        this.dialog.content.instance.title = title;
        this.dialog.content.instance.message = message;
        this.dialog.content.instance.okAndCancel = okAndCancel;
        this.dialog.result.subscribe((result: any) => {
            if (result === true && okCallback !== null) {
                okCallback();
            }
            this.mergeInProgress = false;
        });
    }

    private mergePatientToAccount(patientId: string) {
        this.patientServices.PatientAccountTransfer.merge({ patientId: patientId, otherAccountId: this.accountId})
            .$promise.then((res) => {
                if (res && res.Value) {
                    this.toastrFactory.success(
                        this.translate.instant('Merge complete.'),
                        this.translate.instant('Success'));
                    this.ngOnInit();
                } else {
                    this.toastrFactory.error(this.translate.instant('Failed to merge the selected person. Refresh the page to try again.'));
                }
            }, () => {
                this.toastrFactory.error(this.translate.instant('Failed to merge the selected person. Refresh the page to try again.'));
            });
    }
}

interface CanMergeResult {
    Value: PersonCanBeMerged
}

interface PersonCanBeMerged {
    CanMerge: boolean,
    Warning: boolean,
    Reason: string
}
