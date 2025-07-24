import { TestBed } from '@angular/core/testing';
import { NoteTemplatesHttpService } from './note-templates-http.service';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { AuthAccess } from '../models/auth-access.model';
import { Categories, CategoriesWithTemplate, CustomFormTemplate, FormBankItem, FormSection, FormSectionItem, FormTypes, NoteTemplatesViewModel, Template } from 'src/business-center/practice-settings/chart/note-templates/note-templates';
import cloneDeep from 'lodash/cloneDeep';
import concat from 'lodash/concat';
import { SoarResponse } from 'src/@core/models/core/soar-response';

const mockSoarConfig = {
  domainUrl: 'https://localhost:35440',
};

const mockPatSecurityService = {
  IsAuthorizedByAbbreviation: jasmine.createSpy('patSecurityService.IsAuthorizedByAbbreviation').and.returnValue(true)
};

const mockLocalizeService = {
  getLocalizedString: () => 'translated text'
};

const mockStaticData = {
  TeethDefinitions: () => {
    return {
      then: (res) => { res({ Value: { Teeth: [{ USNumber: "1" }, { USNumber: "2" }] } }) }
    };
  }
};

const mockTemplate: Template = {
  TemplateId: "340a0b22-1ea4-4d12-a1f9-dd0a5ab01c11",
  TemplateName: "TestTemplate",
  CategoryId: "1",
  TemplateBodyFormId: "884684cd-8ce6-4e65-832a-fbe35b38305b"
}

