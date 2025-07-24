// The component is using the default change detection strategy, but we needed to handle dynamic DOM changes
// that must be loaded before using the component, and to handle potential errors related to DOM expression changes. 
// Therefore, we added manual change detection using "ChangeDetectorRef".
// https://stackoverflow.com/questions/36919399/angular-2-view-not-updating-after-model-changes

import { Component, OnInit, Input, OnDestroy, ChangeDetectorRef, ElementRef } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Subscription } from 'rxjs';
import { CustomFormTemplate, FormDataArray, FormSectionItem } from 'src/business-center/practice-settings/chart/note-templates/note-templates';
import cloneDeep from 'lodash/cloneDeep';
import { NoteTemplatesHelperService } from 'src/business-center/practice-settings/chart/note-templates/note-templates-helper.service';
import { debounceTime } from 'rxjs/operators';

@Component({
    selector: 'custom-text-field',
    templateUrl: './custom-text-field.component.html',
    styleUrls: ['./custom-text-field.component.scss']
})

export class CustomTextFieldComponent implements OnInit, OnDestroy {

    @Input() inputIsDisabled: boolean;
    @Input() sectionIndex: number;
    @Input() sectionItemIndex: number;
    @Input() editItem = true;
    @Input() parentForm: FormGroup;
    @Input() sectionItem: FormSectionItem;
    @Input() formDataArray: FormDataArray[] = [];

    formValueSubscription: Subscription;
    frmQuestionTextField: FormGroup;
    subscription: Subscription;
    customForm: CustomFormTemplate;

    constructor(public fb: FormBuilder, private changeDetectorRef: ChangeDetectorRef, private _elementRef: ElementRef,
        private noteTemplatesHelperService: NoteTemplatesHelperService) { }

    ngOnInit(): void {
        this.subscription = this.noteTemplatesHelperService.getData().subscribe((res) => {
            this.customForm = res;
        })
        if (this.editItem == true) {
            this.createForm();
        }
    }

    createForm = () => {
        //Remove Existing form if exist in array
        if (this.parentForm.get(`frmQuestionTextFieldFormArray_${this.sectionIndex}_${this.sectionItemIndex}`)) {
            this.parentForm.removeControl(`frmQuestionTextFieldFormArray_${this.sectionIndex}_${this.sectionItemIndex}`);
        }

        this.frmQuestionTextField = this.fb.group({
            questionTextFieldText: [this.sectionItem?.FormItemTextField?.NoteText, [Validators.required, Validators.maxLength(1000)]]
        });

        this.changeDetectorRef.detectChanges();
        this.parentForm.addControl(`frmQuestionTextFieldFormArray_${this.sectionIndex}_${this.sectionItemIndex}`, this.fb.array([this.frmQuestionTextField]));

        //Set Focus in add/New Record creation mode not applicable in edit mode
        if (this.sectionItem?.FormItemTextField?.NoteText == "" || this.sectionItem?.FormItemTextField?.NoteText == null) {
            //Set initial focus on 1st control
            this.changeDetectorRef.detectChanges();
            // Set focus on latest input field.
            if (this._elementRef?.nativeElement?.querySelector(`#questionTextFieldText${this.sectionIndex}_${this.sectionItemIndex}`)) {
                this._elementRef?.nativeElement?.querySelector(`#questionTextFieldText${this.sectionIndex}_${this.sectionItemIndex}`)?.focus();
            }
        }
        this.setUpdatedFormValues();
    }

    setUpdatedFormValues = () => {
        this.formValueSubscription = this.frmQuestionTextField.valueChanges.pipe(debounceTime(500)).subscribe((changedValues) => {
            if (changedValues) {
                this.noteTemplatesHelperService.setUndo(true);
                this.noteTemplatesHelperService.undoStack.push("value_changed");
                this.formDataArray.push({ formData: cloneDeep(this.sectionItem), sectionItemIndex: this.sectionItemIndex });
                this.sectionItem.FormItemTextField.NoteText = changedValues['questionTextFieldText'];
            }
        });
    }

    ngOnDestroy() {
        this.formValueSubscription?.unsubscribe();
        this.subscription?.unsubscribe();
    }
}
