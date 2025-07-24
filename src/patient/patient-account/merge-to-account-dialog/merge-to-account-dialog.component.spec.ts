import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { MergeToAccountDialogComponent } from './merge-to-account-dialog.component';
import { TranslateModule } from '@ngx-translate/core';
import { DialogRef } from '@progress/kendo-angular-dialog';
import { configureTestSuite } from 'src/configure-test-suite';

describe('MergeToAccountDialogComponent', () => {
  let component: MergeToAccountDialogComponent;
  let fixture: ComponentFixture<MergeToAccountDialogComponent>;
  let dialog: DialogRef;
  let mockDialog = {
    close: jasmine.createSpy(),
  };

  configureTestSuite(() => {
    TestBed.configureTestingModule({
      declarations: [MergeToAccountDialogComponent],
      imports: [TranslateModule.forRoot()],
      providers: [{ provide: DialogRef, useValue: mockDialog }],
    });
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(MergeToAccountDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();

    dialog = TestBed.get(DialogRef);
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('cancelClicked function ->', () => {
    it('should call dialog.close', () => {
      component.cancelClicked();

      expect(dialog.close).toHaveBeenCalledWith();
    });
  });

  describe('okClicked function ->', () => {
    it('should call dialog.close', () => {
      component.okClicked();

      expect(dialog.close).toHaveBeenCalledWith(true);
    });
  });
});
