import { Component, Input, Output, EventEmitter, OnChanges } from '@angular/core';

@Component({
  selector: 'benefit-plan-search',
  templateUrl: './benefit-plan-search.component.html',
  styleUrls: ['./benefit-plan-search.component.scss']
})
export class BenefitPlanSearchComponent implements OnChanges {

    @Input() benefitPlanList: any[];
    @Output() selectedPlanChanged = new EventEmitter<any[]>();
    planDisplayList: any[];
    placeholder = 'Search Plans';
    template = 'kendoAutoCompleteBenefitPlanTemplate';

  constructor() { 
  }
    
    ngOnChanges(changes: any) {
        if (changes.benefitPlanList.currentValue) {
            this.planDisplayList = [];
            for (var plan of changes.benefitPlanList.currentValue) {
                var planObject = { BenefitId: plan.BenefitId, Name: plan.Name.toString(), CarrierName: plan.CarrierName, PlanGroupNumber: plan.PlanGroupNumber };
                this.planDisplayList.push(planObject);
            }
        }
    };

    handlePlanSelection(value) {
        this.selectedPlanChanged.emit(value);
    }

}
