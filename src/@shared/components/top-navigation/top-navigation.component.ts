import { Component, Inject, Input, OnInit } from '@angular/core';
import { MenuHelper, MenuItem, SubMenuItem } from 'src/@shared/providers/menu-helper';

import * as moment from 'moment';
declare let _: any;

@Component({
  selector: 'top-navigation',
  templateUrl: './top-navigation.component.html',
  styleUrls: ['./top-navigation.component.scss']
})
export class TopNavigationComponent implements OnInit {
  dayDateDisplay: any = moment(new Date()).format('dddd, MMMM D, YYYY');
  showSecondary = false;
  displayName = "";
  subMenuItems: (SubMenuItem & { Selected?: boolean; })[];
  menuItems: MenuItem[];
  @Input() menuType = '';
  constructor(
    private menuHelper: MenuHelper,
    @Inject('referenceDataService') private referenceDataService,
    @Inject('platformSessionCachingService') private platformSessionCachingService,
    @Inject('FeatureService') private featureService
  ) {
    this.getUserInfo();
  }

  getUserInfo() {
    const users = this.referenceDataService.get(this.referenceDataService.entityNames.users);
    const userContext = this.platformSessionCachingService.userContext.get();
    if (userContext !== null) {
      const currentuser = userContext.Result.User;
      const user = _.find(users, { UserId: currentuser.UserId });
      if (user) {
        const middleName = user.MiddleName || '';
        const suffixName = user.SuffixName || '';
        const designation = user.ProfessionalDesignation || '';
        this.displayName = (user.FirstName + (middleName.length > 0 ? ' ' +
          middleName.charAt(0) : '') + ' ' +
          user.LastName + (suffixName.length > 0 ? ', ' +
            suffixName : '') + ' - ' +
          user.UserCode +
          (designation.length > 0 ? ', ' +
            designation : '')).trim();
      }
    }
  }

  ngOnInit(): void {
    this.subMenuItems = [];
    var itemFound = false;
    var tempMenuItems = [];
    tempMenuItems = this.menuHelper.businessMenuItems();
    if (tempMenuItems) {
      this.featureService.isEnabled('DevelopmentMode').then((res) => {
        this.menuItems = tempMenuItems;
        if (this.menuItems) {
          for (const item of this.menuItems) {
            if (item.Text !== 'Reports') {
              item.Selected = false;
              if (window.location.href.includes(item.Url.substring(1, item.Url.length)) || (item.RouteValue && window.location.href.includes(item.RouteValue.substring(1, item.Url.length)))) {
                item.Selected = true;
                if (item.SubMenuItems && item.SubMenuItems.length > 0) {
                  this.subMenuItems = item.SubMenuItems;
                  for (const subItem of this.subMenuItems) {
                    subItem.Selected = false;
                    if (window.location.href.includes(subItem.Url.substring(1, subItem.Url.length))) {
                      subItem.Selected = true;
                      itemFound = true;
                      document.title = subItem.Title;
                    }
                  }
                  if (!itemFound) {
                    this.subMenuItems[0].Selected = true;
                  }
                }
              }
            }
          }
        }
      });
    }
  }

  menuClick(menuItem) {
    document.title = menuItem.Title;
    window.location = menuItem.Url;
  }
}
