import { Component, OnInit, Inject, ViewChild, EventEmitter, TemplateRef, Output, ViewContainerRef, ChangeDetectorRef, ElementRef, OnDestroy } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Subscription } from 'rxjs';
import { filter, take } from 'rxjs/operators';
import { ConfirmationModalService } from 'src/@shared/components/confirmation-modal/confirmation-modal.service';
import { ConfirmationModalOverlayRef } from 'src/@shared/components/confirmation-modal/confirmation-modal.overlayref';
import { DialogRef } from '@progress/kendo-angular-dialog';
import { NgTemplateOutlet } from '@angular/common';
import { IdentifiersListItems, PatientAdditionalIdentifiers } from './patient-additional-identifier';
import { AddEvent, CancelEvent, EditEvent, GridComponent, SaveEvent } from '@progress/kendo-angular-grid';
import { PatientAdditionalIdentifierService } from './patient-additional-identifier.service';
import { SoarResponse } from 'src/@core/models/core/soar-response';


@Component({
  selector: 'patient-additional-identifiers',
  templateUrl: './patient-additional-identifiers.component.html',
  styleUrls: ['./patient-additional-identifiers.component.scss']
})
export class PatientAdditionalIdentifiersComponent implements OnInit, OnDestroy {

  dialog: DialogRef;
  @ViewChild('templateRef') templateElement: TemplateRef<NgTemplateOutlet>;
  @ViewChild("container", { read: ViewContainerRef })
  public containerRef: ViewContainerRef;
  patientAdditionalIdentifiers: PatientAdditionalIdentifiers[] = [];
  formGroup: FormGroup = new FormGroup({});
  columns: { field: string, title: string, width: string, hasValidations: boolean, validation: { message: string, maxLength: string } }[] = [];
  breadCrumbs: { name: string, path: string, title: string }[] = [];
  hasViewAccess: boolean = false;
  hasCreateAccess: boolean = false;
  hasDeleteAccess: boolean = false;
  hasEditAccess: boolean = false;
  loading: boolean = true;
  closeDialog: boolean = false;
  isDialogOpen: boolean = true;
  subscriptions: Array<Subscription> = new Array<Subscription>();

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

  //Properties For the Identifier's List item Modal pop-up
  @ViewChild('inpAdditionalIdentifierName') inpAdditionalIdentifierName: ElementRef;
  patientAdditionalIdentifier: PatientAdditionalIdentifiers = new PatientAdditionalIdentifiers('', '', false);
  previousPatientAdditionalIdentifierValue: PatientAdditionalIdentifiers = new PatientAdditionalIdentifiers('', '', false);
  dialogSettings: { width: string } = { width: "50%" }
  showReOrderListButtons: boolean = false;
  previousIdentifiersListItemValue: string = '';
  selcterIdentifiersListItemId: string = '';
  editedRowIndex: number;
  public listItemformGroup: FormGroup;
  ifIdentifierUpdated: boolean = false
  ifIdentifierisDuplicated: boolean = false;
  listValueIsEmpty: boolean = false;
  isEditIdentifierMode: boolean = false;
  AdditionalIdentifierName: Array<string> = new Array();
  identifierListItemValuesValidation: string = '';
  existingListItems: Array<string> = new Array<string>();

  //Pop Up to confirm Identifiers Changes
  saveIdentifiersConfirmationRef: ConfirmationModalOverlayRef;
  saveIdentifiersConfirmationModalSubscription: Subscription;
  saveIdentifiersConfirmationModalData: { header: string, message: string, confirm: string, cancel: string, height: number, width: number } = {
    header: '',
    message: '',
    confirm: 'Yes',
    cancel: 'No',
    height: 200,
    width: 550
  };

  constructor(@Inject('referenceDataService') private referenceDataService,
    @Inject('localize') private localize,
    @Inject('patSecurityService') private patSecurityService,
    @Inject('toastrFactory') private toastrFactory,
    @Inject('$location') private location,
    @Inject('AuthZService') private authZ,
    private patientAdditionalIdentifierService: PatientAdditionalIdentifierService,
    @Inject('$injector') private $injector,
    private changeDetector: ChangeDetectorRef,
    private confirmationModalService: ConfirmationModalService) {
    this.authAccess();
  }

