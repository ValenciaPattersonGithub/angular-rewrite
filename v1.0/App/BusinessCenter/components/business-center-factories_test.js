//ToDo: Remove while doing code cleanup for note templates
// describe('NoteTemplatesFactory ->', function () {
//     var toastrFactory, noteTemplatesFactory;
//     var noteTemplateCategoriesService, noteTemplatesService;

//     //#region mockTemplate for adlib
//     var mockTemplate1 = {
//         'Template': {
//             'TemplateId': null,
//             'TemplateName': 'Breakfast',
//             'CategoryId': '8866f327-3b34-4323-9b54-568044b5bdbe',
//             'TemplateBodyFormId': null
//         },
//         'TemplateBodyCustomForm': {
//             'FormId': '00000000-0000-0000-0000-000000000000',
//             'VersionNumber': 1,
//             'SourceFormId': '00000000-0000-0000-0000-000000000000',
//             'FormName': 'Breakfast_880510_CNT',
//             'Description': '',
//             'IsActive': true,
//             'IsVisible': true,
//             'IsPublished': false,
//             'IsDefault': false,
//             'FormSections': [
//                 {
//                     'FormSectionId': '00000000-0000-0000-0000-000000000000',
//                     'Title': 'SS2',
//                     'FormId': '00000000-0000-0000-0000-000000000000',
//                     'SequenceNumber': -1,
//                     'ShowTitle': true,
//                     'ShowBorder': true,
//                     'IsVisible': true,
//                     'FormSectionItems': [
//                         {
//                             'FormSectionId': '00000000-0000-0000-0000-000000000000',
//                             'SectionItemId': -1,
//                             'BankItemId': null,
//                             'FormBankItem': {
//                                 'Answer': null,
//                             },
//                             'IsRequired': false,
//                             'MultiSelectAllow': false,
//                             'IsVisible': true,
//                             'SequenceNumber': 1,
//                             'BankItemDemographicId': null,
//                             'FormBankItemDemographic': null,
//                             'BankItemEmergencyContactId': null,
//                             'FormBankItemEmergencyContact': {
//                             },
//                             'ItemOptions': [

//                             ],
//                             'FormItemTypeName': 'Ad-Lib',
//                             'FormItemType': 9,
//                             'FormBankItemPromptTexts': [
//                                 {
//                                     'Answer': null,
//                                     'ItemText': 'i like eggs',
//                                     'FormItemTypeName': '',
//                                     'Description': '',
//                                     'CommonlyUsed': '',
//                                     'IsVisible': true,
//                                     'UseDefaultValue': false,
//                                     'DefaultValue': '',
//                                     'ItemSequenceNumber': 1
//                                 },
//                                 {
//                                     'Answer': null,
//                                     'ItemText': 'w bacon',
//                                     'FormItemTypeName': '',
//                                     'Description': '',
//                                     'CommonlyUsed': '',
//                                     'IsVisible': true,
//                                     'UseDefaultValue': false,
//                                     'DefaultValue': '',
//                                     'ItemSequenceNumber': 2
//                                 }
//                             ],
//                             'ItemPromptTextsOptions': [
//                                 [
//                                     {
//                                         'SectionItemId': '00000000-0000-0000-0000-000000000000',
//                                         'SectionItemOptionId': '00000000-0000-0000-0000-000000000000',
//                                         'BankItemId': '00000000-0000-0000-0000-000000000000',
//                                         'BankItemOptionId': '00000000-0000-0000-0000-000000000000',
//                                         'BankItemOption': {
//                                             'BankItemOptionId': '00000000-0000-0000-0000-000000000000',
//                                             'OptionIndex': 1,
//                                             'OptionText': 'over easy',
//                                             'OptionValue': '',
//                                             'IsSelected': '',
//                                             'IsVisible': '',
//                                             'SequenceNumber': 1
//                                         },
//                                         'IsSelected': true,
//                                         'IsVisible': true,
//                                         'SequenceNumber': 1
//                                     },
//                                     {
//                                         'SectionItemId': '00000000-0000-0000-0000-000000000000',
//                                         'SectionItemOptionId': '00000000-0000-0000-0000-000000000000',
//                                         'BankItemId': '00000000-0000-0000-0000-000000000000',
//                                         'BankItemOptionId': '00000000-0000-0000-0000-000000000000',
//                                         'BankItemOption': {
//                                             'BankItemOptionId': '00000000-0000-0000-0000-000000000000',
//                                             'OptionIndex': 2,
//                                             'OptionText': 'over medium',
//                                             'OptionValue': '',
//                                             'IsSelected': '',
//                                             'IsVisible': '',
//                                             'SequenceNumber': 1
//                                         },
//                                         'IsSelected': true,
//                                         'IsVisible': true,
//                                         'SequenceNumber': 1
//                                     },
//                                     {
//                                         'SectionItemId': '00000000-0000-0000-0000-000000000000',
//                                         'SectionItemOptionId': '00000000-0000-0000-0000-000000000000',
//                                         'BankItemId': '00000000-0000-0000-0000-000000000000',
//                                         'BankItemOptionId': '00000000-0000-0000-0000-000000000000',
//                                         'BankItemOption': {
//                                             'BankItemOptionId': '00000000-0000-0000-0000-000000000000',
//                                             'OptionIndex': 3,
//                                             'OptionText': 'over well',
//                                             'OptionValue': '',
//                                             'IsSelected': '',
//                                             'IsVisible': '',
//                                             'SequenceNumber': 1
//                                         },
//                                         'IsSelected': true,
//                                         'IsVisible': true,
//                                         'SequenceNumber': 1
//                                     }
//                                 ]
//                             ]
//                         }
//                     ]
//                 }
//             ],
//             'IndexOfSectionInEditMode': 0,
//             'SectionValidationFlag': false,
//             'SectionCopyValidationFlag': -1,
//             'TemplateMode': 1
//         }
//     };
//     //#endregion

