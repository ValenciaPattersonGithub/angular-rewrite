import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { SearchBarAutocompleteByIdComponent } from './search-bar-autocomplete-by-id.component';
import { DropDownsModule } from '@progress/kendo-angular-dropdowns';
import { configureTestSuite } from 'src/configure-test-suite';

describe('SearchBarAutocompleteByIdComponent', () => {
  let component: SearchBarAutocompleteByIdComponent;
  let fixture: ComponentFixture<SearchBarAutocompleteByIdComponent>;

  configureTestSuite(() => {
    TestBed.configureTestingModule({
      imports: [DropDownsModule],
      declarations: [SearchBarAutocompleteByIdComponent],
    });
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SearchBarAutocompleteByIdComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
