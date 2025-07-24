import { ElementRef, DebugElement, Component, Inject } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { configureTestSuite } from "src/configure-test-suite";
import { CheckRoleAccessDirective } from './check-role-access.directive';


@Component({
  template: `
      <input id="testInput" [(ngModel)]="dataModel"
              name="inpAdd" type="text" CheckRoleAccess="soar-biz-bizloc-add" /> `
})

class TestComponent {
  dataModel: string;
  constructor(private el: ElementRef,
    @Inject('AuthZService') private authZ) {
  }
}

describe('CheckRoleAccessDirective', () => {
  let component: TestComponent;
  let fixture: ComponentFixture<TestComponent>;  

  configureTestSuite(() => {
    TestBed.configureTestingModule({
      imports: [FormsModule],
      declarations: [TestComponent, CheckRoleAccessDirective],
      providers: [
        { provide: 'AuthZService', useValue: {} }
      ]
    });
  });

  beforeEach(async () => {
    fixture = TestBed.createComponent(TestComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', async () => {
    expect(component).toBeTruthy();
  });
});
