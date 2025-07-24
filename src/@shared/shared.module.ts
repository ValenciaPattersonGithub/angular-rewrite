import { NgModule } from "@angular/core";
import { CommonModule, CurrencyPipe } from "@angular/common";
import { DragDropModule } from "@angular/cdk/drag-drop";
import { A11yModule } from "@angular/cdk/a11y";
import { OverlayModule } from "@angular/cdk/overlay";
import { PortalModule } from "@angular/cdk/portal";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { PatSharedService } from "./providers";
import { SharedRoutingModule } from "./shared-routing.module";
import { ElapsedTimeComponent } from "./components/elapsed-time/elapsed-time.component";
import { ProfileSectionComponent } from "./components/profile-section/profile-section.component";
import { PatientAccountToothFilterComponent } from "./components/patient-account-tooth-filter/patient-account-tooth-filter.component";
import { ToothDefinitionsPipe } from "./pipes/toothDefinitions/tooth-definitions.pipe";
import { DocPasteImageComponent } from "./components/doc-paste-image/doc-paste-image.component";
import { HighlightTextIfContainsPipe, SearchPipe, OrderByPipe, Search1Pipe } from "./pipes";
import { GetProvidersInPreferredOrderFilter } from "./filters";
import { TranslateModule } from "@ngx-translate/core";
import { ZipCodePipe } from "./pipes/zipCode/zip-code.pipe";
import { formatCurrencyIfNegPipe } from "./pipes/formatCurrencyNeg/format-currency-Neg.pipe";
import { DocScannerComponent } from "./components/doc-scanner/doc-scanner.component";
import { DocScanControlService } from "./components/doc-scanner/doc-scan-control.service";
import { ImagingPatientService } from "./providers/imaging-patient.service";
import { ToShortDisplayDateUtcPipe } from "./pipes/dates/to-short-display-date-utc.pipe";
import { ClaimStatusTextPipe } from "./pipes/claims/claim-status-text.pipe";
import { TooltipModule } from "@progress/kendo-angular-tooltip";
import { PageHeaderComponent } from "./components/page-header/page-header.component";
import { PageNavigationComponent } from "./components/page-navigation/page-navigation.component";
import { DropDownsModule } from "@progress/kendo-angular-dropdowns";
import { DocUploaderComponent } from "./components/doc-uploader/doc-uploader.component";
import { DocUploadService } from "./providers/doc-upload.service";
import { InsurancePaymentTypesDropdownComponent } from "./components/insurance-payment-types-dropdown/insurance-payment-types-dropdown.component";
import { ScrollToTopComponent } from "./components/scroll-to-top/scroll-to-top.component";
import { SearchBarAutocompleteComponent } from "./components/search-bar-autocomplete/search-bar-autocomplete.component";
import { CollapsableDrawerComponent } from "./components/collapsable-drawer/collapsable-drawer.component";
import { SvgIconComponent } from "./components/svg-icons/svg-icon.component";
import { TableSortComponent } from "./components/table-sort/table-sort.component";
import { PhoneNumberPipe } from "./pipes/phone-number/phone-number.pipe";
import { BestPracticePatientNamePipe } from "./pipes/best-practice/best-practice-patient-name.pipe";
import { ToDisplayTimePipe } from "./pipes/time/to-display-time.pipe";
import { ToShortDisplayDatePipe } from "./pipes/dates/to-short-display-date.pipe";
import { TruncateTextPipe } from "./pipes/truncate/truncate-text.pipe";
import { AppButtonComponent } from "./components/form-controls/button/button.component";
import { AppIconButtonComponent } from "./components/form-controls/icon-button/icon-button.component";
import { SideDrawerComponent } from "./components/side-drawer/side-drawer.component";
import { AppMultiselectComponent } from "src/@shared/components/form-controls/multiselect/multiselect.component";
import { CurrencyInputComponent } from "src/@shared/components/currency-input/currency-input.component";
import { PracticeProviderSelectorComponent } from "./components/practice-provider-selector/practice-provider-selector.component";
import { ProviderSelectorComponent } from "./components/provider-selector/provider-selector.component";
import { ConvertToothRangeToQuadrantOrArchCode } from "./pipes/toothConversions/convert-tooth-range-to-quadrant.pipe";
import { AppSelectComponent } from "src/@shared/components/form-controls/select-list/select-list.component";
import { ConfirmationModalService } from "src/@shared/components/confirmation-modal/confirmation-modal.service";
import { ConfirmationModalOverlayRef } from "src/@shared/components/confirmation-modal/confirmation-modal.overlayref";
import { ConfirmationModalComponent } from "src/@shared/components/confirmation-modal/confirmation-modal.component";
import { ResizableDrawerComponent } from "src/@shared/components/resizable-drawer/resizable-drawer.component";
import { EnumAsStringPipe } from "./pipes/enumAsString/enum-as-string.pipe";
import { AppDatePickerComponent } from "./components/form-controls/date-picker/date-picker.component";
import { AppKendoUIModule } from "src/app-kendo-ui/app-kendo-ui.module";
import { AppRadioButtonComponent } from "./components/form-controls/radio-button/radio-button.component";
import { AppCheckBoxComponent } from "./components/form-controls/check-box/check-box.component";
import { EnterpriseService } from "./providers/enterprise/enterprise.service";
import { RootSurfaceSelectorComponent } from "./components/root-surface-selector/root-surface-selector.component";
import { RotTeethSelectorComponent } from "./components/rot-teeth-selector/rot-teeth-selector.component";
import { ToothUtilityService } from "./providers";
import { RotTeethDisplayPipe } from "./pipes";
import { TeethSelectorDisplayPipe } from "./pipes";
import { AreaSelectorDisplayPipe } from "./pipes";
import { DecimalNumberDirective, IsAlphaNumericWithDashAndCommaDirective, OnlyNumberDirective, TooltipDirective, ZipFieldDirective, NumericOnlyDirective, KeepTopDirective } from "./directives";
import { TeethSelectorComponent } from "./components/teeth-selector/teeth-selector.component";
import { ToothAreaService } from "./providers/tooth-area.service";
import { TeethAreaScopeComponent } from "./components/teeth-area-scope/teeth-area-scope.component";
import { AgePipe } from "./pipes/age/age.pipe";
import { ToothAreaDataService } from "./providers/tooth-area-data.service";
import { PatientSecondaryNavigationComponent } from "./components/patient-secondary-navigation/patient-secondary-navigation.component";
import { AppLabelComponent } from "./components/form-controls/form-label/form-label.component";
import { ButtonMenuComponent } from "./components/button-menu/button-menu.component";
import { AppToggleComponent } from "./components/form-controls/toggle/toggle.component";
import { ResponsiblePartySearchComponent } from "./components/responsible-party-search/responsible-party-search.component";
import { UpgradeModule } from "@angular/upgrade/static";
import { NavigationComponent } from "./components/navigation/navigation.component";
import { ChipsComponent } from "./components/chips-component/chips.component";
import { PopoverComponent } from "./components/popover/popover.component";
import { BasicInputComponent } from "./components/form-controls/basic-input/basic-input.component";
import { ToastService } from "./components/toaster/toast.service";
import { defaultToastConfig, TOAST_CONFIG_TOKEN } from "./components/toaster/toast/toast-config";
import { BrowserAnimationsModule } from "@angular/platform-browser/animations";
import { ToastComponent } from "./components/toaster/toast.component";
import { ButtonOnoffComponent } from "./components/button-onoff/button-onoff.component";
import { ProviderSelectorWithGroupingComponent } from "./components/provider-selector-with-grouping/provider-selector-with-grouping.component";
import { ColorPickerComponent } from "./components/color-picker/color-picker.component";
import { ColorPaletteComponent } from "./components/color-picker/color-palette/color-palette.component";
import { ColorSliderComponent } from "./components/color-picker/color-slider/color-slider.component";
import { TextareaComponent } from "./components/form-controls/textarea/textarea.component";
import { TextareaWithVoiceComponent } from "./components/form-controls/textarea-with-voice/textarea-with-voice.component";
import { BroadcastService } from "./providers/broad-cast.service";
import { AccountPaymentTypesDropdownComponent } from "./components/account-payment-types-dropdown/account-payment-types-dropdown.component";
import { FlyoutMenuComponent } from "./components/flyout-menu/flyout-menu.component";
import { MenuHelper } from "./providers/menu-helper";
import { StateListComponent } from "./components/state-list/state-list.component";
import { LimitToDirective } from "./directives/limit-to.directive";
import { CapitalizeFirstDirective } from "./directives/capitalize-first.directive"; // this would execute all downgrade required for later use
import { FeeListLocationComponent } from "./components/fee-list-location/fee-list-location.component";
import { SoarSelectListComponent } from "./components/soar-select-list/soar-select-list.component";
import { IndexedDbCacheService } from "src/@shared/providers/indexed-db-cache.service";
import { SetFocusDirective } from "./directives/set-focus.directive";
import { ValidEmailDirective } from "./directives/valid-email.directive";
import { TaxrateDirective } from "./directives/taxrate.directive";
import { ModelFormatDirective } from "./directives/model-format.directive";
import { AlphaOnlyDirective } from "./directives/alpha-only.directive";
import { TopNavigationComponent } from "./components/top-navigation/top-navigation.component";

