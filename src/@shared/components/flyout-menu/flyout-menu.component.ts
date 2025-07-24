import { Component, EventEmitter, Input, Output } from '@angular/core';
import { MenuItem, SubMenuItem } from 'src/@shared/providers/menu-helper';

@Component({
  selector: 'flyout-menu',
  templateUrl: './flyout-menu.component.html',
  styleUrls: ['./flyout-menu.component.scss']
})
export class FlyoutMenuComponent {
  @Input() menuHeader = '';
  @Input() menuType = 0;// 0 for main 1 for sub
  @Input() flyOutMenuItems: MenuItem[];
  @Output() menuClick = new EventEmitter<MenuItem | SubMenuItem>();
  @Input() practiceHasPayerReport = false;

  showSubFlyOutMenu = false;
  subMenuItems: SubMenuItem[];
  subMenuHeader = '';

  constructor() { }

  menuClicked(menuItem: MenuItem | SubMenuItem) {
    if (!menuItem.Disabled) {
      document.title = menuItem.Title;
      this.menuClick.emit(menuItem);
    }
  }

  showSubMenu(menuItem: MenuItem | null | undefined) {
    if (menuItem?.SubMenuItems && menuItem.SubMenuItems.length > 0) {
      if (menuItem.Text.toLowerCase() == 'Insurance'.toLowerCase() && menuItem.SubMenuItems.length >= 7) {
        menuItem.SubMenuItems[6].Disabled = !this.practiceHasPayerReport;
      }
      this.subMenuHeader = menuItem.Title;
      this.subMenuItems = menuItem.SubMenuItems;
      this.showSubFlyOutMenu = true;
    }
    else {
      this.showSubFlyOutMenu = false;
    }
  }

  subMenuClicked($event: MenuItem | SubMenuItem) {
    this.menuClick.emit($event);
  }
}