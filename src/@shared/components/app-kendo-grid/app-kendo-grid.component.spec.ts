import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SimpleChange } from '@angular/core';
import { process, State, SortDescriptor } from "@progress/kendo-data-query";
import { GridModule } from '@progress/kendo-angular-grid';
import { FormsModule, ReactiveFormsModule, FormGroup, FormControl, Validators } from '@angular/forms';

import { AppKendoGridComponent } from './app-kendo-grid.component';
import { DialogContainerService, DialogRef, DialogService } from '@progress/kendo-angular-dialog';
import { of } from 'rxjs';
let dialogservice: DialogService;
let dialogRef: DialogRef;
const mockDialogRef = {
  close: () => of({}),
  open: (dialogResult: any) => { },
  content: {
      instance: {
          title: ''
      }
  }
}
const mockKendoState: State = {
  skip: 0,
  sort: [
    {
      field: "Description",
      dir: "asc",
    }
  ],
  filter: {
    logic: "and",
    filters: [{
      field: "Description",
      operator: "contains",
      value: ""
    }],
  }
};

let mockFormGroup: FormGroup;

let mockData = [{ id: 1, Description: 'test1' }, { id: 2, Description: 'test2' }, { id: 3, Description: 'test3' }];

describe('AppKendoGridComponent', () => {
  let component: AppKendoGridComponent;
  let fixture: ComponentFixture<AppKendoGridComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [AppKendoGridComponent],
      imports: [
        GridModule,
        FormsModule,
        ReactiveFormsModule
      ], providers: [DialogService, DialogContainerService,
        { provide: DialogRef, useValue: mockDialogRef }
       ]
    })
      .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AppKendoGridComponent);
    component = fixture.componentInstance;
    component.formGroup = mockFormGroup;
    component.state = mockKendoState;
    component.data = mockData;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('ngOnChanges -> ', () => {
    it('should call updateGridData if data input changes', () => {
      const changes = new SimpleChange(null, mockData, true);

      spyOn(component, 'updateGridData');
      component.ngOnChanges({ data: changes });
      expect(component.updateGridData).toHaveBeenCalled();
    });

    it('should edit row if hasKendoAddEdit and isEditing is true and formGroup input changes', () => {      
      const changes = new SimpleChange(null, mockFormGroup, true);

      spyOn(component, 'editKendoRow');
      component.isEditing = true;
      component.hasKendoAddEdit = true;
      component.kendoRowData = { sender: {}, rowIndex: 0 };
      component.ngOnChanges({ formGroup: changes });

      fixture.detectChanges();

      expect(component.editKendoRow).toHaveBeenCalled();
    });

    it('should add row if hasKendoAddEdit is true and isEditing is false and formGroup input changes', () => {
      const changes = new SimpleChange(null, mockFormGroup, true);

      spyOn(component, 'addNewRow');
      component.isEditing = false;
      component.hasKendoAddEdit = true;
      component.kendoRowData = { sender: {} };
      component.ngOnChanges({ formGroup: changes });

      fixture.detectChanges();

      expect(component.addNewRow).toHaveBeenCalled();
    });
  });

  describe('updateGridData -> ', () => {
    it('should call process method of kendo grid', () => {
      component.state = mockKendoState;
      const gridData = process(component.data, mockKendoState);
      component.updateGridData();
      
      fixture.detectChanges();

      expect(component.gridData).toEqual(gridData);
    });
  });
});