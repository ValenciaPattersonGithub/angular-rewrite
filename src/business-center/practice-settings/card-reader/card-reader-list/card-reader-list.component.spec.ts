import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CardReaderListComponent } from './card-reader-list.component';
import {
  DialogContainerService,
  DialogService,
} from '@progress/kendo-angular-dialog';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { ConfirmationModalService } from 'src/@shared/components/confirmation-modal/confirmation-modal.service';
import { OrderByPipe } from 'src/@shared/pipes/order-by/order-by.pipe';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CardReader } from '../card-reader';
import { By } from '@angular/platform-browser';
import { AppKendoUIModule } from 'src/app-kendo-ui/app-kendo-ui.module';

describe('CardReaderListComponent', () => {
  let component: CardReaderListComponent;
  let fixture: ComponentFixture<CardReaderListComponent>;

  let mockConfirmationModalService = {
    open: jasmine.createSpy().and.returnValue({
      events: {
        pipe: jasmine
          .createSpy()
          .and.returnValue({
            subscribe: jasmine.createSpy().and.returnValue({ type: 'confirm' }),
          }),
      },
      subscribe: jasmine.createSpy(),
      closed: jasmine.createSpy(),
    }),
  };

  let mockDialogRef = {
    events: {
      pipe: jasmine
        .createSpy()
        .and.returnValue({ subscribe: jasmine.createSpy() }),
    },
    subscribe: jasmine.createSpy(),
  };
  let mockCardReaderList: CardReader[] = [
    {
      PaymentIntegrationDeviceId:1,
      PartnerDeviceId: 'item 3',
      DeviceFriendlyName: 'Display Name 3',
      ObjectState:null
    },
    {
      PaymentIntegrationDeviceId:2,
      PartnerDeviceId: 'item 2',
      DeviceFriendlyName: 'Display Name 2',
      ObjectState:null
    },
    {PaymentIntegrationDeviceId:3,
      PartnerDeviceId: 'item 1',
      DeviceFriendlyName: 'Display Name 1',
      ObjectState:null
    },
  ];
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AppKendoUIModule, TranslateModule.forRoot()],
      declarations: [CardReaderListComponent, OrderByPipe],
      providers: [
        DialogService,
        DialogContainerService,
        {
          provide: ConfirmationModalService,
          useValue: mockConfirmationModalService,
        },
      ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CardReaderListComponent);
    component = fixture.componentInstance;
    component.cardReaderList = mockCardReaderList;
    component.editMode = true;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
  describe('Action Column visibility', () => {
    it('should show Action column', () => {
      component.editMode = true;
      fixture.detectChanges();
      let actionColumn = fixture.debugElement.query(By.css('.action-col'));
      expect(actionColumn).not.toBeNull();
    });
    it('should hide Action column', () => {
      component.editMode = false;
      fixture.detectChanges();
      let actionColumn = fixture.debugElement.query(By.css('.action-col'));
      expect(actionColumn).toBeNull();
    });
  });
  describe('sortCardReaderList', () => {
    it('should sort card Reader List in ascending order', () => {
      component.isDescending = true;
      fixture.detectChanges();
      component.sortCardReaderList('PartnerDeviceId');
      fixture.detectChanges();
      expect(
        component.cardReaderList.indexOf(
          component.cardReaderList.find(x => x.PartnerDeviceId === 'item 1')
        )
      ).toEqual(2);
      expect(
        component.cardReaderList.indexOf(
          component.cardReaderList.find(x => x.PartnerDeviceId === 'item 2')
        )
      ).toEqual(1);
      expect(
        component.cardReaderList.indexOf(
          component.cardReaderList.find(x => x.PartnerDeviceId === 'item 3')
        )
      ).toEqual(0);
    });
    it('should sort card Reader List in descending order', () => {
      component.isDescending = false;
      component.sortCardReaderList('PartnerDeviceId');
      fixture.detectChanges();
      expect(
        component.cardReaderList.indexOf(
          component.cardReaderList.find(x => x.PartnerDeviceId === 'item 3')
        )
      ).toEqual(0);
      expect(
        component.cardReaderList.indexOf(
          component.cardReaderList.find(x => x.PartnerDeviceId === 'item 2')
        )
      ).toEqual(1);
      expect(
        component.cardReaderList.indexOf(
          component.cardReaderList.find(x => x.PartnerDeviceId === 'item 1')
        )
      ).toEqual(2);
    });

  });

  describe('deleteCardReader() -> ', () => {
    it('should call deleteCardReader on click of delete button', () => {
      spyOn(component, 'deleteCardReader');
      let DeviceFriendlyName = fixture.debugElement.query(
        By.css('#delete0')
      );
      DeviceFriendlyName.triggerEventHandler('click', null);
      fixture.detectChanges();
      expect(component.deleteCardReader).toHaveBeenCalled();
      expect(component.deleteCardReader).toHaveBeenCalledWith(0);
    });

    it('should call confirm modal to delete item', () => {
      const data = {
        header: 'Delete Card Reader?',
        message: 'Are you sure you want to delete this card reader?',
        confirm: 'Save',
        cancel: 'Cancel',
        height: 190,
        width: 350,
      };
      mockConfirmationModalService.open = jasmine
        .createSpy()
        .and.returnValue(mockDialogRef);
      component.deleteCardReader(0);
      expect(mockConfirmationModalService.open).toHaveBeenCalled();
      expect(mockConfirmationModalService.open).toHaveBeenCalledWith({
        data: data,
      });
    });
  });

  describe('editCardReader() -> ', () => {
    it('should call editCardReader function with values', () => {
      spyOn(component, 'editCardReader');
      let DeviceFriendlyName = fixture.debugElement.query(By.css('#edit0'));
      DeviceFriendlyName.triggerEventHandler('click', null);
      fixture.detectChanges();
      expect(component.editCardReader).toHaveBeenCalled();
      expect(component.editCardReader).toHaveBeenCalledWith({
        PaymentIntegrationDeviceId: 1,
        PartnerDeviceId: 'item 3',
        DeviceFriendlyName: 'Display Name 3',
        ObjectState: null
      });
    });
  });
});
