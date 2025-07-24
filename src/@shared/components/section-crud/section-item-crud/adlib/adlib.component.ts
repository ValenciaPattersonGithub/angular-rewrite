// The component is using the default change detection strategy, but we needed to handle dynamic DOM changes
// that must be loaded before using the component, and to handle potential errors related to DOM expression changes. 
// Therefore, we added manual change detection using "ChangeDetectorRef".
// https://stackoverflow.com/questions/36919399/angular-2-view-not-updating-after-model-changes

import { Component, OnInit, Input, OnDestroy, ElementRef, ChangeDetectorRef } from '@angular/core';
import { BankItemOption, CustomFormTemplate, FormDataArray, FormSectionItem, ItemOption } from 'src/business-center/practice-settings/chart/note-templates/note-templates';
import { Subscription } from 'rxjs';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NoteTemplatesComponent } from 'src/business-center/practice-settings/chart/note-templates/note-templates.component';
import { OrderByPipe } from '../../../../pipes';
import cloneDeep from 'lodash/cloneDeep';
import { NoteTemplatesHelperService } from 'src/business-center/practice-settings/chart/note-templates/note-templates-helper.service';
import { debounceTime } from 'rxjs/operators';

@Component({
    selector: 'adlib',
    templateUrl: './adlib.component.html',
    styleUrls: ['./adlib.component.scss']
})
export class AdlibComponent implements OnInit, OnDestroy {

    @Input() parentForm: FormGroup;
    @Input() inputIsDisabled = false;
    @Input() sectionItem: FormSectionItem;
    @Input() sectionIndex: number;
    @Input() sectionItemIndex: number;
    @Input() editItem = true;
    @Input() formDataArray: FormDataArray[] = [];

    formValueSubscription: Subscription;
    questionAdlib: FormGroup;
    confirmOptionRemoveIndex = -1;
    orderPipe = new OrderByPipe();
    subscription: Subscription;
    customForm: CustomFormTemplate;
    manualDetectedChanges = false;

    constructor(public fb: FormBuilder, private _elementRef: ElementRef, public noteTemplatesComponent: NoteTemplatesComponent, private changeDetectorRef: ChangeDetectorRef,
        private noteTemplatesHelperService: NoteTemplatesHelperService) { }

    ngOnInit(): void {
        this.subscription = this.noteTemplatesHelperService.getData().subscribe((res) => {
            this.customForm = res;
        })
        if (this.editItem == true) {
            this.createForm();
        }
    }

    createForm = (isInitializing = true) => {
        //Remove Existing form if exist in array
        if (this.parentForm.get(`questionAdlibFormArray_${this.sectionIndex}_${this.sectionItemIndex}`)) {
            this.parentForm.removeControl(`questionAdlibFormArray_${this.sectionIndex}_${this.sectionItemIndex}`);
        }

        this.questionAdlib = this.fb.group({
            questionAdlibRequired: [this.sectionItem?.IsRequired]
        });

        this.sectionItem.FormBankItemPromptTexts = this.orderPipe.transform(this.sectionItem?.FormBankItemPromptTexts, { sortColumnName: 'ItemSequenceNumber', sortDirection: 1 });
        this.sectionItem.ItemPromptTextsOptions[0] = this.orderPipe.transform(this.sectionItem?.ItemPromptTextsOptions[0], { sortColumnName: 'BankItemOption?.OptionIndex', sortDirection: 1 });

        for (let i = 0; i < this.sectionItem?.FormBankItemPromptTexts?.length; i++) {
            const control = this.fb.control(this.sectionItem?.FormBankItemPromptTexts[i]?.ItemText, [Validators.required, Validators.maxLength(500)]);
            const element = `questionAdlibText${this.sectionIndex}_${this.sectionItemIndex}_${i}`;
            this.questionAdlib.addControl(element, control);
        }

        //Some legacy JS records have empty responses saved. This removes those empty responses.
        if (isInitializing) {
            for (let i = 0; i < this.sectionItem?.ItemPromptTextsOptions[0]?.length; i++) {
                if (this.sectionItem?.ItemPromptTextsOptions[0][i]?.BankItemOption?.OptionText == null
                    || this.sectionItem?.ItemPromptTextsOptions[0][i]?.BankItemOption?.OptionText == undefined
                    || this.sectionItem?.ItemPromptTextsOptions[0][i]?.BankItemOption?.OptionText == '') {
                    this.sectionItem?.ItemPromptTextsOptions[0].splice(i, 1)
                }
            }
        }
        for (let i = 0; i < this.sectionItem?.ItemPromptTextsOptions[0]?.length; i++) {
            const control = this.fb.control(this.sectionItem?.ItemPromptTextsOptions[0][i]?.BankItemOption?.OptionText, [Validators.maxLength(100)]);
            this.questionAdlib.addControl(`questionAdlibOptionText${this.sectionIndex}_${this.sectionItemIndex}_${i}`, control);
        }

        this.changeDetectorRef.detectChanges();
        this.parentForm.addControl(`questionAdlibFormArray_${this.sectionIndex}_${this.sectionItemIndex}`, this.fb.array([this.questionAdlib]));

        //Set focus on 1st control while adding new record only not apply in edit mode
        if (this.sectionItem?.FormBankItemPromptTexts[0]?.ItemText == null || this.sectionItem?.FormBankItemPromptTexts[0]?.ItemText == "") {
            //Set initial focus on 1st control
            this.changeDetectorRef.detectChanges();
            // Set focus on latest input field.
            if (this._elementRef?.nativeElement?.querySelector(`#questionAdlibText${this.sectionIndex}_${this.sectionItemIndex}0`)) {
                this._elementRef?.nativeElement?.querySelector(`#questionAdlibText${this.sectionIndex}_${this.sectionItemIndex}0`)?.focus();
            }
        }
        this.setUpdatedFormValues();
    }

