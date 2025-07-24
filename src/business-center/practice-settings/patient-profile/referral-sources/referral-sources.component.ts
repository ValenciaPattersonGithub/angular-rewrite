import { Component, Inject, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Subscription } from 'rxjs';
import { ConfirmationModalOverlayRef } from 'src/@shared/components/confirmation-modal/confirmation-modal.overlayref';
import { ConfirmationModalService } from 'src/@shared/components/confirmation-modal/confirmation-modal.service';
import { PatientsWithSource, ReferralSource } from './referral-sources';
import { filter, take } from 'rxjs/operators';

const createFormGroup = dataItem => new FormGroup({
  'SourceName': new FormControl(dataItem.SourceName, [Validators.required]),
});

@Component({
  selector: 'referral-sources',
  templateUrl: './referral-sources.component.html',
  styleUrls: ['./referral-sources.component.scss']
})
export class ReferralSourcesComponent implements OnInit {

  hasCreateAccess: boolean = false;
  hasDeleteAccess: boolean = false;
  hasEditAccess: boolean = false;
  hasViewAccess: boolean = false;
  loading: boolean = true;
  confirmingDelete: boolean = false;
  deletingReferralSource: boolean = false;
  editingReferralSource: boolean = false;
  cannotDeleteReferralSourceName: string = "";
  cannotEditReferralSourceName: string = "";
  checkingForPatients: boolean = false;
  breadCrumbs: { name: string, path: string, title: string }[] = [];
  columns: { field: string, title: string, width: string, hasValidations: boolean, validation: { message: string, maxLength: string } }[] = [];
  formGroup: FormGroup = new FormGroup({});
  referralSources: ReferralSource[] = [];
  patientsWithSource: PatientsWithSource[] = [];
  referralSourceToDelete: ReferralSource = {};
  nameLength: number;
  referralSourceToEdit :ReferralSource = {};

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
  //state
  state = {
    skip: 0,
    sort: [
      {
        field: "SourceName"
      }
    ],
    filter: {
      logic: "and",
      filters: [{
        field: "SourceName",
        operator: "contains",
        value: ""
      }],
    }
  };

  constructor(
    @Inject('toastrFactory') private toastrFactory,
    @Inject('ReferralSourcesService') private referralSourcesService,
    @Inject('localize') private localize,
    @Inject('patSecurityService') private patSecurityService,
    @Inject('AuthZService') private authZ,
    @Inject('$location') private $location,
    @Inject('$injector') private $injector,
    private confirmationModalService: ConfirmationModalService) { }

  ngOnInit(): void {
    this.authAccess();
    this.getPageNavigation();
    this.initKendoColumns();
    this.getReferralSources();
  }

  authCreateAccess = () => {
    return this.patSecurityService.IsAuthorizedByAbbreviation('soar-biz-brfsrc-add');
  };

  authDeleteAccess = () => {
    return this.patSecurityService.IsAuthorizedByAbbreviation('soar-biz-brfsrc-delete');
  };

  authEditAccess = () => {
    return this.patSecurityService.IsAuthorizedByAbbreviation('soar-biz-brfsrc-edit');
  };

  authViewAccess = () => {
    return this.patSecurityService.IsAuthorizedByAbbreviation('soar-biz-brfsrc-view');
  };