  ngOnInit(): void {
    this.getPageNavigation();
    this.initKendoColumns();
    this.loading = true;
    this.getPatientAdditionalIdentifiers();
    this.updatePatientAdditionalIdentifiers();

  }

  ngAfterViewChecked() {
    this.changeDetector.detectChanges();
  }
  // Method to get the master list
  isLoading = true;
  getPatientAdditionalIdentifiers = () => {
    this.subscriptions.push(this.patientAdditionalIdentifierService.getPatientAdditionalIdentifiers()?.subscribe({
      next: (additionalIdentifiersList: SoarResponse<Array<PatientAdditionalIdentifiers>>) => this.patientAdditionalIdGetSuccess(additionalIdentifiersList),
      error: () => this.patientAdditionalIdGetFailure()
    }));
  };

  patientAdditionalIdGetSuccess = (res: SoarResponse<Array<PatientAdditionalIdentifiers>>) => {
    // indicate we are getting the list
    this.loading = false;
    this.patientAdditionalIdentifiers = res?.Value;
    this.updatePatientAdditionalIdentifiers();
  };

  patientAdditionalIdGetFailure = () => {
    this.loading = false;
    this.patientAdditionalIdentifiers = [];
    this.toastrFactory.error(this.localize
      .getLocalizedString('Failed to retrieve the list of patient additional identifiers. Refresh the page to try again.'),
      this.localize.getLocalizedString('Error'));
  }
  //add keys related to IsSpecifiedListName 
  updatePatientAdditionalIdentifiers = () => {

    this.patientAdditionalIdentifiers.map((st) => {
      st = this.updateIsSpecifiedList(st);
      st = this.updateDeleteRightsViewModel(st)
      st = this.updateEditRightsViewModel(st)
      return st;
    });
  }
  //add keys related to IsSpecifiedListName 
  updateIsSpecifiedList(patientAdditionalIdentifiers: PatientAdditionalIdentifiers) {
    const st: PatientAdditionalIdentifiers = patientAdditionalIdentifiers;
    st.IsSpecifiedListName = patientAdditionalIdentifiers.IsSpecifiedList ? 'Specified List' : 'Free Form Text'
    return st;
  }
  //add keys related to delete rights in each PatientAdditionalIdentifiers
  updateDeleteRightsViewModel(patientAdditionalIdentifiers) {
    const st = patientAdditionalIdentifiers;

    if (!this.hasDeleteAccess) {
      st.disableDelete = true;
      st.deleteTooltipMessage = "You do not have permission to view this information";
    } else {
      if (patientAdditionalIdentifiers.IsUsed) {
        st.disableDelete = true;
        st.deleteTooltipMessage = "Item has been previously selected as a response and cannot be deleted.";
      }
    }

    return st;
  }

  //add keys related to edit rights in each PatientAdditionalIdentifiers
  updateEditRightsViewModel(patientAdditionalIdentifiers) {
    const st = patientAdditionalIdentifiers;

    if (!this.hasEditAccess) {
      st.disableEdit = true;
      st.editTooltipMessage = this.authZ.generateTitleMessage();
    }

    return st;
  }

  //kendo columns
  initKendoColumns() {
    this.columns = [
      {
        field: "Description",
        title: this.localize.getLocalizedString("Patient Additional Identifier"),
        width: '700',
        hasValidations: false,
        validation: null
      },
      {
        field: "IsSpecifiedListName",
        title: " ",
        width: '150',
        hasValidations: false,
        validation: null
      }
    ];
  }

  //#region Authorization
  authViewAccess = () => {
    return this.patSecurityService.IsAuthorizedByAbbreviation('soar-biz-aipat-view');
  }

  authCreateAccess = () => {
    return this.patSecurityService.IsAuthorizedByAbbreviation('soar-biz-aipat-manage');
  };

  authDeleteAccess = () => {
    return this.patSecurityService.IsAuthorizedByAbbreviation('soar-biz-aipat-manage');
  };

