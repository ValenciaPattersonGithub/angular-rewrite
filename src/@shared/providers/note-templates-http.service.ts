import { HttpClient } from '@angular/common/http';
import { Inject, Injectable } from '@angular/core';
import { Categories, CategoriesWithTemplate, NoteTemplatesViewModel, Template } from 'src/business-center/practice-settings/chart/note-templates/note-templates';
import { AuthAccess } from '../models/auth-access.model';
import { OrderByPipe } from '../pipes';
import concat from 'lodash/concat';
import cloneDeep from 'lodash/cloneDeep';
import escape from 'lodash/escape';
import { CustomFormTemplate } from 'src/business-center/practice-settings/chart/note-templates/note-templates';
import { SoarResponse } from 'src/@core/models/core/soar-response';

@Injectable({
  providedIn: 'root'
})
export class NoteTemplatesHttpService {

  constructor(private httpClient: HttpClient,
    @Inject('SoarConfig') private soarConfig,
    @Inject('patSecurityService') private patSecurityService,
    @Inject('localize') private localize,
    @Inject('StaticData') private staticData) { }

  orderPipe = new OrderByPipe();
  ActiveNoteTemplate: NoteTemplatesViewModel = null;
  ActiveTemplateCategory: null;
  public hasAccess: AuthAccess = { create: false, delete: false, update: false, view: false };
  noteCategories: CategoriesWithTemplate[] = [];
  noteTemplates: Template[] = [];
  CurrentOperation = "";
  templateObservers = [];
  categoryObservers = [];
  // NewNote
  NewTemplate: NoteTemplatesViewModel = new NoteTemplatesViewModel();
  TemplateDataChanged = false;
  hasAuthCreateAccess = false;
  hasAuthDeleteAccess = false;
  hasAuthEditAccess = false;
  hasAuthViewAccess = false;
  //#region authentication

  authCreateAccess = (): boolean => {
    this.hasAuthCreateAccess = this.patSecurityService.IsAuthorizedByAbbreviation('soar-clin-nottmp-add');
    return this.hasAuthCreateAccess;
  }

  authDeleteAccess = (): boolean => {
    this.hasAuthDeleteAccess = this.patSecurityService.IsAuthorizedByAbbreviation('soar-clin-nottmp-delete');
    return this.hasAuthDeleteAccess;
  }

  authEditAccess = (): boolean => {
    this.hasAuthEditAccess = this.patSecurityService.IsAuthorizedByAbbreviation('soar-clin-nottmp-edit');
    return this.hasAuthEditAccess;
  }

  authViewAccess = (): boolean => {
    this.hasAuthViewAccess = this.patSecurityService.IsAuthorizedByAbbreviation('soar-clin-nottmp-view');
    return this.hasAuthViewAccess;
  }

  access = (): AuthAccess => {
    if (this.authViewAccess()) {
      this.hasAccess.create = this.authCreateAccess();
      this.hasAccess.delete = this.authDeleteAccess();
      this.hasAccess.update = this.authEditAccess();
      this.hasAccess.view = true;
    }
    return this.hasAccess;
  }
  //#endregion

  //#region templates
  addToTemplates = (template) => {
    const index = this.noteTemplates?.findIndex(x => x.TemplateId == template?.TemplateId);
    if (index > -1) {
      this.noteTemplates?.splice(index, 1, template);
    } else {
      this.noteTemplates?.push(template);
    }
    this.templateObservers?.forEach((observer) => {
      observer(this.noteTemplates);
    });
  }

  removeFromTemplates = (templateId) => {
    const index = this.noteTemplates?.findIndex(x => x?.TemplateId == templateId);
    if (index > -1) {
      this.noteTemplates?.splice(index, 1);
    }
    this.templateObservers?.forEach((observer) => {
      observer(this.noteTemplates);
    });
  }


  // get all note templates
  getTemplates = (categoryId) => {
    return new Promise((resolve, reject) => {
      this.noteTemplates = [];
      const url = `${String(this.soarConfig.domainUrl)}/clinicalnotes/categories/${String(categoryId)}/templates`;
      this.httpClient.get<SoarResponse<Template>>(url)
        .toPromise()
        .then((res: SoarResponse<Template>) => {
          if (res?.Value) {
            res.Value = this.naturalSort(res?.Value, 'TemplateName');
            this.noteTemplates = cloneDeep(res?.Value);
            resolve(res);
          }
        }, (error) => { // Error
          reject(error);
        })
    });
  }


