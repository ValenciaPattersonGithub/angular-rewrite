import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SectionPreviewComponent } from './section-preview.component';

describe('SectionPreviewComponent', () => {
  let component: SectionPreviewComponent;
  let fixture: ComponentFixture<SectionPreviewComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SectionPreviewComponent ] 
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SectionPreviewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('ngOnInit ->', () => {
    it('should call ngOnInit', () => {
      component.ngOnInit = jasmine.createSpy();
      component.ngOnInit();
      expect(component.ngOnInit).toHaveBeenCalled();
    });
  });
});
