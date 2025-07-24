import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DebugElement, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { By } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';
import { InformedConsentSetupComponent } from './informed-consent-setup.component';
import { ConsentMessageComponent } from 'src/@shared/components/consent-message/consent-message.component';
import { HttpClient } from '@angular/common/http';
import { InformedConsentMessageService } from 'src/@shared/providers/informed-consent-message.service';
import cloneDeep from 'lodash/cloneDeep';

describe('InformationConsentSetupComponent', () => {
  let component: InformedConsentSetupComponent;
  let fixture: ComponentFixture<InformedConsentSetupComponent>;
  const retValue = { $promise: { then: jasmine.createSpy() } };
  let de: DebugElement;
  //#region mocks
  const informedConsentResourceMock = {
    DataTag: 'AAAAAB1VfPo=',
    DateModified: '2023-06-16T11:16:25.8397654',
    Text: 'SRTest1 Fuse Informed Consent Message_edited on 10   j',
    UserModified: '46036023-d22b-4b0e-a0f6-c0120e19b7e0',
  };
  const accessMock = { Create: false, Delete: false, Edit: true, View: true };
  const mockInformedConsentMessageService: any = {
    access: jasmine.createSpy().and.callFake(() => accessMock),
    Save: jasmine.createSpy().and.callFake(() => {
      return new Promise((resolve, reject) => {
        resolve({ Value: informedConsentResourceMock }), reject({});
      });
    }),
    getInformedConsentMessage: jasmine.createSpy().and.callFake(() => {
      return new Promise((resolve, reject) => {
        resolve({ Value: informedConsentResourceMock }), reject({});
      });
    }),
  };
  const mockToastrFactory = {
    success: jasmine.createSpy('toastrFactory.success'),
    error: jasmine.createSpy('toastrFactory.error'),
  };
  let mockPatSecurityService = {
    generateMessage: jasmine.createSpy().and.returnValue(''),
    IsAuthorizedByAbbreviation: jasmine
      .createSpy('patSecurityService.IsAuthorizedByAbbreviation')
      .and.returnValue(true),
  };
  const mockModalFactoryService = {
    CancelModal: jasmine
      .createSpy('ModalFactory.CancelModal')
      .and.returnValue({ then: () => {} }),
  };
  const mockLocalizeService: any = {
    getLocalizedString: () => 'translated text',
  };
  let mocklocation: any = {
    path: jasmine.createSpy().and.returnValue('/'),
  };
  const mockStyles: any = {
    wrapperClass: 'informedConsentMessage',
    headerClass: 'informedConsentMessage__header',
    titleClass: 'informedConsentMessage__title',
    bodyClass: 'informedConsentMessage__body',
    textareaClass: 'informedConsentMessage__text',
    textareaId: 'informedConsentText',
    textareaName: 'informedConsentMessage',
    cancelButtonId: 'btnCancelInformedConsentMessage',
    saveButtonId: 'btnSaveInformedConsentMessage',
  };

  const httpClientMock = jasmine.createSpyObj('HttpClient', [
    'post',
    'get',
    'put',
    'delete',
  ]);
  //#endregion
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TranslateModule.forRoot(), FormsModule],
      declarations: [InformedConsentSetupComponent, ConsentMessageComponent],
      providers: [
        { provide: 'localize', useValue: mockLocalizeService },
        { provide: '$location', useValue: mocklocation },
        {
          provide: InformedConsentMessageService,
          useValue: mockInformedConsentMessageService,
        },
        { provide: 'toastrFactory', useValue: mockToastrFactory },
        { provide: 'patSecurityService', useValue: mockPatSecurityService },
        { provide: 'ModalFactory', useValue: mockModalFactoryService },
        { provide: HttpClient, useValue: httpClientMock },
        { provide: 'SoarConfig', useValue: {} },
      ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    }).compileComponents();
  });
  beforeEach(() => {
    fixture = TestBed.createComponent(InformedConsentSetupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
    de = fixture.debugElement;
  });
  it('should create', () => {
    expect(component).toBeTruthy();
  });
  describe('ngOnInit ->', () => {
    it('should call checkAccess, getPageNavigation and loadInformedConsentMessage methods', () => {
      spyOn(component, 'checkAccess');
      spyOn(component, 'loadInformedConsentMessage');
      component.ngOnInit();
      expect(component.checkAccess).toHaveBeenCalled();
      expect(component.loadInformedConsentMessage).toHaveBeenCalled();
    });
  });
  describe('check access method  ->', () => {
    it('should show error and redirect to practice settings if view access is false', () => {
      accessMock.View = true;
      component.access.view = accessMock.View;
      component.checkAccess();
      expect(component.access.view).toEqual(true);
      mockToastrFactory.error(
        mockPatSecurityService.generateMessage('soar-biz-icmsg-view'),
        'Not Authorized'
      );
    });
    it('should navigate back and show toastr message if user does not have view access', () => {
      component.access.View = false;
      mockPatSecurityService.IsAuthorizedByAbbreviation = jasmine
        .createSpy('patSecurityService.IsAuthorizedByAbbreviation')
        .and.returnValue(false);
      component.checkAccess();
      fixture.detectChanges();
      fixture.whenStable().then(() => {
        expect(mockToastrFactory.error).toHaveBeenCalledWith(
          mockPatSecurityService.generateMessage('soar-biz-icmsg-view'),
          'Not Authorized'
        );
      });
    });
  });
  /*   describe('if dataHasChanged is false ->', () => {
      it('should call cancelChanges method', () => {
        component.dataHasChanged = false;
        fixture.detectChanges();
        fixture.whenStable().then(() => {
          expect(component.cancelChanges).toHaveBeenCalled();
        });
      });
     });*/
  describe('if consent message is changed ->', () => {
    it('should call informedConsentMessageChange with whatever change is emitted from consent message component', () => {
      spyOn(component, 'informedConsentMessageChange');
      const consentMessage = de.query(By.directive(ConsentMessageComponent));
      const cmp = consentMessage.componentInstance;
      cmp.consentMessageChange.emit('Test ..');
      expect(component.informedConsentMessageChange).toHaveBeenCalledWith(
        'Test ..'
      );
    });
  });
  describe('if consent message change is saved ->', () => {
    it('should call saveInformedConsentMessage method', () => {
      spyOn(component, 'saveInformedConsentMessage');
      const consentMessage = de.query(By.directive(ConsentMessageComponent));
      const cmp = consentMessage.componentInstance;
      cmp.save.emit();
      expect(component.saveInformedConsentMessage).toHaveBeenCalled();
    });
  });
  //describe('save informed consenent message method  ->', () => {
  //  it('should show error and redirect to practice settings if view access is false', () => {
  //    accessMock.Edit = true;
  //    component.access.edit = accessMock.Edit;
  //    component.saveInformedConsentMessage();
  //    expect(component.access.edit).toEqual(true);
  //  });
  //  it('should navigate back and show toastr message if user does not have view access', () => {
  //    component.access.Edit = false;
  //    mockPatSecurityService.IsAuthorizedByAbbreviation = jasmine.createSpy('patSecurityService.IsAuthorizedByAbbreviation').and.returnValue(false);
  //    component.saveInformedConsentMessage();
  //    fixture.detectChanges();
  //    fixture.whenStable().then((retValue) => {
  //      expect(component.informedConsentMessage).toHaveBeenCalledWith(retValue);
  //    });
  //  });
  //});
  describe('if consent message change is cancelled ->', () => {
    it('should call cancelChanges method', () => {
      spyOn(component, 'cancelChanges');
      const consentMessage = de.query(By.directive(ConsentMessageComponent));
      const cmp = consentMessage.componentInstance;
      cmp.cancel.emit();
      expect(component.cancelChanges).toHaveBeenCalled();
      expect(component.dataHasChanged).toBe(false);
    });
  });
  describe('cancelChanges method  ->', () => {
    it('should cancel modal if datahaschanges is true', () => {
      component.dataHasChanged = true;
      component.cancelChanges();
      expect(component.dataHasChanged).toEqual(true);
    });
    it('should close modal ', () => {
      /*      component.dataHasChanged = true;
            mockPatSecurityService.IsAuthorizedByAbbreviation = jasmine.createSpy('patSecurityService.IsAuthorizedByAbbreviation').and.returnValue(true);
            component.cancelChanges();
            fixture.detectChanges();
            fixture.whenStable().then(() => {
              expect(mockModalFactoryService.CancelModal).toHaveBeenCalled();
              expect(component.cancel).toHaveBeenCalled();
            });*/
    });
  });
  //describe('cancel method  ->', () => {
  //  it('should set dataHasChanged to false and redirect to practice setting', () => {
  //    component.dataHasChanged = false;
  //    fixture.detectChanges();
  //    const buttonid = mockStyles.cancelbuttonid;
  //    const buttonElement = de.query(By.css('#buttonid'));
  //    buttonElement.triggerEventHandler('click', null);
  //    fixture.detectChanges();
  //    fixture.whenStable().then(() => {
  //      expect(component.dataHasChanged).toBe(true);
  //      expect(component.cancel).toHaveBeenCalled();
  //    });
  //  });
  //});
  describe('informedConsentMessageChange function -> ', () => {
    it('should be call resetData, goToPracticeSettings', async () => {
      const consentMessage = de.query(By.directive(ConsentMessageComponent));
      const cmp = consentMessage.componentInstance;
      cmp.consentMessageChange.emit('text');
      component.informedConsentMessage = cloneDeep(informedConsentResourceMock);
      component.informedConsentMessageChange('text');
      expect(component.dataHasChanged).toBe(true);
    });
  });
  describe('cancelChanges function -> ', () => {
    it('should be datachange value false', () => {
      spyOn(component, 'cancel');
      component.dataHasChanged = false;
      component.cancelChanges();
      expect(component.cancel).toHaveBeenCalled();
    });
    describe('saveInformedConsentMessage function -> ', () => {
      it('should be datachange value false', () => {
        component.access.Edit = false;
        component.saveInformedConsentMessage();
      });
    });
  });
});