  // save modified note
  updateNoteTemplate = (template) => {
    return new Promise((resolve, reject) => {
      if (template?.TemplateId) {
        const url = `${String(this.soarConfig.domainUrl)}/clinicalnotes/templates`;
        this.httpClient.put(url, template)
          .toPromise()
          .then((res: SoarResponse<Template>) => {
            if (res?.Value) {
              resolve(res);
            }
          }, (error) => { // Error
            reject(error);
          })
      }
    });
  }


  // save new note template form
  createNoteTemplate = (templateFormDto) => {
    return new Promise((resolve, reject) => {
      const url = `${String(this.soarConfig.domainUrl)}/clinicalnotes/templateforms`;
      this.httpClient.post(url, templateFormDto)
        .toPromise()
        .then((res: SoarResponse<NoteTemplatesViewModel>) => {
          if (res?.Value) {
            const savedTemplate = res?.Value;
            this.addToTemplates(savedTemplate?.Template);
            resolve(res);
          }
        }, error => { // Error
          reject(error);
        })
    });
  }


  // save new note template form
  updateNoteTemplateForm = (templateFormDto) => {
    return new Promise((resolve, reject) => {
      const url = `${String(this.soarConfig.domainUrl)}/clinicalnotes/templateforms/`;
      this.httpClient.put(url, templateFormDto)
        .toPromise()
        .then((res: SoarResponse<CustomFormTemplate>) => {
          if (res?.Value) {
            resolve(res);
          }
        }, (error) => { // Error
          reject(error);
        })
    });
  }

  removeFromCategories = (categoryId) => {
    const index = this.noteCategories?.findIndex(x => x?.CategoryId == categoryId);
    if (index > -1) {
      this.noteCategories?.splice(index, 1);
    }
    this.categoryObservers?.forEach((observer) => {
      observer(this.noteCategories);
    });
  };

  // delete note category
  deleteNoteCategory = (categoryId) => {
    if (this.hasAccess.delete) {
      return new Promise((resolve, reject) => {
        const url = `${String(this.soarConfig.domainUrl)}/clinicalnotes/categories/${String(categoryId)}`;
        this.httpClient.delete(url)
          .toPromise()
          .then(res => {
            this.removeFromCategories(categoryId);
            resolve(res);
          }, error => { // Error            
            reject(error);
          })
      });
    }
  }

  //#endregion

  //#region categories

  // Eslint rule won't work here as this method is calling from two different method which is returning different data set
  // eslint-disable-next-line @typescript-eslint/no-unsafe-return
  naturalSort = (arr, column: string) => {
    let a, b, a1, b1;
    const rx = /(\d+)|(\D+)/g;
    const rd = /\d+/
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return cloneDeep(arr)?.sort((as, bs) => {
      a = as[column]?.toLowerCase()?.match(rx);
      b = bs[column]?.toLowerCase()?.match(rx);
      while (a?.length && b?.length) {
        a1 = a.shift();
        b1 = b.shift();
        if (rd.test(a1) || rd.test(b1)) {
          if (!rd.test(a1)) return 1;
          if (!rd.test(b1)) return -1;
          if (a1 !== b1) return a1 - b1;
        }
        else if (a1 !== b1) return a1 > b1 ? 1 : -1;
      }
      return a?.length - b?.length;
    });
  }

  addToCategories = (category) => {
    const index = this.noteCategories?.findIndex(x => x.CategoryId == category?.CategoryId);
    if (index > -1) {
      this.noteCategories?.splice(index, 1, category);
    } else {
      this.noteCategories?.push(category);
    }
    this.categoryObservers?.forEach((observer) => {
      observer(this.noteCategories);
    });
  }

