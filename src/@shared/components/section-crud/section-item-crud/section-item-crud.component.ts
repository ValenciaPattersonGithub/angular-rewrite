// The component is using the default change detection strategy, but we needed to handle dynamic DOM changes
// that must be loaded before using the component, and to handle potential errors related to DOM expression changes. 
// Therefore, we added manual change detection using "ChangeDetectorRef".
// https://stackoverflow.com/questions/36919399/angular-2-view-not-updating-after-model-changes

import { Component, OnInit, Input, ElementRef, ChangeDetectorRef, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
import { CustomFormTemplate, FormDataArray, FormSection, FormSectionItem, FormTypes } from 'src/business-center/practice-settings/chart/note-templates/note-templates';
import { NoteTemplatesHelperService } from 'src/business-center/practice-settings/chart/note-templates/note-templates-helper.service';
import cloneDeep from 'lodash/cloneDeep';
import { FormGroup } from '@angular/forms';

@Component({
    selector: 'section-item-crud',
    templateUrl: './section-item-crud.component.html',
    styleUrls: ['./section-item-crud.component.scss']
})
export class SectionItemCrudComponent implements OnInit, OnDestroy {

    @Input() parentForm: FormGroup;
    @Input() formType: string;
    @Input() section: FormSection;
    @Input() sectionIndex: number;
    @Input() sectionItemIndex: number;

    sectionItem: FormSectionItem;
    customForm: CustomFormTemplate;
    deleteSectionItemIndex: number;
    subscription: Subscription;
    formsName = FormTypes;

    undoSubscription: Subscription;
    parentFormSubscription: Subscription;
    formDataArray: FormDataArray[] = [];
    deletedSectionItem: { item: FormSectionItem, index: number }[] = [];
    movedSectionItems = [];
    copiedSectionItem: FormSectionItem[] = [];

    constructor(
        public noteTemplatesHelperService: NoteTemplatesHelperService,
        private _elementRef: ElementRef,
        public changeDetectorRef: ChangeDetectorRef
    ) {

        this.undoSubscription = this.noteTemplatesHelperService.invokeEvent.subscribe(value => {
            if (value && (this.noteTemplatesHelperService.undoStackPop?.length == this.noteTemplatesHelperService.undoStack?.length)) {
                this.undo();
            }
        });
    }


    ngOnInit(): void {
        this.getFormItemName();
        this.subscription = this.noteTemplatesHelperService.getData().subscribe((res) => {
            this.customForm = res;
        })

        this.parentFormSubscription = this.parentForm?.valueChanges?.subscribe((changes) => {
            if (changes) {
                // To get all the child form changes
            }
        });
    }


    getFormItemName = () => {
        this.section?.FormSectionItems?.forEach((formSectionItem) => {
            if (formSectionItem !== null && formSectionItem !== undefined) {
                if (formSectionItem?.FormItemType == 2 || formSectionItem?.FormItemType == 8)
                    formSectionItem.FormItemTypeName = FormTypes[2];
                else
                    formSectionItem.FormItemTypeName = FormTypes[formSectionItem?.FormItemType];
            }
        });
    }
    moveSectionItem = (origin, destination) => {
        this.noteTemplatesHelperService.undoStack?.push("moving_section");
        if (this.movedSectionItems?.length > 0) {
            this.movedSectionItems[this.movedSectionItems?.length - 1].push(JSON.parse(JSON.stringify(this.section?.FormSectionItems)));
        } else {
            this.movedSectionItems?.push([JSON.parse(JSON.stringify(this.section?.FormSectionItems))]);
        }

        this.noteTemplatesHelperService.setChildForms(origin, destination, this.sectionIndex, this.section, this.parentForm);
        const temp = this.section?.FormSectionItems[destination];
        this.section.FormSectionItems[destination] = this.section?.FormSectionItems[origin];
        this.section.FormSectionItems[origin] = temp;
    }

    //Move sectionitem Up.
    moveSectionItemUp = (sectionIndex: number, sectionItemIndex: number) => {

        this.moveSectionItem(sectionItemIndex, sectionItemIndex - 1);

        switch (this.sectionItem?.FormItemType) {
            case FormTypes['Yes/No True/False']:
                if (this._elementRef?.nativeElement?.querySelector(`#questionYesNoTrueFalseText${sectionIndex}_${(sectionItemIndex + 1)}`)) {
                    this._elementRef.nativeElement.querySelector(`#questionYesNoTrueFalseText${sectionIndex}_${(sectionItemIndex + 1)}`).focus();
                }
                break;
            case FormTypes['Multiple Choice']:
                if (this._elementRef?.nativeElement?.querySelector(`#questionYesNoTrueFalseText${sectionIndex}_${(sectionItemIndex + 1)}`)) {
                    this._elementRef.nativeElement.querySelector(`#questionYesNoTrueFalseText${sectionIndex}_${(sectionItemIndex + 1)}`).focus();
                }
                break;
            case FormTypes['Comment/Essay']:
                if (this._elementRef?.nativeElement?.querySelector(`#questionCommentEssayText${sectionIndex}_${(sectionItemIndex + 1)}`)) {
                    this._elementRef.nativeElement.querySelector(`#questionCommentEssayText${sectionIndex}_${(sectionItemIndex + 1)}`).focus();
                }
                break;
            case FormTypes['Emergency Contact']:
                if (this._elementRef?.nativeElement?.querySelector(`#questionEmergencyContactNameCKB${sectionIndex}_${(sectionItemIndex + 1)}`)) {
                    this._elementRef.nativeElement.querySelector(`#questionEmergencyContactNameCKB${sectionIndex}_${(sectionItemIndex + 1)}`).focus();
                }
                break;
            case FormTypes['Demographic Question']:
                if (this._elementRef?.nativeElement?.querySelector(`#questionDemographicPreferredNameCKB${sectionIndex}_${(sectionItemIndex + 1)}`)) {
                    this._elementRef.nativeElement.querySelector(`#questionDemographicPreferredNameCKB${sectionIndex}_${(sectionItemIndex + 1)}`).focus();
                }
                break;
            case FormTypes['Date of Completion']:
                if (this._elementRef?.nativeElement?.querySelector(`#lblDateOfCompletion${sectionIndex}_${(sectionItemIndex + 1)}`)) {
                    this._elementRef.nativeElement.querySelector(`#lblDateOfCompletion${sectionIndex}_${(sectionItemIndex + 1)}`).focus();
                }
                break;
            case FormTypes['Signature Box']:
                if (this._elementRef?.nativeElement?.querySelector(`#questionSignatureBoxCKB${sectionIndex}_${(sectionItemIndex + 1)}`)) {
                    this._elementRef.nativeElement.querySelector(`#questionSignatureBoxCKB${sectionIndex}_${(sectionItemIndex + 1)}`).focus();
                }
                break;
            case FormTypes['Ad-Lib']:
                if (this._elementRef?.nativeElement?.querySelector(`#questionAdlib1Text${sectionIndex}_${(sectionItemIndex + 1)}`)) {
                    this._elementRef.nativeElement.querySelector(`#questionAdlib1Text${sectionIndex}_${(sectionItemIndex + 1)}`).focus();
                }
                break;
            case FormTypes['Link Tooth']:
                if (this._elementRef?.nativeElement?.querySelector(`#questionLinkToothText${sectionIndex}_${(sectionItemIndex + 1)}`)) {
                    this._elementRef.nativeElement.querySelector(`#questionLinkToothText${sectionIndex}_${(sectionItemIndex + 1)}`).focus();
                }
                break;
            case FormTypes['Note Text']:
                if (this._elementRef?.nativeElement?.querySelector(`#questionTextField${sectionIndex}_${(sectionItemIndex + 1)}`)) {
                    this._elementRef.nativeElement.querySelector(`#questionTextField${sectionIndex}_${(sectionItemIndex + 1)}`).focus();
                }
                break;
        }
    }

    //Move sectionitem Down.
    moveSectionItemDown = (sectionIndex: number, sectionItemIndex: number) => {
        this.moveSectionItem(sectionItemIndex, sectionItemIndex + 1);

        switch (this.sectionItem?.FormItemType) {
            case FormTypes['Yes/No True/False']:
                if (this._elementRef?.nativeElement?.querySelector(`#questionYesNoTrueFalseText${sectionIndex}_${(sectionItemIndex + 1)}`)) {
                    this._elementRef.nativeElement.querySelector(`#questionYesNoTrueFalseText${sectionIndex}_${(sectionItemIndex + 1)}`).focus();
                }
                break;
            case FormTypes['Multiple Choice']:
                if (this._elementRef?.nativeElement?.querySelector(`#questionYesNoTrueFalseText${sectionIndex}_${(sectionItemIndex + 1)}`)) {
                    this._elementRef.nativeElement.querySelector(`#questionYesNoTrueFalseText${sectionIndex}_${(sectionItemIndex + 1)}`).focus();
                }
                break;
            case FormTypes['Comment/Essay']:
                if (this._elementRef?.nativeElement?.querySelector(`#questionCommentEssayText${sectionIndex}_${(sectionItemIndex + 1)}`)) {
                    this._elementRef.nativeElement.querySelector(`#questionCommentEssayText${sectionIndex}_${(sectionItemIndex + 1)}`).focus();
                }
                break;
            case FormTypes['Emergency Contact']:
                if (this._elementRef?.nativeElement?.querySelector(`#questionEmergencyContactNameCKB${sectionIndex}_${(sectionItemIndex + 1)}`)) {
                    this._elementRef.nativeElement.querySelector(`#questionEmergencyContactNameCKB${sectionIndex}_${(sectionItemIndex + 1)}`).focus();
                }
                break;
            case FormTypes['Demographic Question']:
                if (this._elementRef?.nativeElement?.querySelector(`#questionDemographicPreferredNameCKB${sectionIndex}_${(sectionItemIndex + 1)}`)) {
                    this._elementRef.nativeElement.querySelector(`#questionDemographicPreferredNameCKB${sectionIndex}_${(sectionItemIndex + 1)}`).focus();
                }
                break;
            case FormTypes['Date of Completion']:
                if (this._elementRef?.nativeElement?.querySelector(`#lblDateOfCompletion${sectionIndex}_${(sectionItemIndex + 1)}`)) {
                    this._elementRef.nativeElement.querySelector(`#lblDateOfCompletion${sectionIndex}_${(sectionItemIndex + 1)}`).focus();
                }
                break;
            case FormTypes['Signature Box']:
                if (this._elementRef?.nativeElement?.querySelector(`#questionSignatureBoxCKB${sectionIndex}_${(sectionItemIndex + 1)}`)) {
                    this._elementRef.nativeElement.querySelector(`#questionSignatureBoxCKB${sectionIndex}_${(sectionItemIndex + 1)}`).focus();
                }
                break;
            case FormTypes['Ad-Lib']:
                if (this._elementRef?.nativeElement?.querySelector(`#questionAdlib1Text${sectionIndex}_${(sectionItemIndex + 1)}`)) {
                    this._elementRef.nativeElement.querySelector(`#questionAdlib1Text${sectionIndex}_${(sectionItemIndex + 1)}`).focus();
                }
                break;
            case FormTypes['Link Tooth']:
                if (this._elementRef?.nativeElement?.querySelector(`#questionLinkToothText${sectionIndex}_${(sectionItemIndex + 1)}`)) {
                    this._elementRef.nativeElement.querySelector(`#questionLinkToothText${sectionIndex}_${(sectionItemIndex + 1)}`).focus();
                }
                break;
            case FormTypes['Note Text']:
                if (this._elementRef?.nativeElement?.querySelector(`#questionTextField${sectionIndex}_${(sectionItemIndex + 1)}`)) {
                    this._elementRef.nativeElement.querySelector(`#questionTextField${sectionIndex}_${(sectionItemIndex + 1)}`).focus();
                }
                break;
        }
    }

    //Delete section item
    deleteSectionItem = () => {
        this.noteTemplatesHelperService.undoStack?.push("deleting_section");
        const formType: number = this.section?.FormSectionItems[this.deleteSectionItemIndex]?.FormItemType;
        const deletedItem = this.section?.FormSectionItems?.splice(this.deleteSectionItemIndex, 1)[0];
        this.noteTemplatesHelperService.deleteSections(this.parentForm, formType, this.sectionIndex, this.deleteSectionItemIndex, this.section, true);
        this.deletedSectionItem?.push({ item: deletedItem, index: this.deleteSectionItemIndex });
        this.deleteSectionItemIndex = null;
    };

    // resequence the form items after one is deleted to avoid duplicates
    resequenceFormItems = (section) => {
        let i = 0;
        section?.forEach((res) => {
            if (res != null || res != undefined) {
                res.SequenceNumber = i;
                i++
            }
        });
    }

    // Function to perform sectionitem Delete action.
    confirmDeleteSectionItem = (sectionItemIndex) => {
        this.deleteSectionItemIndex = sectionItemIndex;
        this.resequenceFormItems(this.section?.FormSectionItems);
    }

    // Function to hide delete confirmation box for section item
    cancelDeleteSectionItemConfirmBox = () => {
        this.deleteSectionItemIndex = -1;
    }

    copySectionItem = (sectionIndex: number, sectionItemIndex: number) => {
        this.noteTemplatesHelperService.undoStack?.push("copying_section");
        this.customForm.SectionCopyValidationFlag = sectionItemIndex;
        this.sectionItem = this.section?.FormSectionItems[sectionItemIndex];
        // Copy sectionItem only if form is Valid.
        if (this.isSectionItemValid()) {
            const newSectionItem = cloneDeep(this.sectionItem);
            if (newSectionItem) {
                newSectionItem.SequenceNumber = sectionItemIndex + 1;
            }
            this.section?.FormSectionItems.splice(sectionItemIndex + 1, 0, newSectionItem);
            switch (this.sectionItem?.FormItemType) {
                case FormTypes['Yes/No True/False']:
                    if (this._elementRef?.nativeElement?.querySelector(`#questionYesNoTrueFalseText${sectionIndex}_${(sectionItemIndex + 1)}`)) {
                        this._elementRef.nativeElement.querySelector(`#questionYesNoTrueFalseText${sectionIndex}_${(sectionItemIndex + 1)}`).focus();
                    }
                    break;
                case FormTypes['Multiple Choice']:
                    if (this._elementRef?.nativeElement?.querySelector(`#questionMultipleChoiceText${sectionIndex}_${(sectionItemIndex + 1)}`)) {
                        this._elementRef.nativeElement.querySelector(`#questionMultipleChoiceText${sectionIndex}_${(sectionItemIndex + 1)}`).focus();
                    }
                    break;
                case FormTypes['Comment/Essay']:
                    if (this._elementRef?.nativeElement?.querySelector(`#questionCommentEssayText${sectionIndex}_${(sectionItemIndex + 1)}`)) {
                        this._elementRef.nativeElement.querySelector(`#questionCommentEssayText${sectionIndex}_${(sectionItemIndex + 1)}`).focus();
                    }
                    break;
                case FormTypes['Emergency Contact']:
                    if (this._elementRef?.nativeElement?.querySelector(`#questionEmergencyContactNameCKB${sectionIndex}_${(sectionItemIndex + 1)}`)) {
                        this._elementRef.nativeElement.querySelector(`#questionEmergencyContactNameCKB${sectionIndex}_${(sectionItemIndex + 1)}`).focus();
                    }
                    break;
                case FormTypes['Demographic Question']:
                    if (this._elementRef?.nativeElement?.querySelector(`#questionDemographicPreferredNameCKB${sectionIndex}_${(sectionItemIndex + 1)}`)) {
                        this._elementRef.nativeElement.querySelector(`#questionDemographicPreferredNameCKB${sectionIndex}_${(sectionItemIndex + 1)}`).focus();
                    }
                    break;
                case FormTypes['Date of Completion']:
                    if (this._elementRef?.nativeElement?.querySelector(`#lblDateOfCompletion${sectionIndex}_${(sectionItemIndex + 1)}`)) {
                        this._elementRef.nativeElement.querySelector(`#lblDateOfCompletion${sectionIndex}_${(sectionItemIndex + 1)}`).focus();
                    }
                    break;
                case FormTypes['Signature Box']:
                    if (this._elementRef?.nativeElement?.querySelector(`#questionSignatureBoxCKB${sectionIndex}_${(sectionItemIndex + 1)}`)) {
                        this._elementRef.nativeElement.querySelector(`#questionSignatureBoxCKB${sectionIndex}_${(sectionItemIndex + 1)}`).focus();
                    }
                    break;
                case FormTypes['Ad-Lib']:
                    if (this._elementRef?.nativeElement?.querySelector(`#questionAdlib1Text${sectionIndex}_${(sectionItemIndex + 1)}`)) {
                        this._elementRef.nativeElement.querySelector(`#questionAdlib1Text${sectionIndex}_${(sectionItemIndex + 1)}`).focus();
                    }
                    break;
                case FormTypes['Link Tooth']:
                    if (this._elementRef?.nativeElement?.querySelector(`#questionLinkToothText${sectionIndex}_${(sectionItemIndex + 1)}`)) {
                        this._elementRef.nativeElement.querySelector(`#questionLinkToothText${sectionIndex}_${(sectionItemIndex + 1)}`).focus();
                    }
                    break;
                case FormTypes['Note Text']:
                    if (this._elementRef?.nativeElement?.querySelector(`#questionTextFieldText${sectionIndex}_${(sectionItemIndex + 1)}`)) {
                        this._elementRef.nativeElement.querySelector(`#questionTextFieldText${sectionIndex}_${(sectionItemIndex + 1)}`).focus();
                    }
                    break;
            }
            this.resequenceFormItems(this.section?.FormSectionItems);
        }
        this.copiedSectionItem = this.section?.FormSectionItems;
    }

    isSectionItemValid = () => {
        let isValid = true;

        if (this.sectionItem?.FormItemType == FormTypes['Yes/No True/False'] || this.sectionItem?.FormItemType == 8) {
            if (!this.sectionItem?.FormBankItem?.ItemText) {
                isValid = false;
            }
        }
        if (this.sectionItem?.FormItemType == FormTypes['Multiple Choice']) {
            if (!this.sectionItem?.FormBankItem?.ItemText) {
                isValid = false;
            }
        }
        if (this.sectionItem?.FormItemType == FormTypes['Comment/Essay']) {
            if (!this.sectionItem?.FormBankItem?.ItemText) {
                isValid = false;
            }
        }
        // validation
        if (this.sectionItem?.FormItemType == FormTypes['Ad-Lib']) {
            this.sectionItem?.FormBankItemPromptTexts.forEach(formBankItemPromptText => {
                if (!formBankItemPromptText?.ItemText) {
                    isValid = false;
                }
            });
        }
        if (this.sectionItem?.FormItemType == FormTypes['Link Tooth']) {
            if (!this.sectionItem?.FormBankItem?.ItemText) {
                isValid = false;
            }
        }
        if (this.sectionItem?.FormItemType == FormTypes['Note Text']) {
            // TODO verify field
            if (!this.sectionItem?.FormItemTextField?.NoteText) {
                isValid = false;
            }
        }
        return isValid;
    }

    //undo functionality for section items
    undo = () => {

        switch (this.noteTemplatesHelperService.undoStack[this.noteTemplatesHelperService.undoStack?.length - 1]) {
            case "adding_section":
                // Case for undoing adding a section
                if (this.section != undefined && this.section?.FormSectionItems != undefined && this.section?.FormSectionItems?.length > 0) {
                    this.removeSectionItems();
                    this.section.FormSectionItems?.pop();
                    this.noteTemplatesHelperService.undoStack?.pop();
                }
                break;
            case "deleting_section":
                // Case for undoing deleting a section
                if (this.deletedSectionItem && this.deletedSectionItem?.length > 0) {
                    const lastDeleted = this.deletedSectionItem.pop();
                    if (lastDeleted != null && lastDeleted != undefined) {
                        const deletedItem = lastDeleted.item;
                        const index = lastDeleted.index;
                        this.section?.FormSectionItems?.splice(index, 0, deletedItem);
                        this.noteTemplatesHelperService.deleteSections(this.parentForm, deletedItem?.FormItemType, this.sectionIndex, index, deletedItem, true);
                        this.noteTemplatesHelperService.undoStack?.pop();
                    }
                }
                break;
            case "moving_section":
                // Case for undoing moving sections
                if (this.movedSectionItems != undefined && this.movedSectionItems?.length > 0) {
                    // Remove most recent state from most recent state array
                    const currentStateArray = this.movedSectionItems[this.movedSectionItems?.length - 1];
                    const previousState = currentStateArray?.pop();
                    if (currentStateArray?.length === 0) {  // If the state array is now empty, remove it from the sectionHistory array
                        this.movedSectionItems.pop();
                    }
                    this.removeSectionItems();
                    this.section.FormSectionItems = previousState;// Restore previous section state                    
                    this.changeDetectorRef.detectChanges();
                    this.noteTemplatesHelperService.undoStack?.pop();
                }
                break;
            case "copying_section":
                // Case for undoing copying a section
                if (this.copiedSectionItem != undefined && this.copiedSectionItem?.length > 0) {
                    this.removeSectionItems();
                    this.copiedSectionItem?.pop();
                    this.noteTemplatesHelperService.undoStack?.pop();
                }
                break;
            case "value_changed":
                // Case for undoing a change in a section item's value
                if (this.formDataArray && this.formDataArray?.length > 0) {
                    const tempFormData = this.formDataArray[this.formDataArray.length - 1]?.formData;
                    const tempFormDataIndex = this.formDataArray[this.formDataArray.length - 1]?.sectionItemIndex;
                    this.section.FormSectionItems[tempFormDataIndex] = tempFormData;
                    this.formDataArray?.pop();
                    this.noteTemplatesHelperService.undoStack?.pop();
                }
                break;
        }
    }

    //remove/delete sections from parentform
    removeSectionItems = () => {
        for (let i = 0; i < this.section?.FormSectionItems?.length; i++) {
            const formType = this.section.FormSectionItems[i]?.FormItemType;
            this.noteTemplatesHelperService.deleteSections(this.parentForm, formType, this.sectionIndex, i, this.section.FormSectionItems);
        }
    }

    ngOnDestroy() {
        this.subscription?.unsubscribe();
        this.parentFormSubscription?.unsubscribe();
        if (this.noteTemplatesHelperService.undoStack[this.noteTemplatesHelperService.undoStack?.length - 1] != "deleting_section") {
            this.undoSubscription?.unsubscribe();
        }
    }
}
