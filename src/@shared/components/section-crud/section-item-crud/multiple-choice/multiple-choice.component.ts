// The component is using the default change detection strategy, but we needed to handle dynamic DOM changes
// that must be loaded before using the component, and to handle potential errors related to DOM expression changes. 
// Therefore, we added manual change detection using "ChangeDetectorRef".
// https://stackoverflow.com/questions/36919399/angular-2-view-not-updating-after-model-changes

import { ChangeDetectorRef, ElementRef, OnDestroy } from '@angular/core';
import { Component, OnInit, Input } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Subscription } from 'rxjs';
import { BankItemOption, CustomFormTemplate, FormDataArray, FormSectionItem, ItemOption } from 'src/business-center/practice-settings/chart/note-templates/note-templates';
import cloneDeep from 'lodash/cloneDeep';
import { NoteTemplatesHelperService } from 'src/business-center/practice-settings/chart/note-templates/note-templates-helper.service';
import { debounceTime } from 'rxjs/operators';

@Component({
    selector: 'multiple-choice',
    templateUrl: './multiple-choice.component.html',
    styleUrls: ['./multiple-choice.component.scss']
})
export class MultipleChoiceComponent implements OnInit, OnDestroy {

    @Input() parentForm: FormGroup;
    @Input() inputIsDisabled = false;
    @Input() sectionItem: FormSectionItem;
    @Input() sectionIndex: number;
    @Input() sectionItemIndex: number;
    @Input() editItem = true;
    @Input() formDataArray: FormDataArray[] = [];

    formSubscription: Subscription;
    subscription: Subscription;
    questionMultipleChoiceForm: FormGroup;
    confirmOptionRemoveIndex = -1;
    customForm: CustomFormTemplate;
    manualDetectedChanges = false;

    constructor(public fb: FormBuilder, private _elementRef: ElementRef, private changeDetectorRef: ChangeDetectorRef,
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
        if (this.parentForm.get(`questionMultipleChoiceFormArray_${this.sectionIndex}_${this.sectionItemIndex}`)) {
            this.parentForm.removeControl(`questionMultipleChoiceFormArray_${this.sectionIndex}_${this.sectionItemIndex}`);
        }

        this.questionMultipleChoiceForm = this.fb.group({
            questionMultipleChoiceText: [this.sectionItem?.FormBankItem?.ItemText, [Validators.required, Validators.maxLength(250)]],
            questionMultipleChoiceCKB: [this.sectionItem?.IsRequired],
            questionMultipleChoiceAllowMultipleAnsCKB: [this.sectionItem?.MultiSelectAllow]
        });

        for (let i = 0; i < this.sectionItem?.ItemOptions?.length; i++) {
            const control = this.fb.control(this.sectionItem?.ItemOptions[i]?.BankItemOption.OptionText, [Validators.required, Validators.maxLength(100)]);
            this.questionMultipleChoiceForm.addControl(`questionMultipleChoiceOptionText${this.sectionIndex}_${this.sectionItemIndex}_${i}`, control);
        }

        this.changeDetectorRef.detectChanges();
        this.parentForm.addControl(`questionMultipleChoiceFormArray_${this.sectionIndex}_${this.sectionItemIndex}`, this.fb.array([this.questionMultipleChoiceForm]));

        if (this.sectionItem?.FormBankItem?.ItemText == null || this.sectionItem?.FormBankItem?.ItemText == "") {
            this.changeDetectorRef.detectChanges();
            // Set focus on latest input field.
            if (this._elementRef?.nativeElement?.querySelector(`#questionMultipleChoiceText${this.sectionIndex}_${this.sectionItemIndex}`)) {
                this._elementRef?.nativeElement?.querySelector(`#questionMultipleChoiceText${this.sectionIndex}_${this.sectionItemIndex}`)?.focus();
            }
        }
        this.setUpdatedFormValues();
    }

    setUpdatedFormValues = () => {
        this.formSubscription = this.questionMultipleChoiceForm.valueChanges.pipe(debounceTime(500)).subscribe((changedValues) => {
            if (changedValues) {
                this.noteTemplatesHelperService.setUndo(true);
                if (this.manualDetectedChanges == false) {
                    this.noteTemplatesHelperService.undoStack?.push("value_changed");
                    this.formDataArray?.push({ formData: cloneDeep(this.sectionItem), sectionItemIndex: this.sectionItemIndex });
                }
                for (let i = 0; i < this.sectionItem?.ItemOptions?.length; i++) {
                    this.sectionItem.ItemOptions[i].BankItemOption.OptionText = changedValues[`questionMultipleChoiceOptionText${this.sectionIndex}_${this.sectionItemIndex}_${i}`];
                }
                this.sectionItem.FormBankItem.ItemText = changedValues['questionMultipleChoiceText'];
                this.sectionItem.FormBankItem.Description = changedValues['questionMultipleChoiceText'];
                this.sectionItem.IsRequired = changedValues['questionMultipleChoiceCKB'];
                this.sectionItem.MultiSelectAllow = changedValues['questionMultipleChoiceAllowMultipleAnsCKB'];
                this.manualDetectedChanges = false;
            }
        });
    }