  authEditAccess = () => {
    return this.patSecurityService.IsAuthorizedByAbbreviation('soar-biz-aipat-manage');
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
        name: this.localize.getLocalizedString('Patient Profile Additional Identifiers'),
        path: '/BusinessCenter/Additionalidentifiers/',
        title: 'Patient Profile Additional Identifiers'
      }
    ];

  }


  broadcastChannel = (broadcastType, broadcastPayLoad) => {
    var broadCastService = this.$injector.get('BroadCastService');
    broadCastService.publish({ type: broadcastType, payload: broadcastPayLoad });
  }

  deletePatientAdditionalIdentifiers = (event) => {
    //open delete confirmation modal
    this.openDeleteConfirmationModal(event.dataItem);
  }

  // Confirmation Dialog
  openDeleteConfirmationModal = (patientAdditionalIdentifier) => {
    const patientAdditionalIdentifierData = patientAdditionalIdentifier;
    this.confirmationModalData.message = 'Deleting "' + patientAdditionalIdentifier?.Description + '" will result in a loss of information for all patients. Continue?';
    this.confirmationModalData.confirm = 'Delete';
    const data = this.confirmationModalData;
    this.confirmationRef = this.confirmationModalService.open({ data });

    this.confirmationModalSubscription = this.confirmationRef.events.pipe(
      filter((event) => !!event),
      filter((event) => {
        return event.type === 'confirm' || event.type === 'close';
      }),
      take(1)
    )?.subscribe((events) => {
      switch (events?.type) {
        case 'confirm':
          this.confirmationRef.close();
          this.confirmDelete(patientAdditionalIdentifierData);
          break;
        case 'close':
          this.confirmationRef.close();
          break;
      }
    });
  }
  confirmDelete = (patientAdditionalIdentifier) => {
    if (this.authDeleteAccess) {
      let masterPatientIdentifierId = patientAdditionalIdentifier?.MasterPatientIdentifierId;
      this.subscriptions.push(this.patientAdditionalIdentifierService.delete(masterPatientIdentifierId)?.subscribe({
        next: () => this.deleteAdditionalIdentifierSuccess(masterPatientIdentifierId),
        error: () => this.deleteAdditionalIdentifierFailure()
      }));
    };
  }

  //Delete delete Additional Identifier success
  deleteAdditionalIdentifierSuccess = (MasterPatientIdentifierId) => {
    this.patientAdditionalIdentifiers?.splice(this.patientAdditionalIdentifiers?.findIndex(st => st?.MasterPatientIdentifierId === MasterPatientIdentifierId), 1);
    this.patientAdditionalIdentifiers = this.patientAdditionalIdentifiers?.slice();
    this.toastrFactory.success(this.localize.getLocalizedString('Successfully deleted the service type.'), this.localize.getLocalizedString('Success'));
  }

  //Delete delete Additional Identifier failure
  deleteAdditionalIdentifierFailure = () => {
    this.toastrFactory.error(this.localize.getLocalizedString('Failed to delete the service type. Try again.'), this.localize.getLocalizedString('Delete Error'));
  }



  // ______________Add/Edit Addtional Identifiers In Pop-up funcationality_____________
  editPatientAdditionalIdentifiers = (event) => {
    this.closeDialog = false;
    this.isEditIdentifierMode = true;
    this.patientAdditionalIdentifier = event?.dataItem;
    Object.assign(this.previousPatientAdditionalIdentifierValue, event?.dataItem);
    this.ifIdentifierUpdated = false;
    this.patientAdditionalIdentifier.ListValues = (event?.dataItem?.ListValues) ? event.dataItem.ListValues : [];
    this.getExistingListItemsName();
  }
  addNewPatientAdditionalIdentifiers = () => {
    this.closeDialog = false;
    this.ifIdentifierUpdated = false;
    this.isEditIdentifierMode = false;
    this.patientAdditionalIdentifier = new PatientAdditionalIdentifiers('', '', false);
    this.patientAdditionalIdentifier.ListValues = new Array<IdentifiersListItems>();
    this.getExistingListItemsName();
  }
  getExistingListItemsName = () => {
    this.existingListItems = new Array<string>();
    this.patientAdditionalIdentifier?.ListValues?.forEach(listItem => {
      this.existingListItems.push(listItem?.Value)
    })

    this.AdditionalIdentifierName = new Array<string>();
    this.patientAdditionalIdentifiers?.forEach(identifier => {
      if (identifier?.Description != this.patientAdditionalIdentifier?.Description) {
        this.AdditionalIdentifierName.push(identifier?.Description);
      }
    });
  }
  getValueFieldValidation = (value) => {
    if (value == '') {
      this.identifierListItemValuesValidation = this.localize.getLocalizedString('Value is required.')
    } else if (value?.length > 24) {
      this.identifierListItemValuesValidation = this.localize.getLocalizedString("Value must be 1 to 24 characters.")
    } else {
      this.identifierListItemValuesValidation = '';
    }
  }

  // Addtional Identifier's List Items operations
  addListItem = ({ sender }: AddEvent): void => {
    this.identifierListItemValuesValidation = '';
    this.showReOrderListButtons = true;
    this.closeEditor(sender);
    this.listItemformGroup = new FormGroup({
      Value: new FormControl(
        "",
        Validators.compose([
          Validators.required,
          Validators.maxLength(24),
        ])
      ),
    });
    sender.addRow(this.listItemformGroup);
  }

  previousMasterPatientIdentifierListItemsId: string = '';
  editListItem = ({ sender, rowIndex, dataItem }: EditEvent): void => {
    this.showReOrderListButtons = true;
    this.identifierListItemValuesValidation = '';
    this.previousIdentifiersListItemValue = dataItem?.Value;
    this.previousMasterPatientIdentifierListItemsId = dataItem?.MasterPatientIdentifierListItemsId;
    this.closeEditor(sender);
    this.listItemformGroup = new FormGroup({
      Value: new FormControl(dataItem?.Value)
    });
    this.editedRowIndex = rowIndex;
    sender.editRow(rowIndex, this.listItemformGroup);
  }

  cancelListItem = ({ sender, rowIndex, dataItem }: CancelEvent): void => {
    this.patientAdditionalIdentifier?.ListValues.forEach(item => {
      if (item?.MasterPatientIdentifierListItemsId == dataItem?.MasterPatientIdentifierListItemsId
        && item?.Order == dataItem?.Order) {
        item.Value = this.previousIdentifiersListItemValue;
      }
    })
    sender.closeRow(rowIndex);
    this.showReOrderListButtons = false;
  }

  saveListItem = ({ sender, rowIndex, formGroup, isNew, dataItem }: SaveEvent): void => {
    if (this.identifierListItemValuesValidation == '') {
      let newValue = formGroup?.value?.Value;
      if (isNew) {
        if (!this.existingListItems.includes(newValue)) {
          let listCount = this.patientAdditionalIdentifier?.ListValues?.length;
          listCount = listCount > 0 ? listCount + 1 : 1;
          const newListItem = new IdentifiersListItems(this.patientAdditionalIdentifier?.MasterPatientIdentifierId, newValue, listCount, false);
          this.patientAdditionalIdentifier?.ListValues.push(newListItem)
          this.ifIdentifierUpdated = true;
          this.getExistingListItemsName();
        }
      } else {
        this.patientAdditionalIdentifier?.ListValues.forEach(p => {
          if (p?.MasterPatientIdentifierListItemsId == this.previousMasterPatientIdentifierListItemsId
            && p?.Order == dataItem?.Order) {
            if (!this.existingListItems.includes(dataItem?.Value)) {
              p.Value = dataItem?.Value;
            } else {
              p.Value = this.previousIdentifiersListItemValue;
            }
          }
        })
        this.ifIdentifierUpdated = true;
        this.getExistingListItemsName();
      }
      sender.closeRow(rowIndex);
      this.showReOrderListButtons = false;
      this.sortSpecifiedList();
    }
  }

  closeEditor = (grid: GridComponent, rowIndex = this.editedRowIndex): void => {
    grid.closeRow(rowIndex);
    this.editedRowIndex = undefined;
    this.listItemformGroup = undefined;
  }

  removeListItem = (event) => {
    if (this.hasDeleteAccess) {
      const selectedListItem = event?.dataItem;
      this.confirmationModalData.message = this.localize.getLocalizedString('Deleting "' + selectedListItem.Value + '" will result in a loss of information for all patients. Continue?');
      this.confirmationModalData.confirm = 'Delete';
      const data = this.confirmationModalData;
      this.confirmationRef = this.confirmationModalService.open({ data });

      this.confirmationModalSubscription = this.confirmationRef.events.pipe(
        filter((event) => !!event),
        filter((event) => {
          return event.type === 'confirm' || event.type === 'close';
        }),
        take(1)
      )?.subscribe((events) => {
        switch (events?.type) {
          case 'confirm':
            this.removeIdentifierListItem(selectedListItem);
            break;
          case 'close':
            this.confirmationRef.close();
            break;
        }
      });
    }
    this.subscriptions.push(this.confirmationModalSubscription);
  }
  removeIdentifierListItem = (deletedListItem: IdentifiersListItems) => {
    if (this.patientAdditionalIdentifier?.ListValues) {
      let indx = this.patientAdditionalIdentifier?.ListValues.indexOf(deletedListItem)
      this.patientAdditionalIdentifier?.ListValues.splice(indx, 1);
      this.patientAdditionalIdentifier?.ListValues.forEach(item => {
        if (item.Order > deletedListItem.Order) {
          item.Order = item.Order - 1;
        }
      })
      this.ifIdentifierUpdated = true;
      this.getExistingListItemsName();
    }
    this.confirmationRef.close();
  }

  // Move Identifiers List Items up and down
  moveUpListItem = (dataItem: IdentifiersListItems) => {
    if (dataItem.Order > 1) {
      const newItemOrderNumber = dataItem.Order - 1;
      this.patientAdditionalIdentifier?.ListValues.forEach(listItem => {
        if (listItem.Order == newItemOrderNumber) {
          listItem.Order = listItem.Order + 1;
        }
        if (listItem.Value == dataItem.Value) {
          listItem.Order = newItemOrderNumber;
        }
      })
      this.ifIdentifierUpdated = true;
    }
    this.sortSpecifiedList();
  }
  moveDownListItem = (dataItem: IdentifiersListItems) => {
    if (dataItem.Order < this.patientAdditionalIdentifier?.ListValues.length) {
      const newItemOrderNumber = dataItem.Order + 1;
      this.patientAdditionalIdentifier?.ListValues.forEach(listItem => {
        if (listItem.Order == newItemOrderNumber) {
          listItem.Order = listItem.Order - 1;
        }
        if (listItem.Value == dataItem.Value) {
          listItem.Order = newItemOrderNumber;
        }
      })
      this.ifIdentifierUpdated = true;
    }
    this.sortSpecifiedList();
  }

  sortSpecifiedList = () => {
    if (this.patientAdditionalIdentifier?.ListValues?.length > 1) {
      this.patientAdditionalIdentifier.ListValues = this.patientAdditionalIdentifier?.ListValues.sort((a, b) => {
        if (a['Order'] > b['Order']) {
          return 1;
        }
        if (a['Order'] < b['Order']) {
          return -1;
        }
        return 0;
      });
    }
  }

  // Save, Update and Cancel for the Addional Identifier Modal
  onUpdateIdentifier = () => {
    if (this.isEditIdentifierMode) {
      if (this.patientAdditionalIdentifier.Description != this.previousPatientAdditionalIdentifierValue.Description
        || this.patientAdditionalIdentifier.IsSpecifiedList != this.previousPatientAdditionalIdentifierValue.IsSpecifiedList) {
        this.ifIdentifierUpdated = true;
      } else {
        this.ifIdentifierUpdated = false;
      }
    } else {
      this.ifIdentifierUpdated = true;
    }
    this.disableSaveIdentifierButton();
  }

  changeAnswerType = (value) => {
    this.patientAdditionalIdentifier.IsSpecifiedList = value;
    this.onUpdateIdentifier()
  }
  confirmCancelIdentifierChanges = () => {
    if (this.ifIdentifierUpdated) {
      this.saveIdentifiersConfirmationModalData.header = this.localize.getLocalizedString('Discard');
      this.saveIdentifiersConfirmationModalData.message = this.localize.getLocalizedString('Are you sure you want to discard these changes?');
      this.saveIdentifiersConfirmationModalData.confirm = 'Yes';
      this.saveIdentifiersConfirmationModalData.cancel = 'No';
      this.saveIdentifiersConfirmationModalData.height = 200;
      this.saveIdentifiersConfirmationModalData.width = 550;

      const data = this.saveIdentifiersConfirmationModalData;
      this.saveIdentifiersConfirmationRef = this.confirmationModalService.open({ data });

      this.saveIdentifiersConfirmationModalSubscription = this.saveIdentifiersConfirmationRef.events.pipe(
        filter((event) => !!event),
        filter((event) => {
          return event.type === 'confirm' || event.type === 'close';
        }),
        take(1)
      )?.subscribe((events) => {
        switch (events?.type) {
          case 'confirm':
            this.cancelIdentifierChanges();
            break;
          case 'close':
            this.saveIdentifiersConfirmationRef.close();
            break;
        }
      });
      this.subscriptions.push(this.saveIdentifiersConfirmationModalSubscription);

    } else {
      this.cancelIdentifierChanges();
    }
  }
  cancelIdentifierChanges = () => {
    this.closeDialog = true;
    if (this.ifIdentifierUpdated) { this.saveIdentifiersConfirmationRef.close(); }
    this.getPatientAdditionalIdentifiers();
  }
  opneSaveConfirmPopUp = () => {
    this.patientAdditionalIdentifier.Description = this.patientAdditionalIdentifier?.Description.trim();
    this.ifIdentifierisDuplicated = this.AdditionalIdentifierName?.includes(this.patientAdditionalIdentifier?.Description);
    this.listValueIsEmpty = this.patientAdditionalIdentifier.IsSpecifiedList && this.patientAdditionalIdentifier.ListValues.length == 0;
    if (this.ifIdentifierisDuplicated) {
      this.saveIdentifiersConfirmationModalData.header = this.localize.getLocalizedString('Duplicate Identifier Name');
      this.saveIdentifiersConfirmationModalData.message = this.localize.getLocalizedString("There is already an identifier with name " + this.patientAdditionalIdentifier?.Description + ", Please Change Identifier Name");
      this.saveIdentifiersConfirmationModalData.confirm = this.localize.getLocalizedString('Close');
      this.saveIdentifiersConfirmationModalData.cancel = '';
      this.openPopUpModal();
    } else if (this.listValueIsEmpty) {
      this.saveIdentifiersConfirmationModalData.header = this.localize.getLocalizedString('Add New List Item');
      this.saveIdentifiersConfirmationModalData.message = this.localize.getLocalizedString("Please add new list item.");
      this.saveIdentifiersConfirmationModalData.confirm = this.localize.getLocalizedString('Close');
      this.saveIdentifiersConfirmationModalData.cancel = '';
      this.openPopUpModal();
    } else {
      if (this.isEditIdentifierMode) {
        this.saveIdentifiersConfirmationModalData.header = this.localize.getLocalizedString('Save Additional Identifier');
        this.saveIdentifiersConfirmationModalData.message = this.localize.getLocalizedString('Changes will take effect for all patients. Continue?');
        this.saveIdentifiersConfirmationModalData.confirm = 'Yes';
        this.saveIdentifiersConfirmationModalData.cancel = 'No';
        this.openPopUpModal();
      } else {
        this.saveUpdateIdentifier();
      }
    }
  }

  openPopUpModal = () => {
    const data = this.saveIdentifiersConfirmationModalData;
    this.saveIdentifiersConfirmationRef = this.confirmationModalService.open({ data });
    this.saveIdentifiersConfirmationModalSubscription = this.saveIdentifiersConfirmationRef.events.pipe(
      filter((event) => !!event),
      filter((event) => {
        return event.type === 'confirm' || event.type === 'close';
      }),
      take(1)
    )?.subscribe((events) => {
      switch (events?.type) {
        case 'confirm':
          this.saveUpdateIdentifier();
          break;
        case 'close':
          this.saveIdentifiersConfirmationRef.close();
          break;
      }
    });

    this.subscriptions.push(this.saveIdentifiersConfirmationModalSubscription);
  }

  saveUpdateIdentifier = () => {
    this.ifIdentifierUpdated = false;
    this.saveIdentifiersConfirmationRef?.close();
    if (this.isEditIdentifierMode && !this.ifIdentifierisDuplicated && !this.listValueIsEmpty) {
      this.updateIdentifier();
    } else if (!this.ifIdentifierisDuplicated && !this.listValueIsEmpty) {
      this.saveIdentifier();
    }
  }
  updateIdentifier = () => {
    let requestedSpecifiedlistItems = [];
    this.patientAdditionalIdentifier?.ListValues?.forEach(specifiedListItem => {
      requestedSpecifiedlistItems.push(specifiedListItem);
    });
    this.subscriptions.push(this.patientAdditionalIdentifierService.update(this.patientAdditionalIdentifier)?.subscribe({
      next: (response: SoarResponse<PatientAdditionalIdentifiers>) => this.updateIdentifierSuccess(requestedSpecifiedlistItems, response?.Value),
      error: (error) => this.updateIdentifierFailure(error)
    }));


  }
  updateIdentifierSuccess = (requestedSpecifiedlistItems, patientAdditionalIdentifiers: PatientAdditionalIdentifiers) => {

    if (patientAdditionalIdentifiers) {
      this.patientAdditionalIdentifier = patientAdditionalIdentifiers;
      // This logic is just temporarily in place because the API answer has the following problem.
      // The API returns the old 'Specified list Items', when updating the 'Addtional identifier' after deleting some specified list items.
      // In case of AngularJS we were not updating the current model with API's response data, 
      // So in case of AngularJS we were not able to update 'Addtional Identifier' seconed time. It was throwing error all the time.
      let responseSpecifiedlistItems = patientAdditionalIdentifiers?.ListValues;
      this.patientAdditionalIdentifier.ListValues = [];
      if (requestedSpecifiedlistItems?.length > 0) {
        requestedSpecifiedlistItems.forEach(specifiedList => {
          let matchedItem = responseSpecifiedlistItems?.find(item => item?.Value == specifiedList?.Value);
          this.patientAdditionalIdentifier.ListValues.push(matchedItem);
        })
      }
      // -----------------------------------------------------------------------

      this.broadcastChannel('additionalIdentifiers', { mode: 'update', data: patientAdditionalIdentifiers });

      this.toastrFactory.success(this.localize.getLocalizedString('Update {0}.', ['successful']), this.localize.getLocalizedString('Success'));
    }

  }
  updateIdentifierFailure = (error) => {
    this.closeDialog = true;
    this.toastrFactory.error(this.localize.getLocalizedString('Failed to update the additional identifier. Refresh the page to try again.'), this.localize.getLocalizedString('Update Error'));

  }
  saveIdentifier = () => {
    this.subscriptions.push(this.patientAdditionalIdentifierService.save(this.patientAdditionalIdentifier)?.subscribe({
      next: (response: SoarResponse<PatientAdditionalIdentifiers>) => this.saveIdentifierSuccess(response?.Value),
      error: (error) => this.saveIdentifierFailure(error)
    }));
  }
  saveIdentifierSuccess = (patientAdditionalIdentifiers: PatientAdditionalIdentifiers) => {
    this.patientAdditionalIdentifier = patientAdditionalIdentifiers;
    this.broadcastChannel('additionalIdentifiers', { mode: 'add', data: patientAdditionalIdentifiers });
    this.toastrFactory.success(this.localize.getLocalizedString('Patient additional identifier has been created.'), this.localize.getLocalizedString('Success'));
    this.closeDialog = true;
    this.getPatientAdditionalIdentifiers();
  }
  saveIdentifierFailure = (error) => {
    this.closeDialog = true;
    this.toastrFactory.error(this.localize.getLocalizedString('Failed to Add the additional identifier. Refresh the page to try again.'), this.localize.getLocalizedString('Update Error'));
  }
  disableSaveIdentifierButton = (): boolean => {
    return !(this.ifIdentifierUpdated &&
      (this.patientAdditionalIdentifier?.Description?.length > 0))
  }

  enterKeyEvent = () => {
    return false;
  }

  ngOnDestroy() {
    this.subscriptions?.forEach((subscription) => subscription?.unsubscribe())
  }
}