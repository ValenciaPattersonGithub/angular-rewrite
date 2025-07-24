import { ElementRef } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormArray, FormBuilder, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { NoteTemplatesHelperService } from 'src/business-center/practice-settings/chart/note-templates/note-templates-helper.service';
import { FormTypes } from '../../../../../business-center/practice-settings/chart/note-templates/note-templates';
import { LinkToothComponent } from './link-tooth.component';
import cloneDeep from 'lodash/cloneDeep';

let mockSectionItem = {
    BankItemDemographicId: null,
    BankItemId: null,
    DataTag: "AAAAAAAhpeQ=",
    DateModified: "2023-02-08T15:57:34.3266499",
    FormBankItem: {
        ItemText: "",
        FormItemTypeName: "",
        Description: "",
        CommonlyUsed: false,
        IsVisible: true,
        UseDefaultValue: false,
        DefaultValue: "",
    },
    FormItemTypeName: FormTypes[10],  //Link Tooth
    FormItemType: FormTypes['Link Tooth'],// 10,
    FormBankItemDemographic: null,
    FormBankItemEmergencyContact: null,
    FormItemTextField: null,
    FormSectionId: "01aef280-2cf5-4326-934e-ed43ee3849f7",
    IsRequired: false,
    IsVisible: true,
    ItemOptions: [],
    ItemPromptTextsOptions: [],
    MultiSelectAllow: false,
    SectionItemId: "686af729-a55d-47d5-9952-b0f47ff4d00d",
    SequenceNumber: 1,
    UserModified: "a162c864-8f50-4e84-8942-7194bc8070cf",
    $$TeethSelectOptions:[]
}

let frmNoteTemplate: FormGroup;

let mockSubscription = {
    unsubscribe: jasmine.createSpy(),
    _subscriptions: jasmine.createSpy(),
    closed: true,
    add: jasmine.createSpy(),
    remove: jasmine.createSpy(),
    _parentOrParents: []
};
let mockStaticData =  {
    TeethDefinitions: () => {
        return {
            then: (res) => { res({ Value: {Teeth:[{USNumber:"1"},{USNumber:"2"}]} })}
        };
    }
};

let noteTemplateMock = {
    getData: () => {
        return {
            subscribe: (res) => {
                res(mockSectionItem)
            }
        }
    },
    setData: (tempData) => { return tempData },
    onUndo: jasmine.createSpy(),
    undoStack: ['moving_section', 'adding_section', 'deleting_section', 'value_changed', 'copying_section', 'adding_title'],
    getUndo: () => {
        return {
            subscribe: (res) => {
                res(true)
            }
        }
    },
    setUndo: () => { return },
    resetCrudForm: jasmine.createSpy().and.returnValue({})
};

describe('LinkToothComponent', () => {
    let component: LinkToothComponent;
    let fixture: ComponentFixture<LinkToothComponent>;
    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [TranslateModule.forRoot(), FormsModule, ReactiveFormsModule],
            declarations: [LinkToothComponent],
            providers: [
                { provide: '_elementRef', useValue: ElementRef },
                { provide: 'StaticData',useValue: mockStaticData },
                { provide: NoteTemplatesHelperService, useValue: noteTemplateMock  },
                FormBuilder
            ]
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(LinkToothComponent);
        component = fixture.componentInstance;
        frmNoteTemplate = component.fb.group({
            inpTemplateName: "templatename",
            slctTemplateCategory: "1",
            noteTempListFormArray: new FormArray([])
        });
        component.parentForm = frmNoteTemplate;
        component.sectionItem = mockSectionItem;
        component.sectionIndex = 0;
        component.sectionItemIndex = 0;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    describe('ngOnInit -->', () => {
        it('should call createForm method to create form', () => {
            component.createForm = jasmine.createSpy();
            component.ngOnInit();
            expect(component.createForm).toHaveBeenCalled();
        })

        it('should not call loadTeethSelectOptions when inputIsDisabled & sectionItem.Skip is true', () => {
            component.inputIsDisabled = true;
            component.sectionItem.Skip = true;
            component.loadTeethSelectOptions = jasmine.createSpy();
            component.ngOnInit();
            expect(component.loadTeethSelectOptions).not.toHaveBeenCalled();
        })
    })
    describe('createForm -->', () => {
        it('should call createForm with all fields', () => {
            component.createForm();
            expect(component.frmToothLink).not.toBe(null);
        })
    })

    describe('setUpdatedFormValues -->', () => {
        it('should call setUpdatedFormValues on any form value changed', () => {
            spyOn(noteTemplateMock.undoStack, 'push');
            const formArg = { formData: cloneDeep(component.sectionItem), sectionItemIndex: component.sectionItemIndex };
            spyOn(component.formDataArray, 'push');
            component.frmToothLink.setValue({ "questionLinkToothText": "LinkTooth", "questionLinkToothCKB": true });
            component.frmToothLink.valueChanges.subscribe((changedvalue) => {
                expect(component.sectionItem.FormBankItem.ItemText).toEqual("LinkTooth");
            })
            expect(noteTemplateMock.undoStack.push).not.toHaveBeenCalledWith('value_changed');
            expect(component.formDataArray.push).not.toHaveBeenCalledWith(formArg);
        })
    })

    describe('loadTeethSelectOptions -->', () => {
        it('should set TeethSelectOptions data', () => {
           component.sectionItem = mockSectionItem;
           component.loadTeethSelectOptions();
           expect(component.sectionItem?.$$TeethSelectOptions).not.toBeNull();
           expect(component.sectionItem?.$$TeethSelectOptions?.length).toEqual(2);
        })
    })

    describe('changeSkip -->', () => {
        it('should call loadTeethSelectOptions when Skip is false', () => {
            component.loadTeethSelectOptions = jasmine.createSpy();
            component.changeSkip(false);
            expect(component.loadTeethSelectOptions).toHaveBeenCalled();
        })

        it('should not call loadTeethSelectOptions when Skip is true', () => {
            component.loadTeethSelectOptions = jasmine.createSpy();
            component.changeSkip(true);
            expect(component.loadTeethSelectOptions).not.toHaveBeenCalled();
        })
    })

    describe('ngOnDestroy -->', () => {
        it('should close subscription on destroy', () => {
            component.formValueSubscription = Object.assign(mockSubscription);
            component.ngOnDestroy();
            expect(component.formValueSubscription.closed).toBe(true);
        })
    })
});