//     //#region mock template

//     var mockTemplate = {
//         TemplateId: 'd3796bf1-d0f9-4569-bdd3-d7877d4027fa',
//         TemplateName: 'MockTemplate',
//         TemplateBodyCustomForm: {
//             FormName: 'MockTemplate',
//             VersionNumber: 1,
//             FormSections: [{
//                 Title: 'Section 1',
//                 SequenceNumber: 1,
//                 FormSectionItems: [{
//                     IsRequired: true,
//                     FormItemType: 3,
//                     MultiSelectAllow: true,
//                     FormBankItem: {
//                         ItemText: 'Any Pain or Swelling',
//                         Description: 'Any Pain or Swelling',
//                         Answer: null,
//                         IsRequired: true,
//                         MultiSelectAllow: true,
//                         SequenceNumber: 1,
//                     },
//                     ItemOptions: [{
//                         SequenceNumber: 1,
//                         Answer: false,
//                         BankItemOption: {
//                             OptionIndex: 1,
//                             OptionText: 'Very little',
//                             OptionValue: 'Very little',
//                         },
//                     }, {
//                         SequenceNumber: 2,
//                         Answer: false,
//                         BankItemOption: {
//                             OptionIndex: 1,
//                             OptionText: 'Moderate',
//                             OptionValue: 'Moderate',
//                         },
//                     }, {
//                         SequenceNumber: 3,
//                         Answer: true,
//                         BankItemOption: {
//                             OptionIndex: 3,
//                             OptionText: 'Severe',
//                             OptionValue: 'Severe',
//                         },
//                     },],
//                 },

//                 ],
//             },
//             {
//                 Title: 'Section 2',
//                 SequenceNumber: 2,
//                 FormSectionItems: [{
//                     IsRequired: true,
//                     FormItemType: 3,
//                     MultiSelectAllow: false,
//                     FormBankItem: {
//                         ItemText: 'Are you ever coming back?',

//                         Description: 'Are you ever coming back?',
//                         Answer: 'Probably not',
//                         IsRequired: true,
//                         MultiSelectAllow: false,
//                         SequenceNumber: 1,
//                     },
//                     ItemOptions: [
//                         {
//                             SectionItemId: 'c450fc0f-42e1-441e-8ffb-27a1dea13f15',
//                             SequenceNumber: 1,
//                             BankItemOption: {
//                                 BankItemId: '3a606416-27d4-4be9-bea3-1d62d08ed79c',
//                                 OptionIndex: 1,
//                                 OptionText: 'Probably not',
//                                 OptionValue: 'Probably not',
//                                 Answer: 'Probably not',
//                             },
//                         }, {
//                             SectionItemId: 'c450fc0f-42e1-441e-8ffb-27a1dea13f15',
//                             SequenceNumber: 2,
//                             BankItemOption: {
//                                 BankItemId: '3a606416-27d4-4be9-bea3-1d62d08ed79c',
//                                 OptionIndex: 1,
//                                 OptionText: 'Maybe',
//                                 OptionValue: 'Maybe',
//                                 Answer: 'Probably not',
//                             },
//                         }, {
//                             SectionItemId: 'c450fc0f-42e1-441e-8ffb-27a1dea13f15',
//                             SequenceNumber: 3,
//                             BankItemOption: {
//                                 BankItemId: '3a606416-27d4-4be9-bea3-1d62d08ed79c',
//                                 OptionIndex: 3,
//                                 OptionText: 'Doubt it',
//                                 OptionValue: 'Doubt it',
//                                 Answer: 'Probably not',
//                             },
//                         }
//                     ],
//                 },

//                 ]
//             },

//             {
//                 Title: 'Section 3',
//                 SequenceNumber: 3,
//                 FormSectionItems: [{
//                     IsRequired: true,
//                     FormItemType: 2,
//                     MultiSelectAllow: false,
//                     FormBankItem: {
//                         ItemText: 'Was this painful?',
//                         Description: 'Was this painful?',
//                         Answer: 'Yes',
//                         IsRequired: true,
//                         MultiSelectAllow: false,
//                         SequenceNumber: 1,
//                     },
//                     ItemOptions: [
//                     ],
//                 },

//                 ]
//             }

//             ]
//         }
//     };

//     //#endregion

//     //#region mocks
//     var noteTemplatesMock = [];
//     var mockTemplatesResponse = {
//         Value: noteTemplatesMock
//     };
//     var noteTemplateCategoriesMock = [];
//     var mockTemplateCategoriesResponse = {
//         Value: noteTemplateCategoriesMock
//     };
//     var hasAccessMock = { Create: false, Delete: false, Edit: false, View: false };

//     //#endregion

//     //#region services, before each

//     beforeEach(module('Soar.Common'));
//     beforeEach(module('common.factories'));

//     beforeEach(module('Soar.BusinessCenter', function ($provide) {
//         noteTemplateCategoriesService = {
//             get: jasmine.createSpy().and.returnValue(mockTemplateCategoriesResponse),
//             create: jasmine.createSpy().and.returnValue({}),
//             update: jasmine.createSpy().and.returnValue({}),
//             delete: jasmine.createSpy().and.returnValue({}),
//         };
//         $provide.value('NoteTemplateCategoriesService', noteTemplateCategoriesService);

//         noteTemplatesService = {
//             get: jasmine.createSpy().and.returnValue(mockTemplatesResponse),
//             create: jasmine.createSpy().and.returnValue({}),
//             update: jasmine.createSpy().and.returnValue({}),
//             delete: jasmine.createSpy().and.returnValue({}),
//             getTemplateBodyCustomFormById: jasmine.createSpy().and.returnValue({
//                 then: jasmine.createSpy().and.returnValue({})
//             }),
//         };
//         $provide.value('NoteTemplatesService', noteTemplatesService);

