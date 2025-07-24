import { Component, OnInit, Inject } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Subscription } from 'rxjs';
import { filter, take } from 'rxjs/operators';

import { ConfirmationModalService } from 'src/@shared/components/confirmation-modal/confirmation-modal.service';
import { ConfirmationModalOverlayRef } from 'src/@shared/components/confirmation-modal/confirmation-modal.overlayref';
import { ServiceTypes } from '../../service-code/service-types';
import { CustomServiceType } from '../../service-code/custom-service-type.model';
import { ServiceTypesService } from './service-types.service';
import { TranslateService } from '@ngx-translate/core';

const createFormGroup = dataItem => new FormGroup({
  'Description': new FormControl(dataItem.Description, [Validators.required]),
});

@Component({
  selector: 'service-types',
  templateUrl: './service-types.component.html',
  styleUrls: ['./service-types.component.scss']
})

export class ServiceTypesComponent implements OnInit {
  serviceTypes: ServiceTypes[] = [];
  updatedServiceTypes: CustomServiceType[] = [];
  formGroup: FormGroup = new FormGroup({});
  columns: { field: string, title: string, width: string, hasValidations: boolean, validation: { message: string, maxLength: string } }[] = [];
  breadCrumbs: { name: string, path: string, title: string }[] = [];
  hasViewAccess = false;
  hasCreateAccess = false;
  hasDeleteAccess = false;
  hasEditAccess = false;
  loading = true;
  usePracticesApi = false;

