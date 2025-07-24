import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { configureTestSuite } from 'src/configure-test-suite';

import { TableSortComponent } from './table-sort.component';

describe('TableSortComponent', () => {
  let component: TableSortComponent;
  let fixture: ComponentFixture<TableSortComponent>;

  configureTestSuite(() => {
    TestBed.configureTestingModule({
      declarations: [ TableSortComponent ]
    });
   });

  beforeEach(() => {
    fixture = TestBed.createComponent(TableSortComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
