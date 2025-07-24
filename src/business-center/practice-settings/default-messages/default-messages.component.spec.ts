import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { DefaultMessagesComponent } from './default-messages.component';
import { BillingMessagesService } from './billing-messages.service';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { CheckRoleAccessDirective } from 'src/@shared/directives/check-role-access.directive';

let mockdefaultMessagesDto;
let mocklocalize;
let mockBillingMessagesService;
let patSecurityService;
let mockToastrFactory;
let retVal = false;
let mockModalFactoryService;

describe('DefaultMessagesComponent', () => {
    let component: DefaultMessagesComponent;
    let fixture: ComponentFixture<DefaultMessagesComponent>;

    beforeEach(() => {
        mockdefaultMessagesDto = [{
            DataTag: "AAAAAAAMyYM=",
            DateModified: "2022-08-12T12:31:16.2391585",
            InvoiceMessage: "testing",
            UserModified: "a162c864-8f50-4e84-8942-7194bc8070cf"
        }]

        mocklocalize = {
            getLocalizedString: () => 'translated text'
        }

        mockBillingMessagesService = {
            get: jasmine.createSpy().and.returnValue({
                then: (success, error) => {
                    success({ Value: mockdefaultMessagesDto });
                    error({})
                }
            }),
            save: jasmine.createSpy().and.returnValue({
                then: (success, error) => {
                    success({ Value: mockdefaultMessagesDto });
                    error({})
                }
            }),
            update: jasmine.createSpy().and.returnValue({
                then: (success, error) => {
                    success({ Value: mockdefaultMessagesDto });
                    error({})
                }
            }),
        }

        patSecurityService = {
            IsAuthorizedByAbbreviation: jasmine.createSpy("patSecurityService.IsAuthorizedByAbbreviation").and.returnValue(false)
        };

        mockToastrFactory = {
            success: jasmine.createSpy('toastrFactory.success'),
            error: jasmine.createSpy('toastrFactory.error')
        };

        retVal = false;
        mockModalFactoryService = {
            WarningModal: jasmine.createSpy('ModalFactory.WarningModal')
                .and.callFake(() => {
                    return {
                        then() { return retVal }
                    };
                })
        };

        TestBed.configureTestingModule({
            declarations: [DefaultMessagesComponent, CheckRoleAccessDirective],
            imports: [TranslateModule.forRoot(), FormsModule, ReactiveFormsModule, HttpClientTestingModule],
            providers: [
                { provide: 'localize', useValue: mocklocalize },
                { provide: 'ModalFactory', useValue: mockModalFactoryService },
                { provide: 'patSecurityService', useValue: patSecurityService },
                { provide: 'toastrFactory', useValue: mockToastrFactory },
                { provide: BillingMessagesService, useValue: mockBillingMessagesService },
                { provide: 'SoarConfig', useValue: {} },
                {
                    provide: 'AuthZService', useValue: {
                        checkAuthZ: () => true,
                        generateTitleMessage: () => 'test'
                    }
                }
            ],
            schemas: [CUSTOM_ELEMENTS_SCHEMA]
        })
            .compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(DefaultMessagesComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    describe('ngOnInit -->', () => {
        it('should call get function', () => {
            component.get = jasmine.createSpy();
            component.ngOnInit();
            expect(component.get).toHaveBeenCalled();
        });

        it('should call getPageNavigation function', () => {
            component.getPageNavigation = jasmine.createSpy();
            component.ngOnInit();
            expect(component.getPageNavigation).toHaveBeenCalled();
        });

        it('hasChanges value should be false', () => {
            expect(component.hasChanges).toBe(false);
        });

    })

    describe('getPageNavigation function -->', () => {
        it('should set the breadCrumbs property', () => {
            component.getPageNavigation();
            expect(component.breadCrumbs).not.toBeNull();
            expect(component.dataForCrudOperation.BreadCrumbs).toBe(component.breadCrumbs);
        });
    })

    describe('updateDtos function -->', () => {
        it('InvoiceMessage should null', () => {
            component.updateDtos(null);
            expect(component.defaultMessagesDto.InvoiceMessage).toBe('');
            expect(component.defaultMessagesDtoBackup.InvoiceMessage).toBe('');
        });

        it('InvoiceMessage should not null', () => {
            component.updateDtos({ InvoiceMessage: 'some_value' });
            expect(component.defaultMessagesDto.InvoiceMessage).toBe('some_value');
            expect(component.defaultMessagesDtoBackup.InvoiceMessage).toBe('some_value');
        });

        it('should call onValueChanged', () => {
            spyOn(component, 'onValueChanged')
                .and.returnValue({ then: () => { return true } });
            component.updateDtos({ InvoiceMessage: 'some_value' });
            expect(component.onValueChanged).toHaveBeenCalledWith('some_value')
        });
    })

    describe('onValueChanged function -> ', () => {
        it('should set dynamicAmfa based on state of message', () => {
            component.defaultMessagesDto.InvoiceMessage = 'message 1';
            component.defaultMessagesDtoBackup.InvoiceMessage = 'message 2';
            component.onValueChanged(component.defaultMessagesDto.InvoiceMessage);
            expect(component.hasChanges).toBe(true);
        });

        it('should set dynamicAmfa based on state of message', () => {
            component.defaultMessagesDto.DateModified = null;
            component.onValueChanged(component.defaultMessagesDto.InvoiceMessage);
            expect(component.dynamicAmfa).toBe('soar-biz-bilmsg-add');
        });

        it('should set dynamicAmfa based on state of message', () => {
            component.defaultMessagesDto.DateModified = 'a date';
            component.onValueChanged(component.defaultMessagesDto.InvoiceMessage);
            expect(component.dynamicAmfa).toBe('soar-biz-bilmsg-edit');
        });
    })

    describe('changePath function -> ', () => {
        it('should call', () => {
            expect(component.changePath).toBeTruthy();
        });
    })

    describe('get function -> ', () => {
        it('should not call getMessages when user is not authorized', () => {
            patSecurityService.IsAuthorizedByAbbreviation = jasmine.createSpy().and.returnValue(false);
            component.get();
            expect(mockBillingMessagesService.get).not.toHaveBeenCalled();
        });

        it('should call getMessages when user is authorized', () => {
            component.updateDtos = jasmine.createSpy();
            patSecurityService.IsAuthorizedByAbbreviation = jasmine.createSpy().and.returnValue(true);
            component.get();
            expect(mockBillingMessagesService.get).toHaveBeenCalled();
            expect(component.updateDtos).toHaveBeenCalled();
        });
    })

    describe('showWarningModal function -> ', () => {
        it('should call modalFactory.WarningModal', () => {
            component.showWarningModal('test_path');
            expect(mockModalFactoryService.WarningModal).toHaveBeenCalled();
        });
    })

    describe('save function -> ', () => {
        it('should call createMessage when user not authorized and date is null', () => {
            component.defaultMessagesDto.DateModified = null;
            component.changePath = jasmine.createSpy();
            patSecurityService.IsAuthorizedByAbbreviation = jasmine.createSpy().and.returnValue(false);
            component.save();
            expect(mockBillingMessagesService.save).not.toHaveBeenCalled();
        });

        it('should call createMessage when user is authorized and date is null', () => {
            component.defaultMessagesDto.DateModified = null;
            component.changePath = jasmine.createSpy();
            patSecurityService.IsAuthorizedByAbbreviation = jasmine.createSpy().and.returnValue(true);
            component.save();
            expect(mockToastrFactory.success).toHaveBeenCalled();
            expect(mockBillingMessagesService.save).toHaveBeenCalled();
        });

        it('should call createMessage when user not authorized and date is not null', () => {
            component.defaultMessagesDto.DateModified = 'a date';
            patSecurityService.IsAuthorizedByAbbreviation = jasmine.createSpy().and.returnValue(false);
            component.save();
            expect(mockBillingMessagesService.update).not.toHaveBeenCalled();
        });

        it('should call createMessage when user is authorized and date is not null', () => {
            component.defaultMessagesDto.DateModified = 'a date';
            patSecurityService.IsAuthorizedByAbbreviation = jasmine.createSpy().and.returnValue(true);
            component.changePath = jasmine.createSpy();
            component.save();
            expect(mockToastrFactory.success).toHaveBeenCalled();
            expect(mockBillingMessagesService.update).toHaveBeenCalled();
        });

        it('should call createMessage when user is authorized and date is null', () => {
            patSecurityService.IsAuthorizedByAbbreviation = jasmine.createSpy().and.returnValue(true);
            component.changePath = jasmine.createSpy();
            component.defaultMessagesDto.DateModified = 'a date';
            component.save();
            expect(mockToastrFactory.success).toHaveBeenCalled();
            expect(component.changePath).toHaveBeenCalled();
        });

        it('should call createMessage when user is authorized and date is null', () => {
            patSecurityService.IsAuthorizedByAbbreviation = jasmine.createSpy().and.returnValue(true);
            component.defaultMessagesDto.DateModified = null;
            component.changePath = jasmine.createSpy();
            component.save();
            expect(mockToastrFactory.success).toHaveBeenCalled();
            expect(component.changePath).toHaveBeenCalled();
        });
    })

    describe('cancel function -> ', () => {
        it('should call showWarningModal', () => {
            spyOn(component, 'showWarningModal')
            component.hasChanges = true;
            component.cancel('');
            expect(component.showWarningModal).toHaveBeenCalled();
        });

        it('should call changePath', () => {
            spyOn(component, 'changePath')
            component.hasChanges = false;
            component.cancel('');
            expect(component.changePath).toHaveBeenCalled();
        });
    })

    describe('resetData function -> ', () => {
        it('should call updateDtos', () => {
            spyOn(component, 'updateDtos')
            component.resetData();
            expect(component.updateDtos).toHaveBeenCalled();
        });
    })
});