//         toastrFactory = {};
//         toastrFactory.error = jasmine.createSpy();
//         toastrFactory.success = jasmine.createSpy();
//         $provide.value('toastrFactory', toastrFactory);
//     }));

//     beforeEach(inject(function ($injector) {
//         noteTemplatesFactory = $injector.get('NoteTemplatesFactory');
//     }));

//     //#endregion

//     describe('access method -> ', function () {
//         it('should return user access to module', function () {
//             spyOn(noteTemplatesFactory, 'access').and.returnValue(hasAccessMock);
//             var access = noteTemplatesFactory.access();
//             expect(access).toEqual(hasAccessMock);
//         });
//     });

//     describe('ConvertTemplateToText function->', function () {
//         var template = angular.copy(mockTemplate);

//         angular.forEach(template.TemplateBodyCustomForm.FormSections, function (formSection) {
//             it('should return text that contains Section title in bold', function () {
//                 expect(noteTemplatesFactory.ConvertTemplateToText(template)).toContain('<strong>' + formSection.Title + '</strong>');
//             });
//             angular.forEach(formSection.FormSectionItems, function (formSectionItem) {
//                 it('should return text that contains question answer in bold', function () {
//                     if (formSectionItem.FormItemType === 8) {
//                         expect(noteTemplatesFactory.ConvertTemplateToText(template)).toContain('<strong>&nbsp;' + formSectionItem.FormBankItem.Answer + '</strong>');
//                     }
//                     if (formSectionItem.FormItemType === 2) {
//                         expect(noteTemplatesFactory.ConvertTemplateToText(template)).toContain('<strong>&nbsp;' + formSectionItem.FormBankItem.Answer + '</strong>');
//                     }
//                     if (formSectionItem.FormItemType === 3 && formSectionItem.MultiSelectAllow === true) {
//                         var answer = '';
//                         angular.forEach(formSectionItem.ItemOptions, function (itemOption) {
//                             if (itemOption.Answer === true) {
//                                 answer += itemOption.BankItemOption.OptionText;
//                                 answer += ', ';
//                             }
//                         });
//                         // remove trailing comma
//                         if (answer.length > 2) {
//                             answer = answer.substring(0, answer.length - 2);
//                         }
//                         expect(noteTemplatesFactory.ConvertTemplateToText(template)).toContain('<strong>&nbsp;' + answer + '</strong>');
//                     }
//                     if (formSectionItem.FormItemType === 3 && formSectionItem.MultiSelectAllow === false) {
//                         expect(noteTemplatesFactory.ConvertTemplateToText(template)).toContain('<strong>&nbsp;' + formSectionItem.FormBankItem.Answer + '</strong>');
//                     }
//                 });

//                 it('should return text that contains question in regular text', function () {
//                     expect(noteTemplatesFactory.ConvertTemplateToText(template)).toContain(formSectionItem.FormBankItem.Description);
//                 });
//             });
//         });
//     });

//     describe('ConvertTemplateToText (Adlib) function->', function () {
//         var template = angular.copy(mockTemplate1);

//         angular.forEach(template.TemplateBodyCustomForm.FormSections, function (formSection) {
//             it('should return text that contains Section title in bold', function () {
//                 expect(noteTemplatesFactory.ConvertTemplateToText(template)).toContain('<strong>' + formSection.Title + '</strong>');
//             });
//             angular.forEach(formSection.FormSectionItems, function (formSectionItem) {
//                 it('should return text that contains question answer in bold', function () {
//                     if (formSectionItem.FormItemType === 9) {
//                         formSectionItem.FormBankItem.Answer = 'Bacon!';
//                         expect(noteTemplatesFactory.ConvertTemplateToText(template)).toContain('<strong>&nbsp;' + formSectionItem.FormBankItem.Answer + '&nbsp;</strong>');
//                     }
//                 });
//             });
//         });
//     });

//     describe('ConvertTemplateToText (Link Tooth) function->', function () {
//         var template = angular.copy(mockTemplate1);
//         template.TemplateBodyCustomForm.FormSections[0].FormSectionItems[0] = {
//             IsRequired: true,
//             FormItemType: 10,
//             MultiSelectAllow: false,
//             $$activeTeeth: ['2', '3', '4',],
//             FormBankItem: {
//                 ItemText: 'Link Tooth',
//                 Description: 'Link Tooth',
//             },
//         };
//         angular.forEach(template.TemplateBodyCustomForm.FormSections, function (formSection) {
//             it('should return text that contains Section title in bold', function () {
//                 expect(noteTemplatesFactory.ConvertTemplateToText(template)).toContain('<strong>' + formSection.Title + '</strong>');
//             });
//             angular.forEach(formSection.FormSectionItems, function (formSectionItem) {
//                 it('should return text that contains question answer in bold', function () {
//                     if (formSectionItem.FormItemType === 10) {
//                         var answer = '2, 3, 4';
//                         expect(noteTemplatesFactory.ConvertTemplateToText(template)).toContain('<span><strong>&nbsp;' + answer + '</strong></span><br /><br />');
//                     }
//                 });
//             });
//         });
//     });

//     describe('ConvertTemplateToText (Note Text) function->', function () {
//         var template = angular.copy(mockTemplate1);
//         template.TemplateBodyCustomForm.FormSections[0].Title = 'I am a note text form section title';
//         template.TemplateBodyCustomForm.FormSections[0].FormSectionItems[0] = {
//             FormItemType: 11,
//             FormBankItem: null,
//             FormItemTextField: {
//                 NoteText: 'I am a note Text'
//             }
//         };

