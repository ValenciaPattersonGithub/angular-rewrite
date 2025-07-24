import { Component, OnInit, Input, Inject, ElementRef, OnDestroy } from '@angular/core';
import { BankItemOption, CustomFormTemplate, FormBankItem, FormBankItemDemographic, FormBankItemEmergencyContact, FormBankItemPromptText, FormItemTextField, FormSection, FormSectionItem, FormTypes, ItemOption, sections } from 'src/business-center/practice-settings/chart/note-templates/note-templates';
import { NoteTemplatesHelperService } from 'src/business-center/practice-settings/chart/note-templates/note-templates-helper.service';
import cloneDeep from 'lodash/cloneDeep';
import { SectionCrudComponent } from '../section-crud.component';
import { ViewChild } from '@angular/core';
import { Subscription } from 'rxjs';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ChangeDetectorRef } from '@angular/core';

@Component({
    selector: 'section-header',
    templateUrl: './section-header.component.html',
    styleUrls: ['./section-header.component.scss']
})
export class SectionHeaderComponent implements OnInit, OnDestroy {

    customForm: CustomFormTemplate;
    formsName = FormTypes;
    sections: { Text: string, Value: string }[] = []; //Used for note template

    @Input() parentForm: FormGroup;
    @Input() formType: string;
    @Input() section: FormSection;
    @Input() sectionIndex: number;
    @Input() first = false;
    @Input() last = false;
    canUndo = false;
    canRedo = false; //ToDo: Add Redo Functionality with medicalhistory forms
    undoCount = 0;

    @ViewChild('inputServiceCode') inputServiceCode: ElementRef;

    sectionSelected = 0;
    subscription: Subscription;
    sectionHeaderForm: FormGroup;
    formValueSubscription: Subscription;
    undoSubscription: Subscription;
    constructor(
        @Inject('CustomFormsFactory') private customFormsFactory,
        public noteTemplatesHelperService: NoteTemplatesHelperService,
        public sectionCrudComponent: SectionCrudComponent,
        private _elementRef: ElementRef,
        @Inject('localize') private localize,
        public fb: FormBuilder,
        private changeDetectorRef: ChangeDetectorRef) { }

    ngOnInit(): void {
        this.subscription = this.noteTemplatesHelperService.getData().subscribe((res) => {
            this.customForm = res;
        })
        this.undoSubscription = this.noteTemplatesHelperService.getUndo().subscribe((res) => {
            this.canUndo = res;
        })
        this.setSectionsValue();
        this.createForm();
    }

    createForm = () => {
        //Remove Existing form if exist in array
        if (this.parentForm.get("sectionHeaderFormArray")) {
            this.parentForm.removeControl("sectionHeaderFormArray");
        }

        this.sectionHeaderForm = this.fb.group({
            inpSectionTitle: [this.section?.Title, [Validators.required, Validators.maxLength(256)]]
        });

        this.changeDetectorRef.detectChanges();
        this.parentForm.addControl("sectionHeaderFormArray", this.fb.array([this.sectionHeaderForm]));

        //Set Focus in add/New Record creation mode not applicable in edit mode
        if (this.section?.Title == "" || this.section?.Title == null) {
            //Set initial focus on 1st control
            this.changeDetectorRef.detectChanges();
            // Set focus on latest input field.
            if (this._elementRef?.nativeElement?.querySelector(`#inpSectionTitle_${this.sectionIndex}`)) {
                this._elementRef?.nativeElement?.querySelector(`#inpSectionTitle_${this.sectionIndex}`)?.focus();
            }
        }

        this.setUpdatedFormValues();
    }

    setUpdatedFormValues = () => {
        this.formValueSubscription = this.sectionHeaderForm.valueChanges.subscribe((changedValues) => {
            if (changedValues) {
                this.noteTemplatesHelperService.setUndo(true);
                this.section.Title = changedValues['inpSectionTitle'];
            }
        });
    }

    setSectionsValue = () => {
        this.sections = Object.keys(sections)
            .filter(k => typeof sections[k] === 'number')
            .map(label => ({ Value: sections[label], Text: this.localize.getLocalizedString(label) }));
    }

