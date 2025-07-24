import { HttpClient } from '@angular/common/http';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { DialogService } from '@progress/kendo-angular-dialog';
import { BillingMessagesService } from '../billing-messages.service';
import { AccountStatementBillingMessageCrudComponent } from './account-statement-billing-message-crud/account-statement-billing-message-crud.component';
import { AccountStatementBillingMessageComponent } from './account-statement-billing-message.component';
import { AccountStatementMessagesService } from './account-statement-messages.service';
import { NO_ERRORS_SCHEMA } from '@angular/core';

let message;

describe('AccountStatementBillingMessageComponent', () => {
    let component: AccountStatementBillingMessageComponent;
    let fixture: ComponentFixture<AccountStatementBillingMessageComponent>;
    let crudComponent: AccountStatementBillingMessageCrudComponent;
    let crudFixture: ComponentFixture<AccountStatementBillingMessageCrudComponent>;

    let mockBillingMessagesService;
    let accountStatementMessagesService;
    let mocklocalize;
    let mockModalFactoryService;
    let mockToastrFactory;

    beforeEach(() => {
        message = {
            Name: 'name', Message: 'message',
            AccountStatementMessageId: '10',
            DataTag: 'AAAAAAAMz40=',
            DateModified: new Date(),
            UserModified: 'a162c864-8f50-4e84-8942-7194bc8070cf'
        };

        mockBillingMessagesService = {
            deleteMessage: (dlMessage) => {
                return {
                    then: (res, error) => {
                        res({ Value: dlMessage }),
                            error({

                            })
                    }
                }
            }
        }
        accountStatementMessagesService = {
            all: jasmine.createSpy().and.returnValue({
                then: (success, error) => {
                    success({ Value: message });
                    error({})
                }
            }),
            get: jasmine.createSpy('accountStatementMessagesService.get').and.returnValue({ $promise: { then: () => { } } })
        }
        mocklocalize = {
            getLocalizedString: () => 'translated text'
        }
        mockModalFactoryService = {
            CancelModal: jasmine.createSpy('ModalFactory.CancelModal').and.returnValue({ then: () => { } }),
            ConfirmModal: jasmine.createSpy('ModalFactory.ConfirmModal').and.returnValue({
                then: (res) => {
                    res({ Value: [] })
                }
            })
        };

        mockToastrFactory = {
            success: jasmine.createSpy('toastrFactory.success'),
            error: jasmine.createSpy('toastrFactory.error')
        };

        TestBed.configureTestingModule({
            declarations: [AccountStatementBillingMessageComponent],
            imports: [TranslateModule.forRoot(), FormsModule, ReactiveFormsModule, HttpClientTestingModule],
            providers: [{ provide: 'localize', useValue: mocklocalize },
            { provide: 'ModalFactory', useValue: mockModalFactoryService },
            { provide: AccountStatementMessagesService, useValue: accountStatementMessagesService },
            { provide: BillingMessagesService, useValue: mockBillingMessagesService },
            { provide: 'toastrFactory', useValue: mockToastrFactory },
            { provide: 'SoarConfig', useValue: {} },
            { provide: DialogService, useValue: {} }
                , HttpClient],
            schemas: [NO_ERRORS_SCHEMA]
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(AccountStatementBillingMessageComponent);
        crudFixture = TestBed.createComponent(AccountStatementBillingMessageCrudComponent);
        crudComponent = crudFixture.componentInstance;
        crudComponent.messageData = message;
        crudFixture.detectChanges();
        component = fixture.componentInstance;
        component.accountStatementBillingMessageCrud = crudFixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
    describe('init -> ', () => {
        it('should initialize ', () => {
            component.ngOnInit();
            expect(accountStatementMessagesService.all).toHaveBeenCalled();
        });
    });

    describe('loadMessages --> ', () => {
        it('should call setMessage on successful Data fetch', () => {
            component.setMessage = jasmine.createSpy();
            component.loadMessages();
            expect(component.setMessage).toHaveBeenCalled();
        });
    })

    describe('setMessage --> ', () => {
        it('should set data to message object from res', () => {
            let tempRes = { Value: [message] }
            component.setMessage(tempRes);
            expect(component?.messages[0]?.Name).toEqual(message.Name);
        });
    })

    describe('addNewMessage ->', () => {
        it('should call addNewMessage', () => {
            crudComponent.openPreviewDialog = jasmine.createSpy();
            crudComponent.ngOnInit = jasmine.createSpy();
            component.accountStatementBillingMessageCrud = crudFixture.componentInstance;
            component.addNewMessage();
            expect(component.messageData.AccountStatementMessageId).toBeNull();
            expect(component.isLoaded).toBe(true);
            expect(crudComponent.openPreviewDialog).toHaveBeenCalled();
            expect(crudComponent.ngOnInit).toHaveBeenCalled();
        });
    });

    describe('editNewMessage ->', () => {
        it('should call editNewMessage', () => {
            crudComponent.openPreviewDialog = jasmine.createSpy();
            crudComponent.ngOnInit = jasmine.createSpy();
            component.accountStatementBillingMessageCrud = crudFixture.componentInstance;
            component.editMessage(message);
            expect(component.messageData.AccountStatementMessageId).toBeGreaterThan(0);
            expect(crudComponent.openPreviewDialog).toHaveBeenCalled();
            expect(crudComponent.ngOnInit).toHaveBeenCalled();
        });
    });

    describe('deleteMessage ->', () => {
        it('should open confirmation modal popul', () => {
            component.deleteMessage(message);
            expect(mockModalFactoryService.ConfirmModal).toHaveBeenCalled();
        });
        it('should show success toaster on successful delete', () => {
            message = {
                Name: 'name', Message: 'message',
                AccountStatementMessageId: '10',
                DataTag: 'AAAAAAAMz40=',
                DateModified: new Date(),
                UserModified: 'a162c864-8f50-4e84-8942-7194bc8070cf'
            }
            component.getAccountStatementMessagesDeleteStatusSuccess = jasmine.createSpy();
            component.confirmDelete(message);
            expect(mockToastrFactory.success).toHaveBeenCalled();
            expect(component.getAccountStatementMessagesDeleteStatusSuccess).toHaveBeenCalled();
        })
        it('should show fail toaster on error delete', () => {
            message = {
                Name: 'name', Message: 'message',
                AccountStatementMessageId: null,
                DataTag: 'AAAAAAAMz40=',
                DateModified: new Date(),
                UserModified: 'a162c864-8f50-4e84-8942-7194bc8070cf'
            }
            component.confirmDelete(message);
            expect(mockToastrFactory.error).toHaveBeenCalled();
        })
    });

    describe('closeMessagePopup ->', () => {
        it('should call loadMessages if message data present', () => {
            component.loadMessages = jasmine.createSpy();
            component.closeMessagePopup(message);
            expect(component.loadMessages).toHaveBeenCalled();
        });

        it('should not call loadMessages if message data present', () => {
            component.loadMessages = jasmine.createSpy();
            component.closeMessagePopup(null);
            expect(component.loadMessages).not.toHaveBeenCalled();
        });
    });

});
