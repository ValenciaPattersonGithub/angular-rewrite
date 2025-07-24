import { Component, OnInit, Renderer2, TemplateRef, ViewChild } from '@angular/core';


// needed for confirmation modal example
import { ConfirmationModalService } from '../../@shared/components/confirmation-modal/confirmation-modal.service';
import { ConfirmationModalOverlayRef } from '../../@shared/components/confirmation-modal/confirmation-modal.overlayref';
import { take, filter } from 'rxjs/operators';
import { Subscription } from 'rxjs';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ToastService } from 'src/@shared/components/toaster/toast.service';
import { ToastType } from 'src/@shared/components/toaster/toast/toast-config';
import { ServiceCodesPickerModalComponent } from '../service-code/service-codes-picker-modal/service-codes-picker-modal.component';
import { SeriesData, GaugeChartType, GaugeFiltersTypes } from 'src/@shared/widget/gauge/gauge-chart.model';
import { SimpleHalfDonutChart, SimpleHalfDonutFiltersTypes } from 'src/@shared/widget/simple-half-donut/simple-half-donut';
import { ScrollMode } from '@progress/kendo-angular-grid';

@Component({
    selector: 'new-control-testing-view',
    templateUrl: './new-control-testing-view.component.html',
    styleUrls: ['./new-control-testing-view.component.scss']
})
export class NewControlTestingViewComponent implements OnInit {
    @ViewChild('grid') public grid: any;

