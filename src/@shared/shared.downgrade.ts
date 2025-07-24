import { downgradeComponent, downgradeInjectable } from '@angular/upgrade/static';
import { AccountPaymentTypesDropdownComponent } from './components/account-payment-types-dropdown/account-payment-types-dropdown.component';
import { ButtonMenuComponent } from './components/button-menu/button-menu.component';
import { CollapsableDrawerComponent } from './components/collapsable-drawer/collapsable-drawer.component';
import { DocScanControlService } from './components/doc-scanner/doc-scan-control.service';
import { DocScannerComponent } from './components/doc-scanner/doc-scanner.component';
import { DocUploaderComponent } from './components/doc-uploader/doc-uploader.component';
import { ElapsedTimeComponent } from './components/elapsed-time/elapsed-time.component';
import { AppButtonComponent } from './components/form-controls/button/button.component';
import { ExportChartComponent } from './components/export-chart/export-chart.component';
import { AppCheckBoxComponent } from './components/form-controls/check-box/check-box.component';
import { AppLabelComponent } from './components/form-controls/form-label/form-label.component';
import { AppIconButtonComponent } from './components/form-controls/icon-button/icon-button.component';
import { AppSelectComponent } from './components/form-controls/select-list/select-list.component';
import { TextareaWithVoiceComponent } from './components/form-controls/textarea-with-voice/textarea-with-voice.component';
import { AppToggleComponent } from './components/form-controls/toggle/toggle.component';
import { InsurancePaymentTypesDropdownComponent } from './components/insurance-payment-types-dropdown/insurance-payment-types-dropdown.component';
import { PatientAccountToothFilterComponent } from './components/patient-account-tooth-filter/patient-account-tooth-filter.component';
import { PatientSecondaryNavigationComponent } from './components/patient-secondary-navigation/patient-secondary-navigation.component';
import { ProfileSectionComponent } from './components/profile-section/profile-section.component';
import { ProviderSelectorWithGroupingComponent } from './components/provider-selector-with-grouping/provider-selector-with-grouping.component';
import { ResizableDrawerComponent } from './components/resizable-drawer/resizable-drawer.component';
import { RootSurfaceSelectorComponent } from './components/root-surface-selector/root-surface-selector.component';
import { RotTeethSelectorComponent } from './components/rot-teeth-selector/rot-teeth-selector.component';
import { SearchBarAutocompleteComponent } from './components/search-bar-autocomplete/search-bar-autocomplete.component';
import { SvgDefinitionsComponent } from './components/svg-icons/svg-definitions.component';
import { SvgIconComponent } from './components/svg-icons/svg-icon.component';
import { ToastService } from './components/toaster/toast.service';
import { TopNavigationComponent } from './components/top-navigation/top-navigation.component';
import { WaitOverlayService } from './components/wait-overlay/wait-overlay.service';
import { AdjustmentTypesService } from './providers/adjustment-types.service';
import { BroadcastService } from './providers/broad-cast.service';
import { DocUploadService } from './providers/doc-upload.service';
import { DrawerNotificationService, PatSharedService, ToothUtilityService } from './providers';
import { ScriptService } from './providers/external-script.service';
import { ImagingPatientService } from './providers/imaging-patient.service';
import { LocationChangeService } from './providers/location-change.service';
import { ServiceEstimateCalculationService } from './providers/service-estimate-calculation.service';
import { IndexedDbCacheService } from './providers/indexed-db-cache.service';
import { AreYouSureComponent } from './components/are-you-sure/are-you-sure.component';
import { DropDownListFilterComponent } from './components/drop-down-list-filter/drop-down-list-filter.component';
import { FeeListLocationComponent } from './components/fee-list-location/fee-list-location.component';
import { StateListComponent } from './components/state-list/state-list.component';
import { CdtCodeService } from './providers/cdt-code.service';
import { ConditionsService } from './providers/conditions.service';
import { DiscountTypesService } from './providers/discount-types.service';
import { GroupTypeService } from './providers/group-type.service';
import { InformedConsentMessageService } from './providers/informed-consent-message.service';
import { LocationIdentifierService } from './providers/location-identifier.service';
import { MasterAlertService } from './providers/master-alert.service';
import { NoteTemplatesHttpService } from './providers/note-templates-http.service';
import { PaymentTypesService } from './providers/payment-types.service';
import { PreventiveCareService } from './providers/preventive-care.service';
import { ServerlessSignalrHubConnectionService, ConnectionEventMessageTypes } from './providers/serverless-signalr-hub-connection.service';
import { ServiceCodesService } from './providers/service-codes.service';
import { TeamMemberIdentifierService } from './providers/team-member-identifier.service';
import { TreatmentConsentService } from './providers/treatment-consent.service';
import { NavigationComponent } from './components/navigation/navigation.component';
import { RichTextSanitizerService } from './filters/rich-text-sanitizer.service';
import { ReferralManagementHttpService } from './../@core/http-services/referral-management-http.service';
import { SchedulingSignalRHub } from './providers/signalR/scheduling-signalr-hub.service';
import { NotificationSignalRHub } from './providers/signalR/notification-signalr-hub.service';
import { NotificationsComponent } from './components/notifications/notifications.component';
import { NotificationsService } from './components/notifications/notifications.service';
import { LoaderComponent } from './components/loader/loader.component';
import { DrawTypesService } from './providers/drawtypes.service';
import { AngularParcelComponent } from './components/angular-parcel/angular-parcel.component';
import { PdfService } from './providers/pdf.service';
import { ViewClaimService } from './providers/view-claim.service';


