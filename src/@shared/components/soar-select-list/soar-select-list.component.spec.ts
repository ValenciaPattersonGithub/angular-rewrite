import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DropDownsModule } from '@progress/kendo-angular-dropdowns';
import { configureTestSuite } from 'src/configure-test-suite';
import { SoarSelectListComponent } from './soar-select-list.component';

let stateList: any = [
  {
    Name: 'Alaska',
    Abbreviation: 'AS',
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

describe('SoarSelectListComponent', () => {
  let component: SoarSelectListComponent;
  let fixture: ComponentFixture<SoarSelectListComponent>;

  configureTestSuite(() => {
    TestBed.configureTestingModule({
      imports: [DropDownsModule],
      providers: [],
      declarations: [SoarSelectListComponent],
    });
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SoarSelectListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('Default item is initialized with place holder', () => {
    component.placeHolder = 'Select state';
    component.ngOnInit();
    expect(component.defaultItem.text).toEqual('Select state');
    expect(component.defaultItem.value).toEqual(null);
  });

  it('Item source is computed correctly', () => {
    component.placeHolder = 'Select state new';
    component.textField = 'Name';
    component.valueField = 'Abbreviation';
    component.optionList = stateList;
    component.ngOnChanges({ optionList: true, placeHolder: true });
    expect(component.itemSource.length).toEqual(stateList.length);
    expect(component.itemSource[0].text).toEqual(stateList[0].Name);
    expect(component.itemSource[0].value).toEqual(stateList[0].Abbreviation);
    expect(component.defaultItem.text).toEqual('Select state new');
    expect(component.defaultItem.value).toEqual(null);
  });
});
