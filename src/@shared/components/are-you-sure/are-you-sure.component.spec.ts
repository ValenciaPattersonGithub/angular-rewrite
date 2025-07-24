import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { AreYouSureComponent } from './are-you-sure.component';
import { TranslateModule } from '@ngx-translate/core';
import { configureTestSuite } from 'src/configure-test-suite';
import { By } from '@angular/platform-browser';

describe('AreYouSureComponent', () => {
  let component: AreYouSureComponent;
  let fixture: ComponentFixture<AreYouSureComponent>;

  const mockLocalizeService: any = {
    getLocalizedString: () => 'translated text'
  };

  configureTestSuite(() => {
    TestBed.configureTestingModule({
      imports: [
        TranslateModule.forRoot()
      ],
      providers: [
        { provide: 'localize', useValue: mockLocalizeService }
      ],
      declarations: [AreYouSureComponent]
    });
  });

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [AreYouSureComponent]
    })
      .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AreYouSureComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should click Cancel button', async(() => {
    fixture.detectChanges();
    let buttonElement = fixture.debugElement.query(By.css('#btnCancelDiscard'));    

    buttonElement.triggerEventHandler('click', null);
    fixture.detectChanges();

    fixture.whenStable().then(() => {
      expect(component.ifNo).not.toBe(null);      
    });
  }));

  it('should click Confirm button', async(() => {
    fixture.detectChanges();
    let buttonElement = fixture.debugElement.query(By.css('#btnConfirmDiscard'));    

    buttonElement.triggerEventHandler('click', null);
    fixture.detectChanges();

    fixture.whenStable().then(() => {
      expect(component.ifYes).not.toBe(null);      
    });
  }));
});
