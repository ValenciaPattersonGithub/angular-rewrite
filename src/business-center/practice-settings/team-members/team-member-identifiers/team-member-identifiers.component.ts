import { Component, Inject, Input, OnInit, ViewContainerRef } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { GridDataResult, DataStateChangeEvent } from '@progress/kendo-angular-grid';
import { State, SortDescriptor, orderBy, process } from '@progress/kendo-data-query';
import { Subscription } from 'rxjs';
import { filter, take } from 'rxjs/operators';
import { ConfirmationModalOverlayRef } from 'src/@shared/components/confirmation-modal/confirmation-modal.overlayref';
import { ConfirmationModalService } from 'src/@shared/components/confirmation-modal/confirmation-modal.service';
import { MasterTeamMemberIdentifier, TeamMemberIdentifier } from '../../models/team-member-identifier.model';
import { TeamMemberIdentifierService } from 'src/@shared/providers/team-member-identifier.service';
import { MasterTeamMemberIdentifierQualifiers } from '../team-member';

const createFormGroup = dataItem => new FormGroup({
    'Description': new FormControl(dataItem.Description, [Validators.required]),
    'Qualifier': new FormControl(dataItem.Qualifier),
});

@Component({
    selector: 'team-member-identifiers',
    templateUrl: './team-member-identifiers.component.html',
    styleUrls: ['./team-member-identifiers.component.scss']
})
export class TeamMemberIdentifiersComponent implements OnInit {
    masterTeamMemberIdentifierQualifiers = MasterTeamMemberIdentifierQualifiers;
    breadCrumbs = [];
    hasCreateAccess: boolean = false;
    hasViewAccess: boolean = false;
    hasEditAccess: boolean = false;
    hasDeleteAccess: boolean = false;
    loading: boolean = true;
    teamMemberIdentifiers: Array<TeamMemberIdentifier> = [];
    formGroup: FormGroup;
    editedRowIndex: number;
    isbtnVisible: boolean = false;
    sortColumnName: string;
    sortDirection: number;
    isDescending: boolean;
    defaultOrderKey = 'Description';
    MasterTeamMemberIdentifier: MasterTeamMemberIdentifier = {};    
    senderObject:any;
    // Properties used for delete
    teamMemberIdentifierToDelete: MasterTeamMemberIdentifier = {};
    deletingTeamMemberIdentifier: boolean = false;
    cannotDeleteTeamMemberIdentifierName: string = '';
    checkingForUsers: boolean = false;
    teamMemberWithTeamMemberIdentifier: Array<MasterTeamMemberIdentifier> = [];
    confirmingDelete: boolean = false;
    // End
    rowIndex: number;
    @Input() containerRef: ViewContainerRef;
    noRecordsMessageVal: string = "";

    // For modal
    confirmationRef: ConfirmationModalOverlayRef;
    confirmationModalSubscription: Subscription;
    confirmationModalData = {
        header: '',
        message: '',
        confirm: '',
        cancel: 'Cancel',
        height: 200,
        width: 350
    }

    public state: State = {
        skip: 0,
        sort:[],
        filter: {
            logic: "and",
            filters: [{
                field: "Description",
                operator: "contains",
                value: ""
            },
            {
                field: "Qualifier",
                operator: "eq",
                value: ""
            },],
        }
    };

    // For sorting
    public sort: SortDescriptor[] = [
        {
            field: "Description",
            dir: "asc",
        },
        {
            field: "Qualifier",
            dir: "asc",
        },
    ];

    public gridData: GridDataResult = process(this.teamMemberIdentifiers, this.state);

    private loadTeamMembers(teamMembers): void {
        const teamMemberIdentifiers = teamMembers || this.teamMemberIdentifiers;
        this.gridData = process(teamMemberIdentifiers, this.state);
        if (this.loading == false && this.gridData?.data?.length == 0) {
            this.noRecordsMessageVal = this.localize.getLocalizedString('No records available');
        }
        else {
            this.noRecordsMessageVal = "";
        }
    }
    public dataStateChange(filterState: DataStateChangeEvent): void {
        this.state = filterState;
        this.loadTeamMembers(this.teamMemberIdentifiers);
    }

