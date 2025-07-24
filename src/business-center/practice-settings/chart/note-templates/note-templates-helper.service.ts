import { Injectable, Inject } from "@angular/core";
import { FormArray, FormGroup } from "@angular/forms";
import { Observable } from "rxjs";
import { BehaviorSubject } from "rxjs";
import { CategoriesWithTemplate, CustomFormTemplate, FormTypes } from "./note-templates";
import { NoteTemplatesHttpService } from "src/@shared/providers/note-templates-http.service";
import { SoarResponse } from "src/@core/models/core/soar-response";

@Injectable({ providedIn: 'root' })
export class NoteTemplatesHelperService {

    constructor(private noteTemplatesHttpService: NoteTemplatesHttpService,
        @Inject('localize') private localize,
        @Inject('toastrFactory') private toastrFactory) { }

    public undoStack: string[] = [];
    public undoStackPop: string[] = [];
    invokeEvent: BehaviorSubject<string> = new BehaviorSubject<string>(null);

    private _data$: BehaviorSubject<CustomFormTemplate> = new BehaviorSubject<CustomFormTemplate>(null);
    private _canUndo$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(null);
    private _categoryData$: BehaviorSubject<CategoriesWithTemplate> = new BehaviorSubject<CategoriesWithTemplate>(null);
    loadingCategories = false;
    loadingTemplates = false;

    getData = (): Observable<CustomFormTemplate> => {
        return this._data$.asObservable();
    }

    setData = (data: CustomFormTemplate) => {
        this._data$.next(data);
    }

    //Remove childform once we delete any section
    deleteSections = (parentForm: FormGroup, FormType: number, sectionIndex: number, sectionItemIndex: number, sectionData, resequenceForms = false) => {
        const currentFormName: string = this.getFormName(FormType, sectionIndex, sectionItemIndex);
        if (currentFormName != "" && parentForm?.get(currentFormName)) {
            parentForm?.removeControl(currentFormName);
            if (resequenceForms == true) {
                //Resequence forms on the basis of new index after deleting data
                for (let j = 0; j < sectionData?.FormSectionItems?.length; j++) {
                    if (j > sectionItemIndex) {
                        this.setChildForms(j, j - 1, sectionIndex, sectionData, parentForm);
                    }
                }
            }
        }
    }

    //Get created form name on the basis or formtype and index
    getFormName = (FormType: number, sectionIndex: number, sectionItemIndex: number) => {
        let currentFormName = "";
        switch (FormType) {
            case FormTypes['Yes/No True/False']:
                currentFormName = `questionYesNoTrueFalseFormArray_${sectionIndex}_${sectionItemIndex}`;
                break;
            case 8:
                currentFormName = `questionYesNoTrueFalseFormArray_${sectionIndex}_${sectionItemIndex}`;
                break;
            case FormTypes['Multiple Choice']:
                currentFormName = `questionMultipleChoiceFormArray_${sectionIndex}_${sectionItemIndex}`;
                break;
            case FormTypes['Ad-Lib']:
                currentFormName = `questionAdlibFormArray_${sectionIndex}_${sectionItemIndex}`;
                break;
            case FormTypes['Link Tooth']:
                currentFormName = `frmToothLinkFormArray_${sectionIndex}_${sectionItemIndex}`;
                break;
            case FormTypes['Note Text']:
                currentFormName = `frmQuestionTextFieldFormArray_${sectionIndex}_${sectionItemIndex}`;
                break;
        }
        return currentFormName;
    }

    //Remove section header & all child component forms from parent array
    resetCrudForm = (parentForm: FormGroup) => {
        if (parentForm) {
            const formNameList: string[] = Object.keys(parentForm.controls);
            if (formNameList) {
                for (let i = 0; i < formNameList?.length; i++) {
                    if (formNameList[i] != "frmNoteTemplate" && formNameList[i] != "noteTempListFormArray") {
                        parentForm.removeControl(formNameList[i]);
                    }
                }
            }
        }
    }

    //Change forms as per the index from one place to another
    setChildForms = (origin, destination, sectionIndex, section, parentForm) => {
        let originForm: FormGroup;
        let destinationForm: FormGroup;
        let formName = "";

        const originFormType = section?.FormSectionItems[origin]?.FormItemType;
        formName = this.getFormName(originFormType, sectionIndex, origin);
        if (parentForm?.get(formName)) {
            originForm = <FormGroup>parentForm?.get(formName);
            parentForm?.removeControl(formName);
        }

        const destinationFormType = section?.FormSectionItems[destination]?.FormItemType;
        formName = this.getFormName(destinationFormType, sectionIndex, destination);
        if (parentForm?.get(formName)) {
            destinationForm = <FormGroup>parentForm?.get(formName);
            parentForm?.removeControl(formName);
        }

        if (originForm) {
            //Move originForm to destination
            parentForm?.addControl(this.getFormName(originFormType, sectionIndex, destination), new FormArray([originForm?.controls[0]]));
        }

        if (destinationForm) {
            //Move destinationForm to origin
            parentForm?.addControl(this.getFormName(destinationFormType, sectionIndex, origin), new FormArray([destinationForm?.controls[0]]));
        }
    }

    onUndo = (data: string) => {
        this.invokeEvent?.next(data);
    }

    getUndo = (): Observable<boolean> => {
        return this._canUndo$.asObservable();
    }

    setUndo = (data: boolean) => {
        this._canUndo$.next(data);
    }

    //Create methods to handle circular dependency error between note template and note template list component as same method calling from both the components 
    getCategoriesData = (): Observable<CategoriesWithTemplate> => {
        this.loadingCategories = true;
        this.loadingTemplates = true;
        return this._categoryData$.asObservable();
    }

    setCategoriesData = () => {
        this.loadingCategories = true;
        this.loadingTemplates = true;
        this.noteTemplatesHttpService.CategoriesWithTemplates()
            .then((res: SoarResponse<CategoriesWithTemplate>) => {
                this._categoryData$.next(res?.Value);
            }, () => {
                this.toastrFactory.error(this.localize.getLocalizedString('Failed to retrieve the list of {0}. Refresh the page to try again.', ['Clinical Note Templates']), this.localize.getLocalizedString('Server Error'));
            });
    }

}