    addSectionClick = (sectionIndex, value) => {
        switch (value?.toString()) {
            case '1':
                this.addSectionItem(sectionIndex, FormTypes['Multiple Choice']);
                break;
            case '2':
                this.addSectionItem(sectionIndex, FormTypes['Yes/No True/False']);
                break;
            case '3':
                this.addSectionItem(sectionIndex, FormTypes['Ad-Lib']);
                break;
            case '4':
                this.addSectionItem(sectionIndex, FormTypes['Link Tooth']);
                break;
            case '5':
                this.addSectionItem(sectionIndex, FormTypes['Note Text']);
                break;
        }
        this.sectionCrudComponent.IsExpanded = true;
    }

    onSectionSelectedChange = (value) => {
        this.sectionSelected = value;
        const index = this.section?.FormSectionItems?.length + 1;
        this.addSectionClick(index, this.sectionSelected);
    }

    addSectionItem = (sectionIndex: number, value) => {
        this.noteTemplatesHelperService.undoStack?.push("adding_section");
        this.noteTemplatesHelperService.setUndo(true);
        this.undoCount = 0;
        let newField: FormSectionItem = new FormSectionItem();
        let itemOption: ItemOption = new ItemOption();
        newField = Object.assign({}, this.initializeSectionItem(sectionIndex, value));
        this.customForm.SectionValidationFlag = false;
        this.customForm.SectionCopyValidationFlag = -1;
        const numberOfPrompts = 2;
        switch (value) {
            case 1:
                newField.FormItemTypeName = FormTypes[1]; //'Demographic Question';
                newField.FormItemType = FormTypes['Demographic Question'] //1;
                newField.FormBankItemDemographic.BankItemDemographicId = "00000000-0000-0000-0000-000000000001";
                newField.FormBankItemDemographic.FirstNameFormItemTypeId = 0;
                newField.FormBankItemDemographic.IsRequiredFirstName = true;
                newField.FormBankItemDemographic.LastNameFormItemTypeId = 0;
                newField.FormBankItemDemographic.IsRequiredLastName = true;
                newField.FormBankItemDemographic.PreferredNameFormItemTypeId = 0;
                newField.FormBankItemDemographic.IsRequiredPreferredName = false;
                newField.FormBankItemDemographic.AddressLine1FormItemTypeId = 0;
                newField.FormBankItemDemographic.IsRequiredAddressLine1 = false;
                newField.FormBankItemDemographic.AddressLine2FormItemTypeId = 0;
                newField.FormBankItemDemographic.IsRequiredAddressLine2 = false;
                newField.FormBankItemDemographic.CityFormItemTypeId = 0;
                newField.FormBankItemDemographic.IsRequiredCity = false;
                newField.FormBankItemDemographic.StateFormItemTypeId = 0;
                newField.FormBankItemDemographic.IsRequiredState = false;
                newField.FormBankItemDemographic.ZipFormItemTypeId = 0;
                newField.FormBankItemDemographic.IsRequiredZip = false;
                newField.FormBankItemDemographic.EmailAddressFormItemTypeId = 0;
                newField.FormBankItemDemographic.IsRequiredEmailAddress = false;
                newField.FormBankItemDemographic.PrimaryNumberFormItemTypeId = 0;
                newField.FormBankItemDemographic.IsRequiredPrimaryNumber = false;
                newField.FormBankItemDemographic.SecondaryNumberFormItemTypeId = 0;
                newField.FormBankItemDemographic.IsRequiredSecondaryNumber = false;
                newField.BankItemEmergencyContactId = null;
                newField.FormBankItemEmergencyContact = null;
                newField.BankItemId = null;
                newField.FormBankItem = null;
                break;
            case 2:
                newField.FormBankItem.FormItemTypeName = FormTypes[2];   //'Yes/No or True/False';
                newField.FormItemType = FormTypes['Yes/No True/False'];  //2
                newField.FormItemTypeName = FormTypes[2];   //'Yes/No or True/False';
                newField.BankItemDemographicId = null;
                newField.FormBankItemDemographic = null;
                newField.BankItemEmergencyContactId = null;
                newField.FormBankItemEmergencyContact = null;
                break;
            case 3:
                newField.FormBankItem.FormItemTypeName = FormTypes[3];  //'Multiple Choice';
                newField.FormItemTypeName = FormTypes[3];   //'Multiple Choice';
                newField.FormItemType = FormTypes['Multiple Choice']; //3

                // add 2 itemOptions
                itemOption = new ItemOption();
                itemOption = Object.assign({}, this.initializeSectionItemOption(sectionIndex));
                itemOption.BankItemOption.OptionIndex = 1;
                itemOption.SequenceNumber = 1;
                newField.ItemOptions.push(itemOption);

                itemOption = new ItemOption();
                itemOption = Object.assign({}, this.initializeSectionItemOption(sectionIndex));
                itemOption.BankItemOption.OptionIndex = 2;
                itemOption.SequenceNumber = 2;
                newField.ItemOptions.push(itemOption);

                newField.BankItemDemographicId = null;
                newField.FormBankItemDemographic = null;
                newField.BankItemEmergencyContactId = null;
                newField.FormBankItemEmergencyContact = null;
                break;
            case 4:
                newField.FormBankItem.FormItemTypeName = FormTypes[4]; //'Signature Box';
                newField.FormBankItem.Description = FormTypes[4];  //'Signature Box';
                newField.FormBankItem.ItemText = FormTypes[4];  //'Signature Box';
                newField.FormItemTypeName = FormTypes[4];  //'Signature Box';
                newField.FormItemType = FormTypes['Signature Box']; //4;

                newField.BankItemDemographicId = null;
                newField.FormBankItemDemographic = null;
                newField.BankItemEmergencyContactId = null;
                newField.FormBankItemEmergencyContact = null;
                break;
            case 5:
                newField.FormBankItem.FormItemTypeName = FormTypes[5];  // 'Date of Completion';
                newField.FormBankItem.Description = FormTypes[5];   // 'Date of Completion';
                newField.FormBankItem.ItemText = FormTypes[5];   //'Date of Completion';
                newField.FormItemTypeName = FormTypes[5];   //'Date of Completion';
                newField.FormItemType = FormTypes['Date of Completion'];  //5;
                newField.BankItemDemographicId = null;
                newField.FormBankItemDemographic = null;
                newField.BankItemEmergencyContactId = null;
                newField.FormBankItemEmergencyContact = null;
                break;
            case 6:
                newField.FormItemTypeName = FormTypes[6];  //'Emergency Contact';
                newField.FormItemType = FormTypes['Emergency Contact']; //6;
                newField.FormBankItemEmergencyContact.ContactFormItemTypeId = 0;
                newField.FormBankItemEmergencyContact.IsRequiredContact = false;
                newField.FormBankItemEmergencyContact.PhoneFormItemTypeId = 0;
                newField.FormBankItemEmergencyContact.IsRequiredPhone = false;
                newField.FormBankItemEmergencyContact.ContactRelationshipFormItemTypeId = 0;
                newField.FormBankItemEmergencyContact.IsRequiredContactRelationship = false;
                newField.BankItemDemographicId = null;
                newField.FormBankItemDemographic = null;
                newField.BankItemId = null;
                newField.FormBankItem = null;
                break;
            case 7:
                newField.FormBankItem.FormItemTypeName = FormTypes[7];  //'Comment/Essay';
                newField.FormItemTypeName = FormTypes[7];  //'Comment/Essay';
                newField.FormItemType = FormTypes['Comment/Essay']; //7;
                newField.BankItemDemographicId = null;
                newField.FormBankItemDemographic = null;
                newField.BankItemEmergencyContactId = null;
                newField.FormBankItemEmergencyContact = null;
                break;
            case 9:
                newField = this.addAdlibItem(numberOfPrompts, sectionIndex)
                break;
            case 10:
                newField = this.addLinkToothItem(sectionIndex)
                break;
            case 11:
                newField = this.addTextFieldItem(sectionIndex)
                break;
        }
        // put newField into fields array
        this.section.FormSectionItems.push(newField);
        this.customForm.FormSections[this.sectionIndex] = this.section;
        this.noteTemplatesHelperService.setData(this.customForm);
        this.setFocusForInputTitle(this.sectionIndex);
        if (newField.FormItemType == FormTypes['Yes/No True/False'] || newField.FormItemType == 8) {
            if (this._elementRef?.nativeElement?.querySelector(`#questionYesNoTrueFalseText${sectionIndex}_${(this.section?.FormSectionItems?.length - 1)}`)) {
                this._elementRef.nativeElement.querySelector(`#questionYesNoTrueFalseText${sectionIndex}_${(this.section?.FormSectionItems?.length - 1)}`)?.focus();
            }
        }
        else if (newField.FormItemType == FormTypes['Multiple Choice']) {
            if (this._elementRef?.nativeElement?.querySelector(`#questionMultipleChoiceText${sectionIndex}_${(this.section?.FormSectionItems?.length - 1)}`)) {
                this._elementRef.nativeElement.querySelector(`#questionMultipleChoiceText${sectionIndex}_${(this.section?.FormSectionItems?.length - 1)}`)?.focus();
            }
        }
        else if (newField.FormItemType == FormTypes['Comment/Essay']) {
            //ToDo: Check while MHF migration
            if (this._elementRef?.nativeElement?.querySelector(`#questionCommentEssayText${sectionIndex}_${(this.section?.FormSectionItems?.length - 1)}`)) {
                this._elementRef.nativeElement.querySelector(`#questionCommentEssayText${sectionIndex}_${(this.section?.FormSectionItems?.length - 1)}`)?.focus();
            }
        }
        else if (newField.FormItemType == FormTypes['Emergency Contact']) {
            //ToDo: Check while MHF migration
            if (this._elementRef?.nativeElement?.querySelector(`#questionEmergencyContactNameCKB${sectionIndex}_${(this.section?.FormSectionItems?.length - 1)}`)) {
                this._elementRef.nativeElement.querySelector(`#questionEmergencyContactNameCKB${sectionIndex}_${(this.section?.FormSectionItems?.length - 1)}`)?.focus();
            }
        }
        else if (newField.FormItemType == FormTypes['Demographic Question']) {
            //ToDo: Check while MHF migration
            if (this._elementRef?.nativeElement?.querySelector(`#questionDemographicPreferredNameCKB${sectionIndex}_${(this.section?.FormSectionItems?.length - 1)}`)) {
                this._elementRef.nativeElement.querySelector(`#questionDemographicPreferredNameCKB${sectionIndex}_${(this.section?.FormSectionItems?.length - 1)}`)?.focus();
            }
        }
        else if (newField.FormItemType == FormTypes['Date of Completion']) {
            //ToDo: Check while MHF migration
            if (this._elementRef?.nativeElement?.querySelector(`#lblDateOfCompletion${sectionIndex}_${(this.section?.FormSectionItems?.length - 1)}`)) {
                this._elementRef.nativeElement.querySelector(`#lblDateOfCompletion${sectionIndex}_${(this.section?.FormSectionItems?.length - 1)}`)?.focus();
            }
        }
        else if (newField.FormItemType == FormTypes['Signature Box']) {
            //ToDo: Check while MHF migration
            if (this._elementRef?.nativeElement?.querySelector(`#questionSignatureBoxCKB${sectionIndex}_${(this.section?.FormSectionItems?.length - 1)}`)) {
                this._elementRef.nativeElement.querySelector(`#questionSignatureBoxCKB${sectionIndex}_${(this.section?.FormSectionItems?.length - 1)}`)?.focus();
            }
        }
        else if (newField.FormItemType == FormTypes['Ad-Lib']) {
            if (this._elementRef?.nativeElement?.querySelector(`#questionAdlib1Text${sectionIndex}_${(this.section?.FormSectionItems?.length - 1)}`)) {
                this._elementRef.nativeElement.querySelector(`#questionAdlib1Text${sectionIndex}_${(this.section?.FormSectionItems?.length - 1)}`)?.focus();
            }
        }
        else if (newField.FormItemType == FormTypes['Link Tooth']) {
            if (this._elementRef?.nativeElement?.querySelector(`#questionLinkToothText${sectionIndex}_${(this.section?.FormSectionItems?.length - 1)}`)) {
                this._elementRef.nativeElement.querySelector(`#questionLinkToothText${sectionIndex}_${(this.section?.FormSectionItems?.length - 1)}`)?.focus();
            }
        }
        else if (newField.FormItemType == FormTypes['Note Text']) {
            if (this._elementRef?.nativeElement?.querySelector(`#questionTextFieldText${sectionIndex}_${(this.section?.FormSectionItems?.length - 1)}`)) {
                this._elementRef.nativeElement.querySelector(`#questionTextFieldText${sectionIndex}_${(this.section?.FormSectionItems?.length - 1)}`)?.focus();
            }
        }

        // making sure newly added FormItemTypeId is visible by scrolling page to the bottom
        if (this.section?.FormSectionItems?.length === sectionIndex) {
            window.scrollTo(0, document.body.scrollHeight);
        }

        return true;
    }