  authAccess = () => {
    this.hasViewAccess = this.authViewAccess();
    this.hasCreateAccess = this.authCreateAccess();
    this.hasDeleteAccess = this.authDeleteAccess();
    this.hasEditAccess = this.authEditAccess();
    if (!this.hasViewAccess) {
      this.toastrFactory.error(this.localize.getLocalizedString('User is not authorized to access this area.'), this.localize.getLocalizedString('Not Authorized'));
      this.$location.path('/');
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
        name: this.localize.getLocalizedString('Referral Sources'),
        path: '/BusinessCenter/PatientProfile/ReferralSources/',
        title: 'Referral Sources'
      }
    ];
  }

  initKendoColumns = () => {
    this.columns = [
      {
        field: 'SourceName',
        title: 'Referral Source',
        width: '700',
        hasValidations: true,
        validation: {
          message: this.localize.getLocalizedString('Referral Source is required.'),
          maxLength: '64'
        }
      }
    ];
  }

  broadcastChannel = (broadcastType, broadcastPayLoad) => {
    var broadCastService = this.$injector.get('BroadCastService');
    broadCastService.publish({ type: broadcastType, payload: broadcastPayLoad });
  }

  getReferralSources = () => {
    this.referralSourcesService.get(this.referralSourcesGetSuccess, this.referralSourcesGetFailure);
  }

  referralSourcesGetSuccess = (res) => {
    this.loading = false;
    this.referralSources = res.Value;
    this.updateReferralSourcesAccessRights();
  }

  referralSourcesGetFailure = () => {
    this.loading = false;
    this.referralSources = [];
    this.toastrFactory.error(this.localize.getLocalizedString('Failed to retrieve the list of patient referral sources. Refresh the page to try again.'), this.localize.getLocalizedString('Error'));
  }

  //add keys to each service types to check for edit/delete rights
  updateReferralSourcesAccessRights = () => {
    this.referralSources = this.referralSources.map((st) => {
      st = this.updateDeleteRightsViewModel(st);
      st = this.updateEditRightsViewModel(st);
      return st;
    });
  }

  //add keys related to delete rights in each service types
  updateDeleteRightsViewModel = (referralSources) => {
    const st = referralSources;
    if (!this.hasDeleteAccess) {
      st.disableDelete = true;
      st.deleteTooltipMessage = this.localize.getLocalizedString("You do not have permission to view this information.");
    } else {
      st.disableDelete = false;
    }
    return st;
  }

  //add keys related to edit rights in each refferal sources
  updateEditRightsViewModel = (referralSources) => {
    const st = referralSources;
    if (!this.hasEditAccess) {
      st.disableEdit = true;
      st.editTooltipMessage = this.authZ.generateTitleMessage();
    }
    else {
      st.disableEdit = false;
    }
    return st;
  }

  createReferralSource = () => {
    this.formGroup = createFormGroup({
      'SourceName': ''
    });
  }

  editReferralSource = (event) => {
    this.formGroup = createFormGroup(event.dataItem);
  }

  saveReferralSource = ({ event, isNew }) => {
    this.nameLength = event?.dataItem?.SourceName?.length;
    if(!isNew) {
         this.validateEdit(event);
  }
  else {
    this.addReferralSource(event);
  }
}

  validateEdit = (referralSource) => {
    this.referralSourceToEdit = referralSource;
    this.editingReferralSource = true;
    this.cannotEditReferralSourceName = '';
    this.checkingForPatients = true;
    this.patientsWithSource = [];

    this.referralSourcesService.patientsWithSource({ Id: referralSource?.dataItem.PatientReferralSourceId })
      .$promise.then((res) => {
        this.referralSourceEditWithPatientsSuccess(res, referralSource);
      }, () => {
        this.referralSourceEditWithPatientsFailure();
      });

  }
  

  referralSourceEditWithPatientsSuccess = (res, referralSource?: ReferralSource) => {
    this.patientsWithSource = res.Value;
    this.checkingForPatients = false;
    if(this.patSecurityService && this.patientsWithSource?.length > 0) {
      this.cannotEditReferralSourceName = referralSource?.SourceName;
      this.editingReferralSource = false;

      this.confirmationModalData.message = this.localize.getLocalizedString('Changes will take effect for all patients. Continue?', [this.referralSourceToEdit?.SourceName]);
      this.confirmationModalData.confirm = 'Save';
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
            this.updateReferralSource(referralSource)
            break;
          case 'close':
            this.confirmationRef.close();
            break;
        }
      });
    }
    else{
      this.updateReferralSource(referralSource);
    }
  }

  referralSourceEditWithPatientsFailure = () => {
    this.toastrFactory.error(this.localize.getLocalizedString('Failed to retrieve patients associated with the referral source. Try again.'), this.localize.getLocalizedString('Error'));
  }

  addReferralSource = (event) => {
    if (this.authCreateAccess()) {
      const referralSource = event?.dataItem;
      this.referralSourcesService.save(referralSource)
        .$promise.then((res) => {
          this.createReferralSourceSuccess(res.Value)
        }, (error) => {
          this.createReferralSourceError(error);
        });
    }
  }

  createReferralSourceSuccess = (referralSource: ReferralSource) => {
    this.referralSources.unshift(referralSource);
    this.referralSources = this.referralSources.slice();
    this.broadcastChannel('referralSources', { mode: 'add', data: referralSource });
    this.toastrFactory.success(this.localize.getLocalizedString('Your referral source has been created.'), this.localize.getLocalizedString('Success'));
  }

  createReferralSourceError = (error) => {
    error.data.InvalidProperties.forEach((v, k) => {
    if (v.PropertyName === "SourceName" && this.nameLength > 64) {
      this.toastrFactory.error(this.localize.getLocalizedString('Referral Source cannot be longer than 64 characters.'),
          this.localize.getLocalizedString('Save Error'));
  }
  else {
      this.toastrFactory.error(v.ValidationMessage + '.', this.localize.getLocalizedString('Save Error'));
  }
  });
  }
  updateReferralSource = (event) => {
    if (this.hasEditAccess) {
      event.dataItem.SourceName = this.formGroup.controls.SourceName?.value;
      const referralSource = event?.dataItem;
      this.referralSourcesService.update(referralSource)
        .$promise.then((res) => {
          this.updateReferralSourceSuccess(res.Value);
        }, (error) => {
          this.updateReferralSourceError(error);
        });
    }
  }

  updateReferralSourceSuccess = (referralSource: ReferralSource) => {
    const index = this.referralSources.findIndex((st) => st?.PatientReferralSourceId === referralSource?.PatientReferralSourceId);
    const st = this.updateEditRightsViewModel(referralSource);
    this.referralSources[index] = this.updateDeleteRightsViewModel(st);
    this.referralSources = this.referralSources.slice();
    this.broadcastChannel('referralSources', { mode: 'update', data: referralSource });
    this.toastrFactory.success(this.localize.getLocalizedString('Update {0}.', ['successful']), this.localize.getLocalizedString('Success'));

  }

  // Update service type Error
  updateReferralSourceError = (error) => {
    error.data.InvalidProperties.forEach((v, k) => {
      if (v.PropertyName) {
          var property = ': ' + v.PropertyName;
      }
      if (v.PropertyName === "SourceName" && this.nameLength > 64) {
          this.toastrFactory.error(this.localize.getLocalizedString('Referral Source cannot be longer than 64 characters.'),
              this.localize.getLocalizedString('Error') + property);
      }
      if (v.PropertyName === "PatientReferralSource.PatientReferralSource_PracticeId_SourceName_Unique") {
          this.toastrFactory.error(v.ValidationMessage + '.', this.localize.getLocalizedString('Update Error'));
      }
      else {
          this.toastrFactory.error(v.ValidationMessage + '.', this.localize.getLocalizedString('Error') + property);
      }
  });
    this.toastrFactory.error(this.localize.getLocalizedString('Update was unsuccessful. Please retry your save.'), this.localize.getLocalizedString('Server Error'));
  }

  deleteReferralSource = (event) => {
    this.openDeleteConfirmationModal(event?.dataItem);
  }

  // Confirmation Dialog
  openDeleteConfirmationModal = (referralSource: ReferralSource) => {
    this.confirmationModalData.message = this.localize.getLocalizedString('Are you sure you want to delete') + ' "' + referralSource.SourceName + '"?';
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
          this.validateDelete(referralSource);
          break;
        case 'close':
          this.confirmationRef.close();
          this.cancelDelete();
          break;
      }
    });
  }

  validateDelete = (referralSource: ReferralSource) => {
    this.referralSourceToDelete = referralSource;
    this.deletingReferralSource = true;
    this.cannotDeleteReferralSourceName = '';
    this.checkingForPatients = true;
    this.patientsWithSource = [];

    this.referralSourcesService.patientsWithSource({ Id: this.referralSourceToDelete?.PatientReferralSourceId })
      .$promise.then((res) => {
        this.referralSourceWithPatientsSuccess(res, referralSource);
      }, (error) => {
        this.referralSourceWithPatientsFailure();
      });

  }

  referralSourceWithPatientsSuccess = (res, referralSource: ReferralSource) => {
    this.patientsWithSource = res.Value;
    this.checkingForPatients = false;
    // if no patients attached, go ahead and delete it.
    if (this.patSecurityService && this.patientsWithSource?.length > 0) {
      // Referral Source will not be deleted
      this.cannotDeleteReferralSourceName = referralSource?.SourceName;
      this.deletingReferralSource = false;
      this.referralSourceToDelete = {};
      this.toastrFactory.error(this.localize.getLocalizedString('This Referral Source is assigned to patients and cannot be deleted.'), this.localize.getLocalizedString('Delete Error'));
    } else {
      this.confirmDelete();
    };
  }

  referralSourceWithPatientsFailure = () => {
    this.toastrFactory.error(this.localize.getLocalizedString('Failed to retrieve patients associated with the referral source. Try again.'), this.localize.getLocalizedString('Error'));
  }

  confirmDelete = () => {
    this.confirmingDelete = true;
    this.confirmDeleteReferralSource();
  };

  confirmDeleteReferralSource = () => {
    if (this.hasDeleteAccess) {
      this.confirmingDelete = false;
      this.deletingReferralSource = true;
      this.referralSourcesService.delete({ Id: this.referralSourceToDelete?.PatientReferralSourceId })
        .$promise.then((res) => {
          this.deleteReferralSourceSuccess();
        }, (error) => {
          this.deleteReferralSourceFailure();
        });
    }
  };

  deleteReferralSourceSuccess = () => {
    this.referralSources.splice(this.referralSources.findIndex(st => st.SourceName === this.referralSourceToDelete?.SourceName), 1);
    this.referralSources = this.referralSources.slice();
    this.broadcastChannel('referralSources', { mode: 'delete', data: this.referralSources });
    this.toastrFactory.success(this.localize.getLocalizedString('Successfully deleted the patient referral source.'), this.localize.getLocalizedString('Success'));
    this.deletingReferralSource = false;
    this.referralSourceToDelete = {};
    this.updateReferralSourcesAccessRights();
  }

  deleteReferralSourceFailure = () => {
    this.toastrFactory.error(this.localize.getLocalizedString('Failed to delete the patient referral source. Try again.'), this.localize.getLocalizedString('Error'));
    this.deletingReferralSource = false;
    this.referralSourceToDelete = {};

  }
  cancelDelete = () => {
    this.patientsWithSource = [];
    this.checkingForPatients = false;
    this.confirmingDelete = false;
    this.referralSourceToDelete = {};
  }

}
