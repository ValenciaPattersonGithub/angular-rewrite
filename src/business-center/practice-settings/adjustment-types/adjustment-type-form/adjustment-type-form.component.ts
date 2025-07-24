import { Component, EventEmitter, Inject, Input, OnInit, Output, ViewContainerRef } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { TranslateService } from '@ngx-translate/core';
import { Subscription } from 'rxjs';
import { filter, take } from 'rxjs/operators';
import { ConfirmationModalOverlayRef } from 'src/@shared/components/confirmation-modal/confirmation-modal.overlayref';
import { ConfirmationModalService } from 'src/@shared/components/confirmation-modal/confirmation-modal.service';
import { FormMode } from 'src/patient/common/models/enums';
import { AdjustmentTypes } from '../adjustment-types';
import { AdjustmentTypesService } from 'src/@shared/providers/adjustment-types.service';
import { SoarResponse } from 'src/@core/models/core/soar-response';

@Component({
  selector: 'adjustment-type-form',
  templateUrl: './adjustment-type-form.component.html',
  styleUrls: ['./adjustment-type-form.component.scss']
})
export class AdjustmentTypeFormComponent implements OnInit {

  remainingText = 0;
  adjustmentTypeFG: FormGroup;
  defaultFormValue: AdjustmentTypes;
  isFormValid = true;
  confirmationRef: ConfirmationModalOverlayRef;
  confirmationModalSubscription: Subscription;
  defaultAdjustmentTypeMessage = "This value cannot be changed because the adjustment type is set as the default for one or more benefit plans.";


  drawerMode = FormMode.default;
  listItems = [{ "text": "Production", "value": 1 }, { "text": "Collection", "value": 2 }, { "text": "Adjustments", "value": 3 }];
  descriptionErrorText = "";
  title: string;
  @Input() containerRef: ViewContainerRef;
  @Input() drawer = { isOpen: false };
  @Input() adjustmentTypeEditData: AdjustmentTypes;
  @Input() adjustmentTypeDataSet: AdjustmentTypes[];
  @Input() hasEditAccess: boolean;
  @Input() hasDeleteAccess: boolean;
  @Input() hasCreateAccess: boolean;
  @Output() refreshGrid = new EventEmitter();


  constructor(
    @Inject('toastrFactory') private toastrFactory,
    private adjustmentTypesService: AdjustmentTypesService,
    private confirmationModalService: ConfirmationModalService,
    private translate: TranslateService,
    private fb: FormBuilder,) { }

  ngOnInit(): void {
    this.initiateFormControls();
  }
  initiateFormControls() {
    this.drawerMode = FormMode.AddMode;
    this.title = this.translate.instant("New Adjustment Type");
    this.remainingText = 0;
    this.adjustmentTypeEditData = {};
    this.adjustmentTypeFG = this.fb.group({
      AdjustmentTypeId: null,
      ImpactType: [3, [Validators.required, Validators.min(1)]],
      Description: ['', [Validators.required]],
      IsPositive: false,
      IsActive: true,
      DataTag: ''
    });
  }

  onCategoryChange = (isPositive) => {
    this.adjustmentTypeFG.markAsDirty();
    this.adjustmentTypeFG.patchValue({ IsPositive: isPositive });
  }

  onImpactTypeChange = (event) => {
    this.adjustmentTypeFG.markAsDirty();
    this.adjustmentTypeFG.patchValue({ ImpactType: event.target.value });
  }