    public scrollable: ScrollMode = 'scrollable';
    public gridData = [
        {
            "PatienttName": " 1 Adams, Garrett",
            "TreatmentPlanTotalBalance": "$0.00",
        },
        {
            "PatienttName": "2 Rufus",
            "TreatmentPlanTotalBalance": "$270.60",
        },
        {
            "PatienttName": "3 Sugar",
            "TreatmentPlanTotalBalance": "$1,590.00",
        },
        {
            "PatienttName": "4 Adams, Garrett",
            "TreatmentPlanTotalBalance": "$0.00",
        },
        {
            "PatienttName": "5 Rufus",
            "TreatmentPlanTotalBalance": "$270.60",
        },
        {
            "PatienttName": "6 Sugar",
            "TreatmentPlanTotalBalance": "$1,590.00",
        },
        {
            "PatienttName": "7 Adams, Garrett",
            "TreatmentPlanTotalBalance": "$0.00",
        },
        {
            "PatienttName": "8 Rufus",
            "TreatmentPlanTotalBalance": "$270.60",
        },
        {
            "PatienttName": "9 Sugar",
            "TreatmentPlanTotalBalance": "$1,590.00",
        },
        {
            "PatienttName": "10 Adams, Garrett",
            "TreatmentPlanTotalBalance": "$0.00",
        },
        {
            "PatienttName": "11 Rufus",
            "TreatmentPlanTotalBalance": "$270.60",
        },
        {
            "PatienttName": "12 Sugar",
            "TreatmentPlanTotalBalance": "$1,590.00",
        },
        {
            "PatienttName": "13 Adams, Garrett",
            "TreatmentPlanTotalBalance": "$0.00",
        },
        {
            "PatienttName": "14 Rufus",
            "TreatmentPlanTotalBalance": "$270.60",
        },
        {
            "PatienttName": "15 Sugar",
            "TreatmentPlanTotalBalance": "$1,590.00",
        },
        {
            "PatienttName": "16 Adams, Garrett",
            "TreatmentPlanTotalBalance": "$0.00",
        },
        {
            "PatienttName": "17 Rufus",
            "TreatmentPlanTotalBalance": "$270.60",
        },
        {
            "PatienttName": "18 Sugar",
            "TreatmentPlanTotalBalance": "$1,590.00",
        },
        {
            "PatienttName": "19 Adams, Garrett",
            "TreatmentPlanTotalBalance": "$0.00",
        },
        {
            "PatienttName": "20 Rufus",
            "TreatmentPlanTotalBalance": "$270.60",
        },
        {
            "PatienttName": "21 Sugar",
            "TreatmentPlanTotalBalance": "$1,590.00",
        },
        {
            "PatienttName": "22 Adams, Garrett",
            "TreatmentPlanTotalBalance": "$0.00",
        },
        {
            "PatienttName": "23 Rufus",
            "TreatmentPlanTotalBalance": "$270.60",
        },
        {
            "PatienttName": "24 Sugar",
            "TreatmentPlanTotalBalance": "$1,590.00",
        }
        ,
        {
            "PatienttName": "25 Adams, Garrett",
            "TreatmentPlanTotalBalance": "$0.00",
        },
        {
            "PatienttName": "26 Rufus",
            "TreatmentPlanTotalBalance": "$270.60",
        },
        {
            "PatienttName": "27 Sugar",
            "TreatmentPlanTotalBalance": "$1,590.00",
        },
        {
            "PatienttName": " 28 Adams, Garrett",
            "TreatmentPlanTotalBalance": "$0.00",
        },
        {
            "PatienttName": "29 Rufus",
            "TreatmentPlanTotalBalance": "$270.60",
        },
        {
            "PatienttName": "30 Sugar",
            "TreatmentPlanTotalBalance": "$1,590.00",
        },
        {
            "PatienttName": "31 Adams, Garrett",
            "TreatmentPlanTotalBalance": "$0.00",
        },
        {
            "PatienttName": "32 Rufus",
            "TreatmentPlanTotalBalance": "$270.60",
        },
        {
            "PatienttName": "33 Sugar",
            "TreatmentPlanTotalBalance": "$1,590.00",
        },
        {
            "PatienttName": "34 Adams, Garrett",
            "TreatmentPlanTotalBalance": "$0.00",
        },
        {
            "PatienttName": "35 Rufus",
            "TreatmentPlanTotalBalance": "$270.60",
        },
        {
            "PatienttName": "36 Sugar",
            "TreatmentPlanTotalBalance": "$1,590.00",
        },
        {
            "PatienttName": "37 Adams, Garrett",
            "TreatmentPlanTotalBalance": "$0.00",
        },
        {
            "PatienttName": "38 Rufus",
            "TreatmentPlanTotalBalance": "$270.60",
        },
        {
            "PatienttName": "39 Sugar",
            "TreatmentPlanTotalBalance": "$1,590.00",
        },
        {
            "PatienttName": "40 Adams, Garrett",
            "TreatmentPlanTotalBalance": "$0.00",
        },
        {
            "PatienttName": "41 Rufus",
            "TreatmentPlanTotalBalance": "$270.60",
        },
        {
            "PatienttName": "42 Sugar",
            "TreatmentPlanTotalBalance": "$1,590.00",
        },
        {
            "PatienttName": "43 Adams, Garrett",
            "TreatmentPlanTotalBalance": "$0.00",
        },
        {
            "PatienttName": "44 Rufus",
            "TreatmentPlanTotalBalance": "$270.60",
        },
        {
            "PatienttName": "45 Sugar",
            "TreatmentPlanTotalBalance": "$1,590.00",
        },
        {
            "PatienttName": "46 Adams, Garrett",
            "TreatmentPlanTotalBalance": "$0.00",
        },
        {
            "PatienttName": "47 Rufus",
            "TreatmentPlanTotalBalance": "$270.60",
        },
        {
            "PatienttName": "48 Sugar",
            "TreatmentPlanTotalBalance": "$1,590.00",
        },
        {
            "PatienttName": "49 Adams, Garrett",
            "TreatmentPlanTotalBalance": "$0.00",
        },
        {
            "PatienttName": "50 Rufus",
            "TreatmentPlanTotalBalance": "$270.60",
        },
        {
            "PatienttName": "51 Sugar",
            "TreatmentPlanTotalBalance": "$1,590.00",
        }
        ,
        {
            "PatienttName": "52 Adams, Garrett",
            "TreatmentPlanTotalBalance": "$0.00",
        },
        {
            "PatienttName": "53 Rufus",
            "TreatmentPlanTotalBalance": "$270.60",
        },
        {
            "PatienttName": "54 Sugar",
            "TreatmentPlanTotalBalance": "$1,590.00",
        },
        {
            "PatienttName": "55 Adams, Garrett",
            "TreatmentPlanTotalBalance": "$0.00",
        },
        {
            "PatienttName": "56 Rufus",
            "TreatmentPlanTotalBalance": "$270.60",
        },
        {
            "PatienttName": "57 Sugar",
            "TreatmentPlanTotalBalance": "$1,590.00",
        },
        {
            "PatienttName": "58 Adams, Garrett",
            "TreatmentPlanTotalBalance": "$0.00",
        },
        {
            "PatienttName": "59 Rufus",
            "TreatmentPlanTotalBalance": "$270.60",
        },
        {
            "PatienttName": "60 Sugar",
            "TreatmentPlanTotalBalance": "$1,590.00",
        },
        {
            "PatienttName": "61 Adams, Garrett",
            "TreatmentPlanTotalBalance": "$0.00",
        },
        {
            "PatienttName": "62 Rufus",
            "TreatmentPlanTotalBalance": "$270.60",
        },
        {
            "PatienttName": "63 Sugar",
            "TreatmentPlanTotalBalance": "$1,590.00",
        },
        {
            "PatienttName": "64 Adams, Garrett",
            "TreatmentPlanTotalBalance": "$0.00",
        },
        {
            "PatienttName": "65 Rufus",
            "TreatmentPlanTotalBalance": "$270.60",
        },
        {
            "PatienttName": "66 Sugar",
            "TreatmentPlanTotalBalance": "$1,590.00",
        },
        {
            "PatienttName": "67 Adams, Garrett",
            "TreatmentPlanTotalBalance": "$0.00",
        },
        {
            "PatienttName": "68 Rufus",
            "TreatmentPlanTotalBalance": "$270.60",
        },
        {
            "PatienttName": "69 Sugar",
            "TreatmentPlanTotalBalance": "$1,590.00",
        },
        {
            "PatienttName": "70 Adams, Garrett",
            "TreatmentPlanTotalBalance": "$0.00",
        },
        {
            "PatienttName": "71 Rufus",
            "TreatmentPlanTotalBalance": "$270.60",
        },
        {
            "PatienttName": "72 Sugar",
            "TreatmentPlanTotalBalance": "$1,590.00",
        },
        {
            "PatienttName": "73 Adams, Garrett",
            "TreatmentPlanTotalBalance": "$0.00",
        },
        {
            "PatienttName": "74 Rufus",
            "TreatmentPlanTotalBalance": "$270.60",
        },
        {
            "PatienttName": "75 Sugar",
            "TreatmentPlanTotalBalance": "$1,590.00",
        },
        {
            "PatienttName": "76 Adams, Garrett",
            "TreatmentPlanTotalBalance": "$0.00",
        },
        {
            "PatienttName": "77 Rufus",
            "TreatmentPlanTotalBalance": "$270.60",
        },
        {
            "PatienttName": "78 Sugar",
            "TreatmentPlanTotalBalance": "$1,590.00",
        }
        ,
        {
            "PatienttName": "79 Adams, Garrett",
            "TreatmentPlanTotalBalance": "$0.00",
        },
        {
            "PatienttName": "80 Rufus",
            "TreatmentPlanTotalBalance": "$270.60",
        },
        {
            "PatienttName": "81 Sugar",
            "TreatmentPlanTotalBalance": "$1,590.00",
        }
    ];
    public txPlansHover = [
        {
            "TreatmentPlanName": "Plan A",
            "TreatmentPlanCreatedDate": new Date(),
            "TreatmentPlanTotalBalance": 500,
            "TreatmentPlanStatus": "Active",
            "PatientId": 123,
            "TreatmentPlanId": 1
        }
    ];

