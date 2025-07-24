import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CustomFormTemplate, FormSection } from 'src/business-center/practice-settings/chart/note-templates/note-templates';
import { NoteTemplatesHelperService } from 'src/business-center/practice-settings/chart/note-templates/note-templates-helper.service';
import { SectionFooterComponent } from './section-footer.component';

let tempFormSection: FormSection[] = [{
  DataTag: "AAAAAAAeupg=",
  DateModified: "2022-12-12T21:21:29.032077",
  FormId: "51c3f973-9fc7-44a5-8118-42406bbd8b6f",
  FormSectionId: "9c9f617f-1d61-4beb-a06b-049b17802b7b",
  FormSectionItems: [],
  IsVisible: true,
  SequenceNumber: 1,
  ShowBorder: true,
  ShowTitle: true,
  Title: "AnglersDemo",
  UserModified: "6c36e54d-79af-4921-a0aa-6960f71ef5a0"
}]

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
  FormSections: tempFormSection,
  TemplateMode: 1,
  FileAllocationId: 1,
  DataTag: "",
  UserModified: "",
  DateModified: "",
  IndexOfSectionInEditMode: -1,
  SectionValidationFlag: false,
  SectionCopyValidationFlag: 1
}

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
describe('SectionFooterComponent', () => {
  let component: SectionFooterComponent;
  let fixture: ComponentFixture<SectionFooterComponent>;
  let service: NoteTemplatesHelperService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [SectionFooterComponent],
      providers: [
        { provide: NoteTemplatesHelperService, useValue: mockHelperService }
      ]
    })
      .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SectionFooterComponent);
    component = fixture.componentInstance;
    component.customForm = tempCustomerFormData;
    service = TestBed.get(NoteTemplatesHelperService);
    service.setData(tempCustomerFormData);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('ngOnInit funtion -> ', function () {
    it('should call ngOnInit', function () {
      component.customForm = tempCustomerFormData;
      const spy = component.ngOnInit = jasmine.createSpy();
      component.ngOnInit();
      expect(spy).toHaveBeenCalled();
    });
  });

  describe('toggleIsVisible funtion -> ', function () {
    it('should call toggleIsVisible', function () {
      component.customForm = tempCustomerFormData;
      const sectionIndex = 0;
      tempFormSection[0].IsVisible = true;
      component.toggleIsVisible(tempFormSection[0]);
      expect(component.customForm.FormSections[sectionIndex].IsVisible).toBe(false);
    });
  });

  describe('toggleShowTitle funtion -> ', function () {
    it('should call toggleShowTitle', function () {
      component.customForm = tempCustomerFormData;
      const sectionIndex = 0;
      tempFormSection[0].ShowTitle = true;
      component.toggleShowTitle(tempFormSection[0]);
      expect(component.customForm.FormSections[sectionIndex].ShowTitle).toBe(false);
    });
  });

  describe('toggleShowBorder funtion -> ', function () {
    it('should call toggleShowBorder', function () {
      component.customForm = tempCustomerFormData;
      const sectionIndex = 0;
      tempFormSection[0].ShowBorder = true;
      component.toggleShowBorder(tempFormSection[0]);
      expect(component.customForm.FormSections[sectionIndex].ShowBorder).toBe(false);
    });
  });

});