const mockCustomFormTemplate: CustomFormTemplate = {
  FormId: "011dd431-61be-44f8-a3e3-9c9a596dbcb6",
  FormName: "17072023-Note Template_744313_CNT",
  VersionNumber: 1,
  SourceFormId: null,
  FormTypeId: 2,
  Description: "",
  IsActive: true,
  IsVisible: true,
  IsPublished: false,
  IsDefault: false,
  FormSections: [
    {
      FormId: "011dd431-61be-44f8-a3e3-9c9a596dbcb6",
      FormSectionId: "fc0e1c55-a78d-4463-b3e9-6467774f01b8",
      Title: "17072023-Note Title",
      ShowTitle: true,
      ShowBorder: true,
      IsVisible: true,
      SequenceNumber: 1,
      FormSectionItems: [
        {
          FormSectionId: "fc0e1c55-a78d-4463-b3e9-6467774f01b8",
          SectionItemId: "96976927-d89e-4705-b31d-9daf970c540d",
          FormItemType: 3,
          BankItemId: "1789dc82-9273-4476-a9ce-44740ce61a7f",
          FormBankItem: {
            BankItemId: "1789dc82-9273-4476-a9ce-44740ce61a7f",
            SectionItemId: "00000000-0000-0000-0000-000000000000",
            ItemText: "QT 1",
            ItemSequenceNumber: 0,
            Description: "QT 1",
            CommonlyUsed: false,
            UseDefaultValue: false,
            DefaultValue: "",
            Answer: null,
            DataTag: "AAAAAAArSb4=",
            UserModified: "a162c864-8f50-4e84-8942-7194bc8070cf",
            DateModified: "2023-07-17T09:44:52.4146262"
          },
          FormBankItemPromptTexts: [],
          IsRequired: false,
          MultiSelectAllow: false,
          IsVisible: true,
          SequenceNumber: 1,
          BankItemDemographicId: null,
          FormBankItemDemographic: null,
          FormBankItemEmergencyContact: null,
          FormItemTextField: null,
          ItemOptions: [
            {
              SectionItemId: "96976927-d89e-4705-b31d-9daf970c540d",
              SectionItemOptionId: "edf6a1f0-c6cf-4ffb-8475-f18d4fdf63ff",
              BankItemId: "1789dc82-9273-4476-a9ce-44740ce61a7f",
              BankItemOptionId: "9d1c78df-9797-4a68-b798-1ac5d643e3d6",
              IsSelected: true,
              IsVisible: true,
              SequenceNumber: 1,
              BankItemOption: {
                BankItemId: "1789dc82-9273-4476-a9ce-44740ce61a7f",
                BankItemOptionId: "9d1c78df-9797-4a68-b798-1ac5d643e3d6",
                OptionIndex: 0,
                OptionText: "Option 1",
                OptionValue: "Option 1",
                DataTag: "AAAAAAArSco=",
                UserModified: "a162c864-8f50-4e84-8942-7194bc8070cf",
                DateModified: "2023-07-17T09:44:52.4146262"
              },
              DataTag: "AAAAAAArSeA=",
              UserModified: "a162c864-8f50-4e84-8942-7194bc8070cf",
              DateModified: "2023-07-17T09:44:52.4146262"
            },
            {
              SectionItemId: "96976927-d89e-4705-b31d-9daf970c540d",
              SectionItemOptionId: "1a11d0fd-d915-458a-974f-f1afd935000d",
              BankItemId: "1789dc82-9273-4476-a9ce-44740ce61a7f",
              BankItemOptionId: "a18ef4d6-ad04-413e-9c30-f061eb2def9d",
              IsSelected: true,
              IsVisible: true,
              SequenceNumber: 2,
              BankItemOption: {
                BankItemId: "1789dc82-9273-4476-a9ce-44740ce61a7f",
                BankItemOptionId: "a18ef4d6-ad04-413e-9c30-f061eb2def9d",
                OptionIndex: 1,
                OptionText: "Option 2",
                OptionValue: "Option 2",
                DataTag: "AAAAAAArScw=",
                UserModified: "a162c864-8f50-4e84-8942-7194bc8070cf",
                DateModified: "2023-07-17T09:44:52.4146262"
              },
              DataTag: "AAAAAAArSdk=",
              UserModified: "a162c864-8f50-4e84-8942-7194bc8070cf",
              DateModified: "2023-07-17T09:44:52.4146262"
            },
            {
              SectionItemId: "96976927-d89e-4705-b31d-9daf970c540d",
              SectionItemOptionId: "521a3836-11dd-4fe6-805a-b61cde6ad89b",
              BankItemId: "1789dc82-9273-4476-a9ce-44740ce61a7f",
              BankItemOptionId: "208f7a5f-511f-4285-845a-666bd0e07148",
              IsSelected: true,
              IsVisible: true,
              SequenceNumber: 3,
              BankItemOption: {
                BankItemId: "1789dc82-9273-4476-a9ce-44740ce61a7f",
                BankItemOptionId: "208f7a5f-511f-4285-845a-666bd0e07148",
                OptionIndex: 2,
                OptionText: "Option 3",
                OptionValue: "Option 3",
                DataTag: "AAAAAAArScg=",
                UserModified: "a162c864-8f50-4e84-8942-7194bc8070cf",
                DateModified: "2023-07-17T09:44:52.4146262"
              },
              DataTag: "AAAAAAArSdw=",
              UserModified: "a162c864-8f50-4e84-8942-7194bc8070cf",
              DateModified: "2023-07-17T09:44:52.4146262"
            }
          ],
          ItemPromptTextsOptions: [],
          DataTag: "AAAAAAArSdQ=",
          UserModified: "a162c864-8f50-4e84-8942-7194bc8070cf",
          DateModified: "2023-07-17T09:44:52.4146262"
        },
        {
          FormSectionId: "fc0e1c55-a78d-4463-b3e9-6467774f01b8",
          SectionItemId: "6e5ca757-e9fb-45c3-93eb-5061557d7bb3",
          FormItemType: 3,
          BankItemId: "96f100e6-e664-467e-9f8a-659bdc2abcf9",
          FormBankItem: {
            BankItemId: "96f100e6-e664-467e-9f8a-659bdc2abcf9",
            SectionItemId: "00000000-0000-0000-0000-000000000000",
            ItemText: "QT 2",
            ItemSequenceNumber: 0,
            Description: "QT 2",
            CommonlyUsed: false,
            UseDefaultValue: false,
            DefaultValue: "",
            Answer: null,
            DataTag: "AAAAAAArScE=",
            UserModified: "a162c864-8f50-4e84-8942-7194bc8070cf",
            DateModified: "2023-07-17T09:44:52.4146262"
          },
          FormBankItemPromptTexts: [],
          IsRequired: true,
          MultiSelectAllow: true,
          IsVisible: true,
          SequenceNumber: 2,
          BankItemDemographicId: null,
          FormBankItemDemographic: null,
          FormBankItemEmergencyContact: null,
          FormItemTextField: null,
          ItemOptions: [
            {
              SectionItemId: "6e5ca757-e9fb-45c3-93eb-5061557d7bb3",
              SectionItemOptionId: "131f0d9b-2485-44e0-8b21-28e57209dba5",
              BankItemId: "96f100e6-e664-467e-9f8a-659bdc2abcf9",
              BankItemOptionId: "0c2e6465-e925-4450-8da7-ada7d9097158",
              IsSelected: true,
              IsVisible: true,
              SequenceNumber: 1,
              BankItemOption: {
                BankItemId: "96f100e6-e664-467e-9f8a-659bdc2abcf9",
                BankItemOptionId: "0c2e6465-e925-4450-8da7-ada7d9097158",
                OptionIndex: 0,
                OptionText: "Option 1",
                OptionValue: "Option 1",
                DataTag: "AAAAAAArScc=",
                UserModified: "a162c864-8f50-4e84-8942-7194bc8070cf",
                DateModified: "2023-07-17T09:44:52.4146262"
              },
              DataTag: "AAAAAAArSdg=",
              UserModified: "a162c864-8f50-4e84-8942-7194bc8070cf",
              DateModified: "2023-07-17T09:44:52.4146262"
            }
          ],
          ItemPromptTextsOptions: [],
          DataTag: "AAAAAAArSdI=",
          UserModified: "a162c864-8f50-4e84-8942-7194bc8070cf",
          DateModified: "2023-07-17T09:44:52.4146262"
        },
        {
          FormSectionId: "fc0e1c55-a78d-4463-b3e9-6467774f01b8",
          SectionItemId: "6fba6809-0f93-470f-9704-afa22eac3519",
          FormItemType: 2,
          BankItemId: "bec74c39-64a0-4da4-b245-f9a2bb09b5a9",
          FormBankItem: {
            BankItemId: "bec74c39-64a0-4da4-b245-f9a2bb09b5a9",
            SectionItemId: "00000000-0000-0000-0000-000000000000",
            ItemText: "QT",
            ItemSequenceNumber: 0,
            Description: "QT",
            CommonlyUsed: false,
            UseDefaultValue: false,
            DefaultValue: "",
            Answer: null,
            DataTag: "AAAAAAArScM=",
            UserModified: "a162c864-8f50-4e84-8942-7194bc8070cf",
            DateModified: "2023-07-17T09:44:52.4146262"
          },
          FormBankItemPromptTexts: [],
          IsRequired: false,
          MultiSelectAllow: false,
          IsVisible: true,
          SequenceNumber: 3,
          BankItemDemographicId: null,
          FormBankItemDemographic: null,
          FormBankItemEmergencyContact: null,
          FormItemTextField: null,
          ItemOptions: [],
          ItemPromptTextsOptions: [],
          DataTag: "AAAAAAArSdM=",
          UserModified: "a162c864-8f50-4e84-8942-7194bc8070cf",
          DateModified: "2023-07-17T09:44:52.4146262"
        },
        {
          FormSectionId: "fc0e1c55-a78d-4463-b3e9-6467774f01b8",
          SectionItemId: "fd150389-ec4d-43f9-a287-a5cc0161e17c",
          FormItemType: 9,
          BankItemId: null,
          FormBankItem: null,
          FormBankItemPromptTexts: [
            {
              BankItemId: "9537f8fc-8a13-4340-9e41-33de45bac15c",
              SectionItemId: "fd150389-ec4d-43f9-a287-a5cc0161e17c",
              ItemText: "Text After Response 2",
              ItemSequenceNumber: 2,
              Description: "Text After Response 2",
              CommonlyUsed: false,
              UseDefaultValue: false,
              DefaultValue: "",
              Answer: null,
              DataTag: "AAAAAAArScA=",
              UserModified: "a162c864-8f50-4e84-8942-7194bc8070cf",
              DateModified: "2023-07-17T09:44:52.4146262"
            },
            {
              BankItemId: "d5623908-b9a3-48ca-8bd2-c7dee2fc3bf8",
              SectionItemId: "fd150389-ec4d-43f9-a287-a5cc0161e17c",
              ItemText: "Text Before Response 1",
              ItemSequenceNumber: 1,
              Description: "Text Before Response 1",
              CommonlyUsed: false,
              UseDefaultValue: false,
              DefaultValue: "",
              Answer: null,
              DataTag: "AAAAAAArScQ=",
              UserModified: "a162c864-8f50-4e84-8942-7194bc8070cf",
              DateModified: "2023-07-17T09:44:52.4146262"
            }
          ],
          IsRequired: false,
          MultiSelectAllow: false,
          IsVisible: true,
          SequenceNumber: 4,
          BankItemDemographicId: null,
          FormBankItemDemographic: null,
          FormBankItemEmergencyContact: null,
          FormItemTextField: null,
          ItemOptions: [],
          ItemPromptTextsOptions: [
            [
              {
                SectionItemId: "fd150389-ec4d-43f9-a287-a5cc0161e17c",
                SectionItemOptionId: "2a87834a-05b9-4e8c-938b-e23086f58397",
                BankItemId: "d5623908-b9a3-48ca-8bd2-c7dee2fc3bf8",
                BankItemOptionId: "5c668495-93af-4529-a410-70bfc1f29381",
                IsSelected: true,
                IsVisible: true,
                SequenceNumber: 1,
                BankItemOption: {
                  BankItemId: "d5623908-b9a3-48ca-8bd2-c7dee2fc3bf8",
                  BankItemOptionId: "5c668495-93af-4529-a410-70bfc1f29381",
                  OptionIndex: 1,
                  OptionText: "Responses 1",
                  OptionValue: "",
                  DataTag: "AAAAAAArSck=",
                  UserModified: "a162c864-8f50-4e84-8942-7194bc8070cf",
                  DateModified: "2023-07-17T09:44:52.4146262"
                },
                DataTag: "AAAAAAArSds=",
                UserModified: "a162c864-8f50-4e84-8942-7194bc8070cf",
                DateModified: "2023-07-17T09:44:52.4146262"
              },
              {
                SectionItemId: "fd150389-ec4d-43f9-a287-a5cc0161e17c",
                SectionItemOptionId: "dac69fa4-04a4-4ade-8e3a-5196f5e922fc",
                BankItemId: "d5623908-b9a3-48ca-8bd2-c7dee2fc3bf8",
                BankItemOptionId: "f9cc7c70-34c6-484b-8f76-46f6df7caedb",
                IsSelected: true,
                IsVisible: true,
                SequenceNumber: 1,
                BankItemOption: {
                  BankItemId: "d5623908-b9a3-48ca-8bd2-c7dee2fc3bf8",
                  BankItemOptionId: "f9cc7c70-34c6-484b-8f76-46f6df7caedb",
                  OptionIndex: 2,
                  OptionText: "Responses 2",
                  OptionValue: "",
                  DataTag: "AAAAAAArSc4=",
                  UserModified: "a162c864-8f50-4e84-8942-7194bc8070cf",
                  DateModified: "2023-07-17T09:44:52.4146262"
                },
                DataTag: "AAAAAAArSd8=",
                UserModified: "a162c864-8f50-4e84-8942-7194bc8070cf",
                DateModified: "2023-07-17T09:44:52.4146262"
              },
              {
                SectionItemId: "fd150389-ec4d-43f9-a287-a5cc0161e17c",
                SectionItemOptionId: "78d46dc9-8802-4092-9132-6c2b6fd0cc78",
                BankItemId: "d5623908-b9a3-48ca-8bd2-c7dee2fc3bf8",
                BankItemOptionId: "9f1dc74b-20fb-4d44-a8f4-367233b7d2c6",
                IsSelected: true,
                IsVisible: true,
                SequenceNumber: 1,
                BankItemOption: {
                  BankItemId: "d5623908-b9a3-48ca-8bd2-c7dee2fc3bf8",
                  BankItemOptionId: "9f1dc74b-20fb-4d44-a8f4-367233b7d2c6",
                  OptionIndex: 3,
                  OptionText: "Responses 3",
                  OptionValue: "",
                  DataTag: "AAAAAAArScs=",
                  UserModified: "a162c864-8f50-4e84-8942-7194bc8070cf",
                  DateModified: "2023-07-17T09:44:52.4146262"
                },
                DataTag: "AAAAAAArSd4=",
                UserModified: "a162c864-8f50-4e84-8942-7194bc8070cf",
                DateModified: "2023-07-17T09:44:52.4146262"
              }
            ]
          ],
          DataTag: "AAAAAAArSdc=",
          UserModified: "a162c864-8f50-4e84-8942-7194bc8070cf",
          DateModified: "2023-07-17T09:44:52.4146262"
        },
        {
          FormSectionId: "fc0e1c55-a78d-4463-b3e9-6467774f01b8",
          SectionItemId: "016e9a08-d3c7-43ad-b9df-2ddf4401b4aa",
          FormItemType: 9,
          BankItemId: null,
          FormBankItem: null,
          FormBankItemPromptTexts: [
            {
              BankItemId: "fb68dea5-ff13-4b34-a7f0-cc72ef8ab6bd",
              SectionItemId: "016e9a08-d3c7-43ad-b9df-2ddf4401b4aa",
              ItemText: "Text After Response 4",
              ItemSequenceNumber: 2,
              Description: "Text After Response 4",
              CommonlyUsed: false,
              UseDefaultValue: false,
              DefaultValue: "",
              Answer: null,
              DataTag: "AAAAAAArScU=",
              UserModified: "a162c864-8f50-4e84-8942-7194bc8070cf",
              DateModified: "2023-07-17T09:44:52.4146262"
            },
            {
              BankItemId: "b896305b-5866-4525-b91e-e37c08dfdfc9",
              SectionItemId: "016e9a08-d3c7-43ad-b9df-2ddf4401b4aa",
              ItemText: "Text Before Response 3",
              ItemSequenceNumber: 1,
              Description: "Text Before Response 3",
              CommonlyUsed: false,
              UseDefaultValue: false,
              DefaultValue: "",
              Answer: null,
              DataTag: "AAAAAAArScI=",
              UserModified: "a162c864-8f50-4e84-8942-7194bc8070cf",
              DateModified: "2023-07-17T09:44:52.4146262"
            }
          ],
          IsRequired: false,
          MultiSelectAllow: false,
          IsVisible: true,
          SequenceNumber: 5,
          BankItemDemographicId: null,
          FormBankItemDemographic: null,
          FormBankItemEmergencyContact: null,
          FormItemTextField: null,
          ItemOptions: [],
          ItemPromptTextsOptions: [
            [
              {
                SectionItemId: "016e9a08-d3c7-43ad-b9df-2ddf4401b4aa",
                SectionItemOptionId: "1effb0ac-70aa-4ec8-8712-126e2c8f24b6",
                BankItemId: "b896305b-5866-4525-b91e-e37c08dfdfc9",
                BankItemOptionId: "ac937fda-331b-4c91-acaf-b27ecfe48c3f",
                IsSelected: true,
                IsVisible: true,
                SequenceNumber: 1,
                BankItemOption: {
                  BankItemId: "b896305b-5866-4525-b91e-e37c08dfdfc9",
                  BankItemOptionId: "ac937fda-331b-4c91-acaf-b27ecfe48c3f",
                  OptionIndex: 1,
                  OptionText: "Responses 1",
                  OptionValue: "",
                  DataTag: "AAAAAAArSc0=",
                  UserModified: "a162c864-8f50-4e84-8942-7194bc8070cf",
                  DateModified: "2023-07-17T09:44:52.4146262"
                },
                DataTag: "AAAAAAArSdo=",
                UserModified: "a162c864-8f50-4e84-8942-7194bc8070cf",
                DateModified: "2023-07-17T09:44:52.4146262"
              },
              {
                SectionItemId: "016e9a08-d3c7-43ad-b9df-2ddf4401b4aa",
                SectionItemOptionId: "5aa2a2b2-b7f4-451c-9658-f1145af7ee42",
                BankItemId: "b896305b-5866-4525-b91e-e37c08dfdfc9",
                BankItemOptionId: "0a38704f-d78d-45c1-817b-eb9d973a9a38",
                IsSelected: true,
                IsVisible: true,
                SequenceNumber: 1,
                BankItemOption: {
                  BankItemId: "b896305b-5866-4525-b91e-e37c08dfdfc9",
                  BankItemOptionId: "0a38704f-d78d-45c1-817b-eb9d973a9a38",
                  OptionIndex: 3,
                  OptionText: "Responses 3",
                  OptionValue: "",
                  DataTag: "AAAAAAArScY=",
                  UserModified: "a162c864-8f50-4e84-8942-7194bc8070cf",
                  DateModified: "2023-07-17T09:44:52.4146262"
                },
                DataTag: "AAAAAAArSd0=",
                UserModified: "a162c864-8f50-4e84-8942-7194bc8070cf",
                DateModified: "2023-07-17T09:44:52.4146262"
              }
            ]
          ],
          DataTag: "AAAAAAArSdE=",
          UserModified: "a162c864-8f50-4e84-8942-7194bc8070cf",
          DateModified: "2023-07-17T09:44:52.4146262"
        },
        {
          FormSectionId: "fc0e1c55-a78d-4463-b3e9-6467774f01b8",
          SectionItemId: "e22e0301-4db3-4f4b-8359-ad01c505f603",
          FormItemType: 10,
          BankItemId: "93410ee0-0217-4442-ad57-25523e9c8064",
          FormBankItem: {
            BankItemId: "93410ee0-0217-4442-ad57-25523e9c8064",
            SectionItemId: "00000000-0000-0000-0000-000000000000",
            ItemText: "Link Tooth",
            ItemSequenceNumber: 0,
            Description: "Link Tooth",
            CommonlyUsed: false,
            UseDefaultValue: false,
            DefaultValue: "",
            Answer: null,
            DataTag: "AAAAAAArSb8=",
            UserModified: "a162c864-8f50-4e84-8942-7194bc8070cf",
            DateModified: "2023-07-17T09:44:52.4146262"
          },
          FormBankItemPromptTexts: [],
          IsRequired: false,
          MultiSelectAllow: false,
          IsVisible: true,
          SequenceNumber: 6,
          BankItemDemographicId: null,
          FormBankItemDemographic: null,
          FormBankItemEmergencyContact: null,
          FormItemTextField: {
            NoteText: "NoteText"
          },
          ItemOptions: [],
          ItemPromptTextsOptions: [],
          DataTag: "AAAAAAArSdY=",
          UserModified: "a162c864-8f50-4e84-8942-7194bc8070cf",
          DateModified: "2023-07-17T09:44:52.4146262",
          $$TeethSelectOptions: []
        },
        {
          FormSectionId: "fc0e1c55-a78d-4463-b3e9-6467774f01b8",
          SectionItemId: "9ae3e9ac-beff-4c82-838a-5b812568afea",
          FormItemType: 11,
          BankItemId: null,
          FormBankItem: null,
          FormBankItemPromptTexts: [],
          IsRequired: false,
          MultiSelectAllow: false,
          IsVisible: true,
          SequenceNumber: 7,
          BankItemDemographicId: null,
          FormBankItemDemographic: null,
          FormBankItemEmergencyContact: null,
          FormItemTextField: {
            ItemTextFieldId: "02e44f8a-de3d-46a9-a243-0b4e69be86d9",
            NoteText: "Not Text",
            IsRequiredNoteText: true,
            DataTag: "AAAAAAArSc8=",
            UserModified: "a162c864-8f50-4e84-8942-7194bc8070cf",
            DateModified: "2023-07-17T09:44:52.4146262"
          },
          ItemOptions: [],
          ItemPromptTextsOptions: [],
          DataTag: "AAAAAAArSdU=",
          UserModified: "a162c864-8f50-4e84-8942-7194bc8070cf",
          DateModified: "2023-07-17T09:44:52.4146262"
        }
      ],
      DataTag: "AAAAAAArSdA=",
      UserModified: "a162c864-8f50-4e84-8942-7194bc8070cf",
      DateModified: "2023-07-17T09:44:52.4146262"
    }
  ],
  TemplateMode: 0,
  FileAllocationId: null,
  DataTag: "AAAAAAArSbw=",
  UserModified: "a162c864-8f50-4e84-8942-7194bc8070cf",
  DateModified: "2023-07-17T09:44:52.4146262"
}