    isMouseUp = false;
    showTooltipFlag = false;
    mouseX = 0;
    mouseY = 0;
    tooltipData = this.txPlansHover;

    frm: FormGroup;
    fakeFormGroup: FormGroup;
    color: string;
    defaultFinanceChargePattern: any;
    email = '';
    private count = 1;
    public listItems: Array<{ text: string, value: number, IsDisabled?: boolean }> = [
        { text: 'Small', value: 1, IsDisabled: true },
        { text: 'Medium', value: 2 },
        { text: 'Large', value: 3 },
        { text: 'XL', value: 4 },
        { text: 'XXL', value: 5 }
    ];
    confirmationRef: ConfirmationModalOverlayRef;
    confirmationModalSubscription: Subscription;
    public minDate = new Date(2020, 9, 1);
    public maxDate = new Date(2020, 9, 10);
    public optionList = [
        { text: 'Option1', value: 1 },
        { text: 'Option2', value: 2 },
    ]

    StartTime = new Date();
    EndTime = new Date();
    selectedList = this.listItems;
    public appointment = {
        Data: {
            AppointmentId: '71DEBC23-9EF9-46AE-B015-00F3E34CB35',
            StartTime: this.StartTime,
            EndTime: this.EndTime,
            Status: 2,
            StatusIcon: 'far fa-check',
            OriginalStatus: 2,
            PlannedServices: {
                ServiceCodeId: '71e3758b-9bdd-4ff7-a4b0-88a8b7df8971'
            },
            Patient: {
                PatientId: '2a49195c-00a7-42e3-ac2f-9966cf3a001a',
                HasRunningAppointment: false
            }

        }
    };
    zipFieldFormGroup: FormGroup;
    uiMaskFormGroup: FormGroup;
    IsShowPopUp: boolean = false;
    showServiceCodesModal: boolean = false;
    showCTDCodePickerModal: boolean = false;
    public palettes: string[] = [
        "office",
        "apex",
        "austin",
        "clarity",
        "slipstream",
        "metro",
        "flow",
        "hardcover",
        "trek",
        "verve",
    ];
    public palette: Array<string> = [
        "#37399b",
        "#a81c85",
        "#0ab3cc",
        "#2f7d20",
        "#a21616",
        "#f0dc82",
        "#480607",
        "#800020",
        "#deb887",
        "#cc5500",
        '#bf94e4'
    ];
    public selected: string = "#E41B17";
    @ViewChild(ServiceCodesPickerModalComponent) private serviceModal: ServiceCodesPickerModalComponent;

