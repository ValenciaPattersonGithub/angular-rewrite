import { Component, Inject, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Subscription } from 'rxjs';
import { filter, take } from 'rxjs/operators';
import { ConfirmationModalOverlayRef } from 'src/@shared/components/confirmation-modal/confirmation-modal.overlayref';
import { ConfirmationModalService } from 'src/@shared/components/confirmation-modal/confirmation-modal.service';
import { MasterAlerts } from './master-alerts';
import { MasterAlertService } from 'src/@shared/providers/master-alert.service';
import { Patient } from 'src/patient/common/models/patient.model';

const createFormGroup = dataItem => new FormGroup({
  'Description': new FormControl(dataItem.Description, [Validators.required]),
  'SymbolId': new FormControl(dataItem.SymbolId)
});

@Component({
  selector: 'master-alerts',
  templateUrl: './master-alerts.component.html',
  styleUrls: ['./master-alerts.component.scss']
})
export class MasterAlertsComponent implements OnInit {
  breadCrumbs: { name: string, path: string, title: string }[] = [];
  loading: boolean = false;
  saving: boolean = false;
  hasCreateAccess: boolean = false;
  hasDeleteAccess: boolean = false;
  hasEditAccess: boolean = false;
  hasViewAccess: boolean = false;
  symbolList;
  symbolListForDropdown;
  masterAlertTypes: MasterAlerts[] = [];
  masterAlert: MasterAlerts = {};
  columns: { field: string, title: string, width: string, filterable: boolean, hasValidations: boolean, validation: { message: string, maxLength: string } }[] = [];
  formGroup: FormGroup;
  fadeIn: boolean = false;
  fadeOut: boolean = false;
  editedRowIndex: number;
  rowIndex: number;
  senderObject;
  selectedSymbol;
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
  // Initial filter
  state = {
    skip: 0,
    sort: [
      {
        field: "Description"
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
  public defaultItem: { Name: string, AlertIconId: number } = {
    Name: "(none)",
    AlertIconId: null
  };
  showButton: boolean = false;
  showOperator: boolean = true;
  noRecordsMessage:string;
  isInputDuplicate: boolean;
  constructor(
    @Inject('toastrFactory') private toastrFactory,
    @Inject('localize') private localize,
    @Inject('patSecurityService') private patSecurityService,
    @Inject('$location') private $location,
    @Inject('StaticData') private staticData,
    @Inject('$injector') private $injector,
    private masterAlertService: MasterAlertService,
    private confirmationModalService: ConfirmationModalService
  ) { }

  ngOnInit(): void {
    this.loading = true;
    this.saving = false;
    this.noRecordsMessage = this.localize.getLocalizedString('No records available');
    this.authAccess();
    this.getPageNavigation();
    this.getMasterAlerts();
    // list of symbols that can be used
    this.staticData.AlertIcons()
    .then((alertIcons) => {
        this.symbolList = alertIcons; 
        this.symbolList?.Value?.forEach((symbol) => {
          symbol.AlertIconId = symbol.AlertIconId.toString();
        });
    });
  }

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

  authCreateAccess = () => {
    return this.patSecurityService.IsAuthorizedByAbbreviation('soar-biz-bmalrt-add');
  }

  authDeleteAccess = () => {
    return this.patSecurityService.IsAuthorizedByAbbreviation('soar-biz-bmalrt-delete');
  }

  authEditAccess = () => {
    return this.patSecurityService.IsAuthorizedByAbbreviation('soar-biz-bmalrt-edit');
  }

  authViewAccess = () => {
    return this.patSecurityService.IsAuthorizedByAbbreviation('soar-biz-bmalrt-view');
  }

  getPageNavigation = () => {
    this.breadCrumbs = [
      {
        name: this.localize.getLocalizedString('Practice Settings'),
        path: '#/BusinessCenter/PracticeSettings/',
        title: 'Practice Settings'
      },
      {
        name: this.localize.getLocalizedString('Master Flags'),
        path: '/BusinessCenter/PatientProfile/Flags/',
        title: 'Master Flags'
      }
    ];
  }

  getMasterAlerts = () => {
    this.masterAlertService.get().then((res) => {
      this.masterAlertGetSuccess(res);
    }, (error) => {
      this.masterAlertsGetFailure();
    })
  }

  masterAlertGetSuccess = (res) => {
    this.masterAlertTypes = res?.Value;
    this.masterAlertTypes.forEach(d => {
        if (d.SymbolId == null) {
            d.SymbolId = '0';
        }
    });
    this.loading = false;
  }

  masterAlertsGetFailure = () => {
    this.loading = false;
    this.masterAlertTypes = [];
    this.toastrFactory.error(this.localize.getLocalizedString('Failed to retrieve the list of flags. Refresh the page to try again.'), this.localize.getLocalizedString('Error'));
  }

  // getting symbol class
  getClass = (id) => {
    let iconClass = ""
    if (id !== null && id !== undefined) {
      iconClass = this.symbolList?.Value?.length > 0 ? this.symbolList?.Value.find(x => x.AlertIconId === id).Name : "";
    }
    return iconClass;
  }

  broadcastChannel = (broadcastType, broadcastPayLoad) => {
    var broadCastService = this.$injector.get('BroadCastService');
    broadCastService.publish({ type: broadcastType, payload: broadcastPayLoad });
  }

  createMasterAlert = ({ sender }) => {
    this.closeEditor(sender);
    this.formGroup = createFormGroup({
      'Description': '',
      'SymbolId': null
    });
    sender.addRow(this.formGroup);
  }

  saveMasterAlert = ({ sender, rowIndex, isNew }) => {
    this.senderObject = sender;
    if (isNew) {
      this.addMasterAlertType();
    } else {
      this.updateMasterAlertsType(sender, rowIndex);
    }
    sender.closeRow(rowIndex);
  }

  addMasterAlertType = () => {
    this.masterAlert = {};
    if (this.authCreateAccess()) {
      if(this.duplicateCheck(this.formGroup?.controls['Description']?.value)){
        return
      }
      this.masterAlert.Description = this.formGroup?.controls['Description']?.value;
      this.masterAlert.SymbolId = this.formGroup?.controls['SymbolId']?.value;
      this.masterAlertService.save(this.masterAlert)
        .then((res) => {
          this.createMasterTypeSuccess(res)
        }, (error) => {
          this.createMasterTypeError();
        });
    }
  }

  createMasterTypeSuccess = (alertType: MasterAlerts) => {
    this.masterAlertTypes.unshift(alertType);
    this.masterAlertTypes = this.masterAlertTypes.slice();
    this.broadcastChannel('masterAlerts', { mode: 'add', data: alertType });
    this.toastrFactory.success(this.localize.getLocalizedString('Your flag has been created.'), this.localize.getLocalizedString('Success'));
    this.saving = false;
    this.getMasterAlerts();
  }

  createMasterTypeError = () => {
    this.toastrFactory.error(this.localize.getLocalizedString('There was an error and your flag was not created.'), this.localize.getLocalizedString('Server Error'));
    this.saving = false;
  }

  updateMasterAlertsType = (senderObject, rowIndex) => {
    this.masterAlert = {};
    if (this.hasEditAccess) {
      this.masterAlert = senderObject?.data?.data[rowIndex];
      if(this.duplicateCheck(this.formGroup?.value?.Description)){
        return
      }
      if (this.masterAlert) {
        this.masterAlert.SymbolId = this.formGroup?.value?.SymbolId;
        this.masterAlert.Description = this.formGroup?.value?.Description;
      }
      this.masterAlertService.update(this.masterAlert)
        .then((res) => {
          this.updateMasterAlertTypeSuccess(res);
        }, (error) => {
          this.updateMasterAlertTypeError();
        });
    }
  }

  updateMasterAlertTypeSuccess = (alertType: MasterAlerts) => {
    if (alertType?.SymbolId == "") {
      alertType.SymbolId = null;
    }
    this.broadcastChannel('masterAlerts', { mode: 'update', data: alertType });
    this.toastrFactory.success(this.localize.getLocalizedString('Update {0}.', ['successful']), this.localize.getLocalizedString('Success'));
    this.getMasterAlerts();
  }

  updateMasterAlertTypeError = () => {
    this.toastrFactory.error(this.localize.getLocalizedString('Update was unsuccessful. Please retry your save.'), this.localize.getLocalizedString('Server Error'));
  }

  editMasterAlert = ({ sender, rowIndex, dataItem }) => {
    this.closeEditor(sender);  
    this.formGroup = createFormGroup(dataItem);
    this.editedRowIndex = rowIndex;
    sender.editRow(rowIndex, this.formGroup);
  }

  cancelMasterAlert = ({ sender, rowIndex }) => {
    this.closeEditor(sender, rowIndex);
  }

  closeEditor = (grid, rowIndex = this.editedRowIndex) => {
    grid.closeRow(rowIndex);
    this.editedRowIndex = undefined;
    this.formGroup = undefined;
  }

  removeMasterAlert = ({ dataItem }) => {
    if (this.hasDeleteAccess) {
      this.validateDelete(dataItem);
    }
  }

  validateDelete = (masterAlert: MasterAlerts) => {
    let masterAlertId = masterAlert?.MasterAlertId;
    if(masterAlertId)
    {
    this.masterAlertService.alertsWithPatients(masterAlertId)
      .then((res: Patient) => {
        if (res && res?.Value && res?.Value?.length > 0) {
          this.alertsWithPatientsSuccess(res.Value);
        } else if (res?.Value?.length === 0) {
          this.openDeleteConfirmationModal(masterAlert);
         }
      }, (error) => {
        this.alertsWithPatientsError();
      });
    }
  }

  alertsWithPatientsSuccess = (res) => {
    this.toastrFactory.error(this.localize.getLocalizedString('This Flag is assigned to patients and cannot be deleted.'));
  }

  alertsWithPatientsError = () => {
    this.toastrFactory.error(this.localize.getLocalizedString('Failed to get patients with the flag. Try again.'), this.localize.getLocalizedString('Error'));
  }

  openDeleteConfirmationModal = (masterAlert: MasterAlerts) => {
    this.confirmationModalData.message = this.localize.getLocalizedString('Are you sure you want to delete') + ' "' + masterAlert?.Description + '"?';
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
          this.confirmDeleteMasterAlert(masterAlert);
          break;
        case 'close':
          this.confirmationRef.close();
          break;
      }
    });
  }

