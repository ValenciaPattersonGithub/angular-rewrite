import { Component, OnInit } from "@angular/core"
import { ComponentFixture, TestBed } from "@angular/core/testing";
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule } from "@angular/forms";
import { configureTestSuite } from "src/configure-test-suite";
import { ValidEmailDirective } from './valid-email.directive';
@Component({
  template: ` <form [formGroup]="frmUserCrud" name="frmUserCrud" role="form" action="javascript:;">
   <input  class="form-input" id="inpUserName"
    formControlName="UserName" name="inpUserName" type="text"
  validEmail
  required />
  </form>`
})
class TestComponent implements OnInit {
  constructor(private fb: FormBuilder) { }
  dataModel: string;
  frmUserCrud: FormGroup;
  ngOnInit(): void {
    this.frmUserCrud = this.fb.group({
      UserName: ""
    })
  }

}

describe('ValidEmailDirective ->', () => {
  let component: TestComponent;
  let fixture: ComponentFixture<TestComponent>;
  let directive: ValidEmailDirective;
  configureTestSuite(() => {
    TestBed.configureTestingModule({
      imports: [FormsModule, ReactiveFormsModule],
      declarations: [ValidEmailDirective, TestComponent]
    });
  });

  beforeEach(async () => {
    fixture = TestBed.createComponent(TestComponent);
    directive = new ValidEmailDirective();
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('email field validity', () => {
    component.frmUserCrud.controls["UserName"].setValue("abc@@gmail.com");
    expect(component.frmUserCrud.valid).toBeFalsy();

    component.frmUserCrud.controls["UserName"].setValue("sdghsjkdhgkjhdgjksdhgjkhkjhgkjsdhgkdshkjhkgjhsdjkghkjhhhkjH@hjkhsdjfkhdsjkghdkjghjkdshgjkdshgkjdshgjkhdskghkjdhgkjdshgkjdshgkjhdskjghdsjkghkjsdhgkjdshgjkhdsjkghdskjghjdskhgkjdhgkjdshgkjdshjgkhdjkghsdjkghjkdshgjkdshgkjdshgjkdshgjkhdsjkghkdsjhgjkgdshgjkdshgjkdshjgkhdskjghkdsjhgkjdhgkjdshgjkdshjgkhdskjghjkdshgkjdshgkjdshgkj");
    expect(component.frmUserCrud.valid).toBeFalsy();

    component.frmUserCrud.controls["UserName"].setValue("example+firstname+lastname@email.com");
    expect(component.frmUserCrud.valid).toBeTruthy();

    component.frmUserCrud.controls["UserName"].setValue("example@234.234.234.234");
    expect(component.frmUserCrud.valid).toBeTruthy();

    component.frmUserCrud.controls["UserName"].setValue("example@234.234.234.");
    expect(component.frmUserCrud.valid).toBeFalsy();
  });

  it('email field valid case', () => {
    const el = fixture.nativeElement.querySelector('input');
    el.value = 'abc@gmail.com';
    expect(el.value).toBe('abc@gmail.com');
  });

  it('should create', async () => {
    expect(component).toBeTruthy();
  });
})    