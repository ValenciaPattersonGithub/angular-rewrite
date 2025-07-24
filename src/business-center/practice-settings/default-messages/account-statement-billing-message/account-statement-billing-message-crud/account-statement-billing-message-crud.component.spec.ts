import { SimpleChanges } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { DialogContainerService, DialogRef, DialogService } from '@progress/kendo-angular-dialog';
import { of } from 'rxjs';
import { AccountStatementMessagesService } from '../account-statement-messages.service';
import { AccountStatementBillingMessageCrudComponent } from './account-statement-billing-message-crud.component';

let messageData = {
    Name: 'name', Message: 'message',
    AccountStatementMessageId: null,
    DataTag: null,
    DateModified: null,
    UserModified: null
}

let serviceMockData = [{
    Name: 'name1', Message: 'message1',
    AccountStatementMessageId: null,
    DataTag: null,
    DateModified: null,
    UserModified: null
}, {
    Name: 'name2', Message: 'message2',
    AccountStatementMessageId: null,
    DataTag: null,
    DateModified: null,
    UserModified: null
}]
let changes: SimpleChanges = {
    messageData: {
        currentValue: messageData,
        previousValue: null,
        firstChange: false,
        isFirstChange: () => { return false }
    }
}
describe('AccountStatementBillingMessageCrudComponent', () => {
    let component: AccountStatementBillingMessageCrudComponent;
    let fixture: ComponentFixture<AccountStatementBillingMessageCrudComponent>;
    let dialogservice: DialogService;
    let dialogRef: DialogRef;
    let mocklocalize = {
        getLocalizedString: () => 'translated text'
    }
    let accountStatementMessagesService = {
        update: jasmine.createSpy().and.returnValue({
            then: (success, error) => {
                success({ Value: [messageData] });
                error({})
            }
        }),
        save: jasmine.createSpy().and.returnValue({
            then: (success, error) => {
                success({ Value: messageData });
                error({})
            }
        }),
        getDuplicate: (messageData) => {
            let duplicateRec = serviceMockData.filter(x=>x?.Name == messageData?.name);
            return {
                then: (success, error) => {
                    success({
                        Value: duplicateRec
                    });
                    error({})
                }
            }
        }
    };
    let mockDialogRef = {
        close: () => of({}),
        open: (dialogResult) => { },
        content: {
            instance: {
                title: ''
            }
        }
    }
    let mockModalFactoryService = {
        CancelModal: jasmine.createSpy('ModalFactory.CancelModal').and.returnValue({ then: () => { } }),
        ConfirmModal: jasmine.createSpy('ModalFactory.ConfirmModal').and.returnValue({ then: () => { } })
    };
    let mockToastrFactory = {
        success: jasmine.createSpy('toastrFactory.success'),
        error: jasmine.createSpy('toastrFactory.error')
    };
    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [AccountStatementBillingMessageCrudComponent],
            imports: [TranslateModule.forRoot(), FormsModule, ReactiveFormsModule],
            providers: [DialogService, DialogContainerService,
                { provide: DialogRef, useValue: mockDialogRef },
                { provide: 'localize', useValue: mocklocalize },
                { provide: 'ModalFactory', useValue: mockModalFactoryService },
                { provide: AccountStatementMessagesService, useValue: accountStatementMessagesService },
                { provide: 'toastrFactory', useValue: mockToastrFactory }]
        })
            .compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(AccountStatementBillingMessageCrudComponent);
        component = fixture.componentInstance;
        dialogservice = TestBed.get(DialogService);
        dialogRef = TestBed.get(DialogRef);
        spyOn(dialogservice, 'open').and.returnValue({ content: AccountStatementBillingMessageCrudComponent, result: of({ primary: true }) });
        component.messageData = {
            Message: null,
            Name: null,
            DataTag: null,
            AccountStatementMessageId: null,
            DateModified: null,
            UserModified: null
        }
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    describe('ngOnChanges ->', () => {
        it('should set isedit true when data has AccountStatementMessageId', () => {
            messageData.AccountStatementMessageId = 10;
            component.messageData = messageData;
            component.ngOnChanges(changes);
            expect(component.isEdit).toBe(true);
        })
        it('should set originalMessage value when any data change found in messageData', () => {
            messageData.AccountStatementMessageId = null;
            component.messageData = messageData;
            component.ngOnChanges(changes);
            expect(component.originalMessage).toEqual(component.messageData);
        })
    })

    describe('ngOnInit ->', () => {
        it('should set isedit true when data has AccountStatementMessageId', () => {
            messageData = {
                Name: 'name', Message: 'message',
                AccountStatementMessageId: 10,
                DataTag: 'AAAAAAAMz40=',
                DateModified: new Date(),
                UserModified: 'a162c864-8f50-4e84-8942-7194bc8070cf'
            }
            component.messageData = messageData;
            component.ngOnInit();
            expect(component.isEdit).toBe(true);
        })
        it('should set messageData.Name isn null when AccountStatementMessageId dont have value', () => {
            messageData = {
                Message: '',
                Name: null,
                DataTag: null,
                AccountStatementMessageId: null,
                DateModified: null,
                UserModified: null
            }
            component.messageData = messageData;
            component.ngOnInit();
            expect(component?.messageData?.Name).toBeNull();
        })

    })

    describe('openDialog ->', () => {
        it('should open a dialog', () => {
            dialogservice.open = jasmine.createSpy().and.returnValue(mockDialogRef);
            component.openPreviewDialog();
            expect(dialogservice.open).toHaveBeenCalled();
        });
    });

    describe('close -> ', () => {
        it('should close the dialog', () => {
            component.dialog = TestBed.get(DialogRef);
            component.closeDialog();
        });
    });

    describe('cancelOnClick -> ', () => {
        it('should close the modal', () => {
            component.messageData = {
                Message: null,
                Name: 'name',
                DataTag: null,
                AccountStatementMessageId: null,
                DateModified: null,
                UserModified: null
            }
            component.originalMessage = {
                Message: null,
                Name: 'name1',
                DataTag: null,
                AccountStatementMessageId: null,
                DateModified: null,
                UserModified: null
            }
            component.close();
            fixture.detectChanges();
            expect(mockModalFactoryService.CancelModal).toHaveBeenCalled();
        });
    });
    describe('close -> ', () => {
        it('should call modal instance close', () => {
            component.close();
            fixture.detectChanges();
            expect(mockModalFactoryService.CancelModal).toHaveBeenCalled();
        });

        it('should call cancelChanges',() =>{
            component.messageData = messageData;
            component.originalMessage = messageData;
            component.cancelChanges = jasmine.createSpy();
            component.close();
            expect(component.cancelChanges).toHaveBeenCalled();
        })
    });

    describe('cancelChanges -> ', () => {
        it('should call closeDialog & emit messageData', () => {
            component.closeModal.emit = jasmine.createSpy();
            component.closeDialog = jasmine.createSpy();
            component.messageData = messageData;
            component.cancelChanges();
            expect(component.closeModal.emit).toHaveBeenCalled();
            expect(component.closeDialog).toHaveBeenCalled();
        });
    });

    describe('save -> ', () => {
        it('should call accountStatementMessagesService save', () => {
            component.messageData = {
                Name: 'name', Message: 'message',
                AccountStatementMessageId: null,
                DataTag: null,
                DateModified: null,
                UserModified: null
            };
            component.save();
            expect(accountStatementMessagesService.save).toHaveBeenCalled();
            expect(mockToastrFactory.success).toHaveBeenCalled();

        });
        it('should call accountStatementMessagesService updated', () => {
            component.messageData = {
                Name: 'name', Message: 'message',
                AccountStatementMessageId: null,
                DataTag: null,
                DateModified: null,
                UserModified: null
            };
            component.isEdit = true;
            component.save();
            expect(accountStatementMessagesService.update).toHaveBeenCalled();
            expect(mockToastrFactory.success).toHaveBeenCalled();

        });
    });

    describe('validate ->', () => {
        beforeEach(() => {
            component.messageData = {
                Name: 'name', Message: 'message',
                AccountStatementMessageId: '10',
                DataTag: 'AAAAAAAMz40=',
                DateModified: new Date(),
                UserModified: 'a162c864-8f50-4e84-8942-7194bc8070cf'
            };
        });
        it('should return true when valid', () => {
            var result = component.validate();
            expect(result).toEqual(true);
        });
        it('should return false when name missing', () => {
            component.messageData.Name = '';
            var result = component.validate();
            expect(result).toEqual(false);
        });
        it('should return false when message missing', () => {
            component.messageData.Message = '';
            var result = component.validate();
            expect(result).toEqual(false);
        });
        it('should return false when name is a duplicate', () => {
            component.messageData.Name = '';
            component.isDuplicate = true;
            var result = component.validate();
            expect(result).toEqual(false);
        });
    });

    describe('checkDups -> ', () => {
        it('check duplicate message and return true when it found duplicate record', () => {
            component.messageData = {
                Name: 'name1', Message: 'message1',
                AccountStatementMessageId: '11',
                DataTag: null,
                DateModified: null,
                UserModified: null
            }
            component.checkDups();
            expect(component.isDuplicate).toBe(true);
        });
        it('check duplicate message and return false when it found unique record', () => {
            component.messageData = {
                Name: 'name', Message: 'mainmessga',
                AccountStatementMessageId: '10',
                DataTag: null,
                DateModified: null,
                UserModified: null
            }
            component.checkDups();
            expect(component.isDuplicate).toBe(false);
        });
    });

    describe('setDupsRecord -> ', () => {
        it('check setDupsRecord and return isDuplicate is true', () => {
            component.isEdit = true;
            let res = {
                Value: [{
                    Name: 'name', Message: 'message',
                    AccountStatementMessageId: '11',
                    DataTag: null,
                    DateModified: null,
                    UserModified: null
                }]
            }
            component.setDupsRecord(res);
            expect(component.isDuplicate).toBe(true);
        });
        it('check setDupsRecord and return isDuplicate is false when no record match', () => {         
            component.setDupsRecord(null);
            expect(component.isDuplicate).toBe(false);
        });
    });
});