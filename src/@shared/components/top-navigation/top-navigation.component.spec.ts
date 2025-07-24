import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { SearchPipe } from 'src/@shared/pipes';
import { MenuHelper } from 'src/@shared/providers/menu-helper';

import { TopNavigationComponent } from './top-navigation.component';
import { SvgIconComponent } from '../svg-icons/svg-icon.component';
declare let _: any;

describe('TopNavigationComponent', () => {
  let component: TopNavigationComponent;
  let fixture: ComponentFixture<TopNavigationComponent>;

  let mockReferenceDataService: jasmine.SpyObj<{ get: () => any, entityNames: any }>;
  let mockUserContext: jasmine.SpyObj<{ get: () => any }>;
  let mockFeatureService: jasmine.SpyObj<{ isEnabled: () => Promise<void> }>;
  let mockPatSecurityService: jasmine.SpyObj<{ IsAuthorizedByAbbreviation: () => boolean; }>;
  
  beforeEach(waitForAsync(() => {
    mockReferenceDataService = jasmine.createSpyObj('referenceDataService', ['get']);
    mockReferenceDataService.get.and.returnValue([{ UserId: 1, FirstName: 'John', MiddleName: 'Doe', LastName: 'Smith', SuffixName: 'Jr.', ProfessionalDesignation: 'MD', UserCode: '1234' }]);
    mockReferenceDataService.entityNames = { users: 'users' };

    mockUserContext = jasmine.createSpyObj('platformSessionCachingService', ['get']);
    mockUserContext.get.and.returnValue({ Result: { User: { UserId: 1 } } });

    mockFeatureService = jasmine.createSpyObj('FeatureService', ['isEnabled']);
    mockFeatureService.isEnabled.and.returnValue(Promise.resolve());

    mockPatSecurityService = jasmine.createSpyObj('PatSecurityService', ['IsAuthorizedByAbbreviation']);
    mockPatSecurityService.IsAuthorizedByAbbreviation.and.returnValue(true);

    TestBed.configureTestingModule({
      declarations: [TopNavigationComponent, SearchPipe, SvgIconComponent],
      providers: [
        MenuHelper, 
        { provide: 'referenceDataService', useValue: mockReferenceDataService },
        { provide: 'platformSessionCachingService', useValue: { userContext: mockUserContext } },
        { provide: 'FeatureService', useValue: mockFeatureService },
        { provide: 'patSecurityService', useValue: mockPatSecurityService }
      ]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TopNavigationComponent);
    component = fixture.componentInstance;
    component.menuType = 'Business';
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