    initializeSectionItem = (sectionIndex, value) => {
        const formSectionItem: FormSectionItem = new FormSectionItem();

        //set form bank item
        const formBankItem: FormBankItem = new FormBankItem();
        formBankItem.ItemText = "";
        formBankItem.FormItemTypeName = "";
        formBankItem.Description = "";
        formBankItem.CommonlyUsed = false;
        formBankItem.IsVisible = true;
        formBankItem.UseDefaultValue = false;
        formBankItem.DefaultValue = "";

        formSectionItem.FormSectionId = "00000000-0000-0000-0000-000000000000";
        formSectionItem.SectionItemId = value;
        formSectionItem.BankItemId = "00000000-0000-0000-0000-000000000000";
        formSectionItem.FormBankItem = formBankItem;
        formSectionItem.IsRequired = false;
        formSectionItem.MultiSelectAllow = false;
        formSectionItem.IsVisible = true;
        formSectionItem.SequenceNumber = sectionIndex;
        formSectionItem.BankItemDemographicId = "00000000-0000-0000-0000-000000000000";
        formSectionItem.FormBankItemDemographic = new FormBankItemDemographic();
        formSectionItem.BankItemEmergencyContactId = "00000000-0000-0000-0000-000000000000";
        formSectionItem.FormBankItemEmergencyContact = new FormBankItemEmergencyContact();
        formSectionItem.ItemOptions = [];
        formSectionItem.FormItemType = null;
        formSectionItem.FormItemTypeName = "";
        return formSectionItem;
    }