//         angular.forEach(template.TemplateBodyCustomForm.FormSections, function (formSection) {
//             it('should return text that contains Section title in bold', function () {
//                 expect(noteTemplatesFactory.ConvertTemplateToText(template)).toContain('<strong>I am a note text form section title</strong>');
//             });
//             angular.forEach(formSection.FormSectionItems, function (formSectionItem) {
//                 it('should return text that contains question answer in bold', function () {
//                     if (formSectionItem.FormItemType === 11) {
//                         var answer = template.TemplateBodyCustomForm.FormSections[0].FormSectionItems[0].FormItemTextField.NoteText;
//                         expect(noteTemplatesFactory.ConvertTemplateToText(template)).toContain('<span >' + answer + '</span>');
//                     }
//                 });
//             });
//         });
//     });

//     describe('ConvertTemplateToText function->', function () {
//         var template = angular.copy(mockTemplate1);
//         template.TemplateBodyCustomForm.FormSections[0].FormSectionItems[0] = {
//             $$Skip: true
//         };

//         angular.forEach(template.TemplateBodyCustomForm.FormSections, function (formSection) {
//             angular.forEach(formSection.FormSectionItems, function () {
//                 it('should return empty string if $$Skip is true', function () {
//                     expect(noteTemplatesFactory.ConvertTemplateToText(template)).toBe('');
//                 });
//             });
//         });
//     });

//     describe('validateTemplateAnswers when isRequired is true function->', function () {
//         var template = {};
//         beforeEach(function () {
//             template = angular.copy(mockTemplate1);
//         });

//         it('should return true (isValidForm) if FormItemType equals 2 and formSectionItem.FormBankItem.Answer is null', function () {
//             var formSectionItem = { FormItemType: 2, IsRequired: true, FormBankItem: { Answer: null } };
//             template.TemplateBodyCustomForm.FormSections[0].FormSectionItems = [];
//             template.TemplateBodyCustomForm.FormSections[0].FormSectionItems.push(formSectionItem);
//             expect(noteTemplatesFactory.ValidateTemplateAnswers(template.TemplateBodyCustomForm)).toBe(false);
//         });

//         it('should return false (isValidForm) if FormItemType equals 3 and multiselect and formSectionItem.ItemOption.Answer is null', function () {
//             var formSectionItem = {
//                 MultiSelectAllow: true,
//                 FormItemType: 3,
//                 IsRequired: true,
//                 FormBankItem: {
//                     Answer: 'Answer'
//                 }, ItemOptions: [{
//                     Answer: null
//                 }, {
//                     Answer: null
//                 }]
//             };
//             template.TemplateBodyCustomForm.FormSections[0].FormSectionItems = [];
//             template.TemplateBodyCustomForm.FormSections[0].FormSectionItems.push(formSectionItem);
//             expect(noteTemplatesFactory.ValidateTemplateAnswers(template.TemplateBodyCustomForm)).toBe(false);
//         });

//         it('should return false (isValidForm) if FormItemType equals 3 and not multiselect and formSectionItem.FormBankItem.Answer is null', function () {
//             var formSectionItem = {
//                 MultiSelectAllow: false,
//                 FormItemType: 3,
//                 IsRequired: true,
//                 FormBankItem: {
//                     Answer: null
//                 }
//             };
//             template.TemplateBodyCustomForm.FormSections[0].FormSectionItems = [];
//             template.TemplateBodyCustomForm.FormSections[0].FormSectionItems.push(formSectionItem);
//             expect(noteTemplatesFactory.ValidateTemplateAnswers(template.TemplateBodyCustomForm)).toBe(false);
//         });

//         it('should return false (isValidForm) if FormItemType equals 8 and formSectionItem.FormBankItem.Answer is null', function () {
//             var formSectionItem = {
//                 FormItemType: 8,
//                 IsRequired: true,
//                 FormBankItem: { Answer: null }
//             };
//             template.TemplateBodyCustomForm.FormSections[0].FormSectionItems = [];
//             template.TemplateBodyCustomForm.FormSections[0].FormSectionItems.push(formSectionItem);
//             expect(noteTemplatesFactory.ValidateTemplateAnswers(template.TemplateBodyCustomForm)).toBe(false);
//         });

//         it('should return false (isValidForm) if FormItemType equals 9 and formSectionItem.FormBankItem.Answer is null', function () {
//             var formSectionItem = {
//                 FormItemType: 9,
//                 IsRequired: true,
//                 FormBankItem: { Answer: null }
//             };
//             template.TemplateBodyCustomForm.FormSections[0].FormSectionItems = [];
//             template.TemplateBodyCustomForm.FormSections[0].FormSectionItems.push(formSectionItem);
//             expect(noteTemplatesFactory.ValidateTemplateAnswers(template.TemplateBodyCustomForm)).toBe(false);
//         });

//         it('should return false (isValidForm) if FormItemType equals 10 and formSectionItem.$$activeTeeth is null', function () {
//             var formSectionItem = {
//                 FormItemType: 10,
//                 IsRequired: true, $$activeTeeth: []
//             };
//             template.TemplateBodyCustomForm.FormSections[0].FormSectionItems = [];
//             template.TemplateBodyCustomForm.FormSections[0].FormSectionItems.push(formSectionItem);
//             expect(noteTemplatesFactory.ValidateTemplateAnswers(template.TemplateBodyCustomForm)).toBe(false);
//         });

//         it('should return true  (isValidForm) if FormItemType equals 2 and formSectionItem.FormBankItem.Answer is not null', function () {
//             var formSectionItem = {
//                 IsRequired: true,
//                 FormItemType: 2,
//                 FormBankItem: {
//                     Answer: 'Answer'
//                 }
//             };
//             template.TemplateBodyCustomForm.FormSections[0].FormSectionItems = [];
//             template.TemplateBodyCustomForm.FormSections[0].FormSectionItems.push(formSectionItem);
//             expect(noteTemplatesFactory.ValidateTemplateAnswers(template.TemplateBodyCustomForm)).toBe(true);
//         });

