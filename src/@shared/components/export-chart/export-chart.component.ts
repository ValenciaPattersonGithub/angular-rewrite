import { Component, EventEmitter, Inject, Input, OnInit, Output } from "@angular/core";

@Component({
    selector: 'export-chart',
    templateUrl: './export-chart.component.html',
    styleUrls: ['./export-chart.component.scss']
})

export class ExportChartComponent implements OnInit {

    @Input() patientId: any;
    @Output() exportSuccessEvent = new EventEmitter<any>();
    @Output() exportCancelEvent = new EventEmitter<any>();

    public exportChart: boolean;
    public exportLedger: boolean;
    public exportFees: boolean;
    public exportNotes: boolean;
    public showError: boolean;
    public errorMessage: string;
    public exportButtonDisabled: boolean;

    constructor(@Inject('PatientServices') private patientServices,
                @Inject('toastrFactory') private toastrFactory,
                @Inject('localize') private localize) {
        this.exportChart = true;
        this.exportLedger = true;
        this.exportFees = false;
        this.exportNotes = true;
        this.showError = false;
        this.errorMessage = '';
        this.exportButtonDisabled = false;
    }

    ngOnInit(): void {
    }

    public onCancelExport(event: KeyboardEvent) {
        this.exportCancelEvent.emit();
    }

    public onExportChart(event: KeyboardEvent) {

        let exportOptions = {
            includeChart: this.exportChart,
            includeLedger: this.exportLedger,
            includeFees: this.exportFees,
            includeNotes: this.exportNotes
        };

        this.patientServices.ExportOdontogram.save({ patientId: this.patientId }, exportOptions)
            .$promise
            .then((response) => {

                if (response?.InvalidProperties) {
                    this.toastrFactory.error(this.localize.getLocalizedString('An error has occurred.'));
                    return;
                }
                this.toastrFactory.success(this.localize.getLocalizedString('Export successful.'));

            }).catch((errorObject) => {



                if (errorObject.data && errorObject.data.InvalidProperties) {
                    var dirtySnapshot = errorObject.data.InvalidProperties.find((obj) => {
                        return obj.PropertyName == "IsDirty";
                    });
                    if (dirtySnapshot) {
                        this.toastrFactory.error(this.localize.getLocalizedString(dirtySnapshot.ValidationMessage));
                    }
                    else {
                        this.toastrFactory.error(this.localize.getLocalizedString('An error has occurred.'));
                    }
                }
                else {
                    this.toastrFactory.error(this.localize.getLocalizedString('An error has occurred.'));
                }

                
            });

        this.exportSuccessEvent.emit();
    }

    public onOptionChanged() {

        this.toggleError();
        this.exportButtonDisabled = false;

        if (!this.exportChart && !this.exportLedger && !this.exportFees && !this.exportNotes) {
            // they need to select at least one option to export.
            this.toggleError(this.localize.getLocalizedString('Please select at least one item.'));
            this.exportButtonDisabled = true;
        }
    }

    private toggleError(message: string = '') {

        if (message != '') {
            this.showError = true;
            this.errorMessage = message;
            return;
        }

        this.errorMessage = '';
        this.showError = false;
    }
}