    initializeSectionItemOption = (sectionIndex) => {
        const formSectionItemOption: ItemOption = new ItemOption();
        const bankItemOption: BankItemOption = new BankItemOption();
        bankItemOption.BankItemOptionId = "00000000-0000-0000-0000-000000000000";
        bankItemOption.OptionIndex = 1;
        bankItemOption.OptionText = "";
        bankItemOption.OptionValue = "";
        bankItemOption.IsSelected = true;
        bankItemOption.IsVisible = true;
        bankItemOption.SequenceNumber = sectionIndex;
        formSectionItemOption.SectionItemId = "00000000-0000-0000-0000-000000000000";
        formSectionItemOption.SectionItemOptionId = "00000000-0000-0000-0000-000000000000";
        formSectionItemOption.BankItemId = "00000000-0000-0000-0000-000000000000";
        formSectionItemOption.BankItemOptionId = "00000000-0000-0000-0000-000000000000";
        formSectionItemOption.SectionItemId = "00000000-0000-0000-0000-000000000000";
        formSectionItemOption.SectionItemOptionId = "00000000-0000-0000-0000-000000000000";
        formSectionItemOption.BankItemId = "00000000-0000-0000-0000-000000000000";
        formSectionItemOption.BankItemOptionId = "00000000-0000-0000-0000-000000000000";
        formSectionItemOption.BankItemOption = bankItemOption;
        formSectionItemOption.IsSelected = true;
        formSectionItemOption.IsVisible = true;
        formSectionItemOption.SequenceNumber = sectionIndex;
        return formSectionItemOption;
    }