  // get all note template categories and templates
  CategoriesWithTemplates = () => {
    return new Promise((resolve, reject) => {
      this.noteCategories = [];
      this.noteTemplates = [];
      const url = `${String(this.soarConfig.domainUrl)}/clinicalnotes/categoriesWithTemplates`;
      this.httpClient.get<SoarResponse<CategoriesWithTemplate>>(url)
        .toPromise()
        .then(res => {
          if (res?.Value) {
            res.Value = this.naturalSort(res?.Value, 'CategoryName');
            this.noteCategories = cloneDeep(res?.Value);
            this.noteCategories?.forEach((category) => {
              // signals that the templates have been loaded
              category.$$Loaded = true;
              this.noteTemplates = concat(this.noteTemplates, category?.Templates)
              category.$$hasTemplates = category?.Templates?.length === 0 ? false : true;
            });
            resolve({ Value: this.noteCategories });
          }
        }, (error) => { // Error
          reject(error);
        })
    });
  }

  // get all note template categories
  categories = () => {
    return new Promise((resolve, reject) => {
      this.noteCategories = [];
      const url = `${String(this.soarConfig.domainUrl)}/clinicalnotes/categories`;
      this.httpClient.get<SoarResponse<Categories>>(url)
        .toPromise()
        .then(res => {
          if (res?.Value) {
            res.Value = this.naturalSort(res?.Value, 'CategoryName');
            this.noteCategories = cloneDeep(res?.Value);
            resolve(res);
          }
        }, error => { // Error
          reject(error);
        })
    });
  }

  //#region Custom Form 'Answers' validation
  validateMultipleChoiceFormSectionItem = (formSectionItem) => {
    let hasError = true;
    // Multiselect validation
    if (formSectionItem?.MultiSelectAllow) {
      formSectionItem?.ItemOptions?.forEach((itemOption) => {
        if (itemOption?.Answer && itemOption?.Answer === true) {
          hasError = false;
        }
      })
    } else {
      if (formSectionItem?.FormBankItem?.Answer) {
        hasError = false;
      }
    }
    return hasError;
  }

  validateLinkToothFormSectionItem = (formSectionItem) => {
    let hasError = true;
    if (formSectionItem?.$$activeTeeth?.length > 0) {
      hasError = false;
    }
    return hasError;
  }

  // validate patient note template answers by FormSectionItem
  validateFormSectionItemAnswers = (formSectionItem) => {
    let hasError = true;
    if (formSectionItem) {
      formSectionItem.$$InvalidAnswer = false;
      switch (formSectionItem?.FormItemType) {
        case 2:
        case 8:
        case 9:
          // default validation
          if (formSectionItem?.FormBankItem && formSectionItem?.FormBankItem?.Answer) {
            hasError = false;
          }
          formSectionItem.$$InvalidAnswer = hasError;
          return hasError;
        case 3: // Multiple Choice requires at least one answer
          hasError = this.validateMultipleChoiceFormSectionItem(formSectionItem);
          formSectionItem.$$InvalidAnswer = hasError;
          return hasError;
        case 10: // Link Tooth
          hasError = this.validateLinkToothFormSectionItem(formSectionItem);
          formSectionItem.$$InvalidAnswer = hasError;
          return hasError;
        default:
          break;
      }
    }
    return hasError;
  }

  // validate patient note template answers
  ValidateTemplateAnswers = (customForm) => {
    let isValidForm = true;
    customForm?.FormSections?.forEach((formSection) => {
      formSection?.FormSectionItems?.forEach((formSectionItem) => {
        if (formSectionItem.IsRequired) {
          const hasError = this.validateFormSectionItemAnswers(formSectionItem);
          if (hasError) {
            isValidForm = false;
          }
        }
      })
    })
    return isValidForm;
  }
  //#endregion    

  // save new note template or modified note template
  saveCategory = (category) => {
    return new Promise((resolve, reject) => {
      const url = `${String(this.soarConfig.domainUrl)}/clinicalnotes/categories`;
      if (category?.CategoryId) {
        this.httpClient.put(url, category)
          .toPromise()
          .then((res: SoarResponse<CategoriesWithTemplate>) => {
            const savedCategory: CategoriesWithTemplate = cloneDeep(res?.Value);
            savedCategory.$$Visible = true;
            this.addToCategories(savedCategory);
            resolve(res);
          }, (error) => { // Error
            reject(error);
          })
      } else {
        this.httpClient.post(url, category)
          .toPromise()
          .then((res: SoarResponse<CategoriesWithTemplate>) => {
            const savedCategory: CategoriesWithTemplate = cloneDeep(res?.Value);
            savedCategory.$$Loaded = false;
            savedCategory.$$Visible = true;
            this.addToCategories(savedCategory);
            resolve(res);
          }, (error) => {
            reject(error);
          })
      }
    });
  }

