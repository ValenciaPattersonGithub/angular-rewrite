import { Component, OnInit, Inject } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Subscription } from 'rxjs';
import { ConfirmationModalService } from 'src/@shared/components/confirmation-modal/confirmation-modal.service';
import { ConfirmationModalOverlayRef } from 'src/@shared/components/confirmation-modal/confirmation-modal.overlayref';
import { filter, take } from 'rxjs/operators';
import { GroupType, PatientsWithGroupType } from './group-type';
import { SoarResponse } from 'src/@core/models/core/soar-response';
import { GroupTypeService } from 'src/@shared/providers/group-type.service';

const createFormGroup = dataItem => new FormGroup({
    'GroupTypeName': new FormControl(dataItem.GroupTypeName, [Validators.required]),
});


@Component({
  selector: 'group-types',
  templateUrl: './group-types.component.html',
  styleUrls: ['./group-types.component.scss']
})
export class GroupTypesComponent implements OnInit {
    editMode: boolean = false;  
    checkingForPatients: boolean = false; // indicator we are searching for patients with the groupType to be deleted
    deletingGroupType: boolean = false;   // indicator that groupType is being deleted
    loading: boolean = true;   // indicator that we are loading the list
    cannotDeleteGroupTypeName: string = "";
    showBackButton: boolean = false;
    hasCreateAccess : boolean = false;
    hasDeleteAccess : boolean = false;
    hasEditAccess : boolean = false;
    confirmingDelete: boolean = false;
    breadCrumbs: { name: string, path: string, title: string }[] = [];
    formGroup: FormGroup = new FormGroup({});
    patientsWithGroupType: PatientsWithGroupType[] = [];// list of patients with the group type we are deleting
    groupTypeToDelete: GroupType = {};
    groupTypes: GroupType[] = []; // master list
    subscriptions: Array<Subscription> = new Array<Subscription>();

    columns: { field: string, title: string, width: string, hasValidations: boolean, validation: { message: string, maxLength: string } }[] = [];
    // Initial filter
    state = {
        skip: 0,
        sort: [
            {
                field: "GroupTypeName"
            }
        ],
        filter: {
            logic: "and",
            filters: [{
                field: "GroupTypeName",
                operator: "contains",
                value: ""
            }],
        }
    };
    // For modal
    confirmationRef: ConfirmationModalOverlayRef;
    confirmationModalSubscription: Subscription;
    confirmationModalData: { header: string, message: string, confirm: string, cancel: string, height: number, width: number } = {
        header: '',
        message: '',
        confirm: '',
        cancel: 'Cancel',
        height: 200,
        width: 350
    };
    groupTypeId: string;
    nameLength: number;

    constructor(
        @Inject('toastrFactory') private toastrFactory,
        private groupTypeService: GroupTypeService,
        @Inject('localize') private localize,
        @Inject('patSecurityService') private patSecurityService,
        @Inject('AuthZService') private authZ,
        @Inject('$location') private $location,
        @Inject('$routeParams') public $routeParams,
        @Inject('$injector') private $injector,
        private confirmationModalService: ConfirmationModalService
    ) { }

    ngOnInit(): void {
        this.authAccess();
        this.getPageNavigation();
        this.initKendoColumns();
        this.showBackButton = this.$routeParams.subcategory === 'PatientGroupTypes' ? true : false;
        this.getGroupTypes();
    }

    authCreateAccess = () => {
        return this.patSecurityService.IsAuthorizedByAbbreviation('soar-biz-bizgrp-add');
    };

    authDeleteAccess = () => {
        return this.patSecurityService.IsAuthorizedByAbbreviation('soar-biz-bizgrp-delete');
    };

    authEditAccess = () => {
        return this.patSecurityService.IsAuthorizedByAbbreviation('soar-biz-bizgrp-edit');
    };

    authViewAccess = () => {
        return this.patSecurityService.IsAuthorizedByAbbreviation('soar-biz-bizgrp-view');
    };

