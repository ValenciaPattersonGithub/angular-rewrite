import { Component, OnInit, Input, Inject, OnChanges, SimpleChanges } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { Subscription } from 'rxjs';
import { CustomFormTemplate, FormSection } from 'src/business-center/practice-settings/chart/note-templates/note-templates';
import { NoteTemplatesHelperService } from 'src/business-center/practice-settings/chart/note-templates/note-templates-helper.service';
import { NoteTemplatesComponent } from 'src/business-center/practice-settings/chart/note-templates/note-templates.component';

@Component({
    selector: 'section-crud',
    templateUrl: './section-crud.component.html',
    styleUrls: ['./section-crud.component.scss']
})
export class SectionCrudComponent implements OnInit, OnChanges {

    @Input() parentForm: FormGroup;
    @Input() showFooterPage: boolean;
    @Input() formType: string;
    @Input() section: FormSection;
    @Input() sectionIndex: number;
    @Input() first = false;
    @Input() last = false;
    @Input() canEditForm: boolean;
    @Input() inputIsDisabled: boolean;

    customForm: CustomFormTemplate;
    allowSectionOpen = false;
    deleteSectionIndex: number;
    subscription: Subscription;
    hasEditAccess = false;
    IsExpanded = true;

    constructor(private noteTemplatesHelperService: NoteTemplatesHelperService,
        @Inject('toastrFactory') private toastrFactory,
        @Inject('localize') private localize,
        private noteTemplatesComponent: NoteTemplatesComponent,
        @Inject('patSecurityService') private patSecurityService) {
    }

    ngOnChanges(changes: SimpleChanges): void {
        if (changes.section) {
            this.noteTemplatesComponent.templateBodyCustomFormChanged();
        }
    }

    ngOnInit(): void {
        this.subscription = this.noteTemplatesHelperService.getData().subscribe((res) => {
            this.customForm = res;
            if (!this.canEditForm) {
                this.customForm.IndexOfSectionInEditMode = -1;
            }
        })
        this.hasEditAccess = this.checkAuthorization('soar-biz-bcform-edit');
        this.noteTemplatesHelperService.resetCrudForm(this.parentForm);
    }

    checkAuthorization = (amfa) => {
        return this.patSecurityService.IsAuthorizedByAbbreviation(amfa) as boolean;
    }

    // Edit Section
    editSection = (sectionIndex) => {
        if (this.customForm?.IndexOfSectionInEditMode == -1) {
            this.noteTemplatesHelperService.setUndo(false);
            this.customForm.IndexOfSectionInEditMode = sectionIndex;
            this.allowSectionOpen = true;
            this.IsExpanded = true;
            this.noteTemplatesComponent.templateBodyCustomFormChanged();
            this.parentForm?.markAsDirty(); //To Enable save button required to mark as dirty
            return true;
        }
        else {
            this.toastrFactory.error(this.localize.getLocalizedString('You may only edit one section at a time. Please close open section.'), this.localize.getLocalizedString('Error'));
            this.allowSectionOpen = false;
            return false;
        }
    }

    editSectionItem = (event) => {
        this.editSection(event);
    }

    // resequence the form items after one is deleted to avoid duplicates
    resequenceFormItems = () => {
        let i = 0;
        this.customForm?.FormSections.forEach((res) => {
            res.SequenceNumber = i;
            i++
        });
    }

    //Delete section
    deleteSection = () => {
        this.noteTemplatesHelperService.resetCrudForm(this.parentForm);
        this.customForm.FormSections.splice(this.sectionIndex, 1);
        this.customForm.IndexOfSectionInEditMode = -1;
        this.deleteSectionIndex = -1;
        this.noteTemplatesHelperService.setData(this.customForm);
        this.noteTemplatesComponent.templateBodyCustomFormChanged();
    }

    // Function to perform section Cancel Delete action.
    cancelDeleteSection = () => {
        this.deleteSectionIndex = -1;
    }

    // Function to perform section Execute Delete action.
    confirmDeleteSection = (sectionIndex) => {
        this.deleteSectionIndex = sectionIndex;
        this.resequenceFormItems();
    }

    toggleAccordion = (event) => {
        this.IsExpanded = event;
    }
    ngOnDestroy() {
        this.subscription.unsubscribe();
    }
}