    constructor(@Inject('localize') private localize,
        @Inject('toastrFactory') private toastrFactory,
        @Inject('patSecurityService') private patSecurityService,
        @Inject('$location') private $location,
        @Inject('ListHelper') private listHelper,
        private confirmationModalService: ConfirmationModalService,
        private teamMemberIdentifierService: TeamMemberIdentifierService
        ) {
    }

    ngOnInit(): void {
        this.getPageNavigation();
        this.authAccess();
        this.getTeamMemberIdentifiers();
        this.state.filter.filters = [{
            field: "Description",
            operator: "contains",
            value: ""
        }];
    }

    getPageNavigation = () => {
        this.breadCrumbs = [
            {
                name: this.localize.getLocalizedString('Practice Settings'),
                path: '#/BusinessCenter/PracticeSettings/',
                title: 'Practice Settings'
            },
            {
                name: this.localize.getLocalizedString('Team Member Additional Identifiers'),
                path: '/Users/UserIdentifiers/',
                title: 'Team Member Additional Identifiers'
            }
        ];

    }

    authAccess = () => {
        if (!this.authViewAccess()) {
            this.toastrFactory.error(this.localize.getLocalizedString('User is not authorized to access this area.'), this.localize.getLocalizedString('Not Authorized'));
            this.$location.path(encodeURIComponent('/'));
        } else {
            this.hasViewAccess = this.authViewAccess();
            this.hasCreateAccess = this.authCreateAccess();
            this.hasDeleteAccess = this.authDeleteAccess();
            this.hasEditAccess = this.authEditAccess();
        }
    }

    authViewAccess = () => {
        return this.patSecurityService.IsAuthorizedByAbbreviation('soar-biz-aitm-view');
    }

    authCreateAccess = () => {
        return this.patSecurityService.IsAuthorizedByAbbreviation('soar-biz-aitm-manage');
    };

    authDeleteAccess = () => {
        return this.patSecurityService.IsAuthorizedByAbbreviation('soar-biz-aitm-manage');
    }

    authEditAccess = () => {
        return this.patSecurityService.IsAuthorizedByAbbreviation('soar-biz-aitm-manage');
    }

    getTeamMemberIdentifiers = () => {
        this.teamMemberIdentifierService?.get()
            .then((res: MasterTeamMemberIdentifier) => {
                this.teamMemberIdentifiersGetSuccess(res);
            }, () => {
                this.teamMemberIdentifiersGetFailure();
            });
    }

    teamMemberIdentifiersGetSuccess = (res) => {
        this.loading = false;
        this.teamMemberIdentifiers = res?.Value;
        this.loadTeamMembers(this.teamMemberIdentifiers);
        this.gridData = {
            data: orderBy(this.teamMemberIdentifiers, this.sort),
            total: this.teamMemberIdentifiers?.length,
        };
    }

    teamMemberIdentifiersGetFailure = () => {
        this.loading = false;
        this.teamMemberIdentifiers = [];
        this.loadTeamMembers(this.teamMemberIdentifiers);
        this.toastrFactory.error(this.localize?.getLocalizedString('Failed to retrieve the list of additional identifiers. Refresh the page to try again.'), this.localize?.getLocalizedString('Error'));
    }

    editHandler = ({ sender, rowIndex, dataItem }) => {
        this.closeEditor(sender);
        this.formGroup = createFormGroup(dataItem);
        this.editedRowIndex = rowIndex;
        sender.editRow(rowIndex, this.formGroup);
    }

    cancelHandler = ({ sender, rowIndex }) => {
        this.closeEditor(sender, rowIndex);
    }

    saveHandler = ({ sender, rowIndex, formGroup, isNew }) => {
        this.senderObject = sender;
        if (!isNew) {
            this.rowIndex = rowIndex;
            this.openUpdateConfirmationModal(null);
        } else {
            this.saveTeamMemberIdentifier();
        }
        sender.closeRow(rowIndex);
    }