//         it('should return true (isValidForm)  if FormItemType equals 3 and multiselect and formSectionItem.ItemOption.Answer is not null and IsRequired is true', function () {
//             var formSectionItem = {
//                 MultiSelectAllow: true,
//                 FormItemType: 2,
//                 IsRequired: true,
//                 FormBankItem: {
//                     Answer: 'Answer'
//                 },
//                 ItemOptions: [{ Answer: 'Answer' }, {
//                     Answer: 'Answer'
//                 }]
//             };
//             template.TemplateBodyCustomForm.FormSections[0].FormSectionItems = [];
//             template.TemplateBodyCustomForm.FormSections[0].FormSectionItems.push(formSectionItem);
//             expect(noteTemplatesFactory.ValidateTemplateAnswers(template.TemplateBodyCustomForm)).toBe(true);
//         });

//         it('should return true (isValidForm)  if FormItemType equals 3 and not multiselect and formSectionItem.FormBankItem.Answer is not null', function () {
//             var formSectionItem = {
//                 MultiSelectAllow: false,
//                 FormItemType: 3,
//                 IsRequired: true,
//                 FormBankItem: {
//                     Answer: 'Answer'
//                 }
//             };
//             template.TemplateBodyCustomForm.FormSections[0].FormSectionItems = [];
//             template.TemplateBodyCustomForm.FormSections[0].FormSectionItems.push(formSectionItem);
//             expect(noteTemplatesFactory.ValidateTemplateAnswers(template.TemplateBodyCustomForm)).toBe(true);
//         });

//         it('should return true (isValidForm)  if FormItemType equals 8 and formSectionItem.FormBankItem.Answer is not null', function () {
//             var formSectionItem = {
//                 FormItemType: 8,
//                 IsRequired: true,
//                 FormBankItem: { Answer: 'Answer' }
//             };
//             template.TemplateBodyCustomForm.FormSections[0].FormSectionItems = [];
//             template.TemplateBodyCustomForm.FormSections[0].FormSectionItems.push(formSectionItem);
//             expect(noteTemplatesFactory.ValidateTemplateAnswers(template.TemplateBodyCustomForm)).toBe(true);
//         });

//         it('should return true (isValidForm)  if FormItemType equals 9 and formSectionItem.FormBankItem.Answer is not null', function () {
//             var formSectionItem = {
//                 FormItemType: 9,
//                 IsRequired: true,
//                 FormBankItem: { Answer: 'Answer' }
//             };
//             template.TemplateBodyCustomForm.FormSections[0].FormSectionItems = [];
//             template.TemplateBodyCustomForm.FormSections[0].FormSectionItems.push(formSectionItem);
//             expect(noteTemplatesFactory.ValidateTemplateAnswers(template.TemplateBodyCustomForm)).toBe(true);
//         });

//         it('should return true (isValidForm) if FormItemType equals 10 and formSectionItem.$$activeTeeth is not null', function () {
//             var formSectionItem = {
//                 FormItemType: 10,
//                 IsRequired: true,
//                 $$activeTeeth: ['2', '3']
//             };
//             template.TemplateBodyCustomForm.FormSections[0].FormSectionItems = [];
//             template.TemplateBodyCustomForm.FormSections[0].FormSectionItems.push(formSectionItem);
//             expect(noteTemplatesFactory.ValidateTemplateAnswers(template.TemplateBodyCustomForm)).toBe(true);
//         });
//     });

//     describe('ValidateFormSectionItemAnswers function->', function () {
//         it('should return true if FormItemType equals 2 and formSectionItem.FormBankItem.Answer is null', function () {
//             var formSectionItem = { FormItemType: 2, IsRequired: true, FormBankItem: { Answer: null } };
//             expect(noteTemplatesFactory.ValidateFormSectionItemAnswers(formSectionItem)).toBe(true);
//         });

//         it('should return true if FormItemType equals 3 and multiselect and formSectionItem.ItemOption.Answer is null', function () {
//             var formSectionItem = {
//                 MultiSelectAllow: true,
//                 FormItemType: 3,
//                 IsRequired: true,
//                 FormBankItem: {
//                     Answer: 'Answer'
//                 }, ItemOptions: [{
//                     Answer: null
//                 }, {
//                     Answer: null
//                 }]
//             };
//             expect(noteTemplatesFactory.ValidateFormSectionItemAnswers(formSectionItem)).toBe(true);
//         });

//         it('should return true if FormItemType equals 3 and not multiselect and formSectionItem.FormBankItem.Answer is null', function () {
//             var formSectionItem = {
//                 MultiSelectAllow: false,
//                 FormItemType: 3,
//                 IsRequired: true,
//                 FormBankItem: {
//                     Answer: null
//                 }
//             };
//             expect(noteTemplatesFactory.ValidateFormSectionItemAnswers(formSectionItem)).toBe(true);
//         });

//         it('should return true if FormItemType equals 8 and formSectionItem.FormBankItem.Answer is null', function () {
//             var formSectionItem = {
//                 FormItemType: 8,
//                 IsRequired: true,
//                 FormBankItem: { Answer: null }
//             };
//             expect(noteTemplatesFactory.ValidateFormSectionItemAnswers(formSectionItem)).toBe(true);
//         });

//         it('should return true if FormItemType equals 9 and formSectionItem.FormBankItem.Answer is null', function () {
//             var formSectionItem = {
//                 FormItemType: 9,
//                 IsRequired: true,
//                 FormBankItem: { Answer: null }
//             };
//             expect(noteTemplatesFactory.ValidateFormSectionItemAnswers(formSectionItem)).toBe(true);
//         });