    //#region Gauge Chart For Net and Gross Producation
    grossProduction: GaugeChartType = GaugeChartType.GrossProduction;
    netProduction: GaugeChartType = GaugeChartType.NetProduction;

    gaugeFiltersTypes: GaugeFiltersTypes = GaugeFiltersTypes.YTD;
    gaugeChartData: Array<SeriesData> = [{
        Category: "Value",
        Color: "#30AFCD",
        Count: 0,
        Label: null,
        SeriesName: null,
        Value: 15726.43,
    }]

    onClickGaugeChart = () => {
        alert("Gauge Chart Clicked");
    }
    //#endregion


    //#region SimpleHalfDonut Chart For InsuranceClaims Chart        
    simpleHalfDonutFiltersTypes: SimpleHalfDonutFiltersTypes = SimpleHalfDonutFiltersTypes.YTD;
    simpleHalfDonutChartData: SimpleHalfDonutChart = {
        Appointment: null,
        Data: {
            YTD: {
                SeriesData: [{
                    Category: "Unsubmitted",
                    Color: "#D25E59",
                    Count: 91596,
                    Label: null,
                    SeriesName: null,
                    Value: 116769440.72
                },
                {
                    Category: "Submitted",
                    Color: "#FFB34C",
                    Count: 8,
                    Label: null,
                    SeriesName: null,
                    Value: 3396
                },
                {
                    Category: "Alerts",
                    Color: "#FF674C",
                    Count: 2736,
                    Label: null,
                    SeriesName: null,
                    Value: 33169531
                },
                {
                    Category: "Paid",
                    Color: "#7FDE8E",
                    Count: 18,
                    Label: null,
                    SeriesName: null,
                    Value: 144.52
                },
                ], TotalStatements: 0, TotalValue: 0,
            },
            LastMonth: null,
            LastYear: null,
            MTD: null
        },
        DefaultFilter: 'YTD',
        FilterList: ["YTD", "MTD", "Last Year", "Last Month"]
    }
    public gridDataNumeric = [
        { Quantity: 1 },
        { Quantity: 2 },
        { Quantity: 5 },
        { Quantity: 8 },
        { Quantity: 10 },
        { Quantity: 9 },
        { Quantity: 11 }
    ];
    public filteredData = [...this.gridDataNumeric];
    //#endregion

