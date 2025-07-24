import { NgTemplateOutlet } from '@angular/common';
import { ChangeDetectorRef } from '@angular/core';
import { ViewContainerRef } from '@angular/core';
import { ViewChild } from '@angular/core';
import { TemplateRef } from '@angular/core';
import { Component, OnInit, OnDestroy, Inject, Input, OnChanges, SimpleChanges } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { DialogRef } from '@progress/kendo-angular-dialog';
import { Subscription } from 'rxjs';
import { filter, take } from 'rxjs/operators';

import { ConfirmationModalOverlayRef } from '../../../../../@shared/components/confirmation-modal/confirmation-modal.overlayref';
import { ConfirmationModalService } from '../../../../../@shared/components/confirmation-modal/confirmation-modal.service';
import { SoarSelectListComponent } from '../../../../../@shared/components/soar-select-list/soar-select-list.component';
import { ConditionModel, DrawTypes, AffectedAreas } from './conditions.model';
import isEqual from 'lodash/isequal';
import { ConditionsService } from 'src/@shared/providers/conditions.service';
import { FeatureFlagService } from 'src/featureflag/featureflag.service';
import { FuseFlag } from 'src/@core/feature-flags';
import { DrawTypesService } from 'src/@shared/providers/drawtypes.service';

@Component({
  selector: 'conditions-landing',
  templateUrl: './conditions-landing.component.html',
  styleUrls: ['./conditions-landing.component.scss']
})
export class ConditionsLandingComponent implements OnInit, OnChanges {
  conditionsData: ConditionModel[] = [];

  breadCrumbs: { name: string, path: string, title: string }[] = [];
  //access rights
  hasViewAccess: boolean = false;
  hasCreateAccess: boolean = false;
  hasDeleteAccess: boolean = false;
  hasEditAccess: boolean = false;

  //form group
  formGroup: FormGroup = new FormGroup({});

  //kendo bindings
  columns: { field: string, title: string, width: string, hasValidations: boolean, validation: { message: string, maxLength: string } }[] = [];
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

  //component variables
  editMode: boolean = false;
  loading: boolean = true;
  isDialogOpen: boolean = true;
  closeDialog: boolean = false;
  affectedAreas: AffectedAreas[];
  drawTypes: DrawTypes[] = [];
  filteredDrawTypes = [];
  formIsValid: boolean = true;
  isInputDuplicate: boolean = false;
  isInputRequired: boolean = false;
  editData: boolean = false;
  message: string = '';
  condition: ConditionModel = new ConditionModel('', '', false, 0, '');
  previousCondition: ConditionModel = new ConditionModel('', '', false, 0, '');

  //modal variables
  @ViewChild('lstDrawType') soarSelectListComponent: SoarSelectListComponent;
  confirmationRef: ConfirmationModalOverlayRef;
  confirmationModalSubscription: Subscription;
  confirmationModalData: { header: string, message: string, confirm: string, cancel: string, height: number, width: number } = {
    header: '',
    message: '',
    confirm: '',
    cancel: 'Cancel',
    height: 200,
    width: 350,
  };

  //Properties For the Condition Modal pop-up
  dialog: DialogRef;
  @ViewChild('templateRef') templateElement: TemplateRef<NgTemplateOutlet>;
  @ViewChild("container", { read: ViewContainerRef })
  public containerRef: ViewContainerRef;

  constructor(@Inject('localize') private localize,
    @Inject('patSecurityService') private patSecurityService,
    @Inject('toastrFactory') private toastrFactory,
    @Inject('ListHelper') private listHelper,
    @Inject('$location') private location,
    @Inject('referenceDataService') private referenceDataService,
    @Inject('StaticData') private staticData,
    @Inject('AuthZService') private authZ,
    private changeDetector: ChangeDetectorRef,
    private confirmationModalService: ConfirmationModalService,
    private conditionsService: ConditionsService,
    private drawtypesService: DrawTypesService,
    private featureFlagService: FeatureFlagService
  ) {
    this.authAccess();
    this.message = this.authZ.generateTitleMessage();
  }

  ngOnChanges(change: SimpleChanges) {
    if (change?.conditionsData) {
      this.updateConditionAccessRights();
      this.loading = false;
    }
  }

  ngAfterViewChecked() {
    this.changeDetector.detectChanges();
  }

  ngOnInit(): Promise<void> {
    var promise = new Promise<void>((resolve, reject) => {
      this.featureFlagService.getOnce$(FuseFlag.UsePracticeApiForConditions).subscribe(value => {
        this.getConditions(value).then(() => {
          this.getPageNavigation();
          this.initKendoColumns();
          this.affectedAreaName();
          this.drawtypesService.getAll().then((drawtypes) => {
            this.drawTypes = drawtypes;
            this.loading = false;
            resolve();
          }).catch(err => {
            console.error(err);
            reject();
          });
        }).catch(err => {
          console.error(err);
          reject();
        });
      })
    });
    return promise;
  }

