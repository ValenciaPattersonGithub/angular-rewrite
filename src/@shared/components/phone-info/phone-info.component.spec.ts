import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';

import { PhoneInfoComponent } from './phone-info.component';

describe('PhoneInfoComponent', () => {
  let component: PhoneInfoComponent;
  let fixture: ComponentFixture<PhoneInfoComponent>;


  const mockStaticDataService = {
    PhoneTypes: () => new Promise((resolve, reject) => {
    })
  };

  let mockLocalizeService = {
    getLocalizedString: () => 'translated text'
  };

  let mockToastrFactory = {
    success: jasmine.createSpy('toastrFactory.success'),
    error: jasmine.createSpy('toastrFactory.error')
  };

  let mockPatSecurityService = {
    IsAuthorizedByAbbreviation: jasmine.createSpy('patSecurityService.IsAuthorizedByAbbreviation').and.returnValue(true)
 };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [PhoneInfoComponent],
      imports: [ReactiveFormsModule, TranslateModule.forRoot()],
      providers: [
        { provide: 'SaveStates', useValue: {} },
        { provide: 'StaticData', useValue: mockStaticDataService },
        { provide: 'localize', useValue: mockLocalizeService },
        { provide: 'toastrFactory', useValue: mockToastrFactory },
        { provide: 'patSecurityService', useValue: mockPatSecurityService }]
    })
      .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PhoneInfoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });


  describe('ngOnInit -->', () => {
    it('should call getPhoneTypes and addPhone methods under ngOnInit', () => {
      component.getPhoneTypes = jasmine.createSpy();
      component.addPhone = jasmine.createSpy();
      component.authAddAccess = jasmine.createSpy();
      component.ngOnInit();
      expect(component.getPhoneTypes).toHaveBeenCalled();
      expect(component.addPhone).toHaveBeenCalled();
      expect(component.authAddAccess).toHaveBeenCalled();
    })
  })

  describe('On PhoneTypesOnSuccess -->', () => {
    it('should set phoneTypes', () => {
      let res = { Value: [{ PhoneTypeId: 1, Name: "Home" }] }
      component.PhoneTypesOnSuccess(res);
      expect(component.phoneTypes.length).toBeGreaterThan(0);
    });
  })

  describe('On PhoneTypesOnError -->', () => {
    it('should show error toaster ', () => {
      component.PhoneTypesOnError(null);
      expect(mockToastrFactory.error).toHaveBeenCalled();
    });
  })

  describe('On PhoneTypesOnError -->', () => {
    it('should show error toaster ', () => {
      component.PhoneTypesOnError(null);
      expect(mockToastrFactory.error).toHaveBeenCalled();
    });
  })

  describe('On addPhone -->', () => {
    it('should add new phone', () => {
      component.maxLimit = 5;
      component.phones = [];
      component.addPhone();
      expect(component.phones.length).toBeGreaterThan(0);
    });
  })

  describe('On removePhone -->', () => {
    it('should remove item', () => {
      component.maxLimit = 5;
      component.phones = [{ PhoneNumber: '11111111111', Type: "1" }, { PhoneNumber: '222222222', Type: "2" }];
      let remove = { PhoneNumber: '11111111111', Type: "1" };
      component.removePhone(remove);
      expect(component.phones.length).toEqual(1);
    });
  })

  describe('On onUpdatePhone -->', () => {
    it('should remove item', () => {
      component.phones = [{ PhoneNumber: '11111111111', Type: "1", duplicateNumber: false }, { PhoneNumber: '11111111111', Type: "2", duplicateNumber: false }];
      component.onUpdatePhone();
      expect(component.phones[0].duplicateNumber).toEqual(true);
    });
  })

});