  //#region custom template body
  LoadTemplateBodyCustomForm = (template) => {
    if (this.authViewAccess()) {
      return new Promise((resolve, reject) => {
        const url = `${String(this.soarConfig.domainUrl)}/clinicalnotes/templateforms/${String(template?.TemplateBodyFormId)}`;
        this.httpClient.get<SoarResponse<CustomFormTemplate>>(url)
          .toPromise()
          .then(res => {
            resolve(res);
          }, (error) => { // Error
            reject(error);
          })
      });
    }
  }

  // Throwaway code
  loadCustomOption = (formSectionItem) => {
    if (formSectionItem?.ItemOptions) {
      const customItemOption = {
        IsSelected: true,
        IsVisible: true,
        SequenceNumber: 1,
        BankItemOption: {
          OptionIndex: 1,
          OptionText: '',
          OptionValue: '',
          CustomLabel: true
        }
      }
      formSectionItem?.ItemOptions?.push(customItemOption);
    }
  }

  // load the teethSelectOptions for link tooth type
  loadTeethSelectOptions = (formSectionItem) => {
    this.staticData.TeethDefinitions().then((res) => {
      const teethDefinitions = res.Value;
      const placeholderText = this.localize.getLocalizedString('Select teeth...')
      const teethSelectOptions = {
        placeholder: placeholderText,
        dataSource: teethDefinitions.Teeth,
        dataTextField: "USNumber",
        dataValueField: "USNumber",
        valuePrimitive: true,
        autoBind: true
      };
      formSectionItem.$$activeTeeth = [];
      formSectionItem.$$TeethSelectOptions = {
      };
      formSectionItem.$$TeethSelectOptions = teethSelectOptions;
    });
  }

  convertMultipleSelectFormSectionItem = (formSectionItem) => {
    // add questions
    let content = `<span>${String(escape(formSectionItem?.FormBankItem?.Description))}</span>`;
    // get answers
    let answer = '';
    formSectionItem?.ItemOptions?.forEach((itemOption) => {
      if (itemOption?.Answer === true) {
        answer += itemOption?.BankItemOption?.OptionText;
        answer += ', ';
      }
    });
    // remove trailing comma
    if (answer?.length > 2) {
      answer = answer?.substring(0, answer?.length - 2);
    }
    // add answers to content
    content += `<span ><strong>&nbsp;${String(escape(answer))}</strong></span><br /><br />`;
    return content;
  }

  // formatting Ad-Lib response
  convertAdlibFormSectionItem = (formSectionItem) => {
    // make sure the are ordered by ItemSequenceNumber
    formSectionItem.FormBankItemPromptTexts = this.orderPipe.transform(formSectionItem?.FormBankItemPromptTexts, { sortColumnName: 'ItemSequenceNumber', sortDirection: 1 });
    // TODO rework this to handle new multiple FormBankItemPromptTexts
    // format for question would be prompt _______________ prompt _____________ prompt
    let content = '<span >'
    for (let i = 0; i < formSectionItem?.FormBankItemPromptTexts?.length; i++) {
      content = content += escape(formSectionItem?.FormBankItemPromptTexts[i]?.ItemText);
      // then add answers
      if (i === 0) {
        let answer = '';
        if (formSectionItem?.FormBankItem) {
          answer = formSectionItem?.FormBankItem?.Answer ? formSectionItem?.FormBankItem.Answer : '';
        }
        content = content += `<span><strong>&nbsp;${String(escape(answer))}&nbsp;</strong></span>`;
      }
    }
    content = content += '</span><br /><br />';
    return content;
  }

  convertMultipleChoiceFormSectionItem = (formSectionItem) => {
    // add questions
    let content = `<span>${String(escape(formSectionItem?.FormBankItem?.Description))}</span>`;
    // then add answers to same line in bold, empty string for nulls
    const answer = formSectionItem?.FormBankItem?.Answer ? formSectionItem?.FormBankItem.Answer : ''

    content += `<span><strong>&nbsp;${String(escape(answer))}</strong></span><br /><br />`;
    return content;
  }