    constructor(private confirmationModalService: ConfirmationModalService, private fb: FormBuilder, private toastService: ToastService, private renderer: Renderer2) {
        this.StartTime.setHours(14, 0, 0, 0);
        this.StartTime.setDate(this.StartTime.getDate());

        this.EndTime.setHours(14, 30, 0, 0);
        this.EndTime.setDate(this.EndTime.getDate());
        this.defaultFinanceChargePattern = /^\d{0,2}(\.\d{0,2})?$/;
    }
    ngOnInit() {
        this.color = "#FF0000";
        this.frm = this.fb.group({
            radioOptions: ['Yes']
        });
        this.fakeFormGroup = this.fb.group({
            fakeControl: ['', [Validators.required]],
            fakeControl2: [' ', []],
            fakeControl3: ['', []]
        });
        this.zipFieldFormGroup = this.fb.group({
            zipField: ['']
        })

        this.uiMaskFormGroup = this.fb.group({
            uiMask: ['']
        })

    }
    onChange(color: string) {
        this.selected = color;
        console.log(this.selected);
    };
    changeTheColor() {
        this.color = "#7CFC00";
    }

    colorChanged(newColor) {
        this.color = newColor;
    }

    isSmartCodeDisplay = false;
    smartCodeData: any //TODO:once  Servicecode model created remove this
    onOptionsSelected(data: number) {
        if (data == 3) {
            this.isSmartCodeDisplay = true;
            this.smartCodeData = {
                "ServiceCodeId": null,
                "CdtCodeId": null,
                "CdtCodeName": "",
                "Code": "",
                "Description": "",
                "ServiceTypeId": null,
                "ServiceTypeDescription": null,
                "DisplayAs": "",
                "Fee": "",
                "TaxableServiceTypeId": 1,
                "TaxableServiceTypeName": "Not A Taxable Service",
                "AffectedAreaId": 3,
                "AffectedAreaName": "Root",
                "DrawTypeId": null,
                "DrawTypeDescription": "",
                "UsuallyPerformedByProviderTypeId": null,
                "UsuallyPerformedByProviderTypeName": null,
                "UseCodeForRangeOfTeeth": false,
                "IsActive": true,
                "IsEligibleForDiscount": true,
                "Notes": "",
                "SubmitOnInsurance": true,
                "IsSwiftPickCode": false,
                "UseSmartCodes": "true",
                "SmartCode1Id": "3a054e69-1aa2-45dd-902c-0d5c41c57b8f",
                "SmartCode2Id": null,
                "SmartCode3Id": null,
                "SmartCode4Id": null,
                "SmartCode5Id": null,
                "$$IconFileName": "default_service_code.svg",
                "SetsToothAsMissing": false
            }

        } else if (data == 4) {
            this.isSmartCodeDisplay = true;
            this.smartCodeData = {
                "ServiceCodeId": null,
                "CdtCodeId": null,
                "CdtCodeName": "",
                "Code": "",
                "Description": "",
                "ServiceTypeId": null,
                "ServiceTypeDescription": null,
                "DisplayAs": "",
                "Fee": "",
                "TaxableServiceTypeId": 1,
                "TaxableServiceTypeName": "Not A Taxable Service",
                "AffectedAreaId": 4,
                "AffectedAreaName": "Surface",
                "DrawTypeId": null,
                "DrawTypeDescription": "",
                "UsuallyPerformedByProviderTypeId": null,
                "UsuallyPerformedByProviderTypeName": null,
                "UseCodeForRangeOfTeeth": false,
                "IsActive": true,
                "IsEligibleForDiscount": true,
                "Notes": "",
                "SubmitOnInsurance": true,
                "IsSwiftPickCode": false,
                "UseSmartCodes": "true",
                "SmartCode1Id": "2db443e0-ad5d-445a-a17c-91351e6fd7b1",
                "SmartCode2Id": null,
                "SmartCode3Id": null,
                "SmartCode4Id": null,
                "SmartCode5Id": null,
                "$$IconFileName": "default_service_code.svg",
                "SetsToothAsMissing": false
            }

        }
        else if (data == 5) {
            this.isSmartCodeDisplay = true;
            this.smartCodeData = {
                "ServiceCodeId": null,
                "CdtCodeId": null,
                "CdtCodeName": "",
                "Code": "",
                "Description": "",
                "ServiceTypeId": null,
                "ServiceTypeDescription": null,
                "DisplayAs": "",
                "Fee": "",
                "TaxableServiceTypeId": 1,
                "TaxableServiceTypeName": "Not A Taxable Service",
                "AffectedAreaId": 5,
                "AffectedAreaName": "Tooth",
                "DrawTypeId": null,
                "DrawTypeDescription": "",
                "UsuallyPerformedByProviderTypeId": null,
                "UsuallyPerformedByProviderTypeName": null,
                "UseCodeForRangeOfTeeth": "true",
                "IsActive": true,
                "IsEligibleForDiscount": true,
                "Notes": "",
                "SubmitOnInsurance": true,
                "IsSwiftPickCode": false,
                "UseSmartCodes": false,
                "SmartCode1Id": "1bf25d0e-7653-47cf-b2a8-5055d79d441a",
                "SmartCode2Id": null,
                "SmartCode3Id": null,
                "SmartCode4Id": null,
                "SmartCode5Id": null,
                "$$IconFileName": "default_service_code.svg",
                "SetsToothAsMissing": false
            }

        }
    }
    closeSmartCode(data: any) {
        this.isSmartCodeDisplay = false;
    }