  confirmDeleteMasterAlert = (masterAlert: MasterAlerts) => {
    if (this.hasDeleteAccess) {
      this.masterAlertService.delete(masterAlert?.MasterAlertId)
        .then((res) => {
          this.deleteGroupTypeSuccess(masterAlert?.MasterAlertId);
        }, (error) => {
          this.deleteGroupTypeFailure();
        });
    }
  }

  deleteGroupTypeSuccess = (masterAlertId: string) => {
    this.masterAlertTypes.splice(this.masterAlertTypes.findIndex(st => st.MasterAlertId == masterAlertId), 1);
    this.masterAlertTypes = this.masterAlertTypes.slice();
    this.broadcastChannel('masterAlerts', { mode: 'delete', data: masterAlertId });
    this.toastrFactory.success(this.localize.getLocalizedString('Successfully deleted the flag.'),
      this.localize.getLocalizedString('Success'));
  }

  deleteGroupTypeFailure = () => {
    this.toastrFactory.error(this.localize.getLocalizedString('Failed to delete the flag. Try again.'), this.localize.getLocalizedString('Error'));
  }

  // check duplicate 
  duplicateCheck = (description) => {
    this.isInputDuplicate = false;
    if (description === "") {
      return this.isInputDuplicate
    } else {
      const filteredCondition = this.masterAlertTypes?.find(flag => flag?.Description?.trim()?.toLowerCase() === description?.trim()?.toLowerCase() && flag?.MasterAlertId !== this.masterAlert?.MasterAlertId);
      if (filteredCondition) {
        this.isInputDuplicate = true;
        this.toastrFactory.error(this.localize.getLocalizedString('Duplicate Flag'), this.localize.getLocalizedString('Error'));
      }
    }
    return this.isInputDuplicate
  };

}