    authAccess = () => {
        if (!this.authViewAccess()) {
            this.toastrFactory.error(this.localize.getLocalizedString('User is not authorized to access this area.'),
                this.localize.getLocalizedString('Not Authorized'));
            this.$location.path('/');
        } else {
            this.hasCreateAccess = this.authCreateAccess();
            this.hasDeleteAccess = this.authDeleteAccess();
            this.hasEditAccess = this.authEditAccess();
        }
    }

    getPageNavigation = () => {
        this.breadCrumbs = [
            {
                name: this.localize.getLocalizedString('Practice Settings'),
                path: '#/BusinessCenter/PracticeSettings/',
                title: 'Practice Settings'
            },
            {
                name: this.localize.getLocalizedString('Group Types'),
                path: '/BusinessCenter/PatientProfile/GroupTypes/',
                title: 'Group Types'
            }
        ];
    }


    broadcastChannel = (broadcastType, broadcastPayLoad) => {
        var broadCastService = this.$injector.get('BroadCastService');
        broadCastService.publish({ type: broadcastType, payload: broadcastPayLoad });
    }

    initKendoColumns = () => {
        this.columns = [
            {
                field: 'GroupTypeName',
                title: 'Group Type',
                width: '700',
                hasValidations: true,
                validation: {
                    message: this.localize.getLocalizedString('Group Type Name is required.'),
                    maxLength: '64'
                }
            }
        ];
    }

    getGroupTypes = () => {
        this.subscriptions.push(this.groupTypeService.get()?.subscribe({
            next: (groupTypesList: SoarResponse<Array<GroupType>>) => this.groupTypesGetSuccess(groupTypesList),
            error: () => this.groupTypesGetFailure()
        }));
    };

    groupTypesGetSuccess = (apiResponse: SoarResponse<Array<GroupType>>) => {
        // indicate we are getting the list
        this.loading = false;
        this.groupTypes = apiResponse?.Value;
        this.updateGroupTypesAccessRights();
    };

    groupTypesGetFailure = () => {
        this.loading = false;
        this.groupTypes = [];
        this.toastrFactory.error(this.localize.getLocalizedString('Failed to retrieve the list of group types. Refresh the page to try again.'),
            this.localize.getLocalizedString('Error'));
    };

    //add keys to each service types to check for edit/delete rights
    updateGroupTypesAccessRights = () => {
        this.groupTypes = this.groupTypes.map((st) => {
            st = this.updateDeleteRightsViewModel(st);
            st = this.updateEditRightsViewModel(st);
            return st;
        });
    }

    //add keys related to delete rights in each service types
    updateDeleteRightsViewModel = (groupTypes) => {
        const st = groupTypes;
        if (!this.hasDeleteAccess) {
            st.disableDelete = true;
            st.deleteTooltipMessage = this.localize.getLocalizedString("You do not have permission to view this information.");
        } else {
            st.disableDelete = false;
        }
        return st;
    }

    //add keys related to edit rights in each group types
    updateEditRightsViewModel = (groupTypes) => {
        const st = groupTypes;
        if (!this.hasEditAccess) {
            st.disableEdit = true;
            st.editTooltipMessage = this.authZ.generateTitleMessage();
        }
        else {
            st.disableEdit = false;
        }
        return st;
    }

    createGroupType = () => {
        this.formGroup = createFormGroup({
            'GroupTypeName': ''
        });
    }

    editGroupType = (event) => {
        this.groupTypeId = event?.dataItem?.MasterPatientGroupId;
        this.formGroup = createFormGroup(event?.dataItem);
        this.editMode = true;
    }

