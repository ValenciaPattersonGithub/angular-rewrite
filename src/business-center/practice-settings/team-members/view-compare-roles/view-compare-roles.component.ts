import { NgTemplateOutlet } from '@angular/common';
import { ChangeDetectorRef, Component, Inject, Input, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { DialogCloseResult, DialogRef, DialogService } from '@progress/kendo-angular-dialog';
import { OrderByPipe } from '../../../../@shared/pipes';
import { RolesFunctions, RolesMatrix, ViewCompareRoleType } from './roles-matrix.model';

@Component({
    selector: 'view-compare-roles',
    templateUrl: './view-compare-roles.component.html',
    styleUrls: ['./view-compare-roles.component.scss']
})
export class ViewCompareRolesComponent implements OnInit {

    constructor(private dialogService: DialogService,
        @Inject('UserServices') private userServices,
        @Inject('toastrFactory') private toastrFactory,
        @Inject('localize') private localize,
        @Inject('patSecurityService') private patSecurityService,
        @Inject('RoleNames') private roleNames,
        private cdr: ChangeDetectorRef) { }

    @ViewChild('viewRoleModalTemplate') viewRoleModal: TemplateRef<NgTemplateOutlet>;
    isCompareRole: boolean = false;
    canViewRoleDetails: boolean;
    dialog: DialogRef;
    isLoading: boolean = false;
    roleMatrix: Array<RolesMatrix>;

    // This is the list suggested by Mike as part of the new "View Roles" modal. PBI 267925
    fuseRoles: Array<string> = [this.roleNames.PracticeAdmin, 'Associate Dentist', 'Office Manager', 'Hygienist', 'Assistant', 'Financial Coordinator', 'Patient Coordinator', 'Business Partner', 'Add on Security Admin Rights', 'Add on Administrative Setup Rights', 'Add on Clinical Setup Rights', 'Add on Managerial Reporting Rights', 'Add on Clinical Reporting Rights', 'Add on Financial Reporting Rights', 'Add on Front Office Reporting Rights'];

    displaySections: Array<{ text: string, value: string }> = [];
    filterDisplaySections: Array<{ text: string, value: string }> = [];///
    filterRoles: Array<{ RoleName: string }> = [];
    roles: Array<{ RoleName: string }> = [];
    selectedRoles: Array<{ RoleName: string }> = [];
    subSections: Array<RolesFunctions> = [];
    defaultItem:{ RoleName: "Select Roles"}
    selectedValue: { RoleName: string } = { RoleName: "" }
    selectedSectionItem: { text: string, value: string } = { text: "", value: "" }

    ngOnInit() {
        this.initialize();
        this.canViewRoleDetails = this.hasViewPRoleDetailAccess();
        this.getRoleMatrix();
        this.getRoles();
    }

    openViewComapreModal = (type: ViewCompareRoleType) => {
        if (type == ViewCompareRoleType.view) {
            this.isCompareRole = false;
            this.viewRoles();
        }
        if (type == ViewCompareRoleType.compare) {
            this.isCompareRole = true;
            this.compareRoles();
        }
    }

    viewRoles = () => {
        if (this.roleMatrix?.length > 0) {
            this.roleMatrix.forEach(modules => {
                modules.active = false;
            });
        }

        this.dialog = this.dialogService?.open({
            content: this.viewRoleModal,
        });
    }

    close = () => {
        this.dialog.close();
        document.body.style.position = '';
        document.body.style.overflow = 'auto';
    };

    hasViewPRoleDetailAccess = () => {
        return this.patSecurityService.IsAuthorizedByAbbreviation('soar-biz-sec-roldet');
    };


    // Handle error response if role matrix could not be fetched from server
    roleMatrixFailure = (error) => {
        this.isLoading = false;
        let validationMessage = error?.data?.InvalidProperties[0]?.ValidationMessage;
        validationMessage = (validationMessage && validationMessage != "") ? (' : ' + validationMessage) : "";
        this.toastrFactory.error(this.localize.getLocalizedString('{0} failed to load.', ['Role Matrix']), this.localize.getLocalizedString('Server Error' + validationMessage));
    };

    checkSelectedRolePermissions = (rolePermissions: Array<string>, selectedRoleName: string) => {
        return rolePermissions?.includes(selectedRoleName);
    }

    toggle = (index: number) => {
        if (this.roleMatrix?.length > 0) {
            this.roleMatrix[index].active = !this.roleMatrix[index]?.active;
        }
    }
    itemDisabled = (itemArgs) => {
            return itemArgs?.dataItem?.RoleName === this.defaultItem?.RoleName;
    }
    initialize = () => {
        this.displaySections = [];
        this.filterDisplaySections = [];
        this.filterRoles = [];
        this.roles = [];
        this.selectedRoles = [];
        this.subSections = [];
        this.selectedValue = { RoleName: "Select Roles" }
        this.selectedSectionItem = { text: "", value: "" }
    }
    //// Get roles from server and load in dropdown list
    getRoles = () => {
        this.isLoading = true;
        var userContext = JSON.parse(sessionStorage.getItem('userContext'));
        var applicationId = userContext?.Result?.Application?.ApplicationId;
        this.userServices?.Roles?.get({ applicationId: applicationId }).$promise.then((res) => {
            this.rolesGetSuccess(res);
        }, (error) => {
            this.rolesGetFailure();
        });
    };

    // Handle success response when roles fetched from server successfully
    rolesGetSuccess = (res) => {
        if (res && res?.Result) {
            res.Result.forEach(role => {
                if (role && role?.RoleName) {
                    var roleName = role.RoleName;
                    switch (roleName) {
                        case "low":
                            role.Order = 1;
                            break;
                        case "medium":
                            role.Order = 2;
                        case "high":
                            role.Order = 3;
                        default:
                            role.Order = 4;
                            break;
                    }
                    if (role.RoleName != 'Patterson Support Admin')
                    {
                        this.roles.push({ RoleName: role["RoleName"] });
                    }
                }
            });
            this.roles = [...this.roles]
            this.roles = this.orderRoles(this.roles)
            this.filterRoles = this.roles;
        }
        this.isLoading = false;
    };

    orderRoles = (roles) => {
        if (roles !== null && roles !== undefined && roles?.length > 0) {
            const orderPipe = new OrderByPipe();
            return orderPipe.transform(roles, { sortColumnName: 'RoleName', sortDirection: 1 });
        } else {
            return roles;
        }
    }

    // Handle error response if roles could not be fetched from server
    rolesGetFailure = () => {
        this.isLoading = false;
        this.toastrFactory?.error(this.localize?.getLocalizedString('{0} failed to load.', ['Roles']), this.localize.getLocalizedString('Server Error'));
    };


    compareRoles = () => {
        if (this.roleMatrix?.length > 0) {
            this.roleMatrix.forEach(modules => {
                modules.active = false;
            });
        }

        this.dialog = this.dialogService?.open({
            content: this.viewRoleModal,
            width: "64%",
            preventAction: (ev) => {
                return ev instanceof DialogCloseResult;
            },
        });
    }



    checkAuthorization = (amfa) => {
        return this.patSecurityService?.IsAuthorizedByAbbreviation(amfa);
    };

    hasEditProviderInfoAccess = () => {
        return this.patSecurityService?.IsAuthorizedByAbbreviation('soar-biz-bizusr-etprov');
    };

    // Get the roles matrix
    getRoleMatrix = () => {
        if (this.canViewRoleDetails) {
            this.isLoading = true;
            this.userServices?.Roles?.getRoleMatrix({}).$promise.then((res) => {
                this.roleMatrixSuccess(res);
            }, (error) => {
                this.roleMatrixFailure(error);
            });
        }
    }

    // Success response for role matrix and parse the json feed
    roleMatrixSuccess = (res) => {
        this.roleMatrix = new Array<RolesMatrix>();
        if (res && res?.Value) {
            var roleMatrix = JSON.parse(res.Value);
            if (roleMatrix?.Modules?.length > 0) {
                roleMatrix.Modules.forEach(modules => {
                    this.displaySections?.push({ text: modules["Name"], value: modules["Name"] });
                    this.roleMatrix.push(modules)
                })
            }
        }
        this.filterDisplaySections = this.displaySections;
        this.isLoading = false;
    };


    //Notify user, he is not authorized to access current area
    notifyNotAuthorized = () => {
        this.toastrFactory?.error(this.localize?.getLocalizedString('User is not authorized to access this area.'), this.localize.getLocalizedString('Not Authorized'));
    };

    // Get the list of subsections based on the change in the sections list -- recheck the currenly selected role
    onSectionSelectedChange = (selectedSection) => {
        let selectedRoleMatrix = this.roleMatrix?.find(x => x.Name == selectedSection?.text)
        if (selectedRoleMatrix && selectedRoleMatrix.Functions && selectedRoleMatrix.Functions.length > 0)
            this.subSections = selectedRoleMatrix.Functions
    }

    onRoleSelectedChange = (role) => {
        this.cdr.detectChanges();
        this.selectedRoles?.push(role)
        let index = this.filterRoles?.findIndex(d => d.RoleName === role?.RoleName); //find index in your array
        this.filterRoles?.splice(index, 1)
        this.filterRoles = this.orderRoles(this.filterRoles)
        this.selectedValue = null
    }
    handleSectionFilter = (value) => {
        this.filterDisplaySections = this.displaySections.filter(
            (s) => s?.text?.toLowerCase()?.indexOf(value?.toLowerCase()) !== -1
        );
    }
    handleRoleFilter = (value) => {
        this.filterRoles = this.roles?.filter(
            (s) => s?.RoleName?.toLowerCase()?.indexOf(value?.toLowerCase()) !== -1
        );
        this.filterRoles = this.filterRoles.filter((item) => !this.selectedRoles.includes(item));
    }
    removeRoles = (role) => {
        let index = this.selectedRoles?.findIndex(d => d?.RoleName === role);
        this.selectedRoles?.splice(index, 1);
        this.filterRoles?.push({ RoleName: role });
        this.filterRoles = this.orderRoles(this.filterRoles)
    }
}