  onChangeImpactStatus = (event) => {
    if (event.target.value == 'true' && this.drawerMode == FormMode.EditMode) {
      const data = {
        header: this.translate.instant('Confirm'),
        message: this.translate.instant('Are you sure you want to InActivate the Adjustment Type?'),
        confirm: this.translate.instant('Yes'),
        cancel: this.translate.instant('No'),
        height: 200,
        width: 550,
      }
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
            this.adjustmentTypeFG.patchValue({ IsActive: false });
            this.confirmationRef.close();
            break;
          case 'close':
            this.adjustmentTypeFG.patchValue({ IsActive: true });
            this.confirmationRef.close();
            break;
        }
      })
    }
    else if (event.target.value == 'false') {
      this.adjustmentTypeFG.patchValue({ IsActive: true });
    }
    else {
      this.adjustmentTypeFG.patchValue({ IsActive: false });
    }
  }

  onKeyUp = (event) => {
    this.validateDescription(event);
    this.remainingText = event.target?.value?.length;
    this.adjustmentTypeFG.markAsDirty();
    this.adjustmentTypeFG.patchValue({ Description: event.target.value });
  }

  isDescriptionAlreadyExists = (e) => {
    return this.adjustmentTypeDataSet?.filter((f) => {
      return f.Description.toLowerCase() === e.target.value.toLowerCase();
    })?.length > 0;
  }

  validateDescription = (event) => {
    if (this.remainingText == 0) {
      this.isFormValid = false;
      this.descriptionErrorText = this.translate.instant("This field is required.");
    }
    else if (event && (this.isDescriptionAlreadyExists(event) && this.drawerMode == FormMode.AddMode)
      || (event && this.drawerMode == FormMode.EditMode && this.adjustmentTypeEditData?.Description?.toLowerCase() != event?.target?.value?.toLowerCase()
        && this.isDescriptionAlreadyExists(event))) {
      this.isFormValid = false;
      this.descriptionErrorText = this.translate.instant("Adjustment Type with this description already exists.");
    }
    else {
      this.isFormValid = true;
    }
  }

  saveAdjustmentType = () => {
    const adjustmentType = this.adjustmentTypeFG.getRawValue();
    this.validateDescription(null);
    if (this.hasCreateAccess && this.isFormValid && this.drawerMode == FormMode.AddMode) {
      this.adjustmentTypesService.create(adjustmentType).then((res: SoarResponse<AdjustmentTypes[]>) => {
        this.onSuccess(res?.Value)
      }, (error) => {
        this.onFailure(error)
      });
    }
    else if (this.adjustmentTypeEditData.IsAdjustmentTypeAssociatedWithTransactions
      && (this.defaultFormValue.IsPositive != this.adjustmentTypeFG.controls["IsPositive"].value
        || this.defaultFormValue.Description != this.adjustmentTypeFG.controls["Description"].value)) {
      const data = {
        header: this.translate.instant('Adjustment Type Validation'),
        message: this.translate.instant('This adjustment type has been used in previous transactions and can only be activated/inactivated.'),
        confirm: this.translate.instant('OK'),
        height: 200,
        width: 550
      }
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
            this.confirmationRef.close();
            break;
        }
      })
    }
    else if (this.hasEditAccess && this.isFormValid && this.drawerMode == FormMode.EditMode) {
      if (this.defaultFormValue.ImpactType != this.adjustmentTypeFG.controls["ImpactType"].value) {
        const data = {
          header: this.translate.instant('Warning'),
          message: this.translate.instant('Changing the Impacts value will not affect previous adjustments, but will apply to future adjustments.'),
          confirm: this.translate.instant('Save'),
          cancel: this.translate.instant('Cancel'),
          height: 200,
          width: 550
        }
        this.confirmationRef = this.confirmationModalService?.open({data});
        this.confirmationModalSubscription = this.confirmationRef.events.pipe(
          filter((event) => !!event),
          filter((event) => {
            return event.type === 'confirm' || event.type === 'close';
          }),
          take(1)
        ).subscribe((events) => {
          switch (events.type) {
            case 'confirm':
              this.adjustmentTypesService.update(adjustmentType).then((res: SoarResponse<AdjustmentTypes[]>) => {
                this.onSuccess(res?.Value)
              }, (error) => {
                this.onFailure(error)
              });
              this.confirmationRef.close();
              break;
            case 'close':
              this.confirmationRef.close();
              break;
          }
        })
      }
      else {
        this.adjustmentTypesService.update(adjustmentType).then((res: SoarResponse<AdjustmentTypes[]>) => {
          this.onSuccess(res?.Value)
        }, (error) => {
          this.onFailure(error)
        });
      }
    }
  }

  discardAdjustmentType = (onUpdate: boolean) => {
    if (!onUpdate) {
      const data = {
        header: this.translate.instant('Warning'),
        message: this.translate.instant('Are you sure you want to discard these changes?'),
        confirm: this.translate.instant('Yes'),
        cancel: this.translate.instant('No'),
        height: 200,
        width: 550
      }
      this.confirmationRef = this.confirmationModalService.open({data});
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
            this.drawer.isOpen = false;
            this.isFormValid = true;
            this.adjustmentTypeFG.patchValue({ Description: "" });
            this.initiateFormControls();
            break;
          case 'close':
            this.confirmationRef.close();
            break;
        }
      })
    }
    else {
      this.drawer.isOpen = false;
      this.isFormValid = true;
      this.adjustmentTypeFG.patchValue({ Description: "" });
      this.initiateFormControls();
    }
  }

  onSuccess = (res) => {
    if (res && this.drawerMode == FormMode.AddMode) {
      this.toastrFactory.success(
        this.translate.instant('Your adjustment type has been created.'),
        this.translate.instant('Success'));
      this.drawer.isOpen = false;
    }
    else {
      this.toastrFactory.success(
        this.translate.instant('Update successful.'),
        this.translate.instant('Success'));
    }
    this.refreshGrid.emit();
    this.adjustmentTypeFG.reset();
    this.discardAdjustmentType(true);
  }

  onFailure = (ex) => {
    if (ex.data && ex.data.InvalidProperties?.length) {
      this.toastrFactory.error(
        this.translate.instant(ex.data.InvalidProperties[0].ValidationMessage),
        this.translate.instant('Server Error'));
    }
    else if (this.drawerMode == FormMode.AddMode) {
      this.toastrFactory.error(
        this.translate.instant('There was an error and your adjustment type was not created.'),
        this.translate.instant('Server Error'));
    }
    else {
      this.toastrFactory.error(
        this.translate.instant('There was an error and your adjustment type was not updated.'),
        this.translate.instant('Server Error'));
    }
  }

  bindForm = (eventData) => {
    this.defaultFormValue = {
      AdjustmentTypeId: eventData.AdjustmentTypeId,
      ImpactType: eventData.ImpactType,
      Description: eventData.Description,
      IsPositive: eventData.IsPositive,
      IsActive: eventData.IsActive,
      DataTag: eventData.DataTag
    };
    this.remainingText = eventData?.Description?.length;
    this.adjustmentTypeFG.setValue(this.defaultFormValue);
  }

  ngOnChanges() {
    if (this.adjustmentTypeEditData && Object.keys(this.adjustmentTypeEditData)?.length > 0) {
      this.isFormValid = true;
      this.drawerMode = FormMode.EditMode;
      this.title = this.translate.instant("Edit Adjustment Type");
      this.bindForm(this.adjustmentTypeEditData);
    }
  }
} 