    //#region Ad-Lib

    initializeAdlibFormBankItem = (optionIndex) => {
        const formBankItem: FormBankItemPromptText = new FormBankItemPromptText();
        formBankItem.Answer = null;
        formBankItem.ItemText = null;
        formBankItem.FormItemType = "00000000-0000-0000-0000-000000000009";
        formBankItem.FormItemTypeName = "";
        formBankItem.Description = "";
        formBankItem.CommonlyUsed = false;
        formBankItem.DefaultValue = "";
        formBankItem.IsVisible = true;
        formBankItem.ItemSequenceNumber = optionIndex;
        formBankItem.UseDefaultValue = false;
        return formBankItem;
    }

    addAdlibItem = (numberOfPrompts, sectionIndex) => {
        let formSectionItem: FormSectionItem = new FormSectionItem();
        formSectionItem = Object.assign({}, this.initializeSectionItem(sectionIndex, 0));

        // null out these
        formSectionItem.BankItemDemographicId = null;
        formSectionItem.FormBankItemDemographic = null;
        formSectionItem.BankItemEmergencyContactId = null;
        formSectionItem.FormBankItemEmergencyContact = null;
        formSectionItem.BankItemDemographicId = null;
        formSectionItem.BankItemDemographicId = null;
        formSectionItem.FormBankItemDemographic = null;
        formSectionItem.BankItemId = null;
        formSectionItem.FormBankItem = { Answer: "" };

        formSectionItem.FormItemTypeName = FormTypes[9]; //'Ad-Lib';
        formSectionItem.FormItemType = FormTypes['Ad-Lib'];  //9;
        formSectionItem.FormBankItemPromptTexts = [];
        formSectionItem.ItemPromptTextsOptions = [[]];
        formSectionItem.SequenceNumber = sectionIndex;

        // NOTE this will need to be refactored when we add more than 2 prompts
        // add 2 FormBankItems
        for (let i = 1; i <= numberOfPrompts; i++) {
            const formBankItem = this.initializeAdlibFormBankItem(i);
            formSectionItem.FormBankItemPromptTexts.push(formBankItem);
        }

        // add 3 ItemOptions to ItemPromptTextsOptions[0]
        for (let i = 1; i <= 2; i++) {
            // create a list of ItemOptions
            const itemOption = this.initializeSectionItemOption(sectionIndex);
            itemOption.BankItemOption.OptionIndex = i;
            itemOption.SequenceNumber = i;
            formSectionItem.ItemPromptTextsOptions[0].push(itemOption);
        }
        return formSectionItem;

    }
    //#endregion

