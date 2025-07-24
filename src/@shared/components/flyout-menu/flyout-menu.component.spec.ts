import { ComponentFixture, fakeAsync, TestBed, tick, waitForAsync } from '@angular/core/testing';
import { By } from '@angular/platform-browser';

import { FlyoutMenuComponent } from './flyout-menu.component';
import { MenuHelper } from 'src/@shared/providers/menu-helper';
import { FeatureFlagEnabledPipe } from 'src/featureflag/feature-flag-enabled.pipe';
import { FeatureFlagService } from 'src/featureflag/featureflag.service';
import { SvgIconComponent } from '../svg-icons/svg-icon.component';
import { of } from 'rxjs';

describe('FlyoutMenuComponent', () => {
  let component: FlyoutMenuComponent;
  let fixture: ComponentFixture<FlyoutMenuComponent>;
  let menuHelper: MenuHelper;

  let mockFeatureService: jasmine.SpyObj<{ isEnabled: () => Promise<void> }>;

  let mockPatSecurityService: jasmine.SpyObj<{ IsAuthorizedByAbbreviation: () => boolean }>;

  let mockFeatureFlagService: jasmine.SpyObj<FeatureFlagService>;

  beforeEach(waitForAsync(() => {
    mockFeatureService = jasmine.createSpyObj('FeatureService', ['isEnabled']);

    mockPatSecurityService = jasmine.createSpyObj('patSecurityService', ['IsAuthorizedByAbbreviation']);

    mockFeatureFlagService = jasmine.createSpyObj('FeatureFlagService', ['getOnce$']);
    mockFeatureFlagService.getOnce$.and.returnValue(of(true));

    TestBed.configureTestingModule({
      providers: [
        MenuHelper,
        { provide: 'patSecurityService', useValue: mockPatSecurityService },
        { provide: 'FeatureService', useValue: mockFeatureService },
        { provide: FeatureFlagService, useValue: mockFeatureFlagService }
      ],
      declarations: [FlyoutMenuComponent, FeatureFlagEnabledPipe, SvgIconComponent]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FlyoutMenuComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
    menuHelper = TestBed.inject(MenuHelper);
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('menuClicked with all enabled', () => {
    beforeEach(() => {
      component.flyOutMenuItems = menuHelper.businessMenuItems();
      component.flyOutMenuItems[0].Disabled = false;
      fixture.detectChanges();
    });

    it('should call menuClicked function with all enabled', fakeAsync(() => {
      var el = fixture.debugElement.query(By.css('.menuItem'));
      component.menuClicked = jasmine.createSpy();
      el.triggerEventHandler('click', null);
      tick();
      expect(component.menuClicked).toHaveBeenCalled();
    }));


    it('should emit the event', fakeAsync(() => {
      spyOn(component.menuClick, 'emit');
      component.menuClicked(component.flyOutMenuItems[0]);
      tick();
      expect(component.menuClick.emit).toHaveBeenCalled();
    }))

  });

  describe('menuClicked with all Practice At A Glance disabled', () => {
    beforeEach(() => {
      component.flyOutMenuItems = menuHelper.businessMenuItems();
      component.flyOutMenuItems[0].Disabled = true;
      fixture.detectChanges();
    });

    it('should not emit the event', fakeAsync(() => {
      spyOn(component.menuClick, 'emit');
      const event = new MouseEvent('click');
      spyOn(event, 'preventDefault');
      component.menuClicked(component.flyOutMenuItems[0]);
      tick();
      expect(component.menuClick.emit).not.toHaveBeenCalled();
    }));

  });


  describe('secondarymenu functions', () => {
    beforeEach(() => {
      component.flyOutMenuItems = menuHelper.businessMenuItems();
      component.flyOutMenuItems[0].Disabled = false;
      component.flyOutMenuItems[3].Disabled = false;
      component.flyOutMenuItems[3].SubMenuItems[0].Disabled = false;
      component.menuType = 0;
      fixture.detectChanges();
    });

    it('should call showsubmenu function', fakeAsync(() => {
      var el = fixture.debugElement.queryAll(By.css('.menuItem'));
      component.showSubMenu = jasmine.createSpy();
      el[1].triggerEventHandler('mouseover', null);
      tick();
      fixture.detectChanges();
      expect(component.showSubMenu).toHaveBeenCalled();
    }));

    it('should set subMenuItems', () => {
      component.showSubMenu(component.flyOutMenuItems[3]);
      expect(component.subMenuItems).toEqual(component.flyOutMenuItems[3].SubMenuItems);
      expect(component.showSubFlyOutMenu).toBe(true);

      component.showSubMenu(null);
      expect(component.showSubFlyOutMenu).toBe(false);
    });

    it('should handle hard-code payer report sub menu item on showSubMenu', () => {
      component.showSubMenu(component.flyOutMenuItems[2])
      expect(component.subMenuItems[6].Disabled).toBe(true);
    });

    it('click secondary menu', fakeAsync(() => {
      spyOn(component.menuClick, 'emit');
      component.subMenuClicked(component.flyOutMenuItems[3].SubMenuItems[0]);
      expect(component.menuClick.emit).toHaveBeenCalled();
    }));
  });
});