import { AlphaNumericTextDirective } from "./directives/alpha-numeric-text.directive";
import { NoResultsComponent } from "./components/noResult/no-results/no-results.component";
import { UiMaskDirective } from "./directives/ui-mask.directive";
import { TaxonomySelectorComponent } from "./components/taxonomy-selector/taxonomy-selector.component";
import { WaitOverlayComponent } from "./components/wait-overlay/wait-overlay.component";
import { WaitOverlayService } from "./components/wait-overlay/wait-overlay.service";
import { SetFocusIfDirective } from "./directives/set-focus-if.directive";
import { ShowFocusDirective } from "./directives/show-focus.directive";
import { ServiceEstimateCalculationService } from "./providers/service-estimate-calculation.service";
import { BoldTextIfContainsPipe } from "./pipes/boldTextIfContains/bold-text-if-contains.pipe";
import { FocusEnterDirective } from "./directives/focus-enter.directive";
import { ConsentMessageComponent } from "./components/consent-message/consent-message.component";
import { ServiceCodesPickerComponent } from "./components/service-codes-picker/service-codes-picker.component";
import { ColumnSortComponent } from "./components/column-sort/column-sort.component";
import { DropDownListFilterComponent } from './components/drop-down-list-filter/drop-down-list-filter.component';
import { FilterService } from "@progress/kendo-angular-grid";
import { AreYouSureComponent } from './components/are-you-sure/are-you-sure.component';
import { AppDateSelectorComponent } from './components/MigrationTransit/app-date-selector/app-date-selector.component';
import { LoaderComponent } from './components/loader/loader.component';
import { AppKendoGridComponent } from './components/app-kendo-grid/app-kendo-grid.component';
import { CheckRoleAccessDirective } from './directives/check-role-access.directive';
import { ExportChartComponent } from "./components/export-chart/export-chart.component";
import { InsurancePaymentIsValidPipe } from './pipes/insurancePaymentIsValid/insurance-payment-is-valid.pipe';
import { CarrierLongLabelPipe } from "./pipes/carrierLongLabel/carrier-long-label.pipe";
import { AccessBasedLocationSelectorComponent } from "./components/access-based-location-selector/access-based-location-selector.component";
import { ServerlessSignalrHubConnectionService } from "./providers/serverless-signalr-hub-connection.service";
import { NotificationBadgeComponent } from "./components/notification-badge/notification-badge.component";
import { AutocompleteComponent } from "./components/autocomplete/autocomplete.component";
import { AutocompleteOptionComponent } from "./components/autocomplete/autocomplete-option.component";
import { NumericTextBoxModule } from '@progress/kendo-angular-inputs';
import { AccordionComponent } from "./components/accordion/accordion.component";
import { SectionHeaderComponent } from "./components/section-crud/section-header/section-header.component";
import { SectionFooterComponent } from "./components/section-crud/section-footer/section-footer.component";
import { SectionItemCrudComponent } from "./components/section-crud/section-item-crud/section-item-crud.component";
import { UndoSupportComponent } from "./components/undo-support/undo-support.component";
import { SkipPromptComponent } from "./components/section-preview/skip-prompt/skip-prompt.component";
import { SectionPreviewComponent } from "./components/section-preview/section-preview.component";
import { AdlibComponent } from "./components/section-crud/section-item-crud/adlib/adlib.component";
import { CommentEssayComponent } from "./components/section-crud/section-item-crud/comment-essay/comment-essay.component";
import { CustomTextFieldComponent } from "./components/section-crud/section-item-crud/custom-text-field/custom-text-field.component";
import { DateStampComponent } from "./components/section-crud/section-item-crud/date-stamp/date-stamp.component";
import { DemographicComponent } from "./components/section-crud/section-item-crud/demographic/demographic.component";
import { EmergencyContactComponent } from "./components/section-crud/section-item-crud/emergency-contact/emergency-contact.component";
import { LinkToothComponent } from "./components/section-crud/section-item-crud/link-tooth/link-tooth.component";
import { MultipleChoiceComponent } from "./components/section-crud/section-item-crud/multiple-choice/multiple-choice.component";
import { YesNoTrueFalseComponent } from "./components/section-crud/section-item-crud/yes-no-true-false/yes-no-true-false.component";
import { SignatureBoxComponent } from "./components/section-crud/section-item-crud/signature-box/signature-box.component";
import { SectionCrudComponent } from "./components/section-crud/section-crud.component";
import { NoteTemplatesHelperService } from "../business-center/practice-settings/chart/note-templates/note-templates-helper.service";
import { AlphaNumericWithSpecialCharactersDirective } from './directives/alpha-numeric-with-special-characters.directive';
import { SearchBarAutocompleteByIdComponent } from './components/search-bar-autocomplete-by-id/search-bar-autocomplete-by-id.component';
import { CharPatternDirective } from './directives/char-pattern.directive';
import { PhoneInfoComponent } from './components/phone-info/phone-info.component';
import { PhoneInfoItemComponent } from './components/phone-info/phone-info-item/phone-info-item.component';
import { NgxMaskModule } from "ngx-mask";
import { CdtCodeService } from "./providers/cdt-code.service";
import { HighlightDirective } from "./directives/highlight.directive";
import { AddPatientBenefitPlansModalService } from "src/patient/patient-benefit-plan/add-patient-benefit-plans-modal.service";
import { FeeListsService } from "./providers/fee-lists.service";


