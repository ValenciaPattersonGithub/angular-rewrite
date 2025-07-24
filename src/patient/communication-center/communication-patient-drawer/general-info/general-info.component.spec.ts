import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { TranslateModule } from '@ngx-translate/core';
import { GeneralInfoComponent } from './general-info.component';
import { EnumAsStringPipe } from 'src/@shared/pipes/enumAsString/enum-as-string.pipe';
import { AgePipe } from 'src/@shared/pipes/age/age.pipe';
import { configureTestSuite } from 'src/configure-test-suite';

describe('GeneralInfoComponent', () => {
  let component: GeneralInfoComponent;
  let fixture: ComponentFixture<GeneralInfoComponent>;

  configureTestSuite(() => {
    TestBed.configureTestingModule({
      declarations: [ GeneralInfoComponent, EnumAsStringPipe, AgePipe ],
      imports: [TranslateModule.forRoot()]
    });
   });

  beforeEach(() => {
    fixture = TestBed.createComponent(GeneralInfoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
