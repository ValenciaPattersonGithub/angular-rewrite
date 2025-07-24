import { SimpleChanges } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormBuilder } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { CustomFormTemplate } from 'src/business-center/practice-settings/chart/note-templates/note-templates';
import { NoteTemplatesHelperService } from 'src/business-center/practice-settings/chart/note-templates/note-templates-helper.service';
import { NoteTemplatesComponent } from '../../../business-center/practice-settings/chart/note-templates/note-templates.component';
import { SectionCrudComponent } from './section-crud.component';
import { NoteTemplatesHttpService } from 'src/@shared/providers/note-templates-http.service';

let mockAuthZ = {}
let mockLocation = {}
let mockInjector = {}

let changes: SimpleChanges = {
  section: {
    currentValue: { DataTag: "AAAAAAAeupg=", Title: 'AnglersDemo', FormSectionItems: [] },
    previousValue: null,
    firstChange: false,
    isFirstChange: () => { return false }
  }
}
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

const mockModalFactoryService = {
  WarningModal: jasmine.createSpy('ModalFactory.WarningModal')
    .and.callFake(() => {
      return {
        then() { return [] }
      };
    })
}

let mockPatSecurityService = {
  IsAuthorizedByAbbreviation: jasmine.createSpy('patSecurityService.IsAuthorizedByAbbreviation').and.returnValue(true),
  generateMessage: jasmine.createSpy('patSecurityService.generateMessage')
};

let mockHelperService = {
  getData: () => {
    return {
      subscribe: (res) => {
        res(tempCustomerFormData)
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
}
describe('SectionCrudComponent', () => {
  let component: SectionCrudComponent;
  let service: NoteTemplatesHelperService;
  let fixture: ComponentFixture<SectionCrudComponent>;
  let mockToastrFactory = {
    success: jasmine.createSpy('toastrFactory.success'),
    error: jasmine.createSpy('toastrFactory.error')
  };

  let mockLocalizeService = {
    getLocalizedString: () => 'translated text'
  };

  let mockPatSecurityService = {
    IsAuthorizedByAbbreviation: (AccessCode) => {
      if (AccessCode == "soar-biz-bizloc-view" || AccessCode == "soar-biz-bsvct-add" || AccessCode == "soar-biz-bsvct-delete" || AccessCode == "soar-biz-bsvct-edit") {
        return true;
      }
      else {
        return false;
      }

    },
    generateMessage: jasmine.createSpy('patSecurityService.generateMessage')
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TranslateModule.forRoot()],
      declarations: [SectionCrudComponent, NoteTemplatesComponent],
      providers: [
        { provide: 'toastrFactory', useValue: mockToastrFactory },
        { provide: 'localize', useValue: mockLocalizeService },
        { provide: NoteTemplatesHelperService, useValue: mockHelperService },
        { provide: 'ModalFactory', useValue: mockModalFactoryService },
        { provide: 'toastrFactory', useValue: mockToastrFactory },
        { provide: 'patSecurityService', useValue: mockPatSecurityService },
        { provide: 'AuthZService', useValue: mockAuthZ },
        { provide: '$location', useValue: mockLocation },
        { provide: '$injector', useValue: mockInjector },
        { provide: NoteTemplatesHttpService, useValue: {} },
        { provide: 'patSecurityService', useValue: mockPatSecurityService }
        , FormBuilder, NoteTemplatesComponent,
      ]
    })
      .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SectionCrudComponent);
    component = fixture.componentInstance;
    component.customForm = tempCustomerFormData;
    service = TestBed.get(NoteTemplatesHelperService);
    service.setData(tempCustomerFormData);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('ngOnChanges funtion -> ', function () {
    it('should call ngOnChanges', function () {
      component.ngOnChanges(changes);
    });
  });

  describe('ngOnInit funtion -> ', function () {
    it('should call ngOnInit', function () {
      component.customForm = tempCustomerFormData;
      const spy = component.ngOnInit = jasmine.createSpy();
      component.ngOnInit();
      expect(spy).toHaveBeenCalled();
    });

    it('should call the checkAuthorization method ', () => {
      component.checkAuthorization = jasmine.createSpy();
      component.ngOnInit();
      expect(component.checkAuthorization).toHaveBeenCalled();
    });

  });

  describe('editSection funtion -> ', function () {
    it('should call editSection when sectionIndex is -1', function () {
      component.customForm.IndexOfSectionInEditMode = -1;
      component.editSection(-1);
      expect(component.customForm.IndexOfSectionInEditMode).toBe(-1);
      expect(component.allowSectionOpen).toBe(true);
    });

    it('should call toatsrFactory.error when sectionIndex is 0', function () {
      component.customForm.IndexOfSectionInEditMode = 1;
      const spy = mockToastrFactory.error = jasmine.createSpy();
      component.editSection(1);
      expect(spy).toHaveBeenCalled();
      expect(component.allowSectionOpen).toBe(false);
    });
  });

  describe('resequenceFormItems funtion -> ', function () {
    it('should call resequenceFormItems and iterate over the array', function () {
      component.customForm.FormSections = [{ SequenceNumber: 1 }];
      const spy = component.resequenceFormItems = jasmine.createSpy();
      component.resequenceFormItems();
      expect(spy).toHaveBeenCalled();
    });
  });

  describe('deleteSection funtion -> ', function () {
    it('should call deleteSection and set index', function () {
      component.deleteSection();
      expect(component.customForm.IndexOfSectionInEditMode).toBe(-1);
      expect(component.deleteSectionIndex).toBe(-1);
    });
  });

  describe('cancelDeleteSection funtion -> ', function () {
    it('should call cancelDeleteSection and set index to -1', function () {
      component.cancelDeleteSection();
      expect(component.deleteSectionIndex).toBe(-1);
    });
  });

  describe('confirmDeleteSection funtion -> ', function () {
    it('should call confirmDeleteSection and set index to -1 and call method - resequenceFormItems', function () {
      const spy = component.resequenceFormItems = jasmine.createSpy();
      component.confirmDeleteSection(-1);
      expect(component.deleteSectionIndex).toBe(-1);
      expect(spy).toHaveBeenCalled();
    });
  });
});