//         it('should return true if FormItemType equals 10 and formSectionItem.$$activeTeeth is null', function () {
//             var formSectionItem = {
//                 FormItemType: 10,
//                 IsRequired: true, $$activeTeeth: []
//             };
//             expect(noteTemplatesFactory.ValidateFormSectionItemAnswers(formSectionItem)).toBe(true);
//         });

//         it('should return false if FormItemType equals 2 and formSectionItem.FormBankItem.Answer is not null', function () {
//             var formSectionItem = {
//                 IsRequired: true,
//                 FormItemType: 2,
//                 FormBankItem: {
//                     Answer: 'Answer'
//                 }
//             };
//             expect(noteTemplatesFactory.ValidateFormSectionItemAnswers(formSectionItem)).toBe(false);
//         });

//         it('should return false if FormItemType equals 3 and multiselect and formSectionItem.ItemOption.Answer is not null and IsRequired is true', function () {
//             var formSectionItem = {
//                 MultiSelectAllow: true,
//                 FormItemType: 2,
//                 IsRequired: true,
//                 FormBankItem: {
//                     Answer: 'Answer'
//                 },
//                 ItemOptions: [{ Answer: 'Answer' }, {
//                     Answer: 'Answer'
//                 }]
//             };
//             expect(noteTemplatesFactory.ValidateFormSectionItemAnswers(formSectionItem)).toBe(false);
//         });

//         it('should return false if FormItemType equals 3 and not multiselect and formSectionItem.FormBankItem.Answer is not null', function () {
//             var formSectionItem = {
//                 MultiSelectAllow: false,
//                 FormItemType: 3,
//                 IsRequired: true,
//                 FormBankItem: {
//                     Answer: 'Answer'
//                 }
//             };
//             expect(noteTemplatesFactory.ValidateFormSectionItemAnswers(formSectionItem)).toBe(false);
//         });

//         it('should return false if FormItemType equals 8 and formSectionItem.FormBankItem.Answer is not null', function () {
//             var formSectionItem = {
//                 FormItemType: 8,
//                 IsRequired: true,
//                 FormBankItem: { Answer: 'Answer' }
//             };
//             expect(noteTemplatesFactory.ValidateFormSectionItemAnswers(formSectionItem)).toBe(false);
//         });

//         it('should return false  if FormItemType equals 9 and formSectionItem.FormBankItem.Answer is not null', function () {
//             var formSectionItem = {
//                 FormItemType: 9,
//                 IsRequired: true,
//                 FormBankItem: { Answer: 'Answer' }
//             };
//             expect(noteTemplatesFactory.ValidateFormSectionItemAnswers(formSectionItem)).toBe(false);
//         });

//         it('should returnfalse if FormItemType equals 10 and formSectionItem.$$activeTeeth is not null', function () {
//             var formSectionItem = {
//                 FormItemType: 10,
//                 IsRequired: true,
//                 $$activeTeeth: ['2', '3']
//             };
//             expect(noteTemplatesFactory.ValidateFormSectionItemAnswers(formSectionItem)).toBe(false);
//         });
//     });
// });
// TODO : need to remove this later
// describe('ServiceCodesFactory ->', function () {
//     var serviceCodesFactory;

//     beforeEach(module('Soar.BusinessCenter'));

//     beforeEach(inject(function ($injector) {
//         serviceCodesFactory = $injector.get('ServiceCodesFactory');
//     }));

//     describe('CheckForAffectedAreaChanges function -> ', function () {
//         var serviceTransationList;
//         var codes;

//         beforeEach(function () {
//             serviceTransationList = [
//                 {
//                     Code: 'D0120',
//                     ObjectState: 'None',
//                     Roots: null,
//                     RootSummaryInfo: null,
//                     ServiceCodeId: 'cd73b992-896b-4ce5-ab7b-9e11a8cec306',
//                     Surface: null,
//                     SurfaceSummaryInfo: null,
//                     Tooth: ''
//                 },
//                 {
//                     Code: 'D0160',
//                     ObjectState: 'None',
//                     Roots: null,
//                     RootSummaryInfo: null,
//                     ServiceCodeId: 'f472f6b3-b3d3-483a-a2cf-20d0e191b74b',
//                     Surface: 'D,F,L',
//                     SurfaceSummaryInfo: 'DFL',
//                     Tooth: '7',
//                 },
//                 {
//                     Code: 'D0170',
//                     ObjectState: 'None',
//                     Roots: null,
//                     RootSummaryInfo: null,
//                     ServiceCodeId: '252449e6-eabb-486c-b232-377f24cc78ae',
//                     Surface: null,
//                     SurfaceSummaryInfo: null,
//                     Tooth: '20'
//                 },
//                 {
//                     Code: 'D1353',
//                     ObjectState: 'None',
//                     Roots: 'D,M',
//                     RootSummaryInfo: 'DM',
//                     ServiceCodeId: '7a281999-525f-456c-923a-99fab272e05c',
//                     Surface: null,
//                     SurfaceSummaryInfo: null,
//                     Tooth: '32'
//                 }
//             ];
//             codes = [
//                 {
//                     AffectedAreaId: 1,
//                     ServiceCodeId: 'cd73b992-896b-4ce5-ab7b-9e11a8cec306'
//                 },
//                 {
//                     AffectedAreaId: 4,
//                     ServiceCodeId: 'f472f6b3-b3d3-483a-a2cf-20d0e191b74b'
//                 },
//                 {
//                     AffectedAreaId: 5,
//                     ServiceCodeId: '252449e6-eabb-486c-b232-377f24cc78ae'
//                 },
//                 {
//                     AffectedAreaId: 3,
//                     ServiceCodeId: '7a281999-525f-456c-923a-99fab272e05c'
//                 }
//             ];
//         });

//         it('should return an empty list if nothing needs changed', function () {
//             expect(serviceCodesFactory.CheckForAffectedAreaChanges(serviceTransationList, codes)).toEqual([]);
//         });

