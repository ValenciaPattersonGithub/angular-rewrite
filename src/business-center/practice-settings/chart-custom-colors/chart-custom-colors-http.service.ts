import { Inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map } from 'rxjs/operators';
import { MicroServiceApiService } from 'src/security/providers/micro-service-api.service';

@Injectable()
export class ChartColorsHttpService {
    chartColorsSourceUrl;

    // NOTE: This service is used to fetch chart colors from either SAPI or the reference data service (where it is cached, both locally and in the practice API)
    // Chart colors controller has been migrated to Practice API and a new flag introduced to enable/disable fetching data from
    // practice API or SAPI as implemented below. 
    // When this flag is removed, all the chart colors operations will be managed by reference data service via the practice API (which now  also includes cache management).
    constructor(private http: HttpClient,
        private microServiceApis: MicroServiceApiService
    ) {
        this.chartColorsSourceUrl = this.microServiceApis.getPracticesUrl() + "/api/v1";
    }

    getAllChartColors() {
        return this.http.get(this.chartColorsSourceUrl + '/chartcolors')
            .pipe(
                map(res => <any>res)
            );
    }

    update(chartColor) {
        return this.http.put(this.chartColorsSourceUrl + '/chartcolors', chartColor)
            .pipe(
                map(res => <any>res)
            );
    }
};