const mockNoteTemplate: NoteTemplatesViewModel = {
  Template: mockTemplate,
  TemplateBodyCustomForm: mockCustomFormTemplate
}

const mockNoteCategories: Categories[] = [{
  CategoryId: "1",
  CategoryName: "BCategoryOne",
  DataTag: "AAAAAAArSbw=",
  UserModified: "a162c864-8f50-4e84-8942-7194bc8070cf",
  DateModified: "2023-07-17T09:44:52.4146262"
}, {
  CategoryId: "2",
  CategoryName: "ACategoryTwo",
  DataTag: "AAAAAAArSbw=",
  UserModified: "a162c864-8f50-4e84-8942-7194bc8070cf",
  DateModified: "2023-07-17T09:44:52.4146262"
},{
  CategoryId: "3",
  CategoryName: "11_CategoryTwo",
  DataTag: "AAAAAAArSbw=",
  UserModified: "a162c864-8f50-4e84-8942-7194bc8070cf",
  DateModified: "2023-07-17T09:44:52.4146262"
},
{
  CategoryId: "4",
  CategoryName: "01_CategoryTwo",
  DataTag: "AAAAAAArSbw=",
  UserModified: "a162c864-8f50-4e84-8942-7194bc8070cf",
  DateModified: "2023-07-17T09:44:52.4146262"
},
{
  CategoryId: "5",
  CategoryName: "2_CategoryTwo",
  DataTag: "AAAAAAArSbw=",
  UserModified: "a162c864-8f50-4e84-8942-7194bc8070cf",
  DateModified: "2023-07-17T09:44:52.4146262"
}]