//         it('should null-out all properties and not return code that has changed from surface to mouth', function () {
//             codes[1].AffectedAreaId = 1;
//             expect(serviceTransationList[1].Roots).toBe(null);
//             expect(serviceTransationList[1].RootSummaryInfo).toBe(null);
//             expect(serviceTransationList[1].Surface).toBe('D,F,L');
//             expect(serviceTransationList[1].SurfaceSummaryInfo).toBe('DFL');
//             expect(serviceTransationList[1].Tooth).toBe('7');
//             expect(serviceTransationList[1].ObjectState).toBe('None');
//             expect(serviceCodesFactory.CheckForAffectedAreaChanges(serviceTransationList, codes, true)).toEqual([]);
//             expect(serviceTransationList[1].Roots).toBe(null);
//             expect(serviceTransationList[1].RootSummaryInfo).toBe(null);
//             expect(serviceTransationList[1].Surface).toBe(null);
//             expect(serviceTransationList[1].SurfaceSummaryInfo).toBe(null);
//             expect(serviceTransationList[1].Tooth).toBe(null);
//             expect(serviceTransationList[1].ObjectState).toBe('Update');
//         });

//         it('should null-out all properties and not return code that has changed from tooth to mouth', function () {
//             codes[2].AffectedAreaId = 1;
//             expect(serviceTransationList[2].Roots).toBe(null);
//             expect(serviceTransationList[2].RootSummaryInfo).toBe(null);
//             expect(serviceTransationList[2].Surface).toBe(null);
//             expect(serviceTransationList[2].SurfaceSummaryInfo).toBe(null);
//             expect(serviceTransationList[2].Tooth).toBe('20');
//             expect(serviceTransationList[2].ObjectState).toBe('None');
//             expect(serviceCodesFactory.CheckForAffectedAreaChanges(serviceTransationList, codes)).toEqual([]);
//             expect(serviceTransationList[2].Roots).toBe(null);
//             expect(serviceTransationList[2].RootSummaryInfo).toBe(null);
//             expect(serviceTransationList[2].Surface).toBe(null);
//             expect(serviceTransationList[2].SurfaceSummaryInfo).toBe(null);
//             expect(serviceTransationList[2].Tooth).toBe(null);
//             expect(serviceTransationList[2].ObjectState).toBe('None');
//         });

//         it('should null-out all properties and not return code that has changed from root to mouth', function () {
//             codes[3].AffectedAreaId = 1;
//             expect(serviceTransationList[3].Roots).toBe('D,M');
//             expect(serviceTransationList[3].RootSummaryInfo).toBe('DM');
//             expect(serviceTransationList[3].Surface).toBe(null);
//             expect(serviceTransationList[3].SurfaceSummaryInfo).toBe(null);
//             expect(serviceTransationList[3].Tooth).toBe('32');
//             expect(serviceTransationList[3].ObjectState).toBe('None');
//             expect(serviceCodesFactory.CheckForAffectedAreaChanges(serviceTransationList, codes, true)).toEqual([]);
//             expect(serviceTransationList[3].Roots).toBe(null);
//             expect(serviceTransationList[3].RootSummaryInfo).toBe(null);
//             expect(serviceTransationList[3].Surface).toBe(null);
//             expect(serviceTransationList[3].SurfaceSummaryInfo).toBe(null);
//             expect(serviceTransationList[3].Tooth).toBe(null);
//             expect(serviceTransationList[3].ObjectState).toBe('Update');
//         });

//         it('should return code that has changed from mouth to root', function () {
//             codes[0].AffectedAreaId = 3;
//             expect(serviceCodesFactory.CheckForAffectedAreaChanges(serviceTransationList, codes)).toEqual(['D0120']);
//             expect(serviceTransationList[0].ObjectState).toBe('None');
//         });

//         it('should return code that has changed from surface to root', function () {
//             codes[1].AffectedAreaId = 3;
//             expect(serviceCodesFactory.CheckForAffectedAreaChanges(serviceTransationList, codes)).toEqual(['D0160']);
//             expect(serviceTransationList[1].ObjectState).toBe('None');
//         });

//         it('should return code that has changed from tooth to root', function () {
//             codes[2].AffectedAreaId = 3;
//             expect(serviceCodesFactory.CheckForAffectedAreaChanges(serviceTransationList, codes)).toEqual(['D0170']);
//             expect(serviceTransationList[2].ObjectState).toBe('None');
//         });

//         it('should return code that has changed from mouth to surface', function () {
//             codes[0].AffectedAreaId = 4;
//             expect(serviceCodesFactory.CheckForAffectedAreaChanges(serviceTransationList, codes)).toEqual(['D0120']);
//             expect(serviceTransationList[0].ObjectState).toBe('None');
//         });

//         it('should return code that has changed from tooth to surface', function () {
//             codes[2].AffectedAreaId = 4;
//             expect(serviceCodesFactory.CheckForAffectedAreaChanges(serviceTransationList, codes)).toEqual(['D0170']);
//             expect(serviceTransationList[2].ObjectState).toBe('None');
//         });

//         it('should return code that has changed from root to surface', function () {
//             codes[3].AffectedAreaId = 4;
//             expect(serviceCodesFactory.CheckForAffectedAreaChanges(serviceTransationList, codes)).toEqual(['D1353']);
//             expect(serviceTransationList[3].ObjectState).toBe('None');
//         });

//         it('should return code that has changed from mouth to tooth', function () {
//             codes[0].AffectedAreaId = 5;
//             expect(serviceCodesFactory.CheckForAffectedAreaChanges(serviceTransationList, codes)).toEqual(['D0120']);
//             expect(serviceTransationList[0].ObjectState).toBe('None');
//         });

