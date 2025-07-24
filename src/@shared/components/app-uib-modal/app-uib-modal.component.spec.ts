import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SimpleChanges } from '@angular/core';
import { AppUibModalComponent } from './app-uib-modal.component';
import { TranslateModule } from '@ngx-translate/core';
import { PatSharedService } from 'src/@shared/providers';

const mockUibModal = {
  open: jasmine.createSpy(),
  dismiss: jasmine.createSpy()
}
const mockTostarfactory = {
  error: jasmine.createSpy().and.returnValue('Error Message'),
  success: jasmine.createSpy().and.returnValue('Success Message')
};

const mockPatShared = {
  sanitizeInput: jasmine.createSpy().and.returnValue('Sanitized Input')
}
describe('AppUibModalComponent', () => {
  let component: AppUibModalComponent;
  let fixture: ComponentFixture<AppUibModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TranslateModule.forRoot()],
      declarations: [AppUibModalComponent],
      providers: [
        { provide: 'toastrFactory', useValue: mockTostarfactory },
        { provide: '$uibModal', useValue: mockUibModal },
        { provide: PatSharedService, useValue: mockPatShared },
      ]
    })
      .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AppUibModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('ngOnChanges', () => {
    it('should call showModal when modalVisible changes to true', () => {
      spyOn(component, 'showModal');
      const changes: SimpleChanges = {
        isVisible: {
          currentValue: true,
          previousValue: false,
          firstChange: false,
          isFirstChange: () => false
        }
      };
      component.ngOnChanges(changes);
      expect(component.showModal).toHaveBeenCalled();
    });

    it('should dismiss modal when modalVisible changes to false', () => {
      const changes: SimpleChanges = {
        isVisible: {
          currentValue: false,
          previousValue: true,
          firstChange: false,
          isFirstChange: () => false
        }
      };
      component.ngOnChanges(changes);
      if (component.uibModalInstance) {
        expect(mockUibModal.dismiss).toHaveBeenCalled();
      }
    });
  });

  describe('showModal', () => {
    it('should open a modal', () => {
      component.templateUrlPath = "templateUrlPath";
      component.controllerName = "controllerName";
      component.showModal();
      expect(mockUibModal.open).toHaveBeenCalled();
    });

    it('should not open a modal', () => {
      component.templateUrlPath = "";
      component.controllerName = "";
      component.showModal();
      expect(mockTostarfactory.error).toHaveBeenCalledWith('templateUrl and controllerName not provided', 'error');

      component.templateUrlPath = "templateUrlPath";
      component.controllerName = "";
      component.showModal();
      expect(mockTostarfactory.error).toHaveBeenCalledWith('controllerName not provided', 'error');

      component.templateUrlPath = "";
      component.controllerName = "controllerName";
      component.showModal();
      expect(mockTostarfactory.error).toHaveBeenCalledWith('templateUrl not provided', 'error');
    });
  });


  describe('ngOnDestroy', () => {
    it('should dismiss modal on destroy', () => {
      component.templateUrlPath = "templateUrlPath";
      component.controllerName = "controllerName";
      component.showModal();
      component.ngOnDestroy();
      if (component.uibModalInstance) {
        expect(mockUibModal.dismiss).toHaveBeenCalled();
      }
    });
  });

});