  //#region Authorization
  authViewAccess = () => {
    return this.patSecurityService.IsAuthorizedByAbbreviation('soar-biz-bizloc-view');
  };

  authCreateAccess = () => {
    return this.patSecurityService.IsAuthorizedByAbbreviation('soar-biz-bsvct-add');
  };

  authDeleteAccess = () => {
    return this.patSecurityService.IsAuthorizedByAbbreviation('soar-biz-bsvct-delete');
  };

  authEditAccess = () => {
    return this.patSecurityService.IsAuthorizedByAbbreviation('soar-biz-bsvct-edit');
  };

  authAccess = () => {
    this.hasViewAccess = this.authViewAccess();
    this.hasCreateAccess = this.authCreateAccess();
    this.hasDeleteAccess = this.authDeleteAccess();
    this.hasEditAccess = this.authEditAccess();
    if (!this.authViewAccess()) {
      this.toastrFactory.error(this.localize.getLocalizedString('User is not authorized to access this area.'), this.localize.getLocalizedString('Not Authorized'));
      this.location.path('/')
    };
  };

  //breadcrumbs
  getPageNavigation() {
    this.breadCrumbs = [
      {
        name: this.localize.getLocalizedString('Practice Settings'),
        path: '#/BusinessCenter/PracticeSettings/',
        title: 'Practice Settings'
      },
      {
        name: this.localize.getLocalizedString('Conditions'),
        path: '/BusinessCenter/Conditions/',
        title: 'Conditions'
      }
    ];
  };

  //init kendo columns
  initKendoColumns = () => {
    this.columns = [
      {
        field: 'Description',
        title: 'Description',
        width: '700',
        hasValidations: true,
        validation: {
          message: 'Description is required.',
          maxLength: '64'
        }
      }
    ];
  };

  // check duplicate description
  checkDuplicateDescriptionOnBlur = (description, condition) => {
    if (description === "" || description === condition.Description) {
      this.isInputDuplicate = false;
    } else {
      const filteredCondition = this.conditionsData?.filter(condition => condition.Description.toLowerCase() === description.toLowerCase())[0];
      this.isInputDuplicate = filteredCondition ? true : false;
    }
  };

  addNewCondition = () => {
    this.closeDialog = false;
    this.isInputDuplicate = false;
    this.editMode = false;
    this.condition = new ConditionModel('', '', false, 0, '');
  };

  deleteConditions = (event) => {
    //open delete confirmation modal
    this.openDeleteConfirmationModal(event?.dataItem);
  };

  openDeleteConfirmationModal = (condition) => {
    this.confirmationModalData.message = this.localize.getLocalizedString('Deleting "' + condition?.Description + '" will be deleted from all patient charts?');
    this.confirmationModalData.confirm = this.localize.getLocalizedString('Delete');
    const data = this.confirmationModalData;
    this.confirmationRef = this.confirmationModalService.open({ data });

    this.confirmationModalSubscription = this.confirmationRef.events.pipe(
      filter((event) => !!event),
      filter((event) => {
        return event.type === 'confirm' || event.type === 'close';
      }),
      take(1)
    ).subscribe((events) => {
      this.confirmationRef.close();
      if (events.type == 'confirm') this.confirmDelete(condition);
    });
  };

  confirmDelete = (condition: ConditionModel) => {
    if (this.hasDeleteAccess) {
      this.conditionsService?.delete(condition?.ConditionId)
        .then((res) => {
          this.deleteConditionSuccess(condition?.ConditionId);
        }, (error) => {
          this.deleteConditionFailure(error);
        });
    };
  };

  //Delete delete condition success
  deleteConditionSuccess = (conditionsId) => {
    let index = this.listHelper.findIndexByFieldValue(this.conditionsData, 'ConditionId', conditionsId);
    if (index > -1) {
      this.conditionsData.splice(index, 1);
    }
    this.conditionsData = this.conditionsData.slice();
    this.toastrFactory.success(this.localize.getLocalizedString('Condition deleted'),
      this.localize.getLocalizedString('Success'));
    this.referenceDataService.forceEntityExecution(this.referenceDataService.entityNames.conditions);
  };

  deleteConditionFailure = (error) => {
    this.toastrFactory.error(this.localize.getLocalizedString('Delete {0} was unsuccessful.Please retry your delete.', ['Condition']), this.localize.getLocalizedString('Server Error' + error?.data?.Message));
  };

  getConditions = async (usePracticesApi: boolean) => {
    if (usePracticesApi) {
      let conditions = await this.conditionsService.getAll();
      this.conditionsData = conditions.sort((a, b) => a.Description.localeCompare(b.Description));
      this.updateConditionAccessRights();
    } else {
      this.conditionsData = this.referenceDataService?.get(this.referenceDataService?.entityNames?.conditions) || [];
      this.updateConditionAccessRights();
    }
  };

