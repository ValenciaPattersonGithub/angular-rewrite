import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DialogService, DialogContainerService, DialogRef } from '@progress/kendo-angular-dialog';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { of } from 'rxjs';
import { DebugElement } from '@angular/core';
import { By } from '@angular/platform-browser';

import { ServiceCodesPickerModalComponent } from './service-codes-picker-modal.component';
import { ServiceCodesPickerComponent } from 'src/@shared/components/service-codes-picker/service-codes-picker.component';

describe('ServiceCodesPickerModalComponent', () => {
  let component: ServiceCodesPickerModalComponent;
  let fixture: ComponentFixture<ServiceCodesPickerModalComponent>;
  let dialogservice: DialogService;
  let dialogRef: DialogRef;
  let de: DebugElement;

  //region mock
  const mockDialogRef = {
    close: () => of({}),
    open: (dialogResult: any) => { },
    content: {
        instance: {
            title: ''
        }
    },
    result:  of({}),
}

  //End region

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TranslateModule.forRoot()],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
      providers: [
        DialogService,
        DialogContainerService,
        { provide: DialogRef, useValue: mockDialogRef }
      ],
      declarations: [ServiceCodesPickerModalComponent, ServiceCodesPickerComponent]
    })
      .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ServiceCodesPickerModalComponent);
    component = fixture.componentInstance;
    de = fixture.debugElement;
    dialogservice = TestBed.get(DialogService);
    dialogRef = TestBed.get(DialogRef);
    spyOn(dialogservice, 'open').and.returnValue({ content: ServiceCodesPickerComponent, result: of({ primary: true }) });
    fixture.detectChanges();
  });

  it('should create', () => { 
    expect(component).toBeTruthy();
  });

  describe('close -> ', () => {
    it('should close the dialog', () => {
      component.dialog = TestBed.get(DialogRef);
      component.close();
    });
  });

  describe('onSelect -> ', () => {
    it('should call onSelect method', () => {
      spyOn(component, 'close');
      component.dialog = TestBed.get(DialogRef);
      component.onSelect([]);
      expect(component.close).toHaveBeenCalled();
    });
  });

  it('should Call openDialog method', () => {
    dialogservice.open = jasmine.createSpy().and.returnValue(mockDialogRef);
    component.openDialog();
    expect(dialogservice.open).toHaveBeenCalled();
});
});