    saveGroupType = ({ event, isNew }) => {
        this.nameLength = event?.dataItem?.GroupTypeName?.length;
        if (isNew) {
            this.addGroupType(event);
        } else {
            this.updateGroupType(event);
        }
    }
    //Add new service type
    addGroupType = (event) => {
        if (this.authCreateAccess()) {
            const groupType = event?.dataItem;
            this.subscriptions.push(this.groupTypeService.save(groupType)?.subscribe({
                next: (response) => this.createGroupTypeSuccess(response),
                error: (error) => this.createGroupTypeError(error)
            }));
        }
    }

    //Create Service type success
    createGroupTypeSuccess = (apiResponse: SoarResponse<GroupType>) => {
        let groupType = apiResponse?.Value;
        if (groupType) {
        this.groupTypes.unshift(groupType);
        this.groupTypes = this.groupTypes.slice();
        this.broadcastChannel('groupTypes', { mode: 'add', data: groupType });
        this.toastrFactory.success(this.localize.getLocalizedString('Patient group type has been created.'),
            this.localize.getLocalizedString('Success'));
        }
    }

    createGroupTypeError = (error) => {
        error.data.InvalidProperties.forEach((v, k) => {
            if (v.PropertyName === "GroupTypeName" && this.nameLength > 64) {
                this.toastrFactory.error(this.localize.getLocalizedString('Group Type Name cannot be longer than 64 characters.'),
                    this.localize.getLocalizedString('Save Error'));
            }
            else {
                this.toastrFactory.error(v.ValidationMessage + '.', this.localize.getLocalizedString('Save Error'));
            }
        });
    }

    //Update service type
    updateGroupType = (event) => {
        if (this.hasEditAccess) {
            event.dataItem.GroupTypeName = this.formGroup?.controls?.GroupTypeName?.value;
            const groupType = event?.dataItem;
            this.subscriptions.push(this.groupTypeService.update(groupType)?.subscribe({
                next: (response) => this.updateGroupTypeSuccess(response),
                error: (error) => this.updateGroupTypeError(error)
            }));
        }
    }

    // Update Service type Success
    updateGroupTypeSuccess = (apiResponse: SoarResponse<GroupType>) => {
        let groupType = apiResponse?.Value;
        if (groupType) {
        const index = this.groupTypes.findIndex((st) => st?.MasterPatientGroupId === groupType?.MasterPatientGroupId);
        const st = this.updateEditRightsViewModel(groupType);
        this.groupTypes[index] = this.updateDeleteRightsViewModel(st);
        this.groupTypes = this.groupTypes.slice();
        this.broadcastChannel('groupTypes', { mode: 'add', data: groupType });
        this.toastrFactory.success(this.localize.getLocalizedString('Update {0}.', ['successful']),
            this.localize.getLocalizedString('Success'));
        }
    }

    // Update service type Error
    updateGroupTypeError = (error) => {
        error.data.InvalidProperties.forEach((v, k) => {
            if (v.PropertyName) {
                var property = ': ' + v.PropertyName;
            }
            if (v.PropertyName === "GroupTypeName" && this.nameLength > 64) {
                this.toastrFactory.error(this.localize.getLocalizedString('Group Type Name cannot be longer than 64 characters.'),
                    this.localize.getLocalizedString('Error') + property);
            }
            if (v.PropertyName === "MasterPatientGroup.MasterPatientGroup_PracticeId_GroupTypeName_Unique") {
                this.toastrFactory.error(v.ValidationMessage + '.', this.localize.getLocalizedString('Update Error'));
            }
            else {
                this.toastrFactory.error(v.ValidationMessage + '.', this.localize.getLocalizedString('Error') + property);
            }
        });
    }

    deleteGroupType = (event) => {
        this.openDeleteConfirmationModal(event?.dataItem);
    }

