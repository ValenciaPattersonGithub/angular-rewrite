// purpose of this file is to allow angular pages to register and be informed when the drawer area is expanded or collapsed.
// at the time of the creation of this file the drawer area has such a mechanism however it is build in angular.js and 
// the same method of notification does not work when doing the same thing for an angular subscriber 
// thus I need one of these in angular js and one is angular so that update calls for the observers will work.
// essentially this does the same thing as the angular js version.

import { Injectable } from '@angular/core';
import { Observable, BehaviorSubject } from 'rxjs';

@Injectable({
    providedIn: 'root'
})
export class DrawerNotificationService {
    private drawerState$ = new BehaviorSubject<boolean>(false);
    private dragState$ = new BehaviorSubject<boolean>(false);


    constructor() { }

    public changeDrawerState(state: boolean) {
        this.drawerState$.next(state);
    }

    public getDrawerState(): Observable<any> {
        return this.drawerState$;
    }

    public changeDragState(state: boolean) {
        this.dragState$.next(state);
    }

    public getDragState(): Observable<any> {
        return this.dragState$;
    }
}