declare var angular: angular.IAngularStatic;

export function SharedDowngrade() {
    angular
        .module('Soar.Main')
        .directive('accountPaymentTypesDropdown', downgradeComponent({ component: AccountPaymentTypesDropdownComponent }))
        .directive('buttonMenu', downgradeComponent({ component: ButtonMenuComponent }))
        .directive('collapsableDrawer', downgradeComponent({ component: CollapsableDrawerComponent }))
        .factory('DocScanControlService', downgradeInjectable(DocScanControlService))
        .directive('docScanner', downgradeComponent({ component: DocScannerComponent }))
        .directive('docUploader', downgradeComponent({ component: DocUploaderComponent }))
        .directive('elapsedTime', downgradeComponent({ component: ElapsedTimeComponent }))
        .directive('appButton', downgradeComponent({ component: AppButtonComponent }))
        .directive('exportChart', downgradeComponent({ component: ExportChartComponent }))
        .directive('appCheckBox', downgradeComponent({ component: AppCheckBoxComponent }))
        .directive('appLabel', downgradeComponent({ component: AppLabelComponent, inputs: ['label', 'fieldId', 'ariaLabel', 'labelClass'] }))
        .directive('iconButton', downgradeComponent({ component: AppIconButtonComponent }))
        .directive(
            'appSelect',
            downgradeComponent({
                component: AppSelectComponent,
                inputs: ['placeholder', 'listItems', 'value', 'size', 'isDisabled', 'label', 'fieldId', 'labelDirection', 'hasError'],
            })
        )
        .directive('appTextarea', downgradeComponent({ component: TextareaWithVoiceComponent }))
        .directive(
            'appToggle',
            downgradeComponent({
                component: AppToggleComponent,
                inputs: ['label', 'labelDirection', 'id', 'value', 'isChecked', 'isDisabled'],
                outputs: ['checkChanged', 'toggled'],
            })
        )
        .directive('insurancePaymentTypesDropdown', downgradeComponent({ component: InsurancePaymentTypesDropdownComponent }))
        .directive('navigation', downgradeComponent({ component: NavigationComponent }))
        .directive('patientAccountToothFilter', downgradeComponent({ component: PatientAccountToothFilterComponent }))
        .directive('patientSecondaryNavigation', downgradeComponent({ component: PatientSecondaryNavigationComponent }))
        .directive('profileSection', downgradeComponent({ component: ProfileSectionComponent }))
        .directive('providerSelectorWithGrouping', downgradeComponent({ component: ProviderSelectorWithGroupingComponent }))
        .directive('resizableDrawer', downgradeComponent({ component: ResizableDrawerComponent }))
        .directive('rootSurfaceSelector', downgradeComponent({ component: RootSurfaceSelectorComponent }))
        .directive('rotTeethSelector', downgradeComponent({ component: RotTeethSelectorComponent }))
        .directive('searchBarAutocomplete', downgradeComponent({ component: SearchBarAutocompleteComponent }))
        .directive('appSvgDefinitionsJs', downgradeComponent({ component: SvgDefinitionsComponent }))
        .directive('loaderComponent', downgradeComponent({ component:LoaderComponent }))
        .directive('svgIcon', downgradeComponent({ component: SvgIconComponent, inputs: ['name', 'iconHeight', 'iconWidth', 'iconColor'] }))
        .factory('ToastService', downgradeInjectable(ToastService))
        .directive('topNavigation', downgradeComponent({ component: TopNavigationComponent }))
        .factory('WaitOverlayService', downgradeInjectable(WaitOverlayService))
        .factory('NewAdjustmentTypesService', downgradeInjectable(AdjustmentTypesService))
        .factory('BroadCastService', downgradeInjectable(BroadcastService))
        .factory('DocUploadService', downgradeInjectable(DocUploadService))
        .factory('DrawerNotificationService', downgradeInjectable(DrawerNotificationService))
        .factory('ScriptService', downgradeInjectable(ScriptService))
        .factory('ImagingPatientService', downgradeInjectable(ImagingPatientService))
        .factory('LocationChangeService', downgradeInjectable(LocationChangeService))
        .factory('PatSharedServices', downgradeInjectable(PatSharedService))
        .factory('ServiceEstimateCalculationService', downgradeInjectable(ServiceEstimateCalculationService))
        .factory('ToothUtilityService', downgradeInjectable(ToothUtilityService))
        .factory('IndexedDbCacheService', downgradeInjectable(IndexedDbCacheService))
        .directive('stateListNg', downgradeComponent({ component: StateListComponent }))
        .directive('feeListLocation', downgradeComponent({ component: FeeListLocationComponent }))
        .factory('ServerlessSignalrHubConnectionService', downgradeInjectable(ServerlessSignalrHubConnectionService))
        .factory('SchedulingSignalrHub', downgradeInjectable(SchedulingSignalRHub))
        .factory('NotificationSignalrHub', downgradeInjectable(NotificationSignalRHub))
        .constant('ConnectionEventMessageTypes', ConnectionEventMessageTypes)
        .directive('dropDownListFiltersNg', downgradeComponent({ component: DropDownListFilterComponent }))
        .directive('areYouSureNg', downgradeComponent({ component: AreYouSureComponent }))
        .factory('TreatmentConsentService', downgradeInjectable(TreatmentConsentService))
        .factory('CdtCodeService', downgradeInjectable(CdtCodeService))
        .factory('MasterAlertService', downgradeInjectable(MasterAlertService))
        .factory('InformedConsentMessageService', downgradeInjectable(InformedConsentMessageService))
        .factory('GroupTypeService', downgradeInjectable(GroupTypeService))
        .factory('TeamMemberIdentifierService', downgradeInjectable(TeamMemberIdentifierService))
        .factory('ConditionsService', downgradeInjectable(ConditionsService))
        .factory('DrawTypesService', downgradeInjectable(DrawTypesService))
        .factory('DiscountTypesService', downgradeInjectable(DiscountTypesService))
        .factory('ServiceCodesService', downgradeInjectable(ServiceCodesService))
        .factory('LocationIdentifierService', downgradeInjectable(LocationIdentifierService))
        .factory('PreventiveCareService', downgradeInjectable(PreventiveCareService))
        .factory('NoteTemplatesHttpService', downgradeInjectable(NoteTemplatesHttpService))
        .factory('NewPaymentTypesService', downgradeInjectable(PaymentTypesService))
        .factory('RichTextSanitizerService', downgradeInjectable(RichTextSanitizerService))
        .factory('ReferralManagementHttpService', downgradeInjectable(ReferralManagementHttpService))
        .directive('notifications', downgradeComponent({ component: NotificationsComponent }))
        .factory('NotificationsService', downgradeInjectable(NotificationsService))
        .directive('angularParcel', downgradeComponent({ component: AngularParcelComponent }))
        .factory('PdfService', downgradeInjectable(PdfService))
        .factory('ViewClaimService', downgradeInjectable(ViewClaimService));
}