    // Confirmation Dialog
    openDeleteConfirmationModal = (groupType: GroupType) => {
        this.confirmationModalData.message = this.localize.getLocalizedString('Are you sure you want to delete') + ' "' + groupType.GroupTypeName + '"?';
        this.confirmationModalData.confirm = 'Delete';
        const data = this.confirmationModalData;
        this.confirmationRef = this.confirmationModalService.open({ data });

        this.confirmationModalSubscription = this.confirmationRef.events.pipe(
            filter((event) => !!event),
            filter((event) => {
                return event.type === 'confirm' || event.type === 'close';
            }),
            take(1)
        ).subscribe((events: any) => {
            switch (events.type) {
                case 'confirm':
                    this.confirmationRef.close();
                    this.validateDelete(groupType);
                    break;
                case 'close':
                    this.confirmationRef.close();
                    this.cancelDelete();
                    break;
            }
        });
    }

    validateDelete = (groupType: GroupType) => {        
        this.groupTypeToDelete = groupType;
        this.deletingGroupType = true;
        this.cannotDeleteGroupTypeName = '';
        this.checkingForPatients = true;
        // check to see if any patient tied to item...
        this.patientsWithGroupType = [];

        this.subscriptions.push(this.groupTypeService.groupTypeWithPatients(this.groupTypeToDelete?.MasterPatientGroupId)?.subscribe({
            next: (response) => this.groupTypeWithPatientsSuccess(response, groupType),
            error: () => this.groupTypeWithPatientsFailure()
        }));
    }

    groupTypeWithPatientsSuccess = (apiResponse: SoarResponse<Array<PatientsWithGroupType>>, groupType: GroupType) => {
        this.patientsWithGroupType = apiResponse?.Value;
        this.checkingForPatients = false;
        // if no patients attached, go ahead and delete it.
        if (this.patientsWithGroupType && this.patientsWithGroupType?.length > 0) {
            // groupType will not be deleted
            this.cannotDeleteGroupTypeName = groupType?.GroupTypeName;
            this.deletingGroupType = false;
            this.groupTypeToDelete = {};
            this.toastrFactory.error(this.localize.getLocalizedString('Patient group type with associated patients can not be deleted.'),
                this.localize.getLocalizedString('Delete Error'));
        } else {
            this.confirmDelete();
        };
    };

    groupTypeWithPatientsFailure = () => {
        this.toastrFactory.error(this.localize.getLocalizedString('Failed to get patients with the group type. Try again.'),
            this.localize.getLocalizedString('Error'));
    };

    confirmDelete = () => {
        this.confirmingDelete = true;
        this.confirmDeleteGroupType();
    };

    confirmDeleteGroupType = () => {
        if (this.hasDeleteAccess) {
            this.confirmingDelete = false;
            this.deletingGroupType = true;
            this.subscriptions.push(this.groupTypeService.delete(this.groupTypeToDelete?.MasterPatientGroupId)?.subscribe({
                next: () => this.deleteGroupTypeSuccess(),
                error: () => this.deleteGroupTypeFailure()
            }));
        }
    };

    deleteGroupTypeSuccess = () => {       
        this.groupTypes.splice(this.groupTypes.findIndex(st => st.GroupTypeName === this.groupTypeToDelete?.GroupTypeName), 1);
        this.groupTypes = this.groupTypes.slice();
        this.broadcastChannel('groupTypes', { mode: 'delete', data: this.groupTypes });
        this.toastrFactory.success(this.localize.getLocalizedString('Successfully deleted the patient group type.'),
            this.localize.getLocalizedString('Success'));
        this.deletingGroupType = false;
        this.groupTypeToDelete = {};
        this.updateGroupTypesAccessRights();
    };

    deleteGroupTypeFailure = () => {
        this.toastrFactory.error(this.localize.getLocalizedString('Failed to delete the patient group type. Try again.'),
            this.localize.getLocalizedString('Error'));
        this.deletingGroupType = false;
        this.groupTypeToDelete = {};
    }

    cancelDelete = () => {
        this.patientsWithGroupType = [];
        this.checkingForPatients = false;
        this.confirmingDelete = false;
        this.groupTypeToDelete = {};
    }    
}