import { GaugeComponent } from './widget/gauge/gauge.component';
import { GaugesModule } from "@progress/kendo-angular-gauges";
import { SimpleHalfDonutComponent } from './widget/simple-half-donut/simple-half-donut.component';
import { ChartsModule } from '@progress/kendo-angular-charts';
import { AddressFieldDirective } from './directives/address-field.directive';
import { NoteTemplatesHttpService } from "./providers/note-templates-http.service";
import { NewStandardService } from "./providers/new-standard.service";
import { FeatureFlagModule } from "src/featureflag/featureflag.module";
import { DateRangeSelectorComponent } from './components/form-controls/date-range-selector/date-range-selector.component';
import { NumericRangeSelectorComponent } from './components/form-controls/numeric-range-selector/numeric-range-selector.component';
import { BadgeComponent } from './components/badge/badge.component';
import { RealTimeEligibilityComponent } from './components/real-time-eligibility/real-time-eligibility.component';
import { PatientAppointmentComponent } from './components/patient-appointment/patient-appointment.component';
import { SubSectionComponent } from './components/sub-section/sub-section.component';
import { SoarSelectListWithGroupingComponent } from "./components/soar-select-list-with-grouping/soar-select-list-with-grouping.component";
import { PatientGridComponent } from "./components/patient-grid/patient-grid.component";
import { NewProfileSectionComponent } from './components/new-profile-section/new-profile-section.component';
import { AppUibModalComponent } from './components/app-uib-modal/app-uib-modal.component';
import { ClickOutsideDirective } from "./directives/clickOutside.directive";
import { RemainingAmountToDistributePipe } from "./pipes/remainingAmountToDistribute/remaining-amount-to-distribute.pipe";
import { ApplyInsurancePaymentIsValidPipe } from "./pipes/applyInsurancePaymentIsValid/apply-insurance-payment-is-valid.pipe";
import { SchedulingSignalRHub } from "./providers/signalR/scheduling-signalr-hub.service";
import { NotificationSignalRHub } from "./providers/signalR/notification-signalr-hub.service";
import { NotificationsComponent } from "./components/notifications/notifications.component";
import { CardReaderSelectComponent } from './components/card-reader-select/card-reader-select.component';
import { PaypageModalComponent } from "./components/paypage-modal/paypage-modal.component";
import { CardReaderSelectModalComponent } from './components/card-reader-select-modal/card-reader-select-modal.component';
import { AngularParcelComponent } from "./components/angular-parcel/angular-parcel.component";

