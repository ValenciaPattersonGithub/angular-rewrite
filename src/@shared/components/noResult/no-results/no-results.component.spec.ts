import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NoResultsComponent } from './no-results.component';

const mockLocalizeService: any = {
    getLocalizedString: () => 'translated text'
};

describe('NoResultsComponent', () => {
  let component: NoResultsComponent;
  let fixture: ComponentFixture<NoResultsComponent>;
  let defaultMessage = 'There are no results that match the filter.';
  let loadingMessage = 'There are no results.';
  let message = 'Now we are filtering';
  beforeEach(async () => {
    await TestBed.configureTestingModule({
        declarations: [NoResultsComponent],
        providers: [{ provide: 'localize', useValue: mockLocalizeService }]
    })
      .compileComponents();
  });
  beforeEach(() => {
    fixture = TestBed.createComponent(NoResultsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });
  it('should create', () => {
    expect(component).toBeTruthy();
  });
  describe('setDefaultMessage function ->', function () {
    it('should set filteringMessage to default if no filteringMessage passed to directive ', function () {
      this.filteringMessage = defaultMessage;
      component.setDefaultMessage();
      expect(this.filteringMessage).toEqual('There are no results that match the filter.');
    });
    it('should set loadingMessage to default if no loadingMessage passed to directive ', function () {
      this.loadingMessage = loadingMessage;
      component.setDefaultMessage();
      expect(this.loadingMessage).toEqual('There are no results.');
    });
  });
  describe('filtering $watch ->', function () {
    it('should set message to filtering message if filtering', function () {
      this.message = message;
      this.filtering = false;
      this.filteringMessage = 'Now we are filtering';
      this.filtering = true;

      expect(this.message).toEqual(this.filteringMessage);
    });
  });
  describe('loading $watch ->', function () {
    it('should set message to loading message if loading', function () {
      component.loadingMessage = 'Now we are loading';
      component.loading = false;
      expect(component.message).toBe(undefined);
      component.onChangeLoading(true);
      component.loading = true;
      expect(component.message).toEqual(component.loadingMessage);
    });
    it('should set message to filtering message if filtering', function () {
      component.loadingMessage = 'Now we are filtering';
      component.filtering = false;
      expect(component.message).toBe(undefined);
      component.onChangeFilter(true);
      component.filtering = true;
      expect(component.message).toEqual(component.filteringMessage);
    });
  });
});