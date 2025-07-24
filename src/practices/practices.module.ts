import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DatePipe } from '@angular/common'; 
import { LocationTimeService, LocationsDisplayService, TimezoneDataService } from './common/providers';
import { LocationsService, RoomsService  } from './providers';
import { LocationHttpService ,UserSettingHttpService } from './http-providers'

@NgModule({
    declarations: [],
    imports: [
        CommonModule
    ],
    providers: [
        DatePipe,
        LocationTimeService,
        LocationsDisplayService,
        TimezoneDataService,
        LocationsService,
        RoomsService,
        LocationHttpService,
        UserSettingHttpService,
    ]
})
export class PracticesModule { }
