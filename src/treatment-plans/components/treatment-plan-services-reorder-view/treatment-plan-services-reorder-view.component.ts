import { Component, OnInit, OnDestroy, Inject, Renderer2 } from '@angular/core';
import { CdkDragDrop, moveItemInArray, transferArrayItem } from '@angular/cdk/drag-drop';
import { Subscription } from 'rxjs';
import { DrawerNotificationService } from 'src/@shared/providers/drawer-notification.service';
import { TreatmentPlanEditServicesService } from '../../component-providers';
import { TreatmentPlansService } from '../../providers';
import { TreatmentPlanHeader } from '../../models/treatment-plan-header';

@Component({
    selector: 'old-treatment-plan-services-reorder-view',
    templateUrl: './treatment-plan-services-reorder-view.component.html',
    styleUrls: ['./treatment-plan-services-reorder-view.component.scss']
})
export class TreatmentPlanServicesReorderViewComponent implements OnInit, OnDestroy {
    treatmentPlanEditServicesService: TreatmentPlanEditServicesService;
    treatmentPlansService: TreatmentPlansService;

    public drawerState: boolean = false;
    subscription: Subscription;
    treatmentPlan: TreatmentPlanHeader;
    planStages: any[];
    tempPlanStages: any[];
    treatmentPlanName: string;
    treatmentPlanServices: any[];

    constructor(private renderer: Renderer2,
        @Inject('$routeParams') private route,
        private editServicesService: TreatmentPlanEditServicesService,
        private plansService: TreatmentPlansService,
        private drawerNotificationService: DrawerNotificationService,
        @Inject('TreatmentPlansFactory') private treatmentPlanFactory,
        @Inject('TreatmentPlanChangeService') private treatmentPlanChangeService,
    ) {
        this.treatmentPlanEditServicesService = editServicesService;
        this.treatmentPlansService = plansService;

        // you have to register the observer this way to ensure the update works
        // notice how I am not calling a function but putting the function definition in the registration
        this.subscription = this.drawerNotificationService.getDrawerState().subscribe(message => {
            this.drawerState = message;
        });

    }

    ngOnInit() {
        this.tempPlanStages = this.treatmentPlanFactory.GetPlanStages();
        // need to disconnect the two objects ... right now I know this will work ...
        let activeTreatmentPlan = JSON.parse(JSON.stringify(this.treatmentPlanFactory.ActiveTreatmentPlan));
        this.treatmentPlanName = activeTreatmentPlan.TreatmentPlanName;
        this.treatmentPlanServices = activeTreatmentPlan.TreatmentPlanServices;

        for (let i = 0; i < this.tempPlanStages.length; i++) {
            // add the array to the element;
            if (this.tempPlanStages[i].services === null || this.tempPlanStages[i].services === undefined) {
                this.tempPlanStages[i].services = [];
            }

            for (let x = 0; x < this.treatmentPlanServices.length; x++) {

                if (this.tempPlanStages[i].stageno === this.treatmentPlanServices[x].TreatmentPlanServiceHeader.TreatmentPlanGroupNumber) {
                    this.tempPlanStages[i].services.push(this.treatmentPlanServices[x]);
                }
            }
        }

        this.planStages = this.tempPlanStages;

    }

    onDrop(event: CdkDragDrop<any[]>) {
        if (event.previousContainer == event.container) {
            moveItemInArray(event.container.data, event.previousIndex, event.currentIndex);
        } else {
            transferArrayItem(event.previousContainer.data, event.container.data, event.previousIndex, event.currentIndex);
        }
        // debugger;
        // maybe reformat the data so that it can be saved
        // notification change tracking that the page state is different

        // need to extract to some service or factory.
        let reOrderedStages = this.planStages;
        let reOrderedServices: any[] = [];
        // take plan stages ... and update the priority numbers and the stage numbers for each item.
        let stageNumber = 1;
        for (let i = 0; i < reOrderedStages.length; i++) {
            let priorityNumber = 1;
            for (let x = 0; x < reOrderedStages[i].services.length; x++) {
                reOrderedStages[i].services[x].TreatmentPlanServiceHeader.TreatmentPlanGroupNumber = stageNumber;
                reOrderedStages[i].services[x].TreatmentPlanServiceHeader.Priority = priorityNumber;
                reOrderedServices.push(reOrderedStages[i].services[x]);
                priorityNumber++;
            }

            stageNumber++;
        }

        this.treatmentPlanChangeService.changeTreatmentPlanStageOrderState(reOrderedServices);
    }

    // unregister the item from observing the drawer notification service
    ngOnDestroy() {
        this.subscription.unsubscribe();
    }
}
