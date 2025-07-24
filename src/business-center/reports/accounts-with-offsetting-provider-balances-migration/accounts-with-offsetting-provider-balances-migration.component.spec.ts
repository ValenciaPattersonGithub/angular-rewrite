import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TranslateModule } from '@ngx-translate/core';

import { AccountWithOffsettingProviderBalancesMigrationComponent } from './accounts-with-offsetting-provider-balances-migration.component';

describe('AccountWithOffsettingProviderBalancesMigrationComponent', () => {
    let component: AccountWithOffsettingProviderBalancesMigrationComponent;
    let fixture: ComponentFixture<AccountWithOffsettingProviderBalancesMigrationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
        declarations: [AccountWithOffsettingProviderBalancesMigrationComponent],
      imports:[TranslateModule.forRoot()]
    })
      .compileComponents();
  });

  beforeEach(() => {
      fixture = TestBed.createComponent(AccountWithOffsettingProviderBalancesMigrationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  describe('Refresh the data', () => {
    it('should create the component', () => {
      let data =
      {
        
      }

      component.data = data;
      component.refreshData = jasmine.createSpy();
      component.ngOnChanges();
      expect(component.refreshData).toHaveBeenCalled();
    });
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