  // Initial filter descriptor
  state = {
    skip: 0,
    sort: [
      {
        field: "Description",
        dir: "asc",
      }
    ],
    filter: {
      logic: "and",
      filters: [{
        field: "Description",
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

  constructor(@Inject('referenceDataService') private referenceDataService,
    @Inject('localize') private localize,
    @Inject('patSecurityService') private patSecurityService,
    @Inject('toastrFactory') private toastrFactory,
    @Inject('$location') private location,
    @Inject('AuthZService') private authZ,
    private confirmationModalService: ConfirmationModalService,
    private serviceTypesService: ServiceTypesService,
    private translate: TranslateService,
  ) {
    this.authAccess();
  }

  async ngOnInit(): Promise<void> {
    this.getPageNavigation();
    this.initKendoColumns();
    const serviceTypes = await this.serviceTypesService.getAll();
    this.serviceTypes = serviceTypes;
    this.updateServiceTypesAccessRights();
    this.loading = false;
  }

  //add keys to each service types to check for edit/delete rights
  updateServiceTypesAccessRights = () => {
    this.updatedServiceTypes = this.serviceTypes.map((st) => {
      st = this.updateDeleteRightsViewModel(st);
      st = this.updateEditRightsViewModel(st);
      return st;
    });
  }

  //add keys related to delete rights in each service types
  updateDeleteRightsViewModel(serviceType: ServiceTypes) {
    const st: CustomServiceType = serviceType;

    if (!this.hasDeleteAccess) {
      st.disableDelete = true;
      st.deleteTooltipMessage = "You do not have permission to view this information";
    } else {
      if (serviceType.IsSystemType) {
        st.disableDelete = true;
        st.deleteTooltipMessage = "This service type cannot be removed as it is a default service type.";
      } else if (serviceType.IsAssociatedWithServiceCode && !serviceType.IsSystemType) {
        st.disableDelete = true;
        st.deleteTooltipMessage = "This service type cannot be removed at this time as there are service codes associated with it.  Please remove these associations and try again.";
      }
    }

    return st;
  }

  //add keys related to edit rights in each service types
  updateEditRightsViewModel(serviceType: ServiceTypes) {
    const st: CustomServiceType = serviceType;

    if (!this.hasEditAccess || (this.hasEditAccess && st.IsSystemType)) {
      st.disableEdit = true;
      st.editTooltipMessage = this.authZ.generateTitleMessage();
    }

    return st;
  }

  //kendo columns
  initKendoColumns() {
    this.columns = [
      {
        field: 'Description',
        title: 'Service Type',
        width: '700',
        hasValidations: true,
        validation: {
          message: 'Service Type Name is required.',
          maxLength: '64'
        }
      }
    ];
  }

  //#region Authorization
  authViewAccess = () => {
    this.hasViewAccess = this.patSecurityService.IsAuthorizedByAbbreviation('soar-biz-bizloc-view');
     return this.hasViewAccess; 
  }

  authCreateAccess = () => {
    this.hasCreateAccess = this.patSecurityService.IsAuthorizedByAbbreviation('soar-biz-bsvct-add');
    return this.hasCreateAccess;
  };

  authDeleteAccess = () => {
    this.hasDeleteAccess = this.patSecurityService.IsAuthorizedByAbbreviation('soar-biz-bsvct-delete');
    return this.hasDeleteAccess;
  };

  authEditAccess = () => {
    this.hasEditAccess = this.patSecurityService.IsAuthorizedByAbbreviation('soar-biz-bsvct-edit');
    return this.hasEditAccess;
  };

  authAccess = () => {
    this.hasViewAccess = this.authViewAccess();
    this.hasCreateAccess = this.authCreateAccess();
    this.hasDeleteAccess = this.authDeleteAccess();
    this.hasEditAccess = this.authEditAccess();

    if (!this.hasViewAccess) {
      this.toastrFactory.error(this.localize.getLocalizedString('User is not authorized to access this area.'), this.localize.getLocalizedString('Not Authorized'));
      this.location.path(encodeURIComponent('/'));
    }
  }

  //end region

  getPageNavigation = () => {
    this.breadCrumbs = [
      {
        name: this.localize.getLocalizedString('Practice Settings'),
        path: '#/BusinessCenter/PracticeSettings/',
        title: 'Practice Settings'
      },
      {
        name: this.localize.getLocalizedString('Service Types'),
        path: '/BusinessCenter/ServiceTypes/',
        title: 'Service Types'
      }
    ];
  }

  addNewServiceType = () => {
    this.formGroup = createFormGroup({
      'Description': ''
    });
  }

  editServiceType = (event) => {
    this.formGroup = createFormGroup(event.dataItem);
  }

  saveServiceType = ({ event, isNew }) => {
    if (isNew) {
      this.addServiceType(event);
    } else {
      this.updateServiceType(event);
    }
  }

  //Add new service type
  addServiceType = (event) => {
    if (this.patSecurityService?.IsAuthorizedByAbbreviation('soar-biz-bsvct-add')) {
      const serviceType = event.dataItem;

      this.serviceTypesService?.save(serviceType)
        .then((res: ServiceTypes) => {
          this.createServiceTypeSuccess(res?.Value)
        }, (error) => {
          this.createServiceTypeError(error);
        });
    }
  }

  //Create Service type success
  createServiceTypeSuccess = (serviceType) => {
    this.updatedServiceTypes?.unshift(serviceType);
    this.updatedServiceTypes = this.updatedServiceTypes?.slice();

    this.toastrFactory?.success(this.localize?.getLocalizedString('Service type has been created.'), this.localize?.getLocalizedString('Success'));
  }

  //Create Service type error
  createServiceTypeError = (error) => {
    error?.data?.InvalidProperties?.forEach((v) => {
      this.toastrFactory?.error(v?.ValidationMessage, this.localize?.getLocalizedString('Save Error'));
    });
  }

  //Update service type
  updateServiceType = (event) => {
    if (this.patSecurityService?.IsAuthorizedByAbbreviation('soar-biz-bsvct-edit')) {
      event.dataItem.Description = this.formGroup?.controls?.Description?.value;
      const serviceType = event.dataItem;

      this.serviceTypesService?.update(serviceType)
        .then((res: ServiceTypes) => {
          this.updateServiceTypeSuccess(res?.Value);
        }, (error) => {
          this.updateServiceTypeError(error);
        });
    }
  }

  // Update Service type Success
  updateServiceTypeSuccess = (serviceType) => {
    const index = this.updatedServiceTypes?.findIndex((st) => st?.ServiceTypeId === serviceType?.ServiceTypeId);
    const st = this.updateEditRightsViewModel(serviceType);

    this.updatedServiceTypes[index] = this.updateDeleteRightsViewModel(st);
    this.updatedServiceTypes = this.updatedServiceTypes?.slice();

    this.toastrFactory?.success(this.localize?.getLocalizedString('Update {0}.', ['successful']), this.localize?.getLocalizedString('Success'));
  }

  // Update service type Error
  updateServiceTypeError = (error) => {
    error?.data?.InvalidProperties?.forEach((v) => {
      this.toastrFactory?.error(v?.ValidationMessage, this.localize?.getLocalizedString('Update Error'));
    });
  }

  deleteServiceType = (event) => {
    //open delete confirmation modal
    this.openDeleteConfirmationModal(event?.dataItem);
  }

  confirmDelete = (serviceType: ServiceTypes) => {
    if (this.patSecurityService?.IsAuthorizedByAbbreviation('soar-biz-bsvct-delete')) {
      this.serviceTypesService?.delete(serviceType?.ServiceTypeId)
        .then(() => {
          this.deleteServiceTypeSuccess(serviceType?.ServiceTypeId);
        }, () => {
          this.deleteServiceTypeFailure();
        });
    }
  }

  //Delete servie type success
  deleteServiceTypeSuccess = (serviceTypeId: string) => {
    this.updatedServiceTypes?.splice(this.updatedServiceTypes?.findIndex(st => st?.ServiceTypeId === serviceTypeId), 1);
    this.updatedServiceTypes = this.updatedServiceTypes?.slice();
    this.toastrFactory?.success(this.localize?.getLocalizedString('Successfully deleted the service type.'), this.localize?.getLocalizedString('Success'));
  }

  //Delete servie type failure
  deleteServiceTypeFailure = () => {
    this.toastrFactory?.error(this.localize?.getLocalizedString('Failed to delete the service type. Try again.'), this.localize?.getLocalizedString('Delete Error'));
  }

  // Confirmation Dialog
  openDeleteConfirmationModal = (serviceType) => {
    this.confirmationModalData.message = this.translate.instant('Deleting "' + String(serviceType?.Description) + '" will result in a loss of all information entered for this Service Type. Continue?');
    this.confirmationModalData.confirm = 'Delete';
    const data = this.confirmationModalData;
    this.confirmationRef = this.confirmationModalService.open({ data });

    this.confirmationModalSubscription = this.confirmationRef.events.pipe(
      filter((event) => !!event),
      filter((event) => {
        return event.type === 'confirm' || event.type === 'close';
      }),
      take(1)
    ).subscribe((events) => {
      switch (events.type) {
        case 'confirm':
          this.confirmationRef.close();
          this.confirmDelete(serviceType);
          break;
        case 'close':
          this.confirmationRef.close();
          break;
      }
    });
  }
}