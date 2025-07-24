import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { SearchBarAutocompleteComponent } from './search-bar-autocomplete.component';
import { DropDownsModule } from '@progress/kendo-angular-dropdowns';
import { configureTestSuite } from 'src/configure-test-suite';

describe('SearchBarComponent', () => {
    let component: SearchBarAutocompleteComponent;
    let fixture: ComponentFixture<SearchBarAutocompleteComponent>;

    configureTestSuite(() => {
        TestBed.configureTestingModule({
            imports: [
                DropDownsModule
            ],
            declarations: [SearchBarAutocompleteComponent]
        });
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(SearchBarAutocompleteComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
