import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CustomFormTemplate } from 'src/business-center/practice-settings/chart/note-templates/note-templates';
import { NoteTemplatesHelperService } from 'src/business-center/practice-settings/chart/note-templates/note-templates-helper.service';
import { AccordionComponent } from './accordion.component';
import { NoteTemplatesHttpService } from 'src/@shared/providers/note-templates-http.service';

let mockNoteTemplateService = {

  data$: jasmine.createSpy().and.returnValue({
    pipe: (event) => {
      return {
        type: "confirm",
        subscribe: (success) => {
          success({ type: "confirm" })
        },
        filter: (f) => { return f }
      }
    },
    close: jasmine.createSpy(),
  }),
};

let tempCustomerFormData: CustomFormTemplate = {
  FormId: "1234",
  FormName: "Test Form",
  VersionNumber: 1,
  SourceFormId: "4567",
  FormTypeId: 2,
  Description: "Description",
  IsActive: false,
  IsVisible: false,
  IsPublished: false,
  IsDefault: false,
  FormSections: [{ SequenceNumber: 1 }],
  TemplateMode: 1,
  FileAllocationId: 1,
  DataTag: "",
  UserModified: "",
  DateModified: "",
  IndexOfSectionInEditMode: -1,
  SectionValidationFlag: false,
  SectionCopyValidationFlag: 1
}
let mockNoteTemplatesHttpService = {
  ActiveTemplateCategory: jasmine.createSpy().and.returnValue({}),
  ActiveNoteTemplate: jasmine.createSpy().and.returnValue({}),
  CurrentOperation: jasmine.createSpy().and.returnValue({}),
  access: jasmine.createSpy().and.returnValue({ view: true, create: true, edit: true }),
  SetActiveNoteTemplate: jasmine.createSpy().and.callFake(function (temp) {
    this.ActiveNoteTemplate = temp;
  }),
  SetActiveTemplateCategory: jasmine.createSpy().and.callFake(function (category) {
    this.ActiveTemplateCategory = category;
  }),
  SetCurrentOperation: jasmine.createSpy().and.callFake(function (temp) {
    this.CurrentOperation = temp;
  }),
  setTemplateDataChanged: jasmine.createSpy().and.returnValue({}),
  ShowTemplateHeader: jasmine.createSpy().and.returnValue({}),
  CloseTemplateHeader: jasmine.createSpy().and.returnValue({}),
  validateTemplate: jasmine.createSpy().and.returnValue({}),		
  updateNoteTemplateForm: () => {
    return {
      then: (res, error) => {
        res({ Value: [] }),
        error({})
      }
    }
  },
  updateNoteTemplate: () => {
    return {
      then: (res, error) => {
        res({ Value: [] }),
        error({})
      }
    }
  },
  saveNoteTemplates: jasmine.createSpy().and.returnValue({
    then: jasmine.createSpy()
  }),
  createNoteTemplate: () => {
    return {
      then: (res, error) => {
        res({ Value: [] }),
        error({})
      }
    }
  },
  categories: () => {
    return {
      then: (res, error) => {
        res({ Value: [] }),
        error({})
      }
    }
  },
  observeTemplates: jasmine.createSpy().and.returnValue({}),
  observeCategories: jasmine.createSpy().and.returnValue({}),
  CategoriesWithTemplates: jasmine.createSpy('NoteTemplatesHttpService.CategoriesWithTemplates').and.returnValue({
    then: jasmine.createSpy()
  }),
  ExpandOrCollapseCategory: jasmine.createSpy().and.returnValue({
    then: jasmine.createSpy()
  })
}

describe('AccordionComponent', () => {
  let component: AccordionComponent;
  let fixture: ComponentFixture<AccordionComponent>;
  let service: NoteTemplatesHelperService;
	let mockToastrFactory = {
		success: jasmine.createSpy('toastrFactory.success'),
		error: jasmine.createSpy('toastrFactory.error')
	};

	let mockLocalizeService = {
		getLocalizedString: () => 'translated text'
	};

	const mockSoarConfig = {
		domainUrl: 'https://localhost:35440',
	};

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [AccordionComponent],
      providers: [
        { provide: NoteTemplatesHttpService, useValue: mockNoteTemplatesHttpService },
        { provide: 'SoarConfig', useValue: mockSoarConfig },
        { provide: 'toastrFactory', useValue: mockToastrFactory },
				{ provide: 'localize', useValue: mockLocalizeService }

      ]
    })
      .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AccordionComponent);
    component = fixture.componentInstance;
    service = TestBed.get(NoteTemplatesHelperService);
    service.setData(tempCustomerFormData);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('ngOnInit funtion -> ', function () {
    it('should call ngOnInit', function () {
      const spy = component.getCustomFormTemplateData = jasmine.createSpy();
      component.ngOnInit();
      expect(spy).toHaveBeenCalled();
    });
  });
});