    addNewMultipleChoiceOption = (sectionIndex: number, sectionItemIndex: number) => {
        this.noteTemplatesHelperService.undoStack?.push("value_changed");
        this.formDataArray?.push({ formData: cloneDeep(this.sectionItem), sectionItemIndex: this.sectionItemIndex });
        const newOptionId = this.sectionItem?.ItemOptions?.length + 1;
        const newOptionObject = this.initializeSectionItemOption(sectionItemIndex);
        newOptionObject.BankItemOption.OptionIndex = newOptionId;
        newOptionObject.SequenceNumber = newOptionId;
        newOptionObject.BankItemOption.OptionText = '';
        this.sectionItem?.ItemOptions?.push(newOptionObject);
        const elementName = `questionMultipleChoiceOptionText${sectionIndex}_${sectionItemIndex}_${(this.sectionItem?.ItemOptions?.length - 1)}`;
        const control = this.fb.control("", [Validators.required, Validators.maxLength(100)]);
        this.questionMultipleChoiceForm?.addControl(elementName, control);
        this.changeDetectorRef.detectChanges();
        this.manualDetectedChanges = true;
        // Set focus on latest input field.
        if (this._elementRef?.nativeElement?.querySelector("#" + elementName)) {
            this._elementRef?.nativeElement?.querySelector("#" + elementName)?.focus();
        }
        this.resequenceFormItemOptions(this.sectionItem?.ItemOptions);
    }

    initializeSectionItemOption = (sequenceNumber: number) => {
        const formSectionItemOption: ItemOption = new ItemOption();
        const bankItemOption: BankItemOption = new BankItemOption();
        bankItemOption.BankItemOptionId = "";
        bankItemOption.OptionIndex = sequenceNumber + 1;
        bankItemOption.OptionText = "";
        bankItemOption.OptionValue = "";
        bankItemOption.IsSelected = true;
        bankItemOption.IsVisible = true;
        bankItemOption.SequenceNumber = sequenceNumber;
        formSectionItemOption.SectionItemId = "";
        formSectionItemOption.SectionItemOptionId = "";
        formSectionItemOption.BankItemId = "";
        formSectionItemOption.BankItemOptionId = "";
        formSectionItemOption.SectionItemId = "";
        formSectionItemOption.SectionItemOptionId = "";
        formSectionItemOption.BankItemId = "";
        formSectionItemOption.BankItemOptionId = "";
        formSectionItemOption.BankItemOption = bankItemOption;
        formSectionItemOption.IsSelected = true;
        formSectionItemOption.IsVisible = true;
        formSectionItemOption.SequenceNumber = sequenceNumber;
        return formSectionItemOption;
    }

    removeMultipleChoiceOption = (sectionIndex: number, sectionItemIndex: number) => {
        this.noteTemplatesHelperService.undoStack?.push("value_changed");
        this.formDataArray?.push({ formData: cloneDeep(this.sectionItem), sectionItemIndex: this.sectionItemIndex });
        this.sectionItem?.ItemOptions?.splice(this.confirmOptionRemoveIndex, 1);
        const elementName = `questionMultipleChoiceOptionText${sectionIndex}_${sectionItemIndex}_${this.sectionItem?.ItemOptions?.length - 1}`;
        this.changeDetectorRef.detectChanges();
        this.manualDetectedChanges = true;
        // Set focus on latest field.
        if (this._elementRef?.nativeElement?.querySelector("#" + elementName)) {
            this._elementRef?.nativeElement?.querySelector("#" + elementName).focus();
        }
        this.confirmOptionRemoveIndex = -1;
        this.resequenceFormItemOptions(this.sectionItem?.ItemOptions);
        //Recreate form to reorder the controls
        this.createForm();
    };

    // Function to cancel remove new options operation for MultipleChoice question.
    cancelRemoveMultipleChoiceOption = () => {
        this.confirmOptionRemoveIndex = -1;
    };

    confirmRemoveMultipleChoiceOption = (optionObject, index) => {
        this.confirmOptionRemoveIndex = index;
        this.resequenceFormItems(this.sectionItem?.ItemOptions);
    };

    resequenceFormItems = (section) => {
        let i = 0;
        section?.forEach((res) => {
            res.SequenceNumber = i;
            i++
        })
    }

    resequenceFormItemOptions = (section) => {
        let i = 0;
        section?.forEach((res) => {
            res.BankItemOption.OptionIndex = i;
            i++
        });
    }

    ngOnDestroy() {
        this.formSubscription?.unsubscribe();
        this.subscription?.unsubscribe();
    }
}
