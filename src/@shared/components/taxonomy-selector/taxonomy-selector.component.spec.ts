import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DropDownsModule } from '@progress/kendo-angular-dropdowns';
import { configureTestSuite } from 'src/configure-test-suite';
import { TaxonomySelectorComponent } from './taxonomy-selector.component';

let taxonomyList: any = [
  {
    Category: 'Cat1',
    Code: 'C001',
    TaxonomyCodeId: '001',
  },
  {
    Category: 'Cat1',
    Code: 'C002',
    TaxonomyCodeId: '002',
  },
  {
    Category: 'Cat1',
    Code: 'Cxyz',
    TaxonomyCodeId: '003',
  },
];

describe('SoarSelectListComponent', () => {
  let component: TaxonomySelectorComponent;
  let fixture: ComponentFixture<TaxonomySelectorComponent>;

  configureTestSuite(() => {
    TestBed.configureTestingModule({
      imports: [DropDownsModule],
      providers: [],
      declarations: [TaxonomySelectorComponent],
    });
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(TaxonomySelectorComponent);
    component = fixture.componentInstance;
    component.optionList = taxonomyList;
    component.placeHolder = 'Taxonomy code/specialty';
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('Default item is initialized with place holder', () => {
    //component.ngOnInit();
    expect(component.defaultItem.Category).toEqual('Taxonomy code/specialty');
    expect(component.defaultItem.TaxonomyCodeId).toEqual(null);
  });

  it('Changing value should mark touched and fire onChange()', () => {
    var spy = jasmine.createSpy();
    component.registerOnChange(spy);
    component.onSelectionChanged('003');
    expect(component.touched).toEqual(true);
    expect(spy).toHaveBeenCalledWith('003');
  });
});
