import { ChangeDetectorRef, ElementRef } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import {
  FormArray,
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
} from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { NoteTemplatesComponent } from 'src/business-center/practice-settings/chart/note-templates/note-templates.component';
import { AdlibComponent } from './adlib.component';
import { OrderByPipe } from '../../../../pipes';
import {
  BankItemOption,
  CustomFormTemplate,
} from '../../../../../business-center/practice-settings/chart/note-templates/note-templates';
import { NoteTemplatesHelperService } from 'src/business-center/practice-settings/chart/note-templates/note-templates-helper.service';
import cloneDeep from 'lodash/cloneDeep';
import { NoteTemplatesHttpService } from 'src/@shared/providers/note-templates-http.service';

let mockModalFactoryService = {};
let mockToastrFactory = {};
let mockPatSecurityService = {};
let mockAuthZ = {};
let mockLocation = {};
let mockInjector = {};
let noteTemplatesHttpService = {
  ValidateTemplateBodyCustomForm: jasmine.createSpy().and.returnValue({}),
};
let mockLocalizeService = {
  getLocalizedString: () => 'translated text',
};

let mockSectionItem = {
  BankItemDemographicId: null,
  BankItemId: null,
  DataTag: 'AAAAAAAhpeQ=',
  DateModified: '2023-02-08T15:57:34.3266499',
  FormBankItem: null,
  FormBankItemDemographic: null,
  FormBankItemEmergencyContact: null,
  FormItemTextField: null,
  FormItemType: 9,
  FormSectionId: '01aef280-2cf5-4326-934e-ed43ee3849f7',
  IsRequired: false,
  IsVisible: true,
  ItemOptions: [
    {
      SectionItemId: '686af729-a55d-47d5-9952-b0f47ff4d00d',
      SectionItemOptionId: '686af729-a55d-47d5-9952-b0f47ff4d00d',
      BankItemId: 'a6773ae6-0b79-477e-bfb4-9c148994bf4a',
      BankItemOptionId: 'a6773ae6-0b79-477e-bfb4-9c148994bf4a',
      IsSelected: true,
      IsVisible: true,
      SequenceNumber: 1,
      BankItemOption: new BankItemOption(),
      DataTag: '',
      UserModified: '',
      DateModified: '',
    },
  ],
  FormBankItemPromptTexts: [
    {
      Answer: null,
      BankItemId: 'a6773ae6-0b79-477e-bfb4-9c148994bf4a',
      CommonlyUsed: false,
      DataTag: 'AAAAAAAhpVg=',
      DateModified: '2023-02-08T12:55:15.7229439',
      DefaultValue: '',
      Description: '',
      ItemSequenceNumber: 1,
      ItemText: '',
      SectionItemId: 'cfc94739-53ec-427d-8a90-b8ae40ca2939',
      UseDefaultValue: false,
      UserModified: 'a162c864-8f50-4e84-8942-7194bc8070cf',
    },
    {
      Answer: null,
      BankItemId: 'a6773ae6-0b79-477e-bfb4-9c148994bf4a',
      CommonlyUsed: false,
      DataTag: 'AAAAAAAhpVg=',
      DateModified: '2023-02-08T12:55:15.7229439',
      DefaultValue: '',
      Description: '',
      ItemSequenceNumber: 2,
      ItemText: '',
      SectionItemId: 'cfc94739-53ec-427d-8a90-b8ae40ca2939',
      UseDefaultValue: false,
      UserModified: 'a162c864-8f50-4e84-8942-7194bc8070cf',
    },
  ],
  ItemPromptTextsOptions: [
    [
      {
        BankItemId: 'a6773ae6-0b79-477e-bfb4-9c148994bf4a',
        BankItemOption: {
          BankItemId: 'a6773ae6-0b79-477e-bfb4-9c148994bf4a',
          BankItemOptionId: '293ffcd8-6e38-4fc7-8a49-4c383d1ee5b4',
          OptionIndex: 1,
          OptionText: 'Responses 1',
          OptionValue: '',
          UserModified: 'a162c864-8f50-4e84-8942-7194bc8070cf',
        },
        BankItemOptionId: '293ffcd8-6e38-4fc7-8a49-4c383d1ee5b4',
        DataTag: 'AAAAAAAhpWU=',
        DateModified: '2023-02-08T12:55:15.7229439',
        IsSelected: true,
        IsVisible: true,
        SectionItemId: 'cfc94739-53ec-427d-8a90-b8ae40ca2939',
        SectionItemOptionId: '21626080-4491-4d8c-b52c-9375043c5ef0',
        SequenceNumber: 1,
        UserModified: 'a162c864-8f50-4e84-8942-7194bc8070cf',
      },
      {
        BankItemId: 'a6773ae6-0b79-477e-bfb4-9c148994bf4a',
        BankItemOption: {
          BankItemId: 'a6773ae6-0b79-477e-bfb4-9c148994bf4a',
          BankItemOptionId: '293ffcd8-6e38-4fc7-8a49-4c383d1ee5b4',
          OptionIndex: 2,
          OptionText: 'Responses 2',
          OptionValue: '',
          UserModified: 'a162c864-8f50-4e84-8942-7194bc8070cf',
        },
        BankItemOptionId: '293ffcd8-6e38-4fc7-8a49-4c383d1ee5b4',
        DataTag: 'AAAAAAAhpWU=',
        DateModified: '2023-02-08T12:55:15.7229439',
        IsSelected: true,
        IsVisible: true,
        SectionItemId: 'cfc94739-53ec-427d-8a90-b8ae40ca2939',
        SectionItemOptionId: '21626080-4491-4d8c-b52c-9375043c5ef0',
        SequenceNumber: 2,
        UserModified: 'a162c864-8f50-4e84-8942-7194bc8070cf',
      },
      {
        BankItemId: 'a6773ae6-0b79-477e-bfb4-9c148994bf4a',
        BankItemOption: {
          BankItemId: 'a6773ae6-0b79-477e-bfb4-9c148994bf4a',
          BankItemOptionId: '293ffcd8-6e38-4fc7-8a49-4c383d1ee5b4',
          OptionIndex: 2,
          OptionText: 'Responses 3',
          OptionValue: '',
          UserModified: 'a162c864-8f50-4e84-8942-7194bc8070cf',
        },
        BankItemOptionId: '293ffcd8-6e38-4fc7-8a49-4c383d1ee5b4',
        DataTag: 'AAAAAAAhpWU=',
        DateModified: '2023-02-08T12:55:15.7229439',
        IsSelected: true,
        IsVisible: true,
        SectionItemId: 'cfc94739-53ec-427d-8a90-b8ae40ca2939',
        SectionItemOptionId: '21626080-4491-4d8c-b52c-9375043c5ef0',
        SequenceNumber: 2,
        UserModified: 'a162c864-8f50-4e84-8942-7194bc8070cf',
      },
      {
        BankItemId: 'a6773ae6-0b79-477e-bfb4-9c148994bf4a',
        BankItemOption: {
          BankItemId: 'a6773ae6-0b79-477e-bfb4-9c148994bf4a',
          BankItemOptionId: '293ffcd8-6e38-4fc7-8a49-4c383d1ee5b4',
          OptionIndex: 2,
          OptionText: '',
          OptionValue: '',
          UserModified: 'a162c864-8f50-4e84-8942-7194bc8070cf',
        },
        BankItemOptionId: '293ffcd8-6e38-4fc7-8a49-4c383d1ee5b4',
        DataTag: 'AAAAAAAhpWU=',
        DateModified: '2023-02-08T12:55:15.7229439',
        IsSelected: true,
        IsVisible: true,
        SectionItemId: 'cfc94739-53ec-427d-8a90-b8ae40ca2939',
        SectionItemOptionId: '21626080-4491-4d8c-b52c-9375043c5ef0',
        SequenceNumber: 2,
        UserModified: 'a162c864-8f50-4e84-8942-7194bc8070cf',
      },
    ],
  ],
  MultiSelectAllow: false,
  SectionItemId: '686af729-a55d-47d5-9952-b0f47ff4d00d',
  SequenceNumber: 2,
  UserModified: 'a162c864-8f50-4e84-8942-7194bc8070cf',
};
let tempCustomerFormData: CustomFormTemplate = {
  FormId: '1234',
  FormName: 'Test Form',
  VersionNumber: 1,
  SourceFormId: '4567',
  FormTypeId: 2,
  Description: 'Description',
  IsActive: false,
  IsVisible: false,
  IsPublished: false,
  IsDefault: false,
  FormSections: [
    {
      SequenceNumber: 1,
      FormSectionItems: [mockSectionItem],
    },
  ],
  TemplateMode: 1,
  FileAllocationId: 1,
  DataTag: '',
  UserModified: '',
  DateModified: '',
  IndexOfSectionInEditMode: -1,
  SectionValidationFlag: false,
  SectionCopyValidationFlag: 1,
};
let frmNoteTemplate: FormGroup;

