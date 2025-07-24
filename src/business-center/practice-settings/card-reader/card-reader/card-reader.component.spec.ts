import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DialogRef } from '@progress/kendo-angular-dialog';
import { CardReaderComponent } from './card-reader.component';
import { CardReader } from '../card-reader';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { By } from '@angular/platform-browser';
import { SaveStates } from 'src/@shared/models/transaction-enum';

describe('CardReaderComponent', () => {
  let component: CardReaderComponent;
  let fixture: ComponentFixture<CardReaderComponent>;

  let mockCardReaderList: CardReader[] = [
    { 
      PaymentIntegrationDeviceId:1,
       PartnerDeviceId : 'item 1',
       DeviceFriendlyName: 'Display Name 1',
       ObjectState:SaveStates.None
    },
    {
      PaymentIntegrationDeviceId:2,
       PartnerDeviceId : 'item 2',
       DeviceFriendlyName: 'Display Name 2',
       ObjectState:SaveStates.None
    },
    {
      PaymentIntegrationDeviceId:3,
      PartnerDeviceId : 'item 3',
       DeviceFriendlyName: 'Display Name 3',
       ObjectState:SaveStates.None
    },
    {
      PaymentIntegrationDeviceId:4,
      PartnerDeviceId : 'item 5',
       DeviceFriendlyName: 'Display Name 5',
       ObjectState:SaveStates.Delete
    }
  ];

  let mockDialogRef = {
    close: () => {},
    open: () => {},
    content: {
      instance: {
        title: '',
        cardReaderList: mockCardReaderList,
      },
    },
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FormsModule, ReactiveFormsModule],
      providers: [
        { provide: DialogRef, useValue: mockDialogRef },
      ],
      declarations: [CardReaderComponent],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CardReaderComponent);
    component = fixture.componentInstance;
    component.cardReaderList = mockCardReaderList;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('createFormControls', () => {
    beforeEach(() => {
      component.cardReaderList = mockCardReaderList;
    });
    it('should create FormControls', () => {
      component.createFormControls();
      const PartnerDeviceId  = component.frmCardReader.controls.PartnerDeviceId ;
      expect(PartnerDeviceId ).toBeDefined();
      const  DeviceFriendlyName =
        component.frmCardReader.controls. DeviceFriendlyName;
      expect( DeviceFriendlyName).toBeDefined();
    });

    describe('ngOnInit ->', () => {
      it('should call all ngoninit methods', () => {
        spyOn(component, 'createFormControls');
        component.ngOnInit();
        expect(component.createFormControls).toHaveBeenCalled();
        fixture.detectChanges();
      });
    });
  });

  describe('In Add Card Reader ->', () => {
    beforeEach(() => {
      component.cardReaderList = mockCardReaderList;
      component.ngOnInit();
    });

    describe('Default Value in form Controls  ->', () => {
      it('should be empty value in form Controls', () => {
        expect(component.frmCardReader.controls.PartnerDeviceId .value).toBeNull();
        expect(
          component.frmCardReader.controls. DeviceFriendlyName.value
        ).toBeNull();
      });
    });

    describe('Validations on form control in Add Card Reader  ->', () => {
      it('should validate duplicate value on focusout and set isCardReaderIdExists ', () => {
        let PartnerDeviceId  = fixture.debugElement.query(By.css('#cardReaderId'));
        PartnerDeviceId .triggerEventHandler('focusout', {
          target: { value: 'item 1' },
        });
        fixture.detectChanges();
        expect(component.isCardReaderIdExists).toBe(true);
      });
      it('should validate duplicate value on focusout and unset isCardReaderIdExists', () => {
        let PartnerDeviceId  = fixture.debugElement.query(By.css('#cardReaderId'));
        PartnerDeviceId .triggerEventHandler('focusout', {
          target: { value: 'item 4' },
        });
        fixture.detectChanges();
        expect(component.isCardReaderIdExists).toBe(false);
      });
      it('should validate duplicate value on focusout and unset isCardReaderIdExists for deleted record', () => {
        let PartnerDeviceId  = fixture.debugElement.query(By.css('#cardReaderId'));
        PartnerDeviceId .triggerEventHandler('focusout', {
          target: { value: 'item 5' },
        });
        fixture.detectChanges();
        expect(component.isCardReaderIdExists).toBe(false);
      });
      it('should validate duplicate value on mouseleave and set isCardReaderIdExists ', () => {
        let PartnerDeviceId  = fixture.debugElement.query(By.css('#cardReaderId'));
        PartnerDeviceId .triggerEventHandler('mouseleave', {
          target: { value: 'item 1' },
        });
        fixture.detectChanges();
        expect(component.isCardReaderIdExists).toBe(true);
      });
      it('should validate duplicate value on mouseleave and unset isCardReaderIdExists', () => {
        let PartnerDeviceId  = fixture.debugElement.query(By.css('#cardReaderId'));
        PartnerDeviceId .triggerEventHandler('mouseleave', {
          target: { value: 'item 4' },
        });
        fixture.detectChanges();
        expect(component.isCardReaderIdExists).toBe(false);
      });
      it('should validate duplicate value on mouseleave and unset isCardReaderIdExists for deleted record', () => {
        let PartnerDeviceId  = fixture.debugElement.query(By.css('#cardReaderId'));
        PartnerDeviceId .triggerEventHandler('mouseleave', {
          target: { value: 'item 5' },
        });
        fixture.detectChanges();
        expect(component.isCardReaderIdExists).toBe(false);
      });
    });
  });

  describe('In Edit Card Reader ->', () => {
    beforeEach(() => {
      component.cardReaderList = mockCardReaderList;
      component.cardReader = mockCardReaderList[0];
      component.ngOnInit();
    });

    describe('Default Value in form Controls  ->', () => {
      it('should patch values in form Controls', () => {
        expect(component.frmCardReader.controls.PartnerDeviceId .value).toBe(
          'item 1'
        );
        expect(
          component.frmCardReader.controls. DeviceFriendlyName.value
        ).toBe('Display Name 1');
      });
    });

    describe('Validations on form control in Edit Card Reader  ->', () => {
      it('should validate duplicate value in Card Reader Name on focusout and unset isCardReaderNameExists', () => {
        let  DeviceFriendlyName = fixture.debugElement.query(
          By.css('#cardReaderDisplayName')
        );
         DeviceFriendlyName.triggerEventHandler('focusout', {
          target: { value: 'Display Name 1' },
        });
        fixture.detectChanges();
        expect(component.isCardReaderNameExists).toBe(false);
      });

      it('should validate duplicate value  in Card Reader Name on focusout and set isCardReaderNameExists', () => {
        let  DeviceFriendlyName = fixture.debugElement.query(
          By.css('#cardReaderDisplayName')
        );
         DeviceFriendlyName.triggerEventHandler('focusout', {
          target: { value: 'Display Name 2' },
        });
        fixture.detectChanges();
        expect(component.isCardReaderNameExists).toBe(true);
      });
      it('should validate duplicate value  in Card Reader Name on focusout and unset isCardReaderNameExists for deleted record', () => {
        let  DeviceFriendlyName = fixture.debugElement.query(
          By.css('#cardReaderDisplayName')
        );
         DeviceFriendlyName.triggerEventHandler('focusout', {
          target: { value: 'Display Name 5' },
        });
        fixture.detectChanges();
        expect(component.isCardReaderNameExists).toBe(false);
      });
      it('should validate duplicate value  in Card Reader Name on mouseleave and unset isCardReaderNameExists', () => {
        let  DeviceFriendlyName = fixture.debugElement.query(
          By.css('#cardReaderDisplayName')
        );
         DeviceFriendlyName.triggerEventHandler('mouseleave', {
          target: { value: 'Display Name 1' },
        });
        fixture.detectChanges();
        let saveBtn = fixture.debugElement.query(By.css('#btnSubmit'));
        expect(component.isCardReaderNameExists).toBe(false);
        expect(saveBtn.nativeElement.disabled).toBeFalsy();
      });
      it('should validate duplicate value  in Card Reader Name on mouseleave and unset isCardReaderNameExists for deleted record', () => {
        let  DeviceFriendlyName = fixture.debugElement.query(
          By.css('#cardReaderDisplayName')
        );
         DeviceFriendlyName.triggerEventHandler('mouseleave', {
          target: { value: 'Display Name 5' },
        });
        fixture.detectChanges();
        let saveBtn = fixture.debugElement.query(By.css('#btnSubmit'));
        expect(component.isCardReaderNameExists).toBe(false);
        expect(saveBtn.nativeElement.disabled).toBeFalsy();
      });
      it('should validate duplicate value  in Card Reader Name on mouseleave and set isCardReaderNameExists', () => {
        let  DeviceFriendlyName = fixture.debugElement.query(
          By.css('#cardReaderDisplayName')
        );
         DeviceFriendlyName.triggerEventHandler('mouseleave', {
          target: { value: 'Display Name 2' },
        });
        fixture.detectChanges();
        let saveBtn = fixture.debugElement.query(By.css('#btnSubmit'));
        expect(component.isCardReaderNameExists).toBe(true);
        expect(saveBtn.nativeElement.disabled).toBeTruthy();
      });
    });
  });

  describe('Save functionality->', () => {
    it('should add record on save in create new card reader', () => {
      
     spyOn(component, 'saveCardReader');
      component.cardReader = null;
      component.ngOnInit();
      component.frmCardReader.patchValue({
        PartnerDeviceId : 'item 4 ',
         DeviceFriendlyName: 'Display Name 4',
      });
      let saveBtn = fixture.debugElement.query(By.css('#btnSubmit'));
      saveBtn.triggerEventHandler('click', null);
     fixture.detectChanges();
      fixture.whenStable().then(() => {
        expect(component.saveCardReader).toHaveBeenCalled();
    });
    });

    it('should update record on save in edit card reader', () => {
      spyOn(component, 'saveCardReader');
      component.cardReader = mockCardReaderList[0];
      component.ngOnInit();
      component.frmCardReader.patchValue({
        PartnerDeviceId : 'item 11',
        DeviceFriendlyName: 'Display Name 4',
      });

      let saveBtn = fixture.debugElement.query(By.css('#btnSubmit'));
      saveBtn.triggerEventHandler('click', null);
      fixture.detectChanges();
      fixture.whenStable().then(() => {
        expect(component.saveCardReader).toHaveBeenCalled();
    });
    });
  });
});