@NgModule({
    declarations: [
        ElapsedTimeComponent,
        ProfileSectionComponent,
        PatientAccountToothFilterComponent,
        ToothDefinitionsPipe,
        DocPasteImageComponent,
        HighlightTextIfContainsPipe,
        SearchPipe,
        DocScannerComponent,
        ZipCodePipe,
        formatCurrencyIfNegPipe,
        OrderByPipe,
        ToShortDisplayDateUtcPipe,
        ClaimStatusTextPipe,
        PageHeaderComponent,
        PageNavigationComponent,
        DocUploaderComponent,
        ExportChartComponent,
        InsurancePaymentTypesDropdownComponent,
        ScrollToTopComponent,
        SearchBarAutocompleteComponent,
        CollapsableDrawerComponent,
        SvgIconComponent,
        TableSortComponent,
        PhoneNumberPipe,
        BestPracticePatientNamePipe,
        ToDisplayTimePipe,
        ToShortDisplayDatePipe,
        TruncateTextPipe,
        AppButtonComponent,
        AppIconButtonComponent,
        SideDrawerComponent,
        AppMultiselectComponent,
        CurrencyInputComponent,
        PracticeProviderSelectorComponent,
        ProviderSelectorComponent,
        ConvertToothRangeToQuadrantOrArchCode,
        GetProvidersInPreferredOrderFilter,
        AppSelectComponent,
        ConfirmationModalComponent,
        ResizableDrawerComponent,
        EnumAsStringPipe,
        AppDatePickerComponent,
        AppRadioButtonComponent,
        AppCheckBoxComponent,
        RootSurfaceSelectorComponent,
        RotTeethSelectorComponent,
        RotTeethDisplayPipe,
        TeethSelectorDisplayPipe,
        AreaSelectorDisplayPipe,
        IsAlphaNumericWithDashAndCommaDirective,
        AgePipe,
        TeethSelectorComponent,
        TeethAreaScopeComponent,
        PatientSecondaryNavigationComponent,
        AppLabelComponent,
        ButtonMenuComponent,
        AppToggleComponent,
        ResponsiblePartySearchComponent,
        NavigationComponent,
        ChipsComponent,
        OnlyNumberDirective,
        PopoverComponent,
        DecimalNumberDirective,
        BasicInputComponent,
        TooltipDirective,
        ToastComponent,
        ButtonOnoffComponent,
        ProviderSelectorWithGroupingComponent,
        ColorPickerComponent,
        ColorPaletteComponent,
        ColorSliderComponent,
        TextareaComponent,
        TextareaWithVoiceComponent,
        AccountPaymentTypesDropdownComponent,
        FlyoutMenuComponent,
        LimitToDirective,
        CapitalizeFirstDirective,
        SetFocusDirective,
        StateListComponent,
        ValidEmailDirective,
        LimitToDirective,
        FeeListLocationComponent,
        SoarSelectListComponent,
        AlphaNumericTextDirective,
        TaxrateDirective,
        ModelFormatDirective,
        ZipFieldDirective,
        NumericOnlyDirective,
        KeepTopDirective,
        ModelFormatDirective,
        TaxrateDirective,
        AlphaOnlyDirective,
        TopNavigationComponent,
        NoResultsComponent,
        UiMaskDirective,
        TaxonomySelectorComponent,
        WaitOverlayComponent,
        SetFocusIfDirective,
        ShowFocusDirective,
        BoldTextIfContainsPipe,
        FocusEnterDirective,
        ConsentMessageComponent,
        ServiceCodesPickerComponent,
        ColumnSortComponent,
        Search1Pipe,
        DropDownListFilterComponent,
        AreYouSureComponent,
        AppDateSelectorComponent,
        LoaderComponent,
        AppKendoGridComponent,
        CheckRoleAccessDirective,
        CarrierLongLabelPipe,
        AccessBasedLocationSelectorComponent,
        InsurancePaymentIsValidPipe,
        RemainingAmountToDistributePipe,
        NotificationBadgeComponent,
        AutocompleteComponent,
        AutocompleteOptionComponent,
        AccordionComponent,
        SectionHeaderComponent,
        SectionFooterComponent,
        SectionItemCrudComponent,
        UndoSupportComponent,
        SectionPreviewComponent,
        SkipPromptComponent,
        AdlibComponent,
        CommentEssayComponent,
        CustomTextFieldComponent,
        DateStampComponent,
        DemographicComponent,
        EmergencyContactComponent,
        LinkToothComponent,
        MultipleChoiceComponent,
        YesNoTrueFalseComponent,
        SignatureBoxComponent,
        SectionCrudComponent,
        CharPatternDirective,
        AlphaNumericWithSpecialCharactersDirective,
        SearchBarAutocompleteByIdComponent,
        PhoneInfoComponent,
        PhoneInfoItemComponent,
        HighlightDirective,
        GaugeComponent,
        SimpleHalfDonutComponent,
        AddressFieldDirective,
        DateRangeSelectorComponent,
        NumericRangeSelectorComponent,
        BadgeComponent,
        RealTimeEligibilityComponent,
        PatientAppointmentComponent,
        SubSectionComponent,
        SoarSelectListWithGroupingComponent,
        PatientGridComponent,
        NewProfileSectionComponent,
        AppUibModalComponent,
        ClickOutsideDirective,
        ApplyInsurancePaymentIsValidPipe,
        NotificationsComponent,
        CardReaderSelectComponent,
        PaypageModalComponent,
        CardReaderSelectModalComponent,
        AngularParcelComponent
    ],
    imports: [
        ChartsModule,
        CommonModule,
        SharedRoutingModule,
        TranslateModule,
        FormsModule,
        ReactiveFormsModule,
        DropDownsModule,
        GaugesModule,
        DragDropModule,
        A11yModule,
        OverlayModule,
        PortalModule,
        AppKendoUIModule,
        UpgradeModule,
        BrowserAnimationsModule,
        FeatureFlagModule,
        NumericTextBoxModule,
        NgxMaskModule.forRoot()
    ],
    exports: [
        TooltipModule,
        FormsModule,
        HighlightTextIfContainsPipe,
        SearchPipe,
        formatCurrencyIfNegPipe,
        OrderByPipe,
        ToShortDisplayDateUtcPipe,
        PageHeaderComponent,
        ToDisplayTimePipe,
        ToShortDisplayDatePipe,
        PageNavigationComponent,
        ScrollToTopComponent,
        SearchBarAutocompleteComponent,
        SearchBarAutocompleteByIdComponent,
        TableSortComponent,
        TruncateTextPipe,
        AppButtonComponent,
        AppIconButtonComponent,
        SideDrawerComponent,
        PracticeProviderSelectorComponent,
        ProviderSelectorComponent,
        CurrencyInputComponent,
        ConvertToothRangeToQuadrantOrArchCode,
        GetProvidersInPreferredOrderFilter,
        AppMultiselectComponent,
        AppSelectComponent,
        ConfirmationModalComponent,
        ResizableDrawerComponent,
        EnumAsStringPipe,
        AppDatePickerComponent,
        AppRadioButtonComponent,
        AppCheckBoxComponent,
        RootSurfaceSelectorComponent,
        RotTeethSelectorComponent,
        RotTeethDisplayPipe,
        TeethSelectorDisplayPipe,
        AreaSelectorDisplayPipe,
        IsAlphaNumericWithDashAndCommaDirective,
        TeethSelectorComponent,
        TeethAreaScopeComponent,
        AgePipe,
        PhoneNumberPipe,
        PatientSecondaryNavigationComponent,
        AppToggleComponent,
        BasicInputComponent,
        AppLabelComponent,
        SvgIconComponent,
        ButtonMenuComponent,
        ResponsiblePartySearchComponent,
        ChipsComponent,
        PopoverComponent,
        OnlyNumberDirective,
        ExportChartComponent,
        NavigationComponent,
        DocUploaderComponent,
        DocScannerComponent,
        DecimalNumberDirective,
        TooltipDirective,
        ToastComponent,
        ButtonOnoffComponent,
        ProviderSelectorWithGroupingComponent,
        ColorPickerComponent,
        ColorSliderComponent,
        ColorPaletteComponent,
        TextareaComponent,
        TextareaWithVoiceComponent,
        AccountPaymentTypesDropdownComponent,
        StateListComponent,
        CapitalizeFirstDirective,
        SetFocusDirective,
        LimitToDirective,
        FeeListLocationComponent,
        ValidEmailDirective,
        TaxrateDirective,
        AlphaNumericTextDirective,
        ModelFormatDirective,
        ZipFieldDirective,
        NumericOnlyDirective,
        KeepTopDirective,
        AlphaOnlyDirective,
        TopNavigationComponent,
        NoResultsComponent,
        SoarSelectListComponent,
        UiMaskDirective,
        TaxonomySelectorComponent,
        ZipCodePipe,
        SetFocusIfDirective,
        ShowFocusDirective,
        BoldTextIfContainsPipe,
        FocusEnterDirective,
        ConsentMessageComponent,
        ServiceCodesPickerComponent,
        ColumnSortComponent,
        Search1Pipe,
        DropDownListFilterComponent,
        AreYouSureComponent,
        AppDateSelectorComponent,
        ProfileSectionComponent,
        LoaderComponent,
        AppKendoGridComponent,
        CheckRoleAccessDirective,
        InsurancePaymentTypesDropdownComponent,
        AccessBasedLocationSelectorComponent,
        InsurancePaymentIsValidPipe,
        RemainingAmountToDistributePipe,
        NotificationBadgeComponent,
        AutocompleteComponent,
        AutocompleteOptionComponent,
        NumericTextBoxModule,
        AccordionComponent,
        SectionHeaderComponent,
        SectionFooterComponent,
        SectionItemCrudComponent,
        UndoSupportComponent,
        SectionPreviewComponent,
        SkipPromptComponent,
        AdlibComponent,
        CommentEssayComponent,
        CustomTextFieldComponent,
        DateStampComponent,
        DemographicComponent,
        EmergencyContactComponent,
        LinkToothComponent,
        MultipleChoiceComponent,
        YesNoTrueFalseComponent,
        SignatureBoxComponent,
        SectionCrudComponent,
        AlphaNumericWithSpecialCharactersDirective,
        SectionCrudComponent,
        CharPatternDirective,
        PhoneInfoComponent,
        PhoneInfoItemComponent,
        HighlightDirective,
        GaugeComponent,
        SimpleHalfDonutComponent,
        AddressFieldDirective,
        DateRangeSelectorComponent,
        NumericRangeSelectorComponent,
        BadgeComponent,
        SubSectionComponent,
        PatientAppointmentComponent,
        SoarSelectListWithGroupingComponent,
        RealTimeEligibilityComponent,
        PatientGridComponent,
        NewProfileSectionComponent,
        AppUibModalComponent,
        ClickOutsideDirective,
        ApplyInsurancePaymentIsValidPipe,
        CardReaderSelectComponent,
        PaypageModalComponent,
        CardReaderSelectModalComponent,
        AngularParcelComponent
    ],
    providers: [
        NoteTemplatesHelperService,
        DocScanControlService,
        PatSharedService,
        ImagingPatientService,
        DocUploadService,
        EnterpriseService,
        CurrencyPipe,
        Search1Pipe,
        { provide: "StaticData", useFactory: ($injector: any) => $injector.get("StaticData"), deps: ["$injector"] },
        {
            provide: "PatientValidationFactory",
            useFactory: ($injector: any) => $injector.get("PatientValidationFactory"),
            deps: ["$injector"],
        },
        { provide: "DocumentGroupsService", useFactory: ($injector: any) => $injector.get("DocumentGroupsService"), deps: ["$injector"] },
        { provide: "PatientServices", useFactory: ($injector: any) => $injector.get("PatientServices"), deps: ["$injector"] },
        { provide: "PatientServicesFactory", useFactory: ($injector: any) => $injector.get("PatientServicesFactory"), deps: ["$injector"] },
        { provide: "RecentDocumentsService", useFactory: ($injector: any) => $injector.get("RecentDocumentsService"), deps: ["$injector"] },
        { provide: "FileUploadFactory", useFactory: ($injector: any) => $injector.get("FileUploadFactory"), deps: ["$injector"] },
        { provide: "PatientDocumentsFactory", useFactory: ($injector: any) => $injector.get("PatientDocumentsFactory"), deps: ["$injector"] },
        { provide: "windowObject", useValue: window },
        { provide: "TreatmentPlansFactory", useFactory: ($injector: any) => $injector.get("TreatmentPlansFactory"), deps: ["$injector"] },
        { provide: "TreatmentPlanChangeService", useFactory: ($injector: any) => $injector.get("TreatmentPlanChangeService"), deps: ["$injector"] },
        { provide: "PatientLandingFactory", useFactory: ($injector: any) => $injector.get("PatientLandingFactory"), deps: ["$injector"] },
        { provide: "ProviderShowOnScheduleFactory", useFactory: ($injector: any) => $injector.get("ProviderShowOnScheduleFactory"), deps: ["$injector"] },
        { provide: "FeatureService", useFactory: ($injector: any) => $injector.get("FeatureService"), deps: ["$injector"] },
        { provide: "ListHelper", useFactory: ($injector: any) => $injector.get("ListHelper"), deps: ["$injector"] },
        { provide: "MultiLocationProposedServiceFactory", useFactory: ($injector: any) => $injector.get("MultiLocationProposedServiceFactory"), deps: ["$injector"] },
        { provide: "ImagingMasterService", useFactory: ($injector: any) => $injector.get("ImagingMasterService"), deps: ["$injector"] },
        { provide: "ImagingProviders", useFactory: ($injector: any) => $injector.get("ImagingProviders"), deps: ["$injector"] },
        { provide: "tabLauncher", useFactory: ($injector: any) => $injector.get("tabLauncher"), deps: ["$injector"] },
        { provide: "PatientCountFactory", useFactory: ($injector: any) => $injector.get("PatientCountFactory"), deps: ["$injector"] },
        { provide: "PatientBenefitPlansFactory", useFactory: ($injector: any) => $injector.get("PatientBenefitPlansFactory"), deps: ["$injector"] },
        { provide: "RealTimeEligibilityFactory", useFactory: ($injector: any) => $injector.get("RealTimeEligibilityFactory"), deps: ["$injector"] },
        ZipCodePipe,
        formatCurrencyIfNegPipe,
        PhoneNumberPipe,
        ToDisplayTimePipe,
        BestPracticePatientNamePipe,
        CarrierLongLabelPipe,
        ConvertToothRangeToQuadrantOrArchCode,
        GetProvidersInPreferredOrderFilter,
        ConfirmationModalService,
        ToothUtilityService,
        ToothAreaService,
        ToothAreaDataService,
        InsurancePaymentIsValidPipe,
        RemainingAmountToDistributePipe,
        ApplyInsurancePaymentIsValidPipe,
        { provide: "PracticesApiService", useFactory: ($injector: any) => $injector.get("PracticesApiService"), deps: ["$injector"] },
        ToastService,
        {
            provide: TOAST_CONFIG_TOKEN,
            useValue: { ...defaultToastConfig },
        },
        BroadcastService,
        MenuHelper,
        { provide: "PayerReportsService", useFactory: ($injector: any) => $injector.get("PayerReportsService"), deps: ["$injector"] },
        IndexedDbCacheService,
        ServerlessSignalrHubConnectionService,
        SchedulingSignalRHub,
        NotificationSignalRHub,
        WaitOverlayService,
        ServiceEstimateCalculationService,
        FilterService,
        CdtCodeService,
        FeeListsService,
        AddPatientBenefitPlansModalService,
        NoteTemplatesHttpService,
        NewStandardService,
        { provide: '$uibModal', useFactory: ($injector: any) => $injector.get('$uibModal'), deps: ['$injector'] }
    ],
    entryComponents: [
        ElapsedTimeComponent,
        ProfileSectionComponent,
        PatientAccountToothFilterComponent,
        DocPasteImageComponent,
        InsurancePaymentTypesDropdownComponent,
        DocScannerComponent,
        DocUploaderComponent,
        ExportChartComponent,
        ScrollToTopComponent,
        SearchBarAutocompleteComponent,
        SearchBarAutocompleteByIdComponent,
        CollapsableDrawerComponent,
        AppButtonComponent,
        AppIconButtonComponent,
        SideDrawerComponent,
        AppSelectComponent,
        AppMultiselectComponent,
        PracticeProviderSelectorComponent,
        ProviderSelectorComponent,
        ConfirmationModalComponent,
        ResizableDrawerComponent,
        AppDatePickerComponent,
        AppRadioButtonComponent,
        AppCheckBoxComponent,
        RootSurfaceSelectorComponent,
        RotTeethSelectorComponent,
        TeethSelectorComponent,
        PatientSecondaryNavigationComponent,
        ButtonMenuComponent,
        ResponsiblePartySearchComponent,
        ChipsComponent,
        SvgIconComponent,
        NavigationComponent,
        AppToggleComponent,
        BasicInputComponent,
        ToastComponent,
        ButtonOnoffComponent,
        ProviderSelectorWithGroupingComponent,
        ColorPickerComponent,
        ColorSliderComponent,
        ColorPaletteComponent,
        TextareaComponent,
        TextareaWithVoiceComponent,
        AccountPaymentTypesDropdownComponent,
        FeeListLocationComponent,
        StateListComponent,
        SoarSelectListComponent,
        TopNavigationComponent,
        TaxonomySelectorComponent,
        WaitOverlayComponent,
        DropDownListFilterComponent,
        AreYouSureComponent,
        AppDateSelectorComponent,
        ProfileSectionComponent,
        LoaderComponent,
        AppKendoGridComponent,
        NotificationBadgeComponent,
        AutocompleteComponent,
        AutocompleteOptionComponent,
        NumericRangeSelectorComponent,
        BadgeComponent,
        SubSectionComponent,
        PatientAppointmentComponent,
        SoarSelectListWithGroupingComponent,
        RealTimeEligibilityComponent,
        DateRangeSelectorComponent,
        PatientGridComponent,
        NewProfileSectionComponent,
        AppUibModalComponent,
        NotificationsComponent,
        CardReaderSelectComponent,
        PaypageModalComponent,
        CardReaderSelectModalComponent,
        AngularParcelComponent
    ],
})
export class SharedModule {
    constructor(public upgrade: UpgradeModule) { }
}
