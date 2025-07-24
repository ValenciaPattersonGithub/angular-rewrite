// purpose of this file is to store the draggable collections so that each can link up 
// with each other between the drawer and the page as dynamic items are added (Ex: Stages) 
// for the drag operations to work between area the drag from location and the drag to location need to be aware of one another.
// the registration ensure the collects between the two works.

// Observable value in services like this facilitate loosely coupled cross componenet communication

import { Injectable } from '@angular/core';
import { Observable, BehaviorSubject } from 'rxjs';

@Injectable({
    providedIn: 'root'
})
export class TreatmentPlanServicesDrawerDragService {
       
    constructor() {
       
    }
   
    private proposed$: BehaviorSubject<any[]> = new BehaviorSubject<any[]>([]);

    //Subscribe to the getProposed Method
    public getProposed(): Observable<any[]>{
        return this.proposed$;
    }

    //This sets the variable value
    public setProposed(proposed: any[]) {
        this.proposed$.next(proposed);
    }
            
    // Code for controlling the drag collections between pages
    private treatmentPlanDragArea$ = new BehaviorSubject<string[]>([]);
    public changeDragAreas(state: string[]) {
        this.treatmentPlanDragArea$.next(state);
    }

    public getDragAreas(): Observable<any> {
        return this.treatmentPlanDragArea$;
    }

    // Code to hold the current checked items and for other pages to tell the drawer that it needs to reset
    private checkedItems: any[] = [];

    private clearCheckedItems$ = new BehaviorSubject<Boolean>(false);

    public getCheckedItems() {
        return this.checkedItems;
    }

    public setCheckedItems(items: any[]) {
        this.checkedItems = items;
    }

    public resetCheckedItems(value: Boolean) {
        this.checkedItems = [];
        this.clearCheckedItems$.next(value);
    }

    public resetCheckedItemsNotfication(): Observable<any> {
        return this.clearCheckedItems$;
    }
}