    setUpdatedFormValues = () => {
        this.formValueSubscription = this.questionAdlib.valueChanges.pipe(debounceTime(500)).subscribe((changedValues) => {
            if (changedValues) {
                this.noteTemplatesHelperService.setUndo(true);
                if (this.manualDetectedChanges == false) {
                    this.noteTemplatesHelperService.undoStack.push("value_changed");
                    this.formDataArray?.push({ formData: cloneDeep(this.sectionItem), sectionItemIndex: this.sectionItemIndex });
                }
                this.sectionItem.FormBankItemPromptTexts = this.orderPipe.transform(this.sectionItem?.FormBankItemPromptTexts, { sortColumnName: 'ItemSequenceNumber', sortDirection: 1 });
                this.sectionItem.ItemPromptTextsOptions[0] = this.orderPipe.transform(this.sectionItem?.ItemPromptTextsOptions[0], { sortColumnName: 'BankItemOption?.OptionIndex', sortDirection: 1 });

                for (let i = 0; i < this.sectionItem?.FormBankItemPromptTexts?.length; i++) {
                    this.sectionItem.FormBankItemPromptTexts[i].ItemText = changedValues[`questionAdlibText${this.sectionIndex}_${this.sectionItemIndex}_${i}`];
                    this.sectionItem.FormBankItemPromptTexts[i].Description = changedValues[`questionAdlibText${this.sectionIndex}_${this.sectionItemIndex}_${i}`];
                }
                for (let i = 0; i < this.sectionItem?.ItemPromptTextsOptions[0]?.length; i++) {
                    this.sectionItem.ItemPromptTextsOptions[0][i].BankItemOption.OptionText = changedValues[`questionAdlibOptionText${this.sectionIndex}_${this.sectionItemIndex}_${i}`];
                }
                this.sectionItem.IsRequired = changedValues['questionAdlibRequired'];
                this.manualDetectedChanges = false;
            }
        });
    }

    confirmRemoveMultipleChoiceOption = (optionObject, index) => {
        this.confirmOptionRemoveIndex = index;
        this.resequenceFormItems(this.sectionItem?.ItemOptions);
    };

    resequenceFormItems = (section) => {
        let i = 0;
        section.forEach((res) => {
            res.SequenceNumber = i;
            i++
        });
    }

    addNewAdlibResponse = (sectionIndex: number, sectionItemIndex: number) => {
        if (this.sectionItem.ItemPromptTextsOptions[0] === undefined) {
            this.sectionItem.ItemPromptTextsOptions = [[]];
        }
        this.noteTemplatesHelperService.undoStack?.push("value_changed");
        this.formDataArray?.push({ formData: cloneDeep(this.sectionItem), sectionItemIndex: this.sectionItemIndex });
        // get next available optionIndex
        const optionIndex = this.sectionItem?.ItemPromptTextsOptions[0]?.length + 1;
        // until we allow 3 or more prompts this is always 1
        const sequenceNumber = 1;
        const newResponse = this.initializeAdlibSectionItemOption(sequenceNumber, optionIndex)
        this.sectionItem?.ItemPromptTextsOptions[0]?.push(newResponse);
        const elementName = `questionAdlibOptionText${sectionIndex}_${sectionItemIndex}_${this.sectionItem?.ItemPromptTextsOptions[0]?.length - 1}`;
        const control = this.fb.control("", [Validators.maxLength(500)]);
        this.questionAdlib?.addControl(elementName, control);
        this.changeDetectorRef.detectChanges();
        this.manualDetectedChanges = true;
        // Set focus on latest input field.
        if (this._elementRef?.nativeElement?.querySelector("#" + elementName)) {
            this._elementRef?.nativeElement?.querySelector("#" + elementName)?.focus();
        }
    }

    initializeAdlibSectionItemOption = (sequenceNumber, optionIndex) => {
        const formSectionItemOption = this.initializeSectionItemOption(sequenceNumber);
        formSectionItemOption.BankItemOption.OptionIndex = optionIndex;
        formSectionItemOption.BankItemOption.SequenceNumber = sequenceNumber;
        return formSectionItemOption;
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

    removeAdlibMultipleChoiceOption = (sectionIndex: number, sectionItemIndex: number) => {
        this.noteTemplatesHelperService.undoStack?.push("value_changed");
        this.formDataArray?.push({ formData: cloneDeep(this.sectionItem), sectionItemIndex: this.sectionItemIndex });
        this.sectionItem?.ItemPromptTextsOptions[0]?.splice(this.confirmOptionRemoveIndex, 1);
        const elementName = `questionAdlibRpesonses${sectionIndex}_${sectionItemIndex}_${(this.sectionItem?.ItemOptions?.length - 1)}`;
        this.changeDetectorRef.detectChanges();
        this.manualDetectedChanges = true;
        // Set focus on latest field.
        if (this._elementRef?.nativeElement?.querySelector("#" + elementName)) {
            this._elementRef?.nativeElement?.querySelector("#" + elementName).focus();
        }
        this.confirmOptionRemoveIndex = -1;
        //Recreate form to reorder the controls
        this.createForm(false);
    };

    // Function to cancel remove new options operation for MultipleChoice question.
    cancelRemoveMultipleChoiceOption = () => {
        this.confirmOptionRemoveIndex = -1;
    };

    isValidCustomFormCheck = (cleanupOptions) => {
        this.noteTemplatesComponent.isValidCustomFormCheck(cleanupOptions);
    }

    trackByMethod = (index: number) => {
        return index;
    }

    ngOnDestroy() {
        this.formValueSubscription?.unsubscribe();
        this.subscription?.unsubscribe();
    }
}
