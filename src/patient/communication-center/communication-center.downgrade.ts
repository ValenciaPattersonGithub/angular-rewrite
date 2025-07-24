import { downgradeComponent } from "@angular/upgrade/static";
import { CommunicationCenterComponent } from "./communication-center.component";
import { CommunicationCenterHeaderComponent } from "./communication-center-header/communication-center-header.component";
import { CommunicationDrawerTabsComponent } from "./communication-drawer-tabs/communication-drawer-tabs.component";
import { CommunicationHoverMenuComponent } from "./communication-hover-menu/communication-hover-menu.component";
import { CommunicationPrintPreviewComponent } from "./communication-print-preview/communication-print-preview.component";

declare var angular: angular.IAngularStatic;

export function CommunicationCenterDowngrade() {

    angular.module('Soar.Main')
    .directive('communicationCenterLanding', downgradeComponent({ component: CommunicationCenterComponent }))
    .directive('communicationCenterHeader', downgradeComponent({ component: CommunicationCenterHeaderComponent }))
    .directive('communicationDrawerTabs', downgradeComponent({ component: CommunicationDrawerTabsComponent }))
    .directive('communicationHoverMenu', downgradeComponent({ component: CommunicationHoverMenuComponent }))
    .directive('communicationsPrintPreview', downgradeComponent({ component: CommunicationPrintPreviewComponent }));    

}