  convertYesNoChoiceFormSectionItem = (formSectionItem) => {
    // add questions
    let content = `<span>${String(escape(formSectionItem?.FormBankItem?.Description))}</span>`;
    // then add answers to same line in bold, empty string for nulls
    const answer = formSectionItem?.FormBankItem?.Answer ? formSectionItem?.FormBankItem?.Answer : ''
    content += `<span><strong>&nbsp;${String(escape(answer))}</strong></span><br /><br />`;
    return content;
  }

  convertFormItemTextField = (formSectionItem) => {
    const content = `<span>${String(escape(formSectionItem?.FormItemTextField?.NoteText))}</span><br /><br />`;
    return content;
  }

  convertLinkToothFormSectionItem = (formSectionItem) => {
    // add questions
      let content = `<span>${String(escape(formSectionItem?.FormBankItem?.Description))}</span>`;

    let answer = '';
    formSectionItem?.$$activeTeeth?.forEach((activeTooth) => {
      answer += activeTooth;
      answer += ', ';
    });
    if (answer?.length > 2) {
      answer = answer?.substring(0, answer?.length - 2);
    }
    // add answers to content
    content += `<span><strong>&nbsp;${String(escape(answer))}</strong></span><br /><br />`;
    return content;
  }

  ConvertTemplateToText = (template) => {
    let content = '';
    template?.TemplateBodyCustomForm?.FormSections?.forEach((formSection) => {
      let visibleSectionItems = 0;
      let sectionItems = '';
      formSection?.FormSectionItems?.forEach((formSectionItem) => {
        if (!formSectionItem?.$$Skip) {
          visibleSectionItems++;
          let formSectionItemContent;
          switch (formSectionItem?.FormItemType) {
            case 2:
            case 8:
              formSectionItemContent = this.convertYesNoChoiceFormSectionItem(formSectionItem);
              break;
            case 3:
              if (formSectionItem.MultiSelectAllow === true) {
                formSectionItemContent = this.convertMultipleSelectFormSectionItem(formSectionItem);
              } else {
                formSectionItemContent = this.convertMultipleChoiceFormSectionItem(formSectionItem);
              }
              break;
            case 9:
              formSectionItemContent = this.convertAdlibFormSectionItem(formSectionItem);
              break;
            case 10:
              formSectionItemContent = this.convertLinkToothFormSectionItem(formSectionItem);
              break;
            case 11:
              formSectionItemContent = this.convertFormItemTextField(formSectionItem);
              break;
          }
          sectionItems += formSectionItemContent;
        }
      });
      if (visibleSectionItems > 0) {
        // add section title
        content += `<span><strong>${String(escape(formSection?.Title))}</strong></span><br />`;
        content += sectionItems;
      }
    });
    return content
  }
  //#endregion

  //#region Validation for Note Templates page
  // validate formSectionItem.FormBankItemPromptTexts
  validateItemPromptTextOptions = (itemPromptTextOptions) => {
    let isValid = true;
    let optionCount = 0;
    // all options must have option text
    for (let optionIndex = 0; optionIndex < itemPromptTextOptions?.length; optionIndex++) {
      optionCount += 1;
      if (!itemPromptTextOptions[optionIndex]?.BankItemOption?.OptionText) {
        isValid = false;
      }
    }
    // at least 1 options
    if (optionCount < 1) {
      isValid = false;
    }
    return isValid
  }

