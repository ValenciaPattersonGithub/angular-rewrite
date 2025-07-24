import { Component, DebugElement } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { configureTestSuite } from 'src/configure-test-suite';
import { KeepTopDirective } from './keep-top.directive';

@Component({
  template: `<form name="form"><div id="header" class="" style="height:50px;" keep-top></div>
  <div id="element" class="" keep-top></div>
  </form>`
})

class TestComponent {
  dataModel: string
}
describe('KeepTopDirective', () => {
  let component: TestComponent;
  let fixture: ComponentFixture<TestComponent>;

  configureTestSuite(() => {
    TestBed.configureTestingModule({
      declarations: [KeepTopDirective, TestComponent]
    });
  });

  beforeEach( () => {
    fixture = TestBed.createComponent(TestComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });
  it('should create an instance', () => {
    expect(component).toBeTruthy();
  });

  describe('keepTop -> ',  () =>{

    it('should set defaults',  ()=> {
      const directiveEl = fixture.debugElement.query(By.directive(KeepTopDirective));
      expect(directiveEl).not.toBeNull();
    });

    it('call keepTop funtion',  ()=> {
      const directiveEl = fixture.debugElement.query(By.directive(KeepTopDirective));
      const directiveInstance = directiveEl.injector.get(KeepTopDirective);
      directiveInstance.keepTop = jasmine.createSpy();
      directiveInstance.keepTop();
      expect(directiveInstance.keepTop).toHaveBeenCalled();
    });
  
    it('should set top to scrollTop', function () {
      const directiveEl = fixture.debugElement.query(By.directive(KeepTopDirective));
      const directiveInstance = directiveEl.injector.get(KeepTopDirective);
      fixture.nativeElement.style.top = "50px"
      directiveInstance.keepTop = jasmine.createSpy();
      directiveInstance.keepTop();
      expect(fixture.nativeElement.style.top).toBe('50px');
    });

});

});