    newPhone = (isPrimary: boolean) => {
        return this.fb.group({
            PhoneNumber: [null, [Validators.required, Validators.minLength(10)]],
            PhoneType: ['', [Validators.required]],
            IsPrimary: [isPrimary],
            PhoneReminder: [true],
            TextReminder: [false],
            ValidPhoneNumber: [true],
            ValidPhoneType: [true]
        });
    }
    getSelectedList = (data: any) => {
        this.selectedList = data;
    }
    removeChips = ($event: any, index: any) => {
        if ($event) {
            this.selectedList.splice(index, 1);
        }
    }
    fakeButtonEvent = () => alert('This button was clicked');

    blurFunction = ($event) => console.log('input blur activated');

    confirmationModalData = {
        header: 'Confirmation Modal?',
        message: 'Yes I would like more bugs to fix?',
        confirm: 'Confirm',
        cancel: 'Cancel',
        height: 170,
        width: 350
    }
    openConfirmationModal(data) {

        this.confirmationRef = this.confirmationModalService.open({
            data
        });

        this.confirmationModalSubscription = this.confirmationRef.events.pipe(
            filter((event) => !!event),
            filter((event) => {
                return event.type === 'confirm' || event.type === 'close';
            }),
            take(1)
        ).subscribe((events) => {
            switch (events.type) {
                case 'confirm':
                    alert('confirmed action, proceed');
                    this.confirmationRef.close();
                    break;
                case 'close':
                    alert('close modal');
                    this.confirmationRef.close();
                    break;
            }
        });
    }
    showToast = (toastType: ToastType) => {
        this.toastService.show(
            {
                text: `Toast message ${this.count}`,
                type: toastType
            },
            true
        );

        this.count += 1;
    }



    showToastManualClose(customTemplate: TemplateRef<any>, toastType: ToastType) {
        this.toastService.show(
            {
                text: `Manual Toast ${this.count}`,
                type: toastType,
                template: customTemplate
            },
            false
        );

        this.count += 1;
    }
    ngOnDestroy() {
        // clean up modal subscription
        this.confirmationModalSubscription.unsubscribe();
    }

    ShowPopup() {
        this.IsShowPopUp = true;
    }
    OnPopupClose(event) {
        this.IsShowPopUp = false;
    }

    //#region Service Codes Modal
    openServiceCodesModal = () => {
        this.serviceModal.openDialog();
    }
    onServiceCodeModalClose = (event) => {
        this.serviceModal.close();
    }
    //end region

    //#region Service Codes Modal
    openCTDCodePickerModal = () => this.showCTDCodePickerModal = true;
    onCTDCodePickerModalClose = (event) => {
        this.showCTDCodePickerModal = false;
    }

