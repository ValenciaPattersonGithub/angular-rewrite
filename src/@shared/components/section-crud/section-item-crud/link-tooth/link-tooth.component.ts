// The component is using the default change detection strategy, but we needed to handle dynamic DOM changes
// that must be loaded before using the component, and to handle potential errors related to DOM expression changes. 
// Therefore, we added manual change detection using "ChangeDetectorRef".
// https://stackoverflow.com/questions/36919399/angular-2-view-not-updating-after-model-changes

import { Component, OnInit, Input, OnDestroy, ElementRef, ChangeDetectorRef, Inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Subscription } from 'rxjs';
import { CustomFormTemplate, FormDataArray, FormSectionItem } from 'src/business-center/practice-settings/chart/note-templates/note-templates';
import cloneDeep from 'lodash/cloneDeep';
import { NoteTemplatesHelperService } from 'src/business-center/practice-settings/chart/note-templates/note-templates-helper.service';
import { MultiSelectComponent } from '@progress/kendo-angular-dropdowns';
import { debounceTime } from 'rxjs/operators';

@Component({
    selector: 'link-tooth',
    templateUrl: './link-tooth.component.html',
    styleUrls: ['./link-tooth.component.scss']
})
export class LinkToothComponent implements OnInit, OnDestroy {
    multiSelectComponent: MultiSelectComponent;
    @Input() parentForm: FormGroup;
    @Input() inputIsDisabled = false;
    @Input() sectionItem: FormSectionItem;
    @Input() sectionIndex: number;
    @Input() sectionItemIndex: number;
    @Input() editItem = true;
    @Input() formDataArray: FormDataArray[] = [];

    formValueSubscription: Subscription;
    frmToothLink: FormGroup;
    subscription: Subscription;
    customForm: CustomFormTemplate;

    constructor(public fb: FormBuilder, private changeDetectorRef: ChangeDetectorRef, private _elementRef: ElementRef,
        private noteTemplatesHelperService: NoteTemplatesHelperService, @Inject('StaticData') private staticData) { }

    ngOnInit(): void {
        this.subscription = this.noteTemplatesHelperService.getData().subscribe((res) => {
            this.customForm = res;
        })
        if (this.editItem == true) {
            this.createForm();
        }
        if (this.inputIsDisabled == false || this.sectionItem?.Skip == false) {
            this.loadTeethSelectOptions();
        }

    }

    createForm = () => {
        //Remove Existing form if exist in array
        if (this.parentForm.get(`frmToothLinkFormArray_${this.sectionIndex}_${this.sectionItemIndex}`)) {
            this.parentForm.removeControl(`frmToothLinkFormArray_${this.sectionIndex}_${this.sectionItemIndex}`);
        }

        this.frmToothLink = this.fb.group({
            questionLinkToothText: [this.sectionItem?.FormBankItem?.ItemText, [Validators.required, Validators.maxLength(250)]],
            questionLinkToothCKB: [this.sectionItem?.IsRequired]
        });

        this.changeDetectorRef.detectChanges();
        this.parentForm.addControl(`frmToothLinkFormArray_${this.sectionIndex}_${this.sectionItemIndex}`, this.fb.array([this.frmToothLink]));

        //Set Focus in add/New Record creation mode not applicable in edit mode
        if (this.sectionItem?.FormBankItem?.ItemText == "" || this.sectionItem?.FormBankItem?.ItemText == null) {
            //Set initial focus on 1st control
            this.changeDetectorRef.detectChanges();
            // Set focus on latest input field.
            if (this._elementRef?.nativeElement?.querySelector(`#questionLinkToothText${this.sectionIndex}_${this.sectionItemIndex}`)) {
                this._elementRef?.nativeElement?.querySelector(`#questionLinkToothText${this.sectionIndex}_${this.sectionItemIndex}`)?.focus();
            }
        }
        this.setUpdatedFormValues();
    }

    setUpdatedFormValues = () => {
        this.formValueSubscription = this.frmToothLink.valueChanges.pipe(debounceTime(500)).subscribe((changedValues) => {
            if (changedValues) {
                this.noteTemplatesHelperService.setUndo(true);
                this.noteTemplatesHelperService.undoStack.push("value_changed");
                this.formDataArray.push({ formData: cloneDeep(this.sectionItem), sectionItemIndex: this.sectionItemIndex });
                this.sectionItem.FormBankItem.ItemText = changedValues['questionLinkToothText'];
                this.sectionItem.FormBankItem.Description = changedValues['questionLinkToothText'];
                this.sectionItem.IsRequired = changedValues['questionLinkToothCKB'];
            }
        });
    }


    loadTeethSelectOptions = () => {
        this.staticData.TeethDefinitions().then((res) => {
            const teethDefinitions = res?.Value;
            this.sectionItem.$$activeTeeth = [];
            this.sectionItem.$$TeethSelectOptions = teethDefinitions?.Teeth;
        });
    }

    changeSkip = (event) => {
        if (event == false) {
            this.loadTeethSelectOptions();
        }
    }

    ngOnDestroy() {
        this.formValueSubscription?.unsubscribe();
        this.subscription?.unsubscribe();
    }
}