const mockNoteCategoriesWithTemplate: CategoriesWithTemplate[] = [{
  Templates: [
    {
      TemplateId: "dfa95e37-dac3-4571-89f2-7329fecb268c",
      TemplateName: "Cat1Template1",
      CategoryId: "461d047a-04c0-4d14-b1c9-09670e96d53f",
      TemplateBodyFormId: "79834280-0630-4773-aebc-bed5e57b64c7"
    },
    {
      TemplateId: "995e62bf-1ea0-43b9-bd9f-b9c5faa20792",
      TemplateName: "Cat1Template2",
      CategoryId: "461d047a-04c0-4d14-b1c9-09670e96d53f",
      TemplateBodyFormId: "dfd9bd4d-4c65-485d-a5a2-7786ab18a8f9"
    }
  ],
  CategoryId: "461d047a-04c0-4d14-b1c9-09670e96d53f",
  CategoryName: "Category1",
  DataTag: "AAAAAAAiXRY=",
  UserModified: "a162c864-8f50-4e84-8942-7194bc8070cf",
  DateModified: "2023-03-14T10:05:23.7153006"
}, {
  Templates: [
    {
      TemplateId: "dfa95e37-dac3-4571-89f2-7329fecb268c",
      TemplateName: "Cat2Template1",
      CategoryId: "461d047a-04c0-4d14-b1c9-09670e96d53f",
      TemplateBodyFormId: "79834280-0630-4773-aebc-bed5e57b64c7"
    },
    {
      TemplateId: "995e62bf-1ea0-43b9-bd9f-b9c5faa20792",
      TemplateName: "Cat2Template2",
      CategoryId: "461d047a-04c0-4d14-b1c9-09670e96d53f",
      TemplateBodyFormId: "dfd9bd4d-4c65-485d-a5a2-7786ab18a8f9"
    }
  ],
  CategoryId: "461d047a-04c0-4d14-b1c9-09670e96d53f",
  CategoryName: "Category2",
  DataTag: "AAAAAAAiXRY=",
  UserModified: "a162c864-8f50-4e84-8942-7194bc8070cf",
  DateModified: "2023-03-14T10:05:23.7153006"
}]
let url = "";
describe('NoteTemplatesHttpService', () => {
  let service: NoteTemplatesHttpService;
  let httpTestingController: HttpTestingController;
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      declarations: [],
      providers: [
        { provide: 'localize', useValue: mockLocalizeService },
        { provide: 'patSecurityService', useValue: mockPatSecurityService },
        { provide: 'SoarConfig', useValue: mockSoarConfig },
        { provide: 'StaticData', useValue: mockStaticData }
      ]
    })

    service = TestBed.inject(NoteTemplatesHttpService);
    httpTestingController = TestBed.inject(HttpTestingController);
  });

  beforeEach(() => {
    service = TestBed.inject(NoteTemplatesHttpService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('authCreateAccess', () => {
    it('should return false it dont have create access', () => {
      mockPatSecurityService.IsAuthorizedByAbbreviation = jasmine.createSpy('patSecurityService.IsAuthorizedByAbbreviation').and.returnValue(false);
      const result = service.authCreateAccess();
      expect(result).toBe(false);
      expect(service.hasAuthCreateAccess).toBe(false);
    })

    it('should return true it has create access', () => {
      mockPatSecurityService.IsAuthorizedByAbbreviation = jasmine.createSpy('patSecurityService.IsAuthorizedByAbbreviation').and.returnValue(true);
      const result = service.authCreateAccess();
      expect(result).toBe(true);
      expect(service.hasAuthCreateAccess).toBe(true);
    })
  })

  describe('authDeleteAccess', () => {
    it('should return false it dont have delete access', () => {
      mockPatSecurityService.IsAuthorizedByAbbreviation = jasmine.createSpy('patSecurityService.IsAuthorizedByAbbreviation').and.returnValue(false);
      const result = service.authDeleteAccess();
      expect(result).toBe(false);
      expect(service.hasAuthDeleteAccess).toBe(false);
    })

    it('should return true it has delete access', () => {
      mockPatSecurityService.IsAuthorizedByAbbreviation = jasmine.createSpy('patSecurityService.IsAuthorizedByAbbreviation').and.returnValue(true);
      const result = service.authDeleteAccess();
      expect(result).toBe(true);
      expect(service.hasAuthDeleteAccess).toBe(true);
    })
  })

  describe('authEditAccess', () => {
    it('should return false it dont have edit access', () => {
      mockPatSecurityService.IsAuthorizedByAbbreviation = jasmine.createSpy('patSecurityService.IsAuthorizedByAbbreviation').and.returnValue(false);
      const result = service.authEditAccess();
      expect(result).toBe(false);
      expect(service.hasAuthEditAccess).toBe(false);
    })

    it('should return true it has edit access', () => {
      mockPatSecurityService.IsAuthorizedByAbbreviation = jasmine.createSpy('patSecurityService.IsAuthorizedByAbbreviation').and.returnValue(true);
      const result = service.authEditAccess();
      expect(result).toBe(true);
      expect(service.hasAuthEditAccess).toBe(true);
    })
  })

  describe('authViewAccess', () => {
    it('should return false if it dont have view access', () => {
      mockPatSecurityService.IsAuthorizedByAbbreviation = jasmine.createSpy('patSecurityService.IsAuthorizedByAbbreviation').and.returnValue(false);
      const result = service.authViewAccess();
      expect(result).toBe(false);
      expect(service.hasAuthViewAccess).toBe(false);
    })

    it('should return true if it has view access', () => {
      mockPatSecurityService.IsAuthorizedByAbbreviation = jasmine.createSpy('patSecurityService.IsAuthorizedByAbbreviation').and.returnValue(true);
      const result = service.authViewAccess();
      expect(result).toBe(true);
      expect(service.hasAuthViewAccess).toBe(true);
    })
  })

  describe('access', () => {
    it('should return authAccess object with all access as false when there is no view access', () => {
      mockPatSecurityService.IsAuthorizedByAbbreviation = jasmine.createSpy('patSecurityService.IsAuthorizedByAbbreviation').and.returnValue(false);
      const result: AuthAccess = service.access();
      expect(result.create).toBe(false);
      expect(result.update).toBe(false);
      expect(result.delete).toBe(false);
      expect(result.view).toBe(false);
    })

    it('should return authAccess object with all access as true when there is view access', () => {
      mockPatSecurityService.IsAuthorizedByAbbreviation = jasmine.createSpy('patSecurityService.IsAuthorizedByAbbreviation').and.returnValue(true);
      const result: AuthAccess = service.access();
      expect(result.create).toBe(true);
      expect(result.update).toBe(true);
      expect(result.delete).toBe(true);
      expect(result.view).toBe(true);
    })
  })


  describe('addToTemplates', () => {
    it('should add new template to noteTemplates array when same template does not exist in noteTemplates array', () => {
      service.noteTemplates = [];
      service.addToTemplates(mockTemplate);
      expect(service.noteTemplates?.length).toBe(1);
    })

    it('should update existing template in noteTemplates array when same template exist in noteTemplates array', () => {
      service.noteTemplates = [];
      service.noteTemplates.push(mockTemplate);
      let tempTemplate = cloneDeep(mockTemplate);
      tempTemplate.TemplateName = "NoteTemplate_Copy";
      expect(service.noteTemplates[0]?.TemplateName).toEqual("TestTemplate");
      service.addToTemplates(tempTemplate);
      expect(service.noteTemplates?.length).toBe(1);
      expect(service.noteTemplates[0]?.TemplateName).toEqual("NoteTemplate_Copy");
    })
  })

  describe('removeFromTemplates', () => {
    it('should remove template from noteTemplates', () => {
      service.noteTemplates = [];
      service.noteTemplates.push(mockTemplate);
      expect(service.noteTemplates?.length).toBe(1);
      service.removeFromTemplates("340a0b22-1ea4-4d12-a1f9-dd0a5ab01c11");
      expect(service.noteTemplates?.length).toBe(0);
    })
  })

  describe('removeFromCategories', () => {
    it('should remove category from noteCategories', () => {
      service.noteCategories = [];
      service.noteCategories = cloneDeep(mockNoteCategoriesWithTemplate);
      expect(service.noteCategories?.length).toBe(2);
      service.removeFromCategories("461d047a-04c0-4d14-b1c9-09670e96d53f");
      expect(service.noteCategories?.length).toBe(1);
    })
  })

  describe('naturalSort -->', () => {
    it('should sort CategoriesWithTemplates and return save', () => {
      expect(mockNoteCategories[0].CategoryId).toEqual("1");
      const result = service.naturalSort(mockNoteCategories, 'CategoryName');
      expect(result[0].CategoryId).toEqual("4");
    })
  })

  describe('addToCategories', () => {
    it('should add new Category to noteCategories array when same noteCategories does not exist in noteCategories array', () => {
      service.noteCategories = [];
      service.addToCategories(mockNoteCategoriesWithTemplate[0]);
      expect(service.noteCategories?.length).toBe(1);
    })

    it('should update existing noteCategory in noteCategories array when same template exist in noteCategories array', () => {
      service.noteCategories = [];
      service.noteCategories = cloneDeep(mockNoteCategoriesWithTemplate);
      let tempNoteCategory: CategoriesWithTemplate[] = cloneDeep(mockNoteCategoriesWithTemplate);
      tempNoteCategory[0].CategoryName = "Category_1_Copy";
      expect(service.noteCategories[0]?.CategoryName).toEqual("Category1");
      service.addToCategories(tempNoteCategory[0]);
      expect(service.noteCategories?.length).toBe(2);
      expect(service.noteCategories[0]?.CategoryName).toEqual("Category_1_Copy");
    })
  })

  describe('validateMultipleChoiceFormSectionItem', () => {
    it('should return true if formSectionItem is null/undefined', () => {
      const result = service.validateMultipleChoiceFormSectionItem(null);
      expect(result).toBe(true);
    })

    it('should return false if MultiSelectAllow is false and formSectionItem.FormBankItem.Answer has value', () => {
      let tempSectionItem: FormSectionItem = cloneDeep(mockCustomFormTemplate?.FormSections[0].FormSectionItems[0]);
      tempSectionItem.FormBankItem.Answer = "Answer";
      const result = service.validateMultipleChoiceFormSectionItem(tempSectionItem);
      expect(result).toBe(false);
    })

    it('should return true if MultiSelectAllow is false and formSectionItem.FormBankItem.Answer does not have value', () => {
      const result = service.validateMultipleChoiceFormSectionItem(mockCustomFormTemplate?.FormSections[0].FormSectionItems[0]);
      expect(result).toBe(true);
    })

    it('should return false if MultiSelectAllow is true and itemOption.Answer has value', () => {
      let tempSectionItem = cloneDeep(mockCustomFormTemplate?.FormSections[0].FormSectionItems[1]);
      for (let index = 0; index < tempSectionItem?.ItemOptions?.length; index++) {
        tempSectionItem.ItemOptions[index]["Answer"] = true;
      }
      const result = service.validateMultipleChoiceFormSectionItem(tempSectionItem);
      expect(result).toBe(false);
    })

    it('should return true if MultiSelectAllow is true and itemOption.Answer does not have value', () => {
      let tempSectionItem = cloneDeep(mockCustomFormTemplate?.FormSections[0].FormSectionItems[1]);
      for (let index = 0; index < tempSectionItem?.ItemOptions?.length; index++) {
        tempSectionItem.ItemOptions[index]["Answer"] = null;
      }
      const result = service.validateMultipleChoiceFormSectionItem(tempSectionItem);
      expect(result).toBe(true);
    })
  })


  describe('validateLinkToothFormSectionItem -->', () => {
    it('should return false when link tooth contains $$activeTeeth', () => {
      const result = service.validateLinkToothFormSectionItem(mockCustomFormTemplate?.FormSections[0]?.FormSectionItems[5]);
      expect(result).toBe(true);
    })

    it('should return true when link tooth contains $$activeTeeth', () => {
      let tempLinkToothSection = cloneDeep(mockCustomFormTemplate?.FormSections[0]?.FormSectionItems[5]);
      tempLinkToothSection.$$activeTeeth = [{ "Teeth": "1" }];
      const result = service.validateLinkToothFormSectionItem(tempLinkToothSection);
      expect(result).toBe(false);
    })
  })

  describe('validateFormSectionItemAnswers -->', () => {
    it('should return true when formSectionItem is null', () => {
      const result = service.validateFormSectionItemAnswers(null);
      expect(result).toBe(true);
    })

    it('should return true when FormBankItem has data and Answer is null in case of ', () => {
      const result = service.validateFormSectionItemAnswers(mockCustomFormTemplate?.FormSections[0]?.FormSectionItems[2]);
      expect(result).toBe(true);
    })

    it('should return false when FormBankItem has data and Answer is not null ', () => {
      let tempFormSection = cloneDeep(mockCustomFormTemplate?.FormSections[0]?.FormSectionItems[2]);
      tempFormSection.FormBankItem.Answer = "Answer";
      const result = service.validateFormSectionItemAnswers(tempFormSection);
      expect(result).toBe(false);
      expect(tempFormSection.$$InvalidAnswer).toBe(false);
    })

    it('should call validateMultipleChoiceFormSectionItem in case for formtype 3[Multiple Choice]', () => {
      service.validateMultipleChoiceFormSectionItem = jasmine.createSpy();
      let tempFormSection = cloneDeep(mockCustomFormTemplate?.FormSections[0]?.FormSectionItems[0]);
      service.validateFormSectionItemAnswers(tempFormSection);
      expect(service.validateMultipleChoiceFormSectionItem).toHaveBeenCalled();
    })

    it('should call validateLinkToothFormSectionItem in case for formtype 10[Link Tooth]', () => {
      service.validateLinkToothFormSectionItem = jasmine.createSpy();
      let tempFormSection = cloneDeep(mockCustomFormTemplate?.FormSections[0]?.FormSectionItems[5]);
      service.validateFormSectionItemAnswers(tempFormSection);
      expect(service.validateLinkToothFormSectionItem).toHaveBeenCalled();
    })

    it('should call return true in case of 11[Note Text] and execute default case', () => {
      let tempFormSection = cloneDeep(mockCustomFormTemplate?.FormSections[0]?.FormSectionItems[6]);
      const result = service.validateFormSectionItemAnswers(tempFormSection);
      expect(result).toBe(true);
    })
  })

  describe('ValidateTemplateAnswers -->', () => {
    it('should call validateFormSectionItemAnswers method', () => {
      service.validateFormSectionItemAnswers = jasmine.createSpy();
      service.ValidateTemplateAnswers(mockCustomFormTemplate);
      expect(service.validateFormSectionItemAnswers).toHaveBeenCalled();
    })

    it('should return true for valid form', () => {
      service.validateFormSectionItemAnswers = jasmine.createSpy();
      const result = service.ValidateTemplateAnswers(mockCustomFormTemplate);
      expect(result).toBe(true);
    })

    it('should return false for invalid form', () => {
      let tempCustomFormTemplate = cloneDeep(mockCustomFormTemplate);
      mockCustomFormTemplate.FormSections[0].FormSectionItems[2].IsRequired = true;
      tempCustomFormTemplate.FormSections[0].FormSectionItems[2].FormBankItem.Answer = "";
      const result = service.ValidateTemplateAnswers(tempCustomFormTemplate);
      expect(result).toBe(false);
    })
  })

  describe('loadCustomOption -->', () => {
    it('should not push customItemOption in itemoption if it is null', () => {
      let tempFormSection: FormSectionItem = cloneDeep(mockCustomFormTemplate.FormSections[0].FormSectionItems[0]);
      tempFormSection.ItemOptions = null;
      service.loadCustomOption(tempFormSection);
      expect(tempFormSection.ItemOptions).toBeNull();
    })
    it('should push customItemOption in itemoption if it is not null', () => {
      let tempFormSection: FormSectionItem = cloneDeep(mockCustomFormTemplate.FormSections[0].FormSectionItems[0]);
      service.loadCustomOption(tempFormSection);
      expect(tempFormSection.ItemOptions).not.toBeNull();
    })
  })

  describe('loadTeethSelectOptions -->', () => {
    it('should set TeethSelectOptions data', () => {
      let tempFormSection: FormSectionItem = cloneDeep(mockCustomFormTemplate.FormSections[0].FormSectionItems[5]);
      tempFormSection.$$TeethSelectOptions = null;
      expect(tempFormSection?.$$TeethSelectOptions).toBeNull();
      service.loadTeethSelectOptions(tempFormSection);
      expect(tempFormSection?.$$TeethSelectOptions).not.toBeNull();
    })
  })

  describe('convertMultipleSelectFormSectionItem -->', () => {
    it('should return multiple section form section content', () => {
      let tempFormSection: FormSectionItem = cloneDeep(mockCustomFormTemplate.FormSections[0].FormSectionItems[0]);
      tempFormSection.ItemOptions[0]["Answer"] = true;
      const result = service.convertMultipleSelectFormSectionItem(tempFormSection);
      expect(result.includes(tempFormSection.FormBankItem?.Description)).toBe(true);
      expect(result.includes(tempFormSection.ItemOptions[0].BankItemOption.OptionText)).toBe(true);
    })
  })

  describe('convertAdlibFormSectionItem -->', () => {
    it('should return adlib section form section content', () => {
      let tempFormSection: FormSectionItem = cloneDeep(mockCustomFormTemplate.FormSections[0].FormSectionItems[3]);
      tempFormSection.FormBankItem = new FormBankItem();
      tempFormSection.FormBankItem.Description = "Description";
      const result = service.convertAdlibFormSectionItem(tempFormSection);
      for (let index = 0; index < tempFormSection?.FormBankItemPromptTexts?.length; index++) {
        expect(result.includes(tempFormSection?.FormBankItemPromptTexts[index].ItemText)).toBe(true);
        if (tempFormSection?.FormBankItem && tempFormSection?.FormBankItem?.Answer) {
          expect(result.includes(tempFormSection?.FormBankItem?.Answer)).toBe(true);
        }
      }
    })
  })

  describe('convertMultipleChoiceFormSectionItem -->', () => {
    it('should return multiple choice section form section content', () => {
      let tempFormSection: FormSectionItem = cloneDeep(mockCustomFormTemplate.FormSections[0].FormSectionItems[0]);
      tempFormSection.FormBankItem.Answer = "Answer";
      const result = service.convertMultipleChoiceFormSectionItem(tempFormSection);
      expect(result.includes(tempFormSection?.FormBankItem?.Description)).toBe(true);
      expect(result.includes(tempFormSection?.FormBankItem?.Answer)).toBe(true);
    })
  })

  describe('convertYesNoChoiceFormSectionItem -->', () => {
    it('should return yes no section form section content', () => {
      let tempFormSection: FormSectionItem = cloneDeep(mockCustomFormTemplate.FormSections[0].FormSectionItems[2]);
      tempFormSection.FormBankItem.Answer = "Answer";
      const result = service.convertYesNoChoiceFormSectionItem(tempFormSection);
      expect(result.includes(tempFormSection?.FormBankItem?.Description)).toBe(true);
      expect(result.includes(tempFormSection?.FormBankItem?.Answer)).toBe(true);
    })
  })

  describe('convertFormItemTextField -->', () => {
    it('should return yes no section form section content', () => {
      const tempFormSection: FormSectionItem = cloneDeep(mockCustomFormTemplate.FormSections[0].FormSectionItems[6]);
      tempFormSection.FormItemTextField.NoteText = "Note Text";
      const result = service.convertFormItemTextField(tempFormSection);
      expect(result.includes(tempFormSection?.FormItemTextField?.NoteText)).toBe(true);
    })
  })

  describe('convertLinkToothFormSectionItem -->', () => {
    it('should return link tooth section form section content', () => {
      const tempFormSection: FormSectionItem = cloneDeep(mockCustomFormTemplate.FormSections[0].FormSectionItems[5]);
      tempFormSection.FormItemTextField.NoteText = "Note Text";
      tempFormSection.$$activeTeeth = ['1', '2'];
      const result = service.convertLinkToothFormSectionItem(tempFormSection);
        expect(result.includes(tempFormSection?.FormBankItem?.Description)).toBe(true);
    })
  })

  describe('ConvertTemplateToText -->', () => {
    it('should call methods according to formtypes', () => {
      service.convertYesNoChoiceFormSectionItem = jasmine.createSpy();
      service.convertMultipleSelectFormSectionItem = jasmine.createSpy();
      service.convertMultipleChoiceFormSectionItem = jasmine.createSpy();
      service.convertAdlibFormSectionItem = jasmine.createSpy();
      service.convertLinkToothFormSectionItem = jasmine.createSpy();
      service.convertFormItemTextField = jasmine.createSpy();

      service.ConvertTemplateToText(mockNoteTemplate);
      mockNoteTemplate?.TemplateBodyCustomForm?.FormSections?.forEach((formSection) => {
        let visibleSectionItems = 0;
        let sectionItems = '';
        let content = "";
        formSection?.FormSectionItems?.forEach((formSectionItem) => {
          visibleSectionItems++;
          let formSectionItemContent;
          switch (formSectionItem?.FormItemType) {
            case 2:
            case 8:
              expect(service.convertYesNoChoiceFormSectionItem).toHaveBeenCalled();
              break;
            case 3:
              if (formSectionItem.MultiSelectAllow === true) {
                expect(service.convertMultipleSelectFormSectionItem).toHaveBeenCalled();
              } else {
                expect(service.convertMultipleChoiceFormSectionItem).toHaveBeenCalled();
              }
              break;
            case 9:
              expect(service.convertAdlibFormSectionItem).toHaveBeenCalled();
              break;
            case 10:
              expect(service.convertLinkToothFormSectionItem).toHaveBeenCalled();
              break;
            case 11:
              expect(service.convertFormItemTextField).toHaveBeenCalled();
              break;
          }
          sectionItems += formSectionItemContent;
        });
      });
    })
  })

  describe('validateItemPromptTextOptions -->', () => {
    it('should validated item prompt text and return false if form is valid', () => {
      const tempItemPromptTextOptions = cloneDeep(mockCustomFormTemplate.FormSections[0].FormSectionItems[4]);
      const result = service.validateItemPromptTextOptions(tempItemPromptTextOptions.ItemPromptTextsOptions);
      expect(result).toBe(false);
    })

    it('should validated item prompt text and return false if form has no ItemPromptTextsOptions', () => {
      const tempItemPromptTextOptions = cloneDeep(mockCustomFormTemplate.FormSections[0].FormSectionItems[4]);
      tempItemPromptTextOptions.ItemPromptTextsOptions = [];
      const result = service.validateItemPromptTextOptions(tempItemPromptTextOptions.ItemPromptTextsOptions);
      expect(result).toBe(false);
    })
  })

  describe('validateTemplateFormSectionItem -->', () => {
    it('should validated sections with respect to form item type and return true for valid form', () => {
      for (let index = 0; index < mockCustomFormTemplate?.FormSections[0]?.FormSectionItems?.length; index++) {
        const result = service.validateTemplateFormSectionItem(mockCustomFormTemplate?.FormSections[0]?.FormSectionItems[index]);
        expect(result).toBe(true);
      }
    })

    it('should validated sections with respect to form item type and return false for invalid form', () => {
      for (let index = 0; index < mockCustomFormTemplate?.FormSections[0]?.FormSectionItems?.length; index++) {
        let tempFormSection = cloneDeep(mockCustomFormTemplate?.FormSections[0]?.FormSectionItems[index]);
        if (tempFormSection.FormItemType == 2 || tempFormSection.FormItemType == 3 || tempFormSection.FormItemType == 7 || tempFormSection.FormItemType == 8 || tempFormSection.FormItemType == 10) {
          tempFormSection.FormBankItem.ItemText = null;
        }
        if (tempFormSection.FormItemType == 9) {
          for (let index = 0; index < tempFormSection?.FormBankItemPromptTexts?.length; index++) {
            tempFormSection.FormBankItemPromptTexts[index].ItemText = null;
          }
        }
        if (tempFormSection.FormItemType == 11) {
          tempFormSection.FormItemTextField.NoteText = null;
        }
        const result = service.validateTemplateFormSectionItem(tempFormSection);
        expect(result).toBe(false);
      }
    })

    it('should validated adlib sections and call validateItemPromptTextOptions method', () => {
      service.validateItemPromptTextOptions = jasmine.createSpy();
      for (let index = 0; index < mockCustomFormTemplate?.FormSections[0]?.FormSectionItems?.length; index++) {
        let tempFormSection = cloneDeep(mockCustomFormTemplate?.FormSections[0]?.FormSectionItems[index]);

        if (tempFormSection.FormItemType == 9) {
          for (let index = 0; index < tempFormSection?.FormBankItemPromptTexts?.length; index++) {
            tempFormSection.FormBankItemPromptTexts[index].ItemText = "Item Text";
          }
        }
        const result = service.validateTemplateFormSectionItem(tempFormSection);
        if (tempFormSection.FormItemType == 9) {
          expect(service.validateItemPromptTextOptions).toHaveBeenCalled();
        }
        else {
          expect(result).toBe(true);
        }
      }
    })
  })

  describe('ValidateTemplateBodyCustomForm -->', () => {
    it('should validated custom form and return true for valid form', () => {
      const result = service.ValidateTemplateBodyCustomForm(mockCustomFormTemplate);
      expect(result).toBe(true);
    })

    it('should validated custom form and call validateTemplateFormSectionItem to validate each form type', () => {
      service.validateTemplateFormSectionItem = jasmine.createSpy();
      service.ValidateTemplateBodyCustomForm(mockCustomFormTemplate);
      expect(service.validateTemplateFormSectionItem).toHaveBeenCalled();
    })

    it('should validated custom form and return false when section title is missing', () => {
      let tempMockCustomFormTemplate = cloneDeep(mockCustomFormTemplate);
      tempMockCustomFormTemplate.FormSections[0].Title = "";
      const result = service.ValidateTemplateBodyCustomForm(tempMockCustomFormTemplate);
      expect(result).toBe(false);
    })
  })

  describe('LoadSelectOptions -->', () => {
    it('should call loadCustomOption in case of Multiple Choice and loadTeethSelectOptions in case of Link tooth', () => {
      service.loadCustomOption = jasmine.createSpy();
      service.loadTeethSelectOptions = jasmine.createSpy();
      service.LoadSelectOptions(mockCustomFormTemplate);
      expect(service.loadCustomOption).toHaveBeenCalled();
      expect(service.loadTeethSelectOptions).toHaveBeenCalled();
    })
  })

  describe('SetItemOptions -->', () => {
    it('should set OptionValue as option text in case of multiple choice and adlib', () => {
      let tempMockCustomFormTemplate = cloneDeep(mockCustomFormTemplate);
      service.SetItemOptions(tempMockCustomFormTemplate);
      for (let index = 0; index < tempMockCustomFormTemplate.FormSections[0].FormSectionItems.length; index++) {
        let tempMockSection = tempMockCustomFormTemplate.FormSections[0].FormSectionItems[index];
        if (tempMockSection.FormItemType == FormTypes['Multiple Choice'] || tempMockSection.FormItemType == FormTypes['Ad-Lib']) {
          for (let ndx = 0; ndx < tempMockSection?.ItemOptions?.length; ndx++) {
            if (tempMockSection?.ItemOptions[ndx]?.BankItemOption?.OptionText) {
              expect(tempMockSection.ItemOptions[ndx].BankItemOption.OptionValue).toEqual(tempMockSection?.ItemOptions[ndx]?.BankItemOption?.OptionText);
            }
          }
        }
      }
    })

    it('should remove item option which dont have option text in case of multiple choice and adlib', () => {
      let tempMockCustomFormTemplate = cloneDeep(mockCustomFormTemplate);
      for (let index = 0; index < tempMockCustomFormTemplate.FormSections[0].FormSectionItems.length; index++) {
        let tempMockSection = tempMockCustomFormTemplate.FormSections[0].FormSectionItems[index];
        if (tempMockSection.FormItemType == FormTypes['Multiple Choice'] || tempMockSection.FormItemType == FormTypes['Ad-Lib']) {
          for (let ndx = 0; ndx < tempMockSection?.ItemOptions?.length; ndx++) {
            tempMockSection.ItemOptions[ndx].BankItemOption.OptionText = null;
          }
        }
      }
      service.SetItemOptions(tempMockCustomFormTemplate);
      for (let index = 0; index < tempMockCustomFormTemplate.FormSections[0].FormSectionItems.length; index++) {
        let tempMockSection = tempMockCustomFormTemplate.FormSections[0].FormSectionItems[index];
        if (tempMockSection.FormItemType == FormTypes['Multiple Choice'] || tempMockSection.FormItemType == FormTypes['Ad-Lib']) {
          expect(tempMockSection?.ItemOptions?.length).toBe(0);
        }
      }
    })
  })

  describe('SetActiveTemplateCategory -->', () => {
    it('should set category as per this selected category', () => {
      service.SetActiveTemplateCategory(mockNoteCategories[0]);
      expect(service.ActiveTemplateCategory).toEqual(mockNoteCategories[0]);
    })
  })

  describe('SetActiveNoteTemplate -->', () => {
    it('should set note template as per this selected note template', () => {
      service.SetActiveNoteTemplate(mockNoteTemplate);
      expect(service.ActiveNoteTemplate).toEqual(mockNoteTemplate);
    })
  })

  describe('SetCurrentOperation -->', () => {
    it('should set SetCurrentOperation as per the input value', () => {
      service.SetCurrentOperation("copy");
      expect(service.CurrentOperation).toEqual("copy");

      service.SetCurrentOperation("edit");
      expect(service.CurrentOperation).toEqual("edit");
    })
  })

  describe('setTemplateDataChanged -->', () => {
    it('should set TemplateDataChanged as per the input and return same', () => {
      let result = service.setTemplateDataChanged(true);
      expect(service.TemplateDataChanged).toBe(true);
      expect(result).toBe(true);

      result = service.setTemplateDataChanged(false);
      expect(service.TemplateDataChanged).toBe(false);
      expect(result).toBe(false);
    })
  })

  describe('ExpandOrCollapseCategory -->', () => {
    it('should call SetActiveTemplateCategory with category in case of expanded category', () => {
      service.SetActiveTemplateCategory = jasmine.createSpy();
      let mockTempCateogory = cloneDeep(mockNoteCategoriesWithTemplate[0]);
      mockTempCateogory.ntExpand = false;
      service.ExpandOrCollapseCategory(mockTempCateogory);
      expect(service.SetActiveTemplateCategory).toHaveBeenCalledWith(mockTempCateogory);
    })

    it('should call SetActiveTemplateCategory with null value in case of collapsed category', () => {
      service.SetActiveTemplateCategory = jasmine.createSpy();
      let mockTempCateogory = cloneDeep(mockNoteCategoriesWithTemplate[0]);
      mockTempCateogory.ntExpand = true;
      service.ExpandOrCollapseCategory(mockTempCateogory);
      expect(service.SetActiveTemplateCategory).toHaveBeenCalledWith(null);
    })
  })

  describe('CloseTemplateHeader -->', () => {
    it('should set addingNewTemplate as false', () => {
      let mockTempCateogory = cloneDeep(mockNoteCategoriesWithTemplate[0]);
      mockTempCateogory.addingNewTemplate = true;
      service.CloseTemplateHeader(mockTempCateogory);
      expect(mockTempCateogory.addingNewTemplate).toBe(false);
    })
  })

  describe('observeCategories -->', () => {
    it('should add selected category to categoryObservers', () => {
      service.categoryObservers = [];
      expect(service.categoryObservers?.length).toBe(0);

      service.observeCategories(mockNoteCategories[0]);
      expect(service.categoryObservers?.length).toBe(1);

      service.observeCategories(mockNoteCategories[1]);
      expect(service.categoryObservers?.length).toBe(2);
    })
  })


  //UTs for all HTTP Request
  describe('getTemplates', () => {
    const categoryId = "461d047a-04c0-4d14-b1c9-09670e96d53f";
    let soarResponse = new SoarResponse<Template>();
    beforeEach(() => {
      url = mockSoarConfig.domainUrl + '/clinicalnotes/categories/' + categoryId + '/templates';
    })

    it('should be OK returning no records', () => {
      service.getTemplates(categoryId).then(
        res => expect(res).toEqual([]),
        error => fail
      );
      const req = httpTestingController.expectOne(url);
      req.flush([]);
    });

    it('should call getTemplates and return an categories and templates ', () => {
      const mockCategoryRes = mockNoteCategoriesWithTemplate.filter(x => x.CategoryId?.toString() == categoryId.toString());
      soarResponse.Value = <Template>mockCategoryRes;
      service.naturalSort = jasmine.createSpy();
      service.getTemplates(categoryId).then(
        res => {
          expect(res).toEqual(soarResponse);
          expect(service.naturalSort).toHaveBeenCalled();
        },
        error => fail
      );

      const req = httpTestingController.expectOne(url);
      expect(req.request.method).toEqual('GET');
      //Return soarresponse
      req.flush(soarResponse);
    });

    it("should throw error with response body when server returns error other than 404", () => {
      const mockErrorResponse = { status: 404, statusText: 'Deliberate 404' };
      const msg = 'Not found';

      service.getTemplates(categoryId).then(
        res => fail('expected to fail'),
        err => {
          expect(err.error).toEqual(msg)
          expect(err.message).toContain(mockErrorResponse.statusText)
        }
      );
      const req = httpTestingController.expectOne(url);
      // respond with a 404 and the error message in the body
      req.flush(msg, mockErrorResponse);
    });
  })

  describe('updateNoteTemplate', () => {
    let soarResponse = new SoarResponse<Template>();
    beforeEach(() => {
      url = mockSoarConfig.domainUrl + '/clinicalnotes/templates';
    })

    it('should update a template and return it', () => {
      soarResponse.Value = cloneDeep(mockTemplate);

      service.updateNoteTemplate(mockTemplate).then(
        res => expect(res).toEqual(soarResponse),
        error => fail
      );
      const req = httpTestingController.expectOne(url);
      expect(req.request.method).toEqual('PUT');
      req.flush(soarResponse);
    });

    it('should turn 404 error into user-facing error', () => {
      const mockErrorResponse = { status: 404, statusText: 'Deliberate 404' };
      const msg = 'Not found';

      service.updateNoteTemplate(mockTemplate).then(
        res => fail('expected to fail'),
        err => {
          expect(err.error).toEqual(msg)
          expect(err.message).toContain(mockErrorResponse.statusText)
        }
      );
      const req = httpTestingController.expectOne(url);
      // respond with a 404 and the error message in the body
      req.flush(msg, mockErrorResponse);
    });
  })

  describe('createNoteTemplate', () => {
    let soarResponse = new SoarResponse<NoteTemplatesViewModel>();
    beforeEach(() => {
      url = mockSoarConfig.domainUrl + '/clinicalnotes/templateforms';
    })

    it('should save a new template and return it', () => {
      soarResponse.Value = cloneDeep(mockNoteTemplate);
      service.createNoteTemplate(mockNoteTemplate).then(
        res => expect(res).toEqual(soarResponse),
        error => fail
      );
      const req = httpTestingController.expectOne(url);
      expect(req.request.method).toEqual('POST');
      req.flush(soarResponse);
    });

    it('should turn 404 error into user-facing error', () => {
      const mockErrorResponse = { status: 404, statusText: 'Deliberate 404' };
      const msg = 'Not found';

      service.createNoteTemplate(mockNoteTemplate).then(
        res => fail('expected to fail'),
        err => {
          expect(err.error).toEqual(msg)
          expect(err.message).toContain(mockErrorResponse.statusText)
        }
      );
      const req = httpTestingController.expectOne(url);
      // respond with a 404 and the error message in the body
      req.flush(msg, mockErrorResponse);
    });
  })

  describe('updateNoteTemplateForm', () => {
    let soarResponse = new SoarResponse<CustomFormTemplate>();
    beforeEach(() => {
      url = mockSoarConfig.domainUrl + '/clinicalnotes/templateforms/';
    })

    it('should update a template and return it', () => {
      soarResponse.Value = cloneDeep(mockCustomFormTemplate);

      service.updateNoteTemplateForm(mockCustomFormTemplate).then(
        res => expect(res).toEqual(soarResponse),
        error => fail
      );
      const req = httpTestingController.expectOne(url);
      expect(req.request.method).toEqual('PUT');
      req.flush(soarResponse);
    });

    it('should turn 404 error into user-facing error', () => {
      const mockErrorResponse = { status: 404, statusText: 'Deliberate 404' };
      const msg = 'Not found';

      service.updateNoteTemplateForm(mockCustomFormTemplate).then(
        res => fail('expected to fail'),
        err => {
          expect(err.error).toEqual(msg)
          expect(err.message).toContain(mockErrorResponse.statusText)
        }
      );
      const req = httpTestingController.expectOne(url);
      // respond with a 404 and the error message in the body
      req.flush(msg, mockErrorResponse);
    });
  })

  describe('deleteNoteCategory', () => {
    const categoryId = "461d047a-04c0-4d14-b1c9-09670e96d53f";
    beforeEach(() => {
      url = mockSoarConfig.domainUrl + '/clinicalnotes/categories/' + categoryId;
      service.hasAccess.delete = true;
    })
    it('should delete a category and return categories', () => {
      service.removeFromCategories = jasmine.createSpy();
      let tempIndex = mockNoteCategoriesWithTemplate.findIndex(x => x.CategoryId == categoryId);
      mockNoteCategoriesWithTemplate.splice(tempIndex, 1);
      service.deleteNoteCategory(categoryId).then(
        res => {
          expect(res).toEqual(mockNoteCategoriesWithTemplate);
          expect(service.removeFromCategories).toHaveBeenCalled();
        },
        error => fail
      );
      const req = httpTestingController.expectOne(url);
      expect(req.request.method).toEqual('DELETE');
      req.flush(mockNoteCategoriesWithTemplate);
    });

    it('should turn 404 error into user-facing error', () => {
      const mockErrorResponse = { status: 404, statusText: 'Deliberate 404' };
      const msg = 'Not found';
      service.deleteNoteCategory(categoryId).then(
        res => fail('expected to fail'),
        err => {
          expect(err.error).toEqual(msg)
          expect(err.message).toContain(mockErrorResponse.statusText)
        }
      );
      const req = httpTestingController.expectOne(url);
      // respond with a 404 and the error message in the body
      req.flush(msg, mockErrorResponse);
    });
  })

  describe('CategoriesWithTemplates', () => {
    beforeEach(() => {
      url = mockSoarConfig.domainUrl + '/clinicalnotes/categoriesWithTemplates';
    })

    it('should be OK returning no records', () => {
      service.CategoriesWithTemplates().then(
        res => expect(res).toEqual([]),
        error => fail
      );
      const req = httpTestingController.expectOne(url);
      req.flush([]);
    });

    it('should call CategoriesWithTemplates and return an categories and templates ', () => {
      let soarResponse = { Value: [] };
      soarResponse.Value = <CategoriesWithTemplate[]>(mockNoteCategoriesWithTemplate);
      soarResponse.Value = service.naturalSort(soarResponse.Value, 'CategoryName');
      soarResponse.Value.forEach((category) => {
        // signals that the templates have been loaded
        category.$$Loaded = true;
        service.noteTemplates = concat(service.noteTemplates, category?.Templates)
        category.$$hasTemplates = category?.Templates?.length === 0 ? false : true;
      });
      service.CategoriesWithTemplates().then(
        res => {
          expect(res).toEqual(soarResponse);
        },
        error => fail
      );

      const req = httpTestingController.expectOne(url);
      expect(req.request.method).toEqual('GET');
      req.flush(soarResponse);
    });

    it("should throw error with response body when server returns error other than 404", () => {
      const mockErrorResponse = { status: 404, statusText: 'Deliberate 404' };
      const msg = 'Not found';

      service.CategoriesWithTemplates().then(
        res => fail('expected to fail'),
        err => {
          expect(err.error).toEqual(msg)
          expect(err.message).toContain(mockErrorResponse.statusText)
        }
      );
      const req = httpTestingController.expectOne(url);
      // respond with a 404 and the error message in the body
      req.flush(msg, mockErrorResponse);
    });
  })

  describe('categories', () => {
    let soarResponse = new SoarResponse<Categories>();
    beforeEach(() => {
      url = mockSoarConfig.domainUrl + '/clinicalnotes/categories';
    })

    it('should be OK returning no records', () => {
      service.categories().then(
        res => expect(res).toEqual([]),
        error => fail
      );
      const req = httpTestingController.expectOne(url);
      req.flush([]);
    });

    it('should call categories and return an categories, should call naturalSort ', () => {
      soarResponse.Value = <Categories>mockNoteCategories;
      service.naturalSort = jasmine.createSpy();
      service.categories().then(
        res => {
          expect(res).toEqual(soarResponse);
          expect(service.naturalSort).toHaveBeenCalled();
        },
        error => fail
      );

      const req = httpTestingController.expectOne(url);
      expect(req.request.method).toEqual('GET');
      //Return soarresponse
      req.flush(soarResponse);
    });

    it("should throw error with response body when server returns error other than 404", () => {
      const mockErrorResponse = { status: 404, statusText: 'Deliberate 404' };
      const msg = 'Not found';

      service.categories().then(
        res => fail('expected to fail'),
        err => {
          expect(err.error).toEqual(msg)
          expect(err.message).toContain(mockErrorResponse.statusText)
        }
      );
      const req = httpTestingController.expectOne(url);
      // respond with a 404 and the error message in the body
      req.flush(msg, mockErrorResponse);
    });
  })

  describe('saveCategory', () => {
    let soarResponse = new SoarResponse<CategoriesWithTemplate>();
    beforeEach(() => {
      service.addToCategories = jasmine.createSpy();
      url = mockSoarConfig.domainUrl + '/clinicalnotes/categories';
    })

    it('should create new category if CategoryId not contains any value', () => {
      soarResponse.Value = cloneDeep(mockNoteCategoriesWithTemplate);
      let tempMockData = cloneDeep(mockNoteCategoriesWithTemplate[0]);
      tempMockData.CategoryId = null;
      service.saveCategory(tempMockData).then(
        res => {
          expect(res).toEqual(soarResponse);
          expect(service.addToCategories).toHaveBeenCalled()
        },
        error => fail
      );
      const req = httpTestingController.expectOne(url);
      expect(req.request.method).toEqual('POST');
      req.flush(soarResponse);
    });

    it('should update category if CategoryId has value', () => {
      soarResponse.Value = cloneDeep(mockNoteCategoriesWithTemplate);
      service.saveCategory(mockNoteCategoriesWithTemplate[0]).then(
        res => {
          expect(res).toEqual(soarResponse);
          expect(service.addToCategories).toHaveBeenCalled()
        },
        error => fail
      );
      const req = httpTestingController.expectOne(url);
      expect(req.request.method).toEqual('PUT');
      req.flush(soarResponse);
    });

    it('should turn 404 error into user-facing error in case of save new record', () => {
      const mockErrorResponse = { status: 404, statusText: 'Deliberate 404' };
      const msg = 'Not found';
      let tempMockData = cloneDeep(mockNoteCategoriesWithTemplate[0]);
      tempMockData.CategoryId = null;
      service.saveCategory(tempMockData).then(
        res => fail('expected to fail'),
        err => {
          expect(err.error).toEqual(msg)
          expect(err.message).toContain(mockErrorResponse.statusText)
        }
      );
      const req = httpTestingController.expectOne(url);
      // respond with a 404 and the error message in the body
      req.flush(msg, mockErrorResponse);
    });

    it('should turn 404 error into user-facing error in case of update request', () => {
      const mockErrorResponse = { status: 404, statusText: 'Deliberate 404' };
      const msg = 'Not found';

      service.saveCategory(mockNoteCategoriesWithTemplate[0]).then(
        res => fail('expected to fail'),
        err => {
          expect(err.error).toEqual(msg)
          expect(err.message).toContain(mockErrorResponse.statusText)
        }
      );
      const req = httpTestingController.expectOne(url);
      // respond with a 404 and the error message in the body
      req.flush(msg, mockErrorResponse);
    });
  })

  describe('LoadTemplateBodyCustomForm', () => {
    let soarResponse = new SoarResponse<CustomFormTemplate>();
    beforeEach(() => {
      url = mockSoarConfig.domainUrl + '/clinicalnotes/templateforms/' + mockTemplate.TemplateBodyFormId;
    })

    it('should be OK returning no records', () => {
      service.LoadTemplateBodyCustomForm(mockTemplate).then(
        res => expect(res).toEqual([]),
        error => fail
      );
      const req = httpTestingController.expectOne(url);
      req.flush([]);
    });

    it('should call LoadTemplateBodyCustomForm and get CustomFormTemplate', () => {
      soarResponse.Value = <CustomFormTemplate>mockCustomFormTemplate;
      service.LoadTemplateBodyCustomForm(mockTemplate).then(
        res => {
          expect(res).toEqual(soarResponse);
          expect(service.naturalSort).toHaveBeenCalled();
        },
        error => fail
      );

      const req = httpTestingController.expectOne(url);
      expect(req.request.method).toEqual('GET');
      //Return soarresponse
      req.flush(soarResponse);
    });

    it("should throw error with response body when server returns error other than 404", () => {
      const mockErrorResponse = { status: 404, statusText: 'Deliberate 404' };
      const msg = 'Not found';

      service.LoadTemplateBodyCustomForm(mockTemplate).then(
        res => fail('expected to fail'),
        err => {
          expect(err.error).toEqual(msg)
          expect(err.message).toContain(mockErrorResponse.statusText)
        }
      );
      const req = httpTestingController.expectOne(url);
      // respond with a 404 and the error message in the body
      req.flush(msg, mockErrorResponse);
    });
  })

  describe('deleteNoteTemplate', () => {
    const templateId = "461d047a-04c0-4d14-b1c9-09670e96d53f";
    beforeEach(() => {
      url = mockSoarConfig.domainUrl + '/clinicalnotes/templateforms/' + templateId;
      service.hasAccess.delete = true;
    })
    it('should delete a note template and return categories', () => {
      service.removeFromTemplates = jasmine.createSpy();
      service.deleteNoteTemplate(templateId).then(
        res => {
          expect(res).toEqual(mockNoteTemplate);
          expect(service.removeFromTemplates).toHaveBeenCalled();
        },
        error => fail
      );
      const req = httpTestingController.expectOne(url);
      expect(req.request.method).toEqual('DELETE');
      req.flush(mockNoteTemplate);
    });

    it('should turn 404 error into user-facing error', () => {
      const mockErrorResponse = { status: 404, statusText: 'Deliberate 404' };
      const msg = 'Not found';
      service.deleteNoteTemplate(templateId).then(
        res => fail('expected to fail'),
        err => {
          expect(err.error).toEqual(msg)
          expect(err.message).toContain(mockErrorResponse.statusText)
        }
      );
      const req = httpTestingController.expectOne(url);
      // respond with a 404 and the error message in the body
      req.flush(msg, mockErrorResponse);
    });
  })

});
