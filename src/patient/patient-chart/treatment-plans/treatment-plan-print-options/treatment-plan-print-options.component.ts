import { Component, ElementRef, Inject, Input, OnInit, QueryList, ViewChildren } from '@angular/core';
import { AppCheckBoxComponent } from '../../../../@shared/components/form-controls/check-box/check-box.component';

@Component({
  selector: 'treatment-plan-print-options',
  templateUrl: './treatment-plan-print-options.component.html',
  styleUrls: ['./treatment-plan-print-options.component.scss']
})
export class TreatmentPlanPrintOptionsComponent implements OnInit {
    @Input() txplanprinttemplate: any;
    @Input() activetreatmentplan: any;
    @Input() modalinstance: any;
    @Input() personid: any;

    cbSelectAllChecked = true;
    cbSelectAllOptionsChecked = true;
    printButtonDisabled = false;
    txPlanPrintOptions = [
        { "optionName": "Description", "checked": true, "fieldName" :"showDescription" },
        { "optionName": "Tooth", "checked": true, "fieldName": "showTooth" },
        { "optionName": "Surface", "checked": true, "fieldName": "showSurface" },
        { "optionName": "Status", "checked": true, "fieldName": "showStatus" },
        { "optionName": "Location", "checked": true, "fieldName": "showLocation" },
        { "optionName": "Provider (Services)", "checked": true, "fieldName": "showProvider" },
        { "optionName": "Charges", "checked": true, "fieldName": "showCharges" },
        { "optionName": "Allowed Amount", "checked": true, "fieldName": "showAllowedAmount" },
        { "optionName": "Est Ins Adj", "checked": true, "fieldName": "showEstAdjIns" },
        { "optionName": "Est Insurance", "checked": true, "fieldName": "showEstIns" },
        { "optionName": "Est Pat Balance", "checked": true, "fieldName": "showPatBalance" }
    ];

    txPlanOtherOptions = [
        { "optionName": "Total Charges", "checked": true, "fieldName": "showTotalCharges" },
        { "optionName": "Estimated Insurance", "checked": true, "fieldName": "showEstInsurance" },
        { "optionName": "Estimated Insurance Adjustment", "checked": true, "fieldName": "showEstInsAdj" },
        { "optionName": "Estimated Patient Balance", "checked": true, "fieldName": "showEstPatBal" }
    ];

    constructor(
        @Inject('tabLauncher') private tabLauncher,
        @Inject('DocumentsLoadingService') private documentsLoadingService
    ) { }

    ngOnInit(): void {
    }

    updatePrintButton() {
        this.printButtonDisabled = !this.txPlanPrintOptions.some(option => option.checked === true) && !this.txPlanOtherOptions.some(option => option.checked === true);
    }

    printOptionChanged(event: any, index: number) {
        this.txPlanPrintOptions[index].checked = event.currentTarget.checked;

        this.updatePrintButton();
    }

    printOtherOptionChanged(event: any, index: number) {
        this.txPlanOtherOptions[index].checked = event.currentTarget.checked;

        this.updatePrintButton();
    }

    selectAllChanged(event: any) {
        this.txPlanPrintOptions.forEach(printOption => { printOption.checked = event.currentTarget.checked; });

        this.updatePrintButton();
    }

    selectAllOptionsChanged(event: any) {
        this.txPlanOtherOptions.forEach(printOption => { printOption.checked = event.currentTarget.checked; });

        this.updatePrintButton();
    }

    print() {
        var txPlanPrintOptions = {};
        this.txPlanPrintOptions.forEach(printOption => {
            if (printOption.checked == false) {
                txPlanPrintOptions[printOption.fieldName] = false;
            }
        });

        this.txPlanOtherOptions.forEach(otherOption => {
            if (otherOption.checked == false) {
                txPlanPrintOptions[otherOption.fieldName] = false;
            }
        });

        this.documentsLoadingService.setDocument(this.txplanprinttemplate);
        localStorage.setItem('activeTreatmentPlan', JSON.stringify(this.activetreatmentplan));
        localStorage.setItem('txPlanPrintOptions', JSON.stringify(txPlanPrintOptions));

        let patientPath = '#/Patient/';
        this.tabLauncher.launchNewTab(patientPath + this.personid + '/PrintTreatmentPlan/' + 0);

        this.modalinstance.close();
    }

    closeModal() {
        this.modalinstance.close();
    }
}
