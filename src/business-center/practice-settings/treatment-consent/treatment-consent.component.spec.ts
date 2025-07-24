import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DebugElement } from '@angular/core';
import { By } from '@angular/platform-browser';
import { TranslateModule } from '@ngx-translate/core';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { FormsModule } from '@angular/forms';
import cloneDeep from 'lodash/cloneDeep';
import { HttpClient } from '@angular/common/http';

import { TreatmentConsentComponent } from './treatment-consent.component';
import { ConsentMessageComponent } from 'src/@shared/components/consent-message/consent-message.component';
import { TreatmentConsentModel } from '../models/treatment-consent.model';
import { TreatmentConsentService } from 'src/@shared/providers/treatment-consent.service';


describe('TreatmentConsentComponent', () => {
  let component: TreatmentConsentComponent;
  let fixture: ComponentFixture<TreatmentConsentComponent>;
  let de: DebugElement;
 let treatmentConsentService:TreatmentConsentService;

  //#region mocks
  const mockTreatmentConsentTextDto: TreatmentConsentModel = {
    DataTag: "AAAAAAAV23E",
    DateModified: "2022-10-21T03:11:16.2419421",
    Text: "Sample Text\npgwzqfsvhgzpwepcpjpxqvkijptcmbrldjvcrayvoahexbvefmatmoafqhixpxmoiqvgvrmqxwcwnelmxaubeaieiiedobytqjkwmmtsjabnxbmfyyzntmacpttdbgukgoafnyevmimebbocjjatvzgeythwhgztpvfxckezsuptubcgoxuitlfiejloicuuocplvgxxxuunspkyodjqugjdytgoaaxjkbkphmkamafdvbgkyifushvjjnmbciiosxrplnmwbnzkhcrwvoswxndmtsihbzwpkrkmbtrvbxhitfuceadalbbbpwfmxgrlelqvzdblhdxtkplxeasgjdnhpglbtvteldgveblmofqfrpcxibuqkevrtjksdbfljmaxnonhrmtnobpvczrlwmxfxwxgggpvbdyukxeccwpetebffssddddddddddjs",
    UserModified: "a162c864-8f50-4e84-8942-7194bc8070cf",
  };

  const treatmentConsentMsg = { Value: { Text: 'i am the treatment msg' } };
  const httpClientMock = jasmine.createSpyObj('HttpClient', ['post', 'get', 'put', 'delete']);
  const mockLocalizeService = {
    getLocalizedString: () => 'translated text'
  };
  let localize;

  const mockTreatmentConsentService = {
    getConsent: jasmine.createSpy('treatmentConsentService.getConsent').and.returnValue({mockTreatmentConsentTextDto}),

    createConsent: jasmine.createSpy('treatmentConsentService.createConsent').and.returnValue({mockTreatmentConsentTextDto}),
    deleteConsent: jasmine.createSpy('treatmentConsentService.deleteConsent').and.returnValue({
      then: () => mockTreatmentConsentTextDto
    }),
    updateConsent: jasmine.createSpy('treatmentConsentService.updateConsent').and.returnValue({
      then: () => mockTreatmentConsentTextDto
    }),
  }
  const mockToastrFactory = {
    success: jasmine.createSpy('toastrFactory.success'),
    error: jasmine.createSpy('toastrFactory.error')
  };
  let mockPatSecurityService = {
    IsAuthorizedByAbbreviation: jasmine.createSpy('patSecurityService.IsAuthorizedByAbbreviation').and.returnValue(true)
  };
  const mockModalFactoryService = {
    CancelModal: jasmine
      .createSpy('ModalFactory.CancelModal')
      .and.returnValue({ then: () => { } }),
    WarningModal: jasmine.createSpy('ModalFactory.WarningModal').and.returnValue({
      then: (success, failure) => {
        success(true);
      }
    })
  };
  //End region

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        TranslateModule.forRoot(),
        FormsModule
      ],
      declarations: [TreatmentConsentComponent, ConsentMessageComponent],
      providers: [
        { provide: 'localize', useValue: mockLocalizeService },
        { provide: 'TreatmentConsentService', useValue: mockTreatmentConsentService },
        { provide: 'toastrFactory', useValue: mockToastrFactory },
        { provide: 'patSecurityService', useValue: mockPatSecurityService },
        { provide: 'ModalFactory', useValue: mockModalFactoryService },
        { provide: HttpClient, useValue: httpClientMock },
        { provide: 'SoarConfig', useValue: {} },

      ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    })
      .compileComponents();
  });
  beforeEach(() => {
    fixture = TestBed.createComponent(TreatmentConsentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
    localize = TestBed.get('localize');
    treatmentConsentService = TestBed.get('TreatmentConsentService');
    de = fixture.debugElement;
    component.treatmentConsentTextDto = mockTreatmentConsentTextDto;
    component.treatmentConsentTextDtoBackup = mockTreatmentConsentTextDto;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('ngOnInit ->', () => {
    it('should call get()', () => {
      spyOn(component, 'get');
      component.ngOnInit();
      expect(component.get).toHaveBeenCalled();
    });
  });
 
  describe('get ->', () => {
    it('should call treatmentConsentService.getConsent() if IsAuthorizedByAbbreviation returns true', () => {
      spyOn(component, 'get').and.returnValue({ then: () => { return true } });
      component.get();
      const val = mockPatSecurityService.IsAuthorizedByAbbreviation("soar-biz-tpmsg-view");

      expect(val).toBe(true);
      expect(component.get).toHaveBeenCalled();
   
    });
  });

  describe('updateDtos function -> ', () => {
    it('should set treatmentConsentTextDto and treatmentConsentTextDtoBackup if value is not null', () => {
      component.updateDtos(mockTreatmentConsentTextDto);

      expect(component.treatmentConsentTextDto).toEqual(mockTreatmentConsentTextDto);
      const treatmentConsentTextDtoBackup = cloneDeep(component.treatmentConsentTextDto);
      expect(component.treatmentConsentTextDtoBackup).toEqual(treatmentConsentTextDtoBackup);
    });

    it('should set treatmentConsentTextDto to be { Text: "" } and treatmentConsentTextDtoBackup to be treatmentConsentTextDto', () => {
      component.updateDtos(null);

      expect(component.treatmentConsentTextDto).toEqual({ Text: "" });
      const treatmentConsentTextDtoBackup = cloneDeep(component.treatmentConsentTextDto);
      expect(component.treatmentConsentTextDtoBackup).toEqual({ Text: "" });
    });

  });

  describe('if consent message is saved ->', () => {
    it('should call saveChanges method', () => {
      spyOn(component, 'saveChanges');
      const consentMessage = de.query(By.directive(ConsentMessageComponent));
      const cmp = consentMessage.componentInstance;
      cmp.save.emit();
      const val = mockPatSecurityService.IsAuthorizedByAbbreviation('soar-biz-tpmsg-add')
      expect(val).toBe(true);
      expect(component.saveChanges).toHaveBeenCalled();
    });
  });
  describe('if consent message is changed ->', () => {
    it('should call treatmentConsentMessageChange method and set hasChanges to true if treatmentConsentTextDto.Text has changed', () => {
      spyOn(component, 'treatmentConsentMessageChange');
      const consentMessage = de.query(By.directive(ConsentMessageComponent));
      const cmp = consentMessage.componentInstance;
      cmp.consentMessageChange.emit('new Text');
      expect(component.treatmentConsentMessageChange).toHaveBeenCalledWith('new Text');;
    });
    it('should set hasChanges to true if treatmentConsentTextDto.Text has changed', () => {
      component.updateDtos(mockTreatmentConsentTextDto);
      component.treatmentConsentTextDtoBackup.Text = 'test';
      component.treatmentConsentTextDto.Text = 'new Text';
      component.hasChanges = true;
      expect(component.hasChanges).toBe(true);
    });
    it('should set hasChanges to false if scope.treatmentConsentTextDto.Text hasn\'t changed', () => {
      component.updateDtos(mockTreatmentConsentTextDto);
      component.treatmentConsentTextDtoBackup.Text = 'test';
      component.treatmentConsentTextDto.Text = 'new Text';
      expect(component.hasChanges).toBe(false);
    });
    it('should set dynamicAmfa based on state of message', () => {
      component.updateDtos(mockTreatmentConsentTextDto);
      component.treatmentConsentTextDto.DateModified = null;
      component.dynamicAmfa = 'soar-biz-tpmsg-add';
      expect(component.dynamicAmfa).toBe('soar-biz-tpmsg-add');
      component.treatmentConsentTextDto.DateModified = 'a date';
      component.dynamicAmfa = 'soar-biz-tpmsg-edit';
      expect(component.dynamicAmfa).toBe('soar-biz-tpmsg-edit');
    });
  });
  describe('getTreatmentConsentFailure function -> ', () => {
    it('should be call toastrFactory ', () => {
      component.getTreatmentConsentFailure();
      spyOn(localize, 'getLocalizedString').and.returnValue('{0} {1}');
      expect(mockToastrFactory.error).toHaveBeenCalled();
    });
  });
  describe('cancel function -> ', () => {
    it('should call showWarningModal method if hasChanges is true', () => {
      spyOn(component, 'showWarningModal');
      component.hasChanges = true;
      component.cancel();

      expect(component.showWarningModal).toHaveBeenCalled();
    });

    it('should call goToPracticeSettings method if hasChanges is false', () => {
      spyOn(component, 'goToPracticeSettings');
      component.hasChanges = false;
      component.cancel();

      expect(component.goToPracticeSettings).toHaveBeenCalled();
    });
  })
  describe('resetData function -> ', () => {
    it('should be call updateDtos', () => {
      spyOn(component, 'updateDtos')
      component.resetData();
      expect(component.updateDtos).toHaveBeenCalledWith(component.treatmentConsentTextDtoBackup);
    });
  });

  describe('showWarningModal function -> ', () => {
    it('should call modalfactory', () => {
      spyOn(component, 'resetData');
      spyOn(component, 'goToPracticeSettings');
      component.showWarningModal();

      expect(component.resetData).toHaveBeenCalled();
      expect(component.goToPracticeSettings).toHaveBeenCalled()
    }); 
  });

  describe('treatmentConsentMessageChange function -> ', () => {

    it('should call treatmentConsentMessageChange method when there is any change in text area', () => {
      spyOn(component, 'treatmentConsentMessageChange');
      const consentMessageComponent = de.query(By.directive(ConsentMessageComponent));
      const cmp = consentMessageComponent.componentInstance;
      cmp.consentMessageChange.emit('text');

      expect(component.treatmentConsentMessageChange).toHaveBeenCalled();
    });

    it('should set dynamicAmfa to add if there is no DateModified', () => {
      component.treatmentConsentTextDtoBackup = mockTreatmentConsentTextDto;
      component.treatmentConsentTextDto.DateModified = null;
      const consentMessage = 'Test'.trim();

      component.treatmentConsentMessageChange(consentMessage);

      fixture.detectChanges();

      fixture.whenStable().then(() => {
        expect(component.treatmentConsentTextDtoBackup.Text).toEqual(mockTreatmentConsentTextDto.Text);
        console.log(component.treatmentConsentTextDtoBackup.Text)
        expect(component.treatmentConsentTextDto.Text).toBe(consentMessage);
        console.log(component.treatmentConsentTextDto.Text)
        expect(component.hasChanges).toEqual(false);

        expect(component.dynamicAmfa).toBe('soar-biz-tpmsg-add');
      });

    });

    it('should set dynamicAmfa to add if there is no DateModified', () => {
      component.treatmentConsentTextDtoBackup = mockTreatmentConsentTextDto;
      component.treatmentConsentTextDto.DateModified = "2022 - 10 - 21T03: 11: 16.2419421";
      const consentMessage = 'Test'.trim();

      component.treatmentConsentMessageChange(consentMessage);

      fixture.detectChanges();

      fixture.whenStable().then(() => {
        expect(component.treatmentConsentTextDtoBackup.Text).toEqual(mockTreatmentConsentTextDto.Text);
        console.log(component.treatmentConsentTextDtoBackup.Text)
        expect(component.treatmentConsentTextDto.Text).toBe(consentMessage);
        console.log(component.treatmentConsentTextDto.Text)
        expect(component.hasChanges).toEqual(false);

        expect(component.dynamicAmfa).toBe('soar-biz-tpmsg-edit');
      });

    });

  });
  describe('save function -> ', () => {
    it('should add if new consent message is added', () => {
      spyOn(component, 'saveChanges').and.callThrough();
      component.treatmentConsentTextDto.DateModified = null;
      component.saveChanges();
      expect(component.saveChanges).toHaveBeenCalled();


    });

    it('should add if consent message is edited', () => {
      spyOn(component, 'saveChanges').and.callThrough();
      spyOn(component, 'goToPracticeSettings').and.callThrough();
      component.treatmentConsentTextDto.DateModified = "2022 - 10 - 21T03: 11: 16.2419421";
      mockPatSecurityService = {
        IsAuthorizedByAbbreviation: jasmine.createSpy('patSecurityService.IsAuthorizedByAbbreviation').and.returnValue(false)
      };
      component.saveChanges();

      expect(component.saveChanges).toHaveBeenCalled();

    });

  });

});