import { Component, OnInit, Input } from '@angular/core';

@Component({
    selector: 'bar-solid-area',
    templateUrl: './bar-solid-area.component.html',
    styleUrls: ['./bar-solid-area.component.scss']
})
export class BarSolidAreaComponent implements OnInit {

    constructor() { }
    @Input() chart;
    @Input() widgetData;
    @Input() totalValue;
    barAreaList;
    setBarAreaList() {
        if (this.widgetData.ItemId === 14) {
            this.barAreaList = [
                { id: 0, value: '0-30 Days', className: 'greendot', solidClass: 'solid solidsArea' },
                { id: 1, value: '31-60 Days', className: 'yellowdot', solidClass: 'solid left-solidss' },
                { id: 2, value: '61-90 Days', className: 'orangedot', solidClass: 'solid solidsArea solidsAreaRight' },
                { id: 3, value: '> 90 Days', className: 'browndot', solidClass: 'solid right-solidss' }];
        } else if (this.widgetData.ItemId === 26) {
            this.barAreaList = [
                { id: 0, value: 'Unsubmitted', className: 'yellowdot', solidClass: 'solid solidsAreaWidth' },
                { id: 1, value: 'Alerts', className: 'browndot', solidClass: 'solid solidsAreaMargin' }];
        } else if (this.widgetData.ItemId === 27) {
            this.barAreaList = [
                { id: 0, value: 'Submitted', className: 'greendot', solidClass: 'solid solidsArea' },
                { id: 1, value: 'Unsubmitted', className: 'yellowdot', solidClass: 'solid left-solidss' },
                { id: 2, value: 'Alerts', className: 'browndot', solidClass: 'solid right-solidss' }];
        } else if (this.widgetData.ItemId === 29) {
            this.barAreaList = [
                { id: 0, value: 'Processed', className: 'greendot', solidClass: 'solid statementArea' },
                { id: 1, value: 'Not Processed', className: 'yellowdot', solidClass: 'solid statement-solidA' },
                { id: 2, value: 'Failed', className: 'browndot', solidClass: 'solid statement-solidB' }];
        }
        else if (this.widgetData.ItemId === 30) {
            this.barAreaList = [               
                { id: 0, value: 'Referred out', className: 'yellowdot', solidClass: 'solid solidsAreaWidth' },
                { id: 1, value: 'Referred in', className: 'browndot', solidClass: 'solid' },
            ];
        }
    }
    ngOnInit() {
        this.setBarAreaList();
    }
    public onLegendItemHover(idx): void {
        if (this.totalValue) {
            if (idx !== -1) { this.chart.showTooltip((point: any) => { return point.seriesIx === idx }) };
            if (idx === -1) { this.chart.hideTooltip() };
        }
    }
}