    //#region link tooth type
    addLinkToothItem = (sectionIndex) => {
        let formSectionItem: FormSectionItem = new FormSectionItem();
        formSectionItem = Object.assign({}, this.initializeSectionItem(sectionIndex, 0));
        // null out these
        formSectionItem.BankItemDemographicId = null;
        formSectionItem.FormBankItemDemographic = null;
        formSectionItem.BankItemEmergencyContactId = null;
        formSectionItem.FormBankItemEmergencyContact = null;
        formSectionItem.FormBankItem.FormItemTypeName = FormTypes[10];  //Link Tooth
        formSectionItem.FormBankItem.Description = FormTypes[10];  //Link Tooth
        formSectionItem.FormItemTypeName = FormTypes[10];  //Link Tooth
        formSectionItem.FormItemType = FormTypes['Link Tooth'];// 10;
        formSectionItem.SequenceNumber = sectionIndex;
        return formSectionItem;
    };
    //#endregion

    //#region Text Field Item

    addTextFieldItem = (sectionIndex) => {
        let formSectionItem: FormSectionItem = new FormSectionItem();
        formSectionItem = Object.assign({}, this.initializeSectionItem(sectionIndex, 0));
        formSectionItem.FormItemTextField = new FormItemTextField();
        formSectionItem.FormItemTextField.NoteText = null;
        formSectionItem.FormItemTextField.IsRequiredNoteText = true;
        formSectionItem.FormItemTextField.TextFieldItemTypeId = FormTypes['Note Text'].toString();   // '11';
        formSectionItem.FormItemTextField.ItemTextFieldId = '00000000-0000-0000-0000-000000000000';
        formSectionItem.ItemTextFieldId = '00000000-0000-0000-0000-000000000000';
        formSectionItem.FormItemTypeName = FormTypes[11];  //'Note Text';
        formSectionItem.FormItemType = FormTypes['Note Text'];  //11;
        formSectionItem.FormBankItem = null;
        formSectionItem.BankItemDemographicId = null;
        formSectionItem.FormBankItemDemographic = null;
        formSectionItem.BankItemEmergencyContactId = null;
        formSectionItem.FormBankItemEmergencyContact = null;
        formSectionItem.FormBankItemDemographic = null;
        formSectionItem.BankItemId = null;
        formSectionItem.SequenceNumber = sectionIndex;
        return formSectionItem;
    }
    //#endregion