    saveTeamMemberIdentifier = () => {
        this.MasterTeamMemberIdentifier.Qualifier = this.formGroup?.controls['Qualifier']?.value;
        this.MasterTeamMemberIdentifier.Description = this.formGroup?.controls['Description']?.value;
        if (this.MasterTeamMemberIdentifier.Qualifier == 0) {
            this.MasterTeamMemberIdentifier.Qualifier = null;
        }
        this.teamMemberIdentifierService?.save(this.MasterTeamMemberIdentifier)
            .then((res: MasterTeamMemberIdentifier) => {
                this.savePostSuccess(res?.Value);
            }, (error) => {
                this.savePostFailure(error);
            });
    }

    savePostSuccess = (res) => {
        this.toastrFactory.success(this.localize?.getLocalizedString('Additional identifier has been created.'), this.localize?.getLocalizedString('Success'));
        this.getTeamMemberIdentifiers();
    }

    savePostFailure = (res) => {
        this.loading = false;
        this.toastrFactory?.error(this.localize?.getLocalizedString(res?.data?.InvalidProperties[0]?.ValidationMessage), this.localize?.getLocalizedString('Error'));
    }

    updateTeamMemberIdentifier = (rowIndex) => {
        this.rowIndex = rowIndex;
    }

    updatePostSuccess = (res) => {
        this.toastrFactory.success(this.localize.getLocalizedString('Update successful.'), this.localize.getLocalizedString('Success'));
        this.getTeamMemberIdentifiers();
    }

    updatePostFailure = (res) => {
        this.loading = false;
        this.toastrFactory.error(this.localize.getLocalizedString(res?.data?.InvalidProperties[0]?.ValidationMessage), this.localize.getLocalizedString('Error'));
    }

    validateDelete = (teamMemberIdentifier) => {
        this.teamMemberIdentifierToDelete = teamMemberIdentifier;
        this.deletingTeamMemberIdentifier = true;
        this.cannotDeleteTeamMemberIdentifierName = '';
        this.checkingForUsers = true;
        this.teamMemberWithTeamMemberIdentifier = [];
        this.teamMemberIdentifierService?.teamMemberIdentifier(teamMemberIdentifier?.MasterUserIdentifierId )
            .then((res) => {
                this.teamMemberWithTeamMemberIdentifierSuccess(res, teamMemberIdentifier);
            }, () => {
                this.teamMemberIdentifierWithTeamMembersFailure();
            });
    }

    teamMemberWithTeamMemberIdentifierSuccess = (res, teamMemberIdentifier) => {
        this.teamMemberWithTeamMemberIdentifier = res?.Value;
        this.checkingForUsers = false;
        // if no users attached, go ahead and delete it.
        if (this.teamMemberWithTeamMemberIdentifier && this.teamMemberWithTeamMemberIdentifier?.length > 0) {
            // teamMemberIdentifier will not be deleted
            this.cannotDeleteTeamMemberIdentifierName = teamMemberIdentifier?.Description;
            this.deletingTeamMemberIdentifier = false;
            this.teamMemberIdentifierToDelete = {};
        } else {
            this.confirmDelete(teamMemberIdentifier);
        };
    }

    teamMemberIdentifierWithTeamMembersFailure = () => {
        this.toastrFactory?.error(this.localize?.getLocalizedString('Failed to get users with the additional identifier. Try again.'), this.localize?.getLocalizedString('Error'));
    }

    confirmDelete = (teamMemberIdentifier) => {
        this.confirmingDelete = true;
        this.openDeleteConfirmationModal(teamMemberIdentifier);
    }

    removeHandler = ({ dataItem }) => {
        if (this.hasDeleteAccess) {
            this.validateDelete(dataItem);
        }
    }

    deleteTeamMemberIdentifierSuccess = () => {
        var index = this.listHelper.findIndexByFieldValue(this.teamMemberIdentifiers, 'MasterUserIdentifierId', this.teamMemberIdentifierToDelete?.MasterUserIdentifierId);
        if (index !== -1) {
            this.teamMemberIdentifiers.splice(index, 1);
            this.gridData.data = this.teamMemberIdentifiers;
        }
        this.toastrFactory.success(this.localize.getLocalizedString('Successfully deleted the user additional identifier.'), this.localize.getLocalizedString('Success'));
        this.deletingTeamMemberIdentifier = false;
        this.teamMemberIdentifierToDelete = {};
    }

