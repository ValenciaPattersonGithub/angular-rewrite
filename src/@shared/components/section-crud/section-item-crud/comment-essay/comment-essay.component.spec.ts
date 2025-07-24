import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CommentEssayComponent } from './comment-essay.component';

describe('CommentEssayComponent', () => {
  let component: CommentEssayComponent;
  let fixture: ComponentFixture<CommentEssayComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
        declarations: [CommentEssayComponent],
        providers: [
           ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CommentEssayComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
