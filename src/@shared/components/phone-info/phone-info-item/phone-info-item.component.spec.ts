import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';

import { PhoneInfoItemComponent } from './phone-info-item.component';

describe('PhoneInfoItemComponent', () => {
  let component: PhoneInfoItemComponent;
  let fixture: ComponentFixture<PhoneInfoItemComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [PhoneInfoItemComponent],
      imports: [ReactiveFormsModule, TranslateModule.forRoot()],
      providers: [ { provide: 'SaveStates', useValue: {} },]
    })
      .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PhoneInfoItemComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('ngOnInit -->', () => {
    it('should call all methods under ngOnInit', () => {
      component.frmContactInfo = new FormGroup({
        phoneNumber: new FormControl(),
        inpPhoneType: new FormControl()
      });
      expect(component.frmContactInfo).not.toBeUndefined();
    })
  })

  describe('On removePrompt -->', () => {
    it('should set showRemoveMsg as true ', () => {
      component.showRemoveMsg = false;
      component.removePrompt();
      expect(component.showRemoveMsg).toEqual(true);
    });
  })

  describe('On confirmRemove-->', () => {
    it('should call parent component removeFunction, and should set showRemoveMsg as false ', () => {
      component.showRemoveMsg = false;
      component.removeFunction.emit = jasmine.createSpy();
      component.confirmRemove();
      expect(component.showRemoveMsg).toEqual(false);
      expect(component.removeFunction.emit).toHaveBeenCalled();
    });
  })

  describe('On cancelRemove-->', () => {
    it('should set showRemoveMsg as false ', () => {
      component.showRemoveMsg = true;
      component.cancelRemove();
      expect(component.showRemoveMsg).toEqual(false);
    });
  })

  describe('On updatePhone-->', () => {
    it('should call parent component onUpdatePhone', () => {

      component.frmContactInfo = new FormGroup({
        phoneNumber: new FormControl(),
        inpPhoneType: new FormControl()
      });
      component.frmContactInfo.patchValue({
        phoneNumber: '123456789',
        inpPhoneType: '1'
      })

      component.phone = { PhoneNumber: "", Type: null };
      component.onUpdatePhone.emit = jasmine.createSpy();
      component.updatePhone({
        phoneNumber: '123456789',
        inpPhoneType: '1'
      });
      expect(component.onUpdatePhone.emit).toHaveBeenCalled();
      expect(component.phone.PhoneNumber).toEqual('123456789');
      expect(component.phone.Type).toEqual('1');
    });
  })

});
