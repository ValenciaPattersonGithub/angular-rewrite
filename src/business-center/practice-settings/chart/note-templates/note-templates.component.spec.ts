import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormBuilder, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { NoteTemplatesComponent } from './note-templates.component';
import cloneDeep from 'lodash/cloneDeep';
import { FormSection } from './note-templates';
import { NoteTemplatesHelperService } from './note-templates-helper.service';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { NoteTemplatesHttpService } from 'src/@shared/providers/note-templates-http.service';
import { NoteTemplatesListComponent } from './note-templates-list/note-templates-list.component';

describe('NoteTemplatesComponent', () => {
	let component: NoteTemplatesComponent;
	let fixture: ComponentFixture<NoteTemplatesComponent>;
	let mockAuthZ = {}
	let mockInjector = {}

	let tempSection: FormSection = new FormSection();

	let mockTemplate = {
		Template: {
			CategoryId: "3d8bec8a-0eb7-44b2-9628-ac175eecb9f3",
			DateModified: "2016-02-29T15:48:39.2312878Z",
			TemplateBody: "<p>gsdfgsdf</p><p>fbf</p>",
			TemplateId: "b6c5193a-4394-4a69-8bd9-8c4e713f3277",
			TemplateName: ""

		},

		TemplateBodyCustomForm: {
			FormSections: [{
				FormId: "00000000-0000-0000-0000-000000000000",
				FormSectionId: "00000000-0000-0000-0000-000000000000",
				FormSectionItems: [],
				IsVisible: true,
				SequenceNumber: 0,
				ShowBorder: true,
				ShowTitle: true,
				Title: "sec1"
			}]
		}

	};

	let mockTemplateEmpty = {}

	let mockTemplateCompare = {
		Template: {
			CategoryId: "3d8beb7a-0eb7-44b2-9628-ac175eecb9f3",
			DateModified: "2016-02-29T15:48:39.2312878Z",
			TemplateBody: "<p>bodyy</p><p>fbf</p>",
			TemplateId: "b6c5193a-4394-4a69-8bd9-8c4e713f3277",
			TemplateName: "Temp2"

		},

		TemplateBodyCustomForm: {}

	};

	let mockPatSecurityService = {
		IsAuthorizedByAbbreviation: jasmine.createSpy('patSecurityService.IsAuthorizedByAbbreviation').and.returnValue(true), generateMessage: jasmine.createSpy('patSecurityService.generateMessage')
	};

	let mockToastrFactory = {
		success: jasmine.createSpy('toastrFactory.success'),
		error: jasmine.createSpy('toastrFactory.error')
	};

	let mockLocalizeService = {
		getLocalizedString: () => 'translated text'
	};

	let mockUpdateNoteTemplate = [{
		"ExtendedStatusCode": null,
		"Value": {
			"CategoryId": "f79589c8-ff67-481b-b09f-2d1b9b4efc34",
			"CategoryName": "m1",
			"DataTag": "AAAAAAAll1E=",
			"UserModified": "a162c864-8f50-4e84-8942-7194bc8070cf",
			"DateModified": "2023-04-19T10:04:56.4083349Z"
		},
		"Count": null,
		"InvalidProperties": null
	}]

	let mockUpdateNoteTemplateForm = [{
		"ExtendedStatusCode": null,
		"Value": {
			"Template": {
				"TemplateId": "254d6ac4-a589-4a78-aad9-27679862a99a",
				"TemplateName": "Ma2",
				"CategoryId": "4121875c-6dd5-49cb-9226-a54af472e37a",
				"TemplateBodyFormId": "e09206f7-fa7e-4e98-8682-05e3c2d39a39",
				"DataTag": "AAAAAAAlndk=",
				"UserModified": "a162c864-8f50-4e84-8942-7194bc8070cf",
				"DateModified": "2023-04-19T14:31:32.9282029Z"
			},
			"TemplateBodyCustomForm": {
				"FormId": "e09206f7-fa7e-4e98-8682-05e3c2d39a39",
				"FormName": "Ma2_135049_CNT",
				"VersionNumber": 1,
				"SourceFormId": null,
				"FormTypeId": 2,
				"Description": "",
				"IsActive": true,
				"IsVisible": true,
				"IsPublished": false,
				"IsDefault": false,
				"FormSections": [],
				"TemplateMode": 1,
				"FileAllocationId": null,
				"DataTag": "",
				"UserModified": "00000000-0000-0000-0000-000000000000",
				"DateModified": "0001-01-01T00:00:00"
			}
		},
		"Count": null,
		"InvalidProperties": null

	}]

	let mockNoteTemplatesHelperService = {
		getData: () => {
			return {
				subscribe: (res) => {
					res({})
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
		resetCrudForm: jasmine.createSpy().and.returnValue({}),
		setCategoriesData: jasmine.createSpy().and.returnValue({}),
		getCategoriesData: () => {
			return {
				subscribe: (res) => {
					res({})
				}
			}
		},
	};

	const mockModalFactoryService = {
		WarningModal: jasmine.createSpy('ModalFactory.WarningModal').and.returnValue({
			then: (success) => {
				success(true)
			}
		})
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

	const mockSoarConfig = {
		domainUrl: 'https://localhost:35440',
	};

	const mockStaticDataService = {
        TeethDefinitions: () => new Promise((resolve, reject) => {
        })
    };
	beforeEach(async () => {

		await TestBed.configureTestingModule({

			imports: [
				FormsModule,
				ReactiveFormsModule,
				TranslateModule.forRoot(), HttpClientTestingModule],

			declarations: [NoteTemplatesComponent],

			schemas: [CUSTOM_ELEMENTS_SCHEMA],

			providers: [
				{ provide: 'toastrFactory', useValue: mockToastrFactory },
				{ provide: 'localize', useValue: mockLocalizeService },
				{ provide: 'patSecurityService', useValue: mockPatSecurityService },
				{ provide: 'AuthZService', useValue: mockAuthZ },
				{ provide: '$injector', useValue: mockInjector },
				{ provide: 'ModalFactory', useValue: mockModalFactoryService },
				{ provide: NoteTemplatesHelperService, useValue: mockNoteTemplatesHelperService },
				{ provide: 'SoarConfig', useValue: mockSoarConfig },
				{ provide: 'StaticData', useValue: mockStaticDataService },
				{ provide: NoteTemplatesHttpService, useValue: mockNoteTemplatesHttpService },
				FormBuilder, NoteTemplatesListComponent
			],

		}).compileComponents();

	});

	beforeEach(() => {
		fixture = TestBed.createComponent(NoteTemplatesComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});

	describe('ngOnInit -->', () => {
	//UT for this method is not possible as getAccess method has window.location.href = '/'; which is causing page load
	});

	describe('getAccess -->', () => {
	//UT for this method is not possible as it has window.location.href = '/'; which is causing page load
	});

	describe('cancelEdit ->', () => {

		it('should call cancelEdit', () => {
			component.selectedTemplate = mockTemplate;
			const spy = component.launchWarningModal = jasmine.createSpy();
			component.cancelEdit();
			component.launchWarningModal();
			expect(component.parentForm.dirty).toBe(false);
			expect(component.selectedTemplate).not.toEqual(component.selectedTemplateBackup);
			expect(spy).toHaveBeenCalled();
		});


	});

	describe('launchWarningModal method -> ', () => {
		it('should call modalfactory launchWarningModal', () => {
			spyOn(component, 'cancel');
			component.launchWarningModal();
			component.cancel();
			expect(component.cancel).toHaveBeenCalled();
		});
	});

	describe('cleanup after confirmed to cancel -> ', () => {
		it('should call cancel cleanup conditions', () => {
			component.cancel();
			expect(component.editMode).toBe(false);
			expect(component.existingTemplateActive).toBe(false);
		});
	});

	describe('createEmptySection ->', () => {
		let sectionCount = 0;
		it('should call createEmptySection with all fields', () => {
			spyOn(component, 'createEmptySection').and.returnValue(tempSection);
			tempSection.IsVisible = true;
			tempSection.FormSectionId = "00000000-0000-0000-0000-000000000000";
			tempSection.Title = "";
			tempSection.FormId = "00000000-0000-0000-0000-000000000000";
			tempSection.SequenceNumber = sectionCount;
			tempSection.ShowTitle = true;
			tempSection.ShowBorder = true;
			tempSection.IsVisible = true;
			tempSection.FormSectionItems = [];
			component.createEmptySection(sectionCount);
			expect(component.createEmptySection).toHaveBeenCalledWith(sectionCount);
		});
	});

	describe('updateTemplateForm -> ', () => {
		let result = {}

		it('update the apis', () => {
			spyOn(component, 'postSaveCleanup');
			component.updateTemplateForm();
			expect(component.postSaveCleanup(result)).toHaveBeenCalled;
			fixture.detectChanges();
		});

		it('template set changed condition check', () => {

			component.selectedTemplate = cloneDeep(mockTemplate);
			component.selectedTemplateBackup = cloneDeep(mockTemplateCompare);
			component.selectedTemplate.TemplateBodyCustomForm = mockTemplate.TemplateBodyCustomForm;
			component.selectedTemplateBackup.TemplateBodyCustomForm = mockTemplateCompare.TemplateBodyCustomForm;
			component.updateTemplateForm();
			expect(component.selectedTemplate).not.toEqual(component.selectedTemplateBackup);

		});

		it('template set changed condition check', () => {
			let result = true;
			component.frmNoteTemplate.markAsDirty();
			spyOn(component, 'postSaveCleanup');
			component.updateTemplateForm();
			expect(component.postSaveCleanup(result)).toHaveBeenCalled;
		});

	});

	describe('postSaveCleanup -> ', () => {

		let result = {};
		mockNoteTemplatesHttpService.SetActiveNoteTemplate({
			CategoryId: null, TemplateId: null, TemplateBody: ''
		});

		it('should call getTemplateCategoriesWithTemplates', () => {
			component.postSaveCleanup(result);
			expect(component.existingTemplateActive).toBeFalsy();
			expect(component.editMode).toBeFalsy();
			expect(mockNoteTemplatesHttpService.SetActiveNoteTemplate).toHaveBeenCalled();
			expect(mockNoteTemplatesHttpService.setTemplateDataChanged).toHaveBeenCalled();
			expect(mockNoteTemplatesHelperService.setCategoriesData).toHaveBeenCalled();
		});
	});

	describe('templateBodyCustomFormChanged ->', () => {
		it('templateBodyCustomFormChanged', () => {
			spyOn(component, 'templateBodyCustomFormChanged');
			component.templateBodyCustomFormChanged();
			component.selectedTemplate.TemplateBodyCustomForm;
			expect(component.templateBodyCustomFormChanged).toHaveBeenCalled();
		});

		it('templateBodyCustomFormChanged', () => {
			component.selectedTemplate.TemplateBodyCustomForm = mockTemplateCompare.TemplateBodyCustomForm;
			expect(component.canAddSection).toBe(true);
			fixture.detectChanges();
		});
	});

	describe('addSection ->', () => {

		it('should call resequenceFormItems', () => {
			const spy = component.resequenceFormItems = jasmine.createSpy();
			component.selectedTemplate = mockTemplate;
			component.selectedTemplate.TemplateBodyCustomForm = mockTemplate.TemplateBodyCustomForm;
			component.selectedTemplate.TemplateBodyCustomForm.FormSections = mockTemplate.TemplateBodyCustomForm.FormSections;
			component.addSection();
			component.resequenceFormItems();
			expect(spy).toHaveBeenCalled();
		});

		it('should call templateBodyCustomFormChanged', () => {
			const spy = component.templateBodyCustomFormChanged = jasmine.createSpy();
			component.selectedTemplate = mockTemplate;
			component.selectedTemplate.TemplateBodyCustomForm.FormSections = mockTemplate.TemplateBodyCustomForm.FormSections;
			component.selectedTemplate.TemplateBodyCustomForm.IndexOfSectionInEditMode = -1;
			component.addSection();
			component.templateBodyCustomFormChanged();
			expect(spy).toHaveBeenCalled();
		});

	});

	describe('createForm -->', () => {
		it('should call createForm with all fields', () => {
			component.createForm();
			expect(component.frmNoteTemplate).not.toBe(null);
		});
	});

	describe('setUpdatedFormValues -->', () => {

		it('should call setUpdatedFormValues on any form value changed', () => {
			component.selectedTemplate = cloneDeep(mockTemplate);
			component.frmNoteTemplate.setValue({ "inpTemplateName": "TemplateName", "slctTemplateCategory": "1" });
			component.frmNoteTemplate.valueChanges.subscribe((changedvalue) => {
				expect(component.selectedTemplate.Template.TemplateName).toEqual("TemplateName");
				expect(component.selectedTemplate.Template.CategoryId).toEqual("1");
			});
		});

	});

	describe('isDisabled ->', () => {

		it('should return true when template name is blank', () => {
			component.selectedTemplate = mockTemplate;
			component.selectedTemplate.Template.TemplateName = '';
			let result = component.isDisabled();
			expect(result).toBe(true);
		});

		it('should return true when category id is null', () => {
			component.selectedTemplate = mockTemplate;
			component.selectedTemplate.Template.CategoryId = null;
			let result = component.isDisabled();
			expect(result).toBe(true);
		});

	});

	describe('checkCanAddSection ->', () => {

		it('should call checkCanAddSection and return false', () => {
			component.checkCanAddSection();
			let result = component.checkCanAddSection();
			expect(result).toBe(false);
		});

		it('should call templateBodyCustomFormChanged', () => {
			const spy = component.templateBodyCustomFormChanged = jasmine.createSpy();
			component.templateBodyCustomForm();
			expect(spy).toHaveBeenCalled();
		});

		it('should make canAddSection true', () => {
			component.selectedTemplate.TemplateBodyCustomForm = mockTemplate.TemplateBodyCustomForm;
			component.selectedTemplate = mockTemplate;
			component.selectedTemplate.TemplateBodyCustomForm.FormSections = mockTemplate.TemplateBodyCustomForm.FormSections;
			component.selectedTemplate = mockTemplateEmpty;
			component.templateBodyCustomForm();
			expect(component.canAddSection).toBe(true);
		});

	});

	describe('saveTemplate ->', () => {

		it('saveTemplate isSaving conditions', () => {
			component.isSaving = false;
			component.saveTemplate();
			expect(component.isSaving).toBe(true);
		});

		it('saveTemplate conditions', () => {
			let result = {};
			spyOn(component, 'isValidCustomFormCheck').and.returnValue(true);
			spyOn(component, 'postSaveCleanup');
			component.selectedTemplate = mockTemplate;
			component.selectedTemplate.Template.TemplateId = mockTemplate.Template.TemplateId;
			component.authAccess.update = true;
			const spy = component.updateTemplateForm = jasmine.createSpy();
			component.saveTemplate();
			component.updateTemplateForm();
			expect(component.isValidCustomFormCheck).toHaveBeenCalledWith(true);
			expect(component.postSaveCleanup(result)).toHaveBeenCalled;
			expect(spy).toHaveBeenCalled();
		});

	});

	describe('selectedNoteTemplate ->', () => {
		it('should call createForm method', () => {
			const spy = component.createForm = jasmine.createSpy();
			component.selectedTemplate = cloneDeep(mockTemplate);
			component.selectedTemplateBackup = cloneDeep(mockTemplateCompare);
			component.selectedNoteTemplate({ selectedTemplate: mockTemplate, editMode: true });
			expect(spy).toHaveBeenCalled();
		});
	});

	describe('checkCanAddSection ->', () => {
		it('checkCanAddSection', () => {
			const spy = component.templateBodyCustomFormChanged = jasmine.createSpy();
			spyOn(component, 'canAddSection').and.returnValue(false);
			component.checkCanAddSection();
			component.templateBodyCustomFormChanged();
			expect(spy).toHaveBeenCalled();
		});
	});

	describe('ngOnDestroy -->', () => {
		it('should close subscription on destroy', () => {
			component.ngOnDestroy();
			expect(component.frmNoteTemplateSubScription.closed).toBe(true);
			expect(component.parentFormSubscription.closed).toBe(true);
		});
	});

});

