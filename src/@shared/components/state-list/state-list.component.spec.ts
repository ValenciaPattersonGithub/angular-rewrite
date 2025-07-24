import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DropDownsModule } from '@progress/kendo-angular-dropdowns';
import { OrderByPipe } from 'src/@shared/pipes';
import { configureTestSuite } from 'src/configure-test-suite';
import { StateListComponent } from './state-list.component';

let stateList: any = [
  {
    Name: 'Alaska',
    Abbreviation: 'AK',
  },
  {
    Name: 'California',
    Abbreviation: 'CA',
  },
  {
    Name: 'Colorado',
    Abbreviation: 'CO',
  },
];

let mockStateTypeValue: any = {
  Name: 'Alaska',
  Abbreviation: 'AK',
};

let ListHelper: any;

describe('StateListComponent', () => {
  let component: StateListComponent;
  let fixture: ComponentFixture<StateListComponent>;

  const mockservice = {
    States: () =>
      new Promise((resolve, reject) => {
        // the resolve / reject functions control the fate of the promise
      }),
  };

  const mockLocalizeService: any = {
    getLocalizedString: () => 'translated text',
  };

  const mockListHelper: any = {
    // findItemByFieldValue: jasmine.createSpy().and.returnValue({}), get: jasmine.createSpy().and.returnValue({})
    findItemByFieldValue: () => {
      return mockStateTypeValue;
    },
    findIndexByFieldValue: () => 2,
  };

  configureTestSuite(() => {
    TestBed.configureTestingModule({
      imports: [DropDownsModule],
      providers: [
        { provide: 'StaticData', useValue: mockservice },
        { provide: 'localize', useValue: mockLocalizeService },
        { provide: 'ListHelper', useValue: mockListHelper },
      ],
      declarations: [StateListComponent],
    });
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(StateListComponent);
    component = fixture.componentInstance;
    ListHelper = TestBed.get('ListHelper');
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('ngOnInit ->', () => {
    it('should call the initialize method and load state list', () => {
      component.initialize = jasmine.createSpy();
      component.ngOnInit();
      expect(component.initialize).toHaveBeenCalled();
      // expect(staticData.States()).toHaveBeenCalled();
    });
  });

  describe('ngOnChanges ->', () => {
    it('should call the state selection change method when a change made to the initial selection input variable', () => {
      var changes = { source: { currentValue: 'AK' } };
      spyOn(component, 'stateSelectionChange');
      component.ngOnChanges(changes);
      expect(component.stateSelectionChange).toHaveBeenCalled();
    });
    it('should not call the state selection change method when no change made to the initial selection input variable', () => {
      var changes = {};
      spyOn(component, 'stateSelectionChange');
      component.ngOnChanges(changes);
      expect(component.stateSelectionChange).not.toHaveBeenCalled();
    });
  });

  describe('stateSelectionChange ->', () => {
    it('should set the initial selection variable if valid input change', () => {
      spyOn(component, 'stateSelectionChange');
      spyOn(ListHelper, 'findItemByFieldValue').and.returnValue(
        Promise.resolve(stateList[0].Name)
      );
      component.stateSelectionChange();
      expect(component.stateSelectionChange).toHaveBeenCalled();
    });
    it('should not set the initial selection variable if currentValue is null', () => {
      var change = { previousValue: 'AK', currentValue: {} };
      spyOn(component, 'stateSelectionChange');
      spyOn(ListHelper, 'findItemByFieldValue').and.returnValue(
        Promise.resolve(null)
      );
      expect(component.stateSelectionChange).not.toHaveBeenCalled();
    });
  });

  describe('StatesOnSuccess ->', () => {
    it('should set statelist variable', () => {
      spyOn(component, 'StatesOnSuccess');
      var res = { statelist: stateList };
      component.StatesOnSuccess(res.statelist);
      expect(component.StatesOnSuccess).toHaveBeenCalled();
    });
    it('should not set statelist variable if empty list is given', () => {
      spyOn(component, 'StatesOnSuccess');
      component.StatesOnSuccess(null);
      expect(component.StatesOnSuccess).toHaveBeenCalled();
    });
  });

  describe('initSelection ->', () => {
    it('should set the state variable if source is not null', () => {
      spyOn(component, 'initSelection');
      spyOn(ListHelper, 'findItemByFieldValue').and.returnValue(
        Promise.resolve(stateList[0].Name)
      );
      component.initSelection();
      expect(component.initSelection).toHaveBeenCalled();
    });
    it('should not set state variable if source is null', () => {
      spyOn(component, 'initSelection');
      spyOn(ListHelper, 'findItemByFieldValue').and.returnValue(
        Promise.resolve(null)
      );
      expect(component.initSelection).not.toHaveBeenCalled();
    });
  });

  describe('onStateChanged ->', () => {
    it('if not disableInput, changing value should mark touched and fire onChange()', () => {
      var spy = jasmine.createSpy();
      component.registerOnChange(spy);
      component.stateSource = {
        Name: 'California',
        Abbreviation: 'CA',
      };
      component.onStateChanged({});
      expect(component.touched).toEqual(true);
      expect(spy).toHaveBeenCalledWith('CA');
    });
    it('if disableInput, changing value should not mark touched and should not fire onChange()', () => {
      var spy = jasmine.createSpy();
      component.registerOnChange(spy);
      component.setDisabledState(true);
      component.stateSource = {
        Name: 'California',
        Abbreviation: 'CA',
      };
      component.onStateChanged({});
      expect(component.touched).toEqual(false);
      expect(spy).not.toHaveBeenCalledWith('CA');
    });
  });
});