    fromDate = new Date(2023, 7, 11);
    toDate = new Date(2023, 7, 31);
    minStartDate: Date = new Date('January 1, 2023');
    maxStartDate: Date = new Date('December 31, 2023');
    minEndDate: Date = new Date('January 1, 2023');
    maxEndDate: Date = new Date('December 31, 2023');
    displayFullDateRange = null;
    showPopOverFromParentCompoent = false;

    applyAction(data) {
        this.fromDate = data?.startDate;
        this.toDate = data?.endDate;
        this.showPopOver = false;
        this.displayFullDateRange = 'From : ' + this.fromDate + ' To : ' + this.toDate;
    }

    onClearFilter(data) {
        this.fromDate = data?.startDate;
        this.toDate = data?.endDate;
        this.showPopOver = false;
        this.displayFullDateRange = 'From : ' + this.fromDate + ' To : ' + this.toDate;
    }

    showPopOver = false
    selectDateRange = () => {
        this.showPopOver = !this.showPopOver;
    }
    //end region

    //tooltip -onhover

    public showTooltip(event, dataItem) {
        this.mouseX = event.pageX - 10;
        this.mouseY = event.pageY - 55;
        var toolTipHeight = this.txPlansHover.length * 2 + 8;

        if (event.pageY + toolTipHeight >= window.outerHeight - 100) {
            this.mouseY = this.mouseY - (toolTipHeight + 8);
        }
        this.showTooltipFlag = true;
    }

    public hideTooltip() {
        this.showTooltipFlag = false;
    }

    public navToPatientTxPlan(patientId, treatmentPlanId) {
        // Navigation logic here
    }

    public getClass(status) {
        var cssClass = '';

        switch (status) {
            case 'Proposed':
                cssClass = 'fa-question-circle';
                break;
            case 'Presented':
                cssClass = 'fa-play-circle';
                break;
            case 'Accepted':
                cssClass = 'far fa-thumbs-up';
                break;
            case 'Rejected':
                cssClass = 'far fa-thumbs-down';
                break;
            case 'Completed':
                cssClass = 'fa-check';
                break;
        }

        return cssClass;
    }

    //Numeric-Range-filter
    onFilterChange(event: { from: number, to: number }) {
        this.filteredData = this.gridDataNumeric;
        if (event?.from) {
            this.filteredData = this.filteredData?.filter(item => item?.Quantity >= event?.from);
        }
        if (event?.to) {
            this.filteredData = this.filteredData?.filter(item => item?.Quantity <= event?.to);
        }
    }

    public print(): void {
        const gridElement = this.grid.wrapper.nativeElement;

        this.setPrintLayout(gridElement);
        this.setNormalLayout(gridElement);
    }

    public setPrintLayout(gridElement: any): void {
        this.grid.renderer.removeClass(gridElement, "grid-dimensions");
        this.scrollable = "none";
        let printableContent = '',
            win = window.open('', '', 'width=800, height=500, resizable=1, scrollbars=1'),
            doc = win.document.open();

        var htmlStart =
            '<!DOCTYPE html>' +
            '<html>' +
            '<head>' +
            '<meta charset="utf-8" />' +
            '<title>Kendo UI Grid</title>' +
            '</head>' +
            '<body>';

        var htmlEnd =
            '</body>' +
            '</html>';

        printableContent = gridElement.outerHTML;
        doc.write(htmlStart + printableContent + htmlEnd);
        doc.close();
        win.print();

    }

    public setNormalLayout(gridElement: any): void {
        this.grid.renderer.addClass(gridElement, "grid-dimensions");
        this.scrollable = "scrollable";
    }


    //#region app-uib-modal
    templateUrlPath = 'App/BusinessCenter/practice-at-a-glance/practice-at-a-glance.html';
    controllerName = 'PracticeAtAGlanceController';
    isVisiblePopup = false;
    frmAppUIBModal: FormGroup = this.fb.group({
        HTMLPath: ['', Validators.required],
        ControllerName: ['', Validators.required],
    });
    
    toggleVisibility = () => {
        this.templateUrlPath = this.frmAppUIBModal?.get('HTMLPath')?.value;
        this.controllerName = this.frmAppUIBModal?.get('ControllerName')?.value;
        this.isVisiblePopup = !this.isVisiblePopup;
    }

    //#endregion
}