    //Copy the section
    copySection = (index: number) => {
        // Copy section only if section is Valid.
        if (this.isSectionValid()) {
            this.customForm.SectionValidationFlag = false;
            const newSection = cloneDeep(this.section);
            newSection.Title = '';
            this.customForm.FormSections.splice(index + 1, 0, newSection);
            this.customForm.FormSections[index + 1].SequenceNumber = index + 1;
            this.previewSection();
            this.sectionCrudComponent.editSection(index + 1);
            if (this.customForm.IndexOfSectionInEditMode != -1) {
                this.setFocusForInputTitle(this.customForm?.IndexOfSectionInEditMode);
            }
        }
        else {
            this.customForm.SectionValidationFlag = true;
        }
    };


    // section validation
    isSectionValid = () => {
        let isValid = true;
        for (let index = 0; index < this.section?.FormSectionItems?.length; index++) {
            if (!this.customFormsFactory.ValidateFormSectionItem(this.section?.FormSectionItems[index])) {
                isValid = false;
            }
        }
        return isValid;
    }

    moveSection = (origin, destination) => {
        const temp = this.customForm?.FormSections[destination];
        this.customForm.FormSections[destination] = this.customForm?.FormSections[origin];
        this.customForm.FormSections[origin] = temp;
    }

    // Move complete section above
    moveSectionUp = (index) => {
        this.moveSection(index, index - 1);
        this.customForm.IndexOfSectionInEditMode = index - 1;
        if (this.customForm?.IndexOfSectionInEditMode != -1) {
            this.setFocusForInputTitle(this.customForm?.IndexOfSectionInEditMode);
        }
    }


    // Move Section
    moveSectionDown = (index: number) => {
        this.moveSection(index, index + 1);
        this.customForm.IndexOfSectionInEditMode = index + 1;
        if (this.customForm?.IndexOfSectionInEditMode != -1) {
            this.setFocusForInputTitle(this.customForm?.IndexOfSectionInEditMode);
        }
    }

    // Preview section
    previewSection = () => {
        if (this.isSectionValid()) {
            this.customForm.SectionValidationFlag = false;
            this.customForm.SectionCopyValidationFlag = -1;
            this.customForm.IndexOfSectionInEditMode = -1;
        }
        else {
            this.customForm.SectionValidationFlag = true;
        }
    }

    //This will call delete method from sectionCrudComponent
    confirmDeleteSection = (sectionIndex) => {
        this.sectionCrudComponent?.confirmDeleteSection(sectionIndex);
    }

    addPromptBlur = () => {
        this.sectionSelected = null;
    }

    //Created common function to Get inpSectionTitle with index 
    setFocusForInputTitle = (index: number) => {
        if (this._elementRef?.nativeElement?.querySelector(`#inpSectionTitle_${index}`)) {
            this._elementRef.nativeElement.querySelector(`#inpSectionTitle_${index}`)?.focus()
        }
    }

    titleChanged = () => {
        this.noteTemplatesHelperService.undoStack.push("adding_title");
    }

    undo = () => {
        this.undoCount += 1;
        if (this.undoCount > 5) {
            this.noteTemplatesHelperService.setUndo(false);
        }
        if (this.canUndo) {
            if (this.noteTemplatesHelperService.undoStack[this.noteTemplatesHelperService.undoStack?.length - 1] == "adding_title") {
                if (this.section?.Title != undefined && this.section?.Title != '') {
                    const formData = {
                        inpSectionTitle: ''
                    }
                    this.sectionHeaderForm.patchValue(formData);
                    this.noteTemplatesHelperService.undoStack?.pop();
                }
            }
            else {
                this.noteTemplatesHelperService.undoStackPop = cloneDeep(this.noteTemplatesHelperService.undoStack);
                this.noteTemplatesHelperService.onUndo(this.localize.getLocalizedString('triggering undo operation'));
            }
        }
        if (this.section?.FormSectionItems?.length == 0 || this.undoCount == 5) {
            this.noteTemplatesHelperService.setUndo(false);
            this.undoCount = 0;
        }

    }

    //ToDo: Add redo Functionality with medicalhistory forms
    redo = () => {

    }

    toggleAccordion = () => {
        this.sectionCrudComponent.IsExpanded = !this.sectionCrudComponent.IsExpanded;
    }

    ngOnDestroy() {
        this.subscription.unsubscribe();
        this.formValueSubscription.unsubscribe();
        this.undoSubscription.unsubscribe();
    }

}