  cancelConditionPopup = () => {
    this.closeDialog = true;
  };

  affectedAreaName = () => {
    // get the affected area name
    this.staticData.AffectedAreas().then((r) => {
      this.affectedAreas = this.filteredAffectedAreas(r);
    });
  };

  filteredAffectedAreas = (res) => {
    const affectedAreas = [];
    const areas = res?.Value;
    areas.map((data) => {
      if (data.Name !== 'Mouth') {
        affectedAreas.push(data);
      }
    });
    return affectedAreas;
  };

  affectedAreaChange = (affectedAreaId) => {
    this.filteredDrawTypes = this.drawTypes?.filter(x => x.AffectedAreaId === affectedAreaId)
    if (!this.editData) {
      this.soarSelectListComponent.optionList = this.filteredDrawTypes;
      this.soarSelectListComponent.initSelectionList();
    }
    if (this.condition.DrawTypeId != null && !this.editData) {
      this.condition.DrawTypeId = null;
    }
    this.editData = false;
  };

  editCondition = (event) => {
    this.closeDialog = false;
    this.isInputDuplicate = false;
    this.condition = event?.dataItem;
    this.previousCondition = Object.assign({}, event?.dataItem);
    this.editMode = true;
    this.editData = true;
    this.affectedAreaChange(this.condition.AffectedAreaId);
  };

  saveCondition = () => {
    if (this.authCreateAccess()) {
      this.conditionsService?.save(this.condition).then((res: ConditionModel) => {
        this.saveConditionSuccess(res?.Value);
      }, (error) => {
        this.saveConditonFailure(error);
      });
    }
  };

  saveConditionSuccess = (condition) => {
    this.conditionsData.push(condition);
    this.conditionsData = this.conditionsData.slice();
    this.referenceDataService.forceEntityExecution(this.referenceDataService.entityNames.conditions);
    this.toastrFactory.success(this.localize.getLocalizedString('Condition created.'), this.localize.getLocalizedString('Success'));
    this.closeDialog = true;
  };

  saveConditonFailure = (error) => {
    this.closeDialog = true;
    this.toastrFactory.error(this.localize.getLocalizedString('Create {0} was unsuccessful.Please retry your save.', ['Condition']), this.localize.getLocalizedString('Server Error' + error?.data?.InvalidProperties[0].ValidationMessage));
  };

  updateCondition = () => {
    this.conditionsService?.update(this.condition).then((res: ConditionModel) => {
      this.updateConditionSuccess(res);
    }, (error) => this.updateConditionFailure(error));
  };

  updateConditionSuccess = (res) => {
    const index = this.conditionsData.findIndex(condition => condition.ConditionId === this.condition.ConditionId);
    this.conditionsData[index] = res?.Value;
    this.conditionsData = this.conditionsData.slice();
    this.closeDialog = true;
    this.toastrFactory.success(this.localize.getLocalizedString('Update {0}.', ['successful']), this.localize.getLocalizedString('Success'));
    this.referenceDataService.forceEntityExecution(this.referenceDataService.entityNames.conditions);
  };

  updateConditionFailure = (error) => {
    this.closeDialog = true;
    this.toastrFactory.error(this.localize.getLocalizedString('Update {0} was unsuccessful.Please retry your save.', ['Condition']), this.localize.getLocalizedString('Server Error' + error?.data?.Message));
  };

  saveUpdatedCondition = (conditionsForm) => {
    if (conditionsForm.valid && conditionsForm.value.lstAffectedArea && !this.isInputDuplicate) {
      if (this.editMode) {
        const condition  = this.listHelper?.findItemByFieldValue(this.conditionsData, "ConditionId", this.condition.ConditionId);
        const isConditionSame = isEqual(condition, this.previousCondition);
        if (!isConditionSame) {
          this.updateCondition();
        } else {
          this.closeDialog = true;
        }
      } else if (!this.editMode) {
        this.saveCondition();
      }
    }
  };

  //add keys to each condition to check for edit/delete rights
  updateConditionAccessRights = () => {
    this.conditionsData = this.conditionsData?.map((condition) => {
      condition = this.updateRightsViewModel(condition);
      return condition;
    });
  };

  //set message related to edit/delete rights in each condition
  updateRightsViewModel = (condition) => {
    if (!this.hasDeleteAccess) {
      condition.deleteTooltipMessage = this.message;
      condition.disableDelete = true;
    }
    if (!this.hasEditAccess) {
      condition.editTooltipMessage = this.message;
      condition.disableEdit = true;
    }
    if (condition.IsDefault) {
      condition.deleteTooltipMessage = this.localize.getLocalizedString('System required items cannot be edited or deleted.');
      condition.disableDelete = true;
      condition.editTooltipMessage = this.localize.getLocalizedString('System required items cannot be edited or deleted.');
      condition.disableEdit = true;
    }
    return condition;
  };
}