let mockSubscription = {
  unsubscribe: jasmine.createSpy(),
  _subscriptions: jasmine.createSpy(),
  closed: true,
  add: jasmine.createSpy(),
  remove: jasmine.createSpy(),
  _parentOrParents: [],
};

let noteTemplateMock = {
  getData: () => {
    return {
      subscribe: res => {
        res(tempCustomerFormData);
      },
    };
  },
  setData: tempData => {
    return tempData;
  },
  onUndo: jasmine.createSpy(),
  undoStack: [
    'moving_section',
    'adding_section',
    'deleting_section',
    'value_changed',
    'copying_section',
    'adding_title',
  ],
  getUndo: () => {
    return {
      subscribe: res => {
        res(true);
      },
    };
  },
  setUndo: () => {
    return;
  },
  resetCrudForm: jasmine.createSpy().and.returnValue({}),
};

describe('AdlibComponent', () => {
  let component: AdlibComponent;
  let fixture: ComponentFixture<AdlibComponent>;
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [TranslateModule.forRoot(), FormsModule, ReactiveFormsModule],
      declarations: [AdlibComponent, OrderByPipe],
      providers: [
        { provide: 'localize', useValue: mockLocalizeService },
        { provide: '_elementRef', useValue: ElementRef },
        { provide: 'toastrFactory', useValue: mockToastrFactory },
        { provide: 'patSecurityService', useValue: mockPatSecurityService },
        { provide: 'AuthZService', useValue: mockAuthZ },
        { provide: '$location', useValue: mockLocation },
        { provide: '$injector', useValue: mockInjector },
        { provide: 'ModalFactory', useValue: mockModalFactoryService },
        {
          provide: NoteTemplatesHttpService,
          useValue: noteTemplatesHttpService,
        },
        {
          provide: 'changeDetectorRef',
          useValue: ChangeDetectorRef,
        },
        { provide: NoteTemplatesHelperService, useValue: noteTemplateMock },
        FormBuilder,
        NoteTemplatesComponent,
      ],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AdlibComponent);
    component = fixture.componentInstance;
    frmNoteTemplate = component.fb.group({
      inpTemplateName: 'templatename',
      slctTemplateCategory: '1',
      noteTempListFormArray: new FormArray([]),
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
    });
  });

  describe('createForm -->', () => {
    it('should call createForm with all fields', () => {
      component.createForm();
      expect(component.questionAdlib).not.toBe(null);
    });
    it('should remove ItemPromptTextsOptions with no option text', () => {
      expect((component.sectionItem.ItemPromptTextsOptions[0].length = 3));
    });
  });

  describe('setUpdatedFormValues -->', () => {
    it('should call setUpdatedFormValues on any form value changed', () => {
      spyOn(noteTemplateMock.undoStack, 'push');
      const formArg = {
        formData: cloneDeep(component.sectionItem),
        sectionItemIndex: component.sectionItemIndex,
      };
      spyOn(component.formDataArray, 'push');
      component.questionAdlib.setValue({
        questionAdlibText0_0_0: 'AdlibFinalContent',
        questionAdlibRequired: true,
        questionAdlibText0_0_1: 'AdlibFinalContent_1',
        questionAdlibOptionText0_0_0: 'questionAdlibOptionText0_1_0',
        questionAdlibOptionText0_0_1: 'questionAdlibOptionText0_0_1',
        questionAdlibOptionText0_0_2: 'questionAdlibOptionText0_0_2',
      });
      component.questionAdlib.valueChanges.subscribe(changedvalue => {
        expect(
          component.sectionItem.FormBankItemPromptTexts[0].ItemText
        ).toEqual('questionAdlibRequired');
        expect(
          component.sectionItem.FormBankItemPromptTexts[1].ItemText
        ).toEqual('AdlibFinalContent_1');
        expect(
          component.sectionItem.ItemPromptTextsOptions[0][0].BankItemOption
            .OptionText
        ).toEqual('questionAdlibOptionText0_0_0');
        expect(
          component.sectionItem.ItemPromptTextsOptions[0][1].BankItemOption
            .OptionText
        ).toEqual('questionAdlibOptionText0_0_1');
      });
      expect(noteTemplateMock.undoStack.push).not.toHaveBeenCalledWith(
        'value_changed'
      );
      expect(component.formDataArray.push).not.toHaveBeenCalledWith(formArg);
      expect(component.manualDetectedChanges).toBe(false);
    });
  });

  describe('confirmRemoveMultipleChoiceOption -->', () => {
    it('should call resequenceFormItems', () => {
      component.resequenceFormItems = jasmine.createSpy();
      component.confirmRemoveMultipleChoiceOption(null, 0);
      expect(component.confirmOptionRemoveIndex).toEqual(0);
      expect(component.resequenceFormItems).toHaveBeenCalled();
    });
  });

  describe('resequenceFormItems -->', () => {
    it('should resequenceFormItems as per section', () => {
      component.resequenceFormItems(component.sectionItem.ItemOptions);
      expect(component.sectionItem.ItemOptions[0].SequenceNumber).toBe(0);
    });
  });

  describe('addNewAdlibResponse -->', () => {
    it('should add new control as per the index', () => {
      spyOn(noteTemplateMock.undoStack, 'push');
      const formArg = {
        formData: cloneDeep(component.sectionItem),
        sectionItemIndex: component.sectionItemIndex,
      };
      spyOn(component.formDataArray, 'push');
      component.addNewAdlibResponse(0, 0);
      expect(component.manualDetectedChanges).toBe(true);
      expect(component.sectionItem.ItemPromptTextsOptions[0].length).toBe(4);
      expect(noteTemplateMock.undoStack.push).toHaveBeenCalledWith(
        'value_changed'
      );
      expect(component.formDataArray.push).toHaveBeenCalledWith(formArg);
    });
  });

  describe('removeAdlibMultipleChoiceOption -->', () => {
    it('should remove control as per the index', () => {
      spyOn(noteTemplateMock.undoStack, 'push');
      const formArg = {
        formData: cloneDeep(component.sectionItem),
        sectionItemIndex: component.sectionItemIndex,
      };
      spyOn(component.formDataArray, 'push');
      component.removeAdlibMultipleChoiceOption(0, 1);
      expect(component.manualDetectedChanges).toBe(true);
      expect(component.sectionItem.ItemPromptTextsOptions[0].length).toBe(2);
      expect(noteTemplateMock.undoStack.push).toHaveBeenCalledWith(
        'value_changed'
      );
      expect(component.formDataArray.push).toHaveBeenCalledWith(formArg);
    });
  });

  describe('cancelRemoveMultipleChoiceOption -->', () => {
    it('should call cancelRemoveMultipleChoiceOption and set confirmOptionRemoveIndex to be -1', () => {
      component.cancelRemoveMultipleChoiceOption();
      expect(component.confirmOptionRemoveIndex).toBe(-1);
    });
  });

  describe('isValidCustomFormCheck -->', () => {
    it('should call isValidCustomFormCheck from note template component', () => {
      component.noteTemplatesComponent.isValidCustomFormCheck = jasmine.createSpy();
      component.isValidCustomFormCheck(false);
      expect(
        component.noteTemplatesComponent.isValidCustomFormCheck
      ).toHaveBeenCalledWith(false);
    });
  });

  describe('ngOnDestroy -->', () => {
    it('should close subscription on destroy', () => {
      component.formValueSubscription = Object.assign(mockSubscription);
      component.ngOnDestroy();
      expect(component.formValueSubscription.closed).toBe(true);
    });
  });
});