    deleteTeamMemberIdentifierFailure = () => {
        this.toastrFactory.error(this.localize.getLocalizedString('Failed to delete the user additional identifier. Try again.'), this.localize.getLocalizedString('Error'));
        this.deletingTeamMemberIdentifier = false;
        this.teamMemberIdentifierToDelete = {};
    }

    addHandler = ({ sender }) => {
        this.closeEditor(sender);
        this.formGroup = createFormGroup({
            'Description': '',
            'Qualifier': null
        });
        sender.addRow(this.formGroup);
    }

    getQualifier = (id: number): MasterTeamMemberIdentifier => {
        return this.masterTeamMemberIdentifierQualifiers.find(x => x.Value === id);
    }

    closeEditor = (grid, rowIndex = this.editedRowIndex) => {
        grid.closeRow(rowIndex);
        this.editedRowIndex = undefined;
        this.formGroup = undefined;
    }

    sortChange = (sort: SortDescriptor[]): void => {
        if (sort) {
            this.sort = sort;
            this.getTeamMemberIdentifiers();
        }
    }

    // Dialog
    openDeleteConfirmationModal = (data) => {
        this.confirmationModalData.message = this.localize?.getLocalizedString('Deleting "' + data?.Description + '" will result in a loss of all information entered for this Additional Identifier. Continue?');
        this.confirmationModalData.confirm = this.localize?.getLocalizedString('Delete');
        data = this.confirmationModalData;
        this.confirmationRef = this.confirmationModalService.open({
            data
        });

        this.confirmationModalSubscription = this.confirmationRef.events.pipe(
            filter((event) => !!event),
            filter((event) => {
                return event.type === 'confirm' || event.type === 'close';
            }),
            take(1)
        ).subscribe((events) => {
            switch (events.type) {
                case 'confirm':
                    this.confirmationRef?.close();
                    this.teamMemberIdentifierService?.delete(this.teamMemberIdentifierToDelete?.MasterUserIdentifierId)
                        .then((res) => {
                            this.deleteTeamMemberIdentifierSuccess();
                        }, () => {
                            this.deleteTeamMemberIdentifierFailure();
                        });
                    break;
                case 'close':
                    this.confirmationRef?.close();
                    break;
            }
        });
    }

    openUpdateConfirmationModal = (data) => {
        this.confirmationModalData.message = this.localize?.getLocalizedString('Changes will take effect for all users. Continue?');
        this.confirmationModalData.confirm = this.localize?.getLocalizedString('Save');
        data = this.confirmationModalData;
        this.confirmationRef = this.confirmationModalService.open({
            data
        });

        this.confirmationModalSubscription = this.confirmationRef.events.pipe(
            filter((event) => !!event),
            filter((event) => {
                return event.type === 'confirm' || event.type === 'close';
            }),
            take(1)
        ).subscribe((events) => {
            switch (events.type) {
                case 'confirm':
                    this.confirmationRef?.close();
                    this.MasterTeamMemberIdentifier = this.senderObject?.data?.data[this.rowIndex];
                    if (this.MasterTeamMemberIdentifier) {
                        this.MasterTeamMemberIdentifier.Qualifier = this.formGroup?.value?.Qualifier == 0 ?  null : this.formGroup?.value?.Qualifier;
                        this.MasterTeamMemberIdentifier.Description = this.formGroup?.value?.Description;
                    }
                    this.teamMemberIdentifierService?.update(this.MasterTeamMemberIdentifier)
                        .then((res: MasterTeamMemberIdentifier) => {
                            this.updatePostSuccess(res?.Value);
                        }, (error) => {
                            this.updatePostFailure(error);
                        });
                    break;
                case 'close':
                    this.confirmationRef?.close();
                    break;
            }
        });
    }

}
