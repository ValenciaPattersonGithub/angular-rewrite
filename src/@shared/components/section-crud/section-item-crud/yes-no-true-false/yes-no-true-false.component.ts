// The component is using the default change detection strategy, but we needed to handle dynamic DOM changes
// that must be loaded before using the component, and to handle potential errors related to DOM expression changes. 
// Therefore, we added manual change detection using "ChangeDetectorRef".
// https://stackoverflow.com/questions/36919399/angular-2-view-not-updating-after-model-changes

import { ChangeDetectorRef, ElementRef, Inject, OnDestroy } from '@angular/core';
import { Component, OnInit, Input } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Subscription } from 'rxjs';
import { CustomFormTemplate, FormDataArray, FormSectionItem } from 'src/business-center/practice-settings/chart/note-templates/note-templates';
import cloneDeep from 'lodash/cloneDeep';
import { NoteTemplatesHelperService } from 'src/business-center/practice-settings/chart/note-templates/note-templates-helper.service';
import { debounceTime } from 'rxjs/operators';

@Component({
    selector: 'yes-no-true-false',
    templateUrl: './yes-no-true-false.component.html',
    styleUrls: ['./yes-no-true-false.component.scss']
})
export class YesNoTrueFalseComponent implements OnInit, OnDestroy {

    @Input() parentForm: FormGroup;
    @Input() inputIsDisabled = false;
    @Input() sectionItem: FormSectionItem;
    @Input() sectionIndex: number;
    @Input() sectionItemIndex: number;
    @Input() editItem = true;
    @Input() formDataArray: FormDataArray[] = [];

    formValueSubscription: Subscription;
    subscription: Subscription;
    questionYesNoTrueFalse: FormGroup;
    customForm: CustomFormTemplate;
    yesNoTrueFalseOptions = [
        { label: this.localize.getLocalizedString('yes or no'), value: 2 },
        { label: this.localize.getLocalizedString('true or false'), value: 8 }
    ];

    constructor(public fb: FormBuilder, @Inject('localize') private localize, private changeDetectorRef: ChangeDetectorRef, private _elementRef: ElementRef,
        private noteTemplatesHelperService: NoteTemplatesHelperService) { }

    ngOnInit(): void {
        this.subscription = this.noteTemplatesHelperService.getData().subscribe((res) => {
            this.customForm = res;
        });
        if (this.editItem == true) {
            this.createForm();
        }
    }

    createForm = () => {
        //Remove Existing form if exist in array
        if (this.parentForm.get(`questionYesNoTrueFalseFormArray_${this.sectionIndex}_${this.sectionItemIndex}`)) {
            this.parentForm.removeControl(`questionYesNoTrueFalseFormArray_${this.sectionIndex}_${this.sectionItemIndex}`);
        }

        this.questionYesNoTrueFalse = this.fb.group({
            questionYesNoTrueFalseText: [this.sectionItem?.FormBankItem?.ItemText, [Validators.required, Validators.maxLength(250)]],
            questionYesNoTrueFalseCKB: [this.sectionItem?.IsRequired],
            selectYesNoTrueFalse: [this.sectionItem?.FormItemType]
        });

        this.changeDetectorRef.detectChanges();
        this.parentForm.addControl(`questionYesNoTrueFalseFormArray_${this.sectionIndex}_${this.sectionItemIndex}`, this.fb.array([this.questionYesNoTrueFalse]));

        //Set Focus in add/New Record creation mode
        if (this.sectionItem?.FormBankItem?.ItemText == "" || this.sectionItem?.FormBankItem?.ItemText == null) {
            //Set initial focus on 1st control
            this.changeDetectorRef.detectChanges();
            // Set focus on latest input field.
            if (this._elementRef?.nativeElement?.querySelector(`#questionYesNoTrueFalseText${this.sectionIndex}_${this.sectionItemIndex}`)) {
                this._elementRef?.nativeElement?.querySelector(`#questionYesNoTrueFalseText${this.sectionIndex}_${this.sectionItemIndex}`)?.focus();
            }
        }
        this.setUpdatedFormValues();
    }

    setUpdatedFormValues = () => {
        this.formValueSubscription = this.questionYesNoTrueFalse.valueChanges.pipe(debounceTime(500)).subscribe((changedValues) => {
            if (changedValues) {
                this.noteTemplatesHelperService.setUndo(true);
                this.noteTemplatesHelperService.undoStack.push("value_changed");
                this.formDataArray.push({ formData: cloneDeep(this.sectionItem), sectionItemIndex: this.sectionItemIndex });
                this.sectionItem.FormBankItem.ItemText = changedValues['questionYesNoTrueFalseText'];
                this.sectionItem.FormBankItem.Description = changedValues['questionYesNoTrueFalseText'];
                this.sectionItem.IsRequired = changedValues['questionYesNoTrueFalseCKB'];
                this.sectionItem.FormItemType = Number(changedValues['selectYesNoTrueFalse']);
            }
        });
    }

    ngOnDestroy() {
        this.formValueSubscription?.unsubscribe();
        this.subscription?.unsubscribe();
    }
}