//         it('should null-out Surface and not return code that has changed from surface to tooth', function () {
//             codes[1].AffectedAreaId = 5;
//             expect(serviceTransationList[1].Surface).toBe('D,F,L');
//             expect(serviceTransationList[1].SurfaceSummaryInfo).toBe('DFL');
//             expect(serviceTransationList[1].ObjectState).toBe('None');
//             expect(serviceCodesFactory.CheckForAffectedAreaChanges(serviceTransationList, codes, true)).toEqual([]);
//             expect(serviceTransationList[1].Surface).toBe(null);
//             expect(serviceTransationList[1].SurfaceSummaryInfo).toBe(null);
//             expect(serviceTransationList[1].ObjectState).toBe('Update');
//         });

//         it('should null-out Roots and not return code that has changed from root to tooth', function () {
//             codes[3].AffectedAreaId = 5;
//             expect(serviceTransationList[3].Roots).toBe('D,M');
//             expect(serviceTransationList[3].RootSummaryInfo).toBe('DM');
//             expect(serviceTransationList[3].ObjectState).toBe('None');
//             expect(serviceCodesFactory.CheckForAffectedAreaChanges(serviceTransationList, codes, false)).toEqual([]);
//             expect(serviceTransationList[3].Roots).toBe(null);
//             expect(serviceTransationList[3].RootSummaryInfo).toBe(null);
//             expect(serviceTransationList[3].ObjectState).toBe('None');
//         });
//     });

//     describe('SetFeesForLocations function ->', function () {
//         beforeEach(function () {
//             serviceCodesFactory.SetFeesByLocation = jasmine.createSpy();
//         });

//         it('should not call SetFeesByLocation if parameters are empty', function () {
//             var serviceCode = {};
//             serviceCodesFactory.SetFeesForLocations(serviceCode, null);
//             serviceCodesFactory.SetFeesForLocations(serviceCode);
//             serviceCodesFactory.SetFeesForLocations(serviceCode, {});
//             serviceCodesFactory.SetFeesForLocations(undefined, []);
//             expect(serviceCodesFactory.SetFeesByLocation).not.toHaveBeenCalled();
//         });

//         it('should call SetFeesByLocation for each location', function () {
//             var serviceCode = {};
//             var locationIds = [5, 6, 7];
//             serviceCodesFactory.SetFeesForLocations(serviceCode, locationIds);
//             expect(serviceCodesFactory.SetFeesByLocation).toHaveBeenCalledTimes(locationIds.length);
//             expect(serviceCodesFactory.SetFeesByLocation).toHaveBeenCalledWith([serviceCode], locationIds[0]);
//             expect(serviceCodesFactory.SetFeesByLocation).toHaveBeenCalledWith([serviceCode], locationIds[1]);
//             expect(serviceCodesFactory.SetFeesByLocation).toHaveBeenCalledWith([serviceCode], locationIds[2]);
//         });
//     });
// });

describe('UsersFactory ->', function () {
  var usersFactory;

  beforeEach(module('Soar.BusinessCenter'));
  beforeEach(module('Soar.Common'));

  beforeEach(inject(function ($injector) {
    usersFactory = $injector.get('UsersFactory');
  }));

  describe('PreferredProviderByLocation method-> ', function () {
    var userId,
      patientInfo = {},
      usuallyPerformedByProviderTypeId;
    var providers = [];

    beforeEach(function () {
      userId = '1234';
      patientInfo = { PreferredDentist: '', PreferredHygienist: '' };
      usuallyPerformedByProviderTypeId = 1;
      providers = [
        { UserId: 1, ProviderTypeId: 1 },
        { UserId: 2, ProviderTypeId: 2 },
        { UserId: 3, ProviderTypeId: 4 },
      ];
    });

    it('should return patient.PreferredDentist if patient has one and usuallyPerformedByProviderTypeId is 1 and PreferredDentist is in list ', function () {
      patientInfo.PreferredDentist = providers[0].UserId;
      usuallyPerformedByProviderTypeId = 1;
      expect(
        usersFactory.PreferredProviderByLocation(
          userId,
          patientInfo,
          usuallyPerformedByProviderTypeId,
          providers
        )
      ).toEqual(providers[0].UserId);
    });

    it('should return PreferredHygienist if patient has one and usuallyPerformedByProviderTypeId is 2 and PreferredHygienist is in list', function () {
      patientInfo.PreferredHygienist = providers[1].UserId;
      usuallyPerformedByProviderTypeId = 2;
      expect(
        usersFactory.PreferredProviderByLocation(
          userId,
          patientInfo,
          usuallyPerformedByProviderTypeId,
          providers
        )
      ).toEqual(providers[1].UserId);
    });

    it('should return null if patient does not have PreferredDentist and usuallyPerformedByProviderTypeId is 1 ', function () {
      patientInfo.PreferredDentist = null;
      usuallyPerformedByProviderTypeId = 1;
      expect(
        usersFactory.PreferredProviderByLocation(
          userId,
          patientInfo,
          usuallyPerformedByProviderTypeId,
          providers
        )
      ).toEqual(null);
    });

    it('should return null if patient does not have PreferredHygenist and usuallyPerformedByProviderTypeId is 2 ', function () {
      usuallyPerformedByProviderTypeId = 2;
      patientInfo.PreferredHygienist = null;
      expect(
        usersFactory.PreferredProviderByLocation(
          userId,
          patientInfo,
          usuallyPerformedByProviderTypeId,
          providers
        )
      ).toEqual(null);
    });

    it('should return null if usuallyPerformedByProviderTypeId is null ', function () {
      usuallyPerformedByProviderTypeId = null;
      expect(
        usersFactory.PreferredProviderByLocation(
          userId,
          patientInfo,
          usuallyPerformedByProviderTypeId,
          providers
        )
      ).toEqual(null);
    });
  });
});