  // validate formSectionItem
  validateTemplateFormSectionItem = (formSectionItem) => {
    let isValidForm = true;
    let isValid = true;
    switch (formSectionItem?.FormItemType) {
      case 2:
      case 3:
      case 7:
      case 8:
      case 10:
        isValid = formSectionItem?.FormBankItem?.ItemText;
        if (!isValid) {
          isValidForm = false;
        } else {
          // set formSectionItem.FormBankItem.Description
          formSectionItem.FormBankItem.Description = formSectionItem?.FormBankItem?.ItemText;
        }
        break;
      case 9:
        // validate formSectionItem.FormBankItemPromptTexts
        for (let i = 0; i <= 1; i++) {
          if (isValid) {
            if (!formSectionItem?.FormBankItemPromptTexts[i]?.ItemText) {
              isValid = false;
            } else {
              //validate options
              if (!this.validateItemPromptTextOptions(formSectionItem?.ItemPromptTextsOptions[0])) {
                isValid = true;
              }
            }
          }
        }
        if (!isValid) {
          isValidForm = false;
        }
        // cleanup
        break;
      case 11:
        // validate formSectionItem.FormItemTextField
        isValid = formSectionItem?.FormItemTextField?.NoteText;
        if (!isValid) {
          isValidForm = false;
        }
        break;
    }
    return isValidForm;
  }

  // validate custom form
  ValidateTemplateBodyCustomForm = (customForm) => {
    let isValidForm = true;
    // validate section titles
    customForm?.FormSections?.forEach((formSection) => {
      if (!formSection?.Title) {
        isValidForm = false;
      }
      // validate formSectionItems
      formSection?.FormSectionItems?.forEach((formSectionItem) => {
        if (!this.validateTemplateFormSectionItem(formSectionItem)) {
          isValidForm = false;
        }
      })
    })
    return isValidForm;
  }
  //#endregion

  LoadSelectOptions = (customForm) => {
    customForm?.FormSections?.forEach((formSection) => {
      formSection?.FormSectionItems?.forEach((formSectionItem) => {
        switch (formSectionItem.FormItemType) {
          case 3:
            this.loadCustomOption(formSectionItem);
            break;
          case 10:
            this.loadTeethSelectOptions(formSectionItem);
            break;
          default:
            break;
        }
      })
    })
  }

  SetItemOptions = (customForm) => {
    customForm?.FormSections?.forEach((formSection) => {
      formSection?.FormSectionItems.forEach((formSectionItem) => {
        switch (formSectionItem?.FormItemType) {
          case 3:
          case 9:
            for (let ndx = 0; ndx < formSectionItem?.ItemOptions?.length; ndx++) {
              if (formSectionItem?.ItemOptions[ndx]?.BankItemOption?.OptionText) {
                formSectionItem.ItemOptions[ndx].BankItemOption.OptionValue = formSectionItem?.ItemOptions[ndx]?.BankItemOption?.OptionText;
              } else {
                formSectionItem?.ItemOptions?.splice(ndx, 1);
                ndx--;
              }
            }
            break;
          default:
            break;
        }
      })
    })
  }
  //#endregion

  // Set Active Category  
  SetActiveTemplateCategory = (category) => {
    this.ActiveTemplateCategory = category;
  }

  SetActiveNoteTemplate = (template: NoteTemplatesViewModel) => {
    this.ActiveNoteTemplate = new NoteTemplatesViewModel();
    this.ActiveNoteTemplate = template;
  }

  // Set CurrentOperation i.e edit or copy to identify edit or copy 
  SetCurrentOperation = (template) => {
    this.CurrentOperation = template;
  }

  // DataChanged
  setTemplateDataChanged = (dataHasChanged) => {
    this.TemplateDataChanged = dataHasChanged;
    return this.TemplateDataChanged;
  }

  // Expand/Collapse Category
  ExpandOrCollapseCategory = (category) => {
    category.ntExpand = !category?.ntExpand;
    category.addingNewTemplate = false;
    if (category?.ntExpand) {
      this.SetActiveTemplateCategory(category);
    } else {
      this.SetActiveTemplateCategory(null);
    }
  }

  //Cancel Template Edit/Create
  CloseTemplateHeader = (category) => {
    category.addingNewTemplate = false;
  }

  deleteNoteTemplate = (templateId) => {
    if (this.hasAccess.delete) {
      return new Promise((resolve, reject) => {
        const url = `${String(this.soarConfig.domainUrl)}/clinicalnotes/templateforms/${String(templateId)}`;
        this.httpClient.delete(url)
          .toPromise()
          .then(res => {
            this.removeFromTemplates(templateId);
            resolve(res);
          }, error => { // Error
            reject(error);
          })
      });
    }
  }

  observeCategories = (observer) => {
    this.categoryObservers.push(observer);
  }
}