import { Injectable } from "@angular/core";
import { Holiday, NewHoliday } from "../models/holiday";
import { HttpClient } from "@angular/common/http";
import { MicroServiceApiService } from "src/security/providers";
import { Observable, throwError } from "rxjs";
import { SoarResponse } from "src/@core/models/core/soar-response";
import { catchError, map } from "rxjs/operators";

@Injectable()
export class HolidaysService {

    constructor(private http: HttpClient, private microServiceApis: MicroServiceApiService) {}

    getAll(): Observable<Holiday[]> {
        return this.http.get<SoarResponse<Holiday[]>>(this.microServiceApis.getSchedulingUrl() + '/api/v0/holidays')
            .pipe(map((res: SoarResponse<Holiday[]>) => res.Value!));
    }

    get(id: string): Observable<Holiday> {
        return this.http.get<SoarResponse<Holiday>>(this.microServiceApis.getSchedulingUrl() + `/api/v0/holidays/${id}`)
            .pipe(map((res: SoarResponse<Holiday>) => res.Value!));
    }

    update(holiday: Holiday): Observable<Holiday> {
        return this.http.put<SoarResponse<Holiday>>(this.microServiceApis.getSchedulingUrl() + '/api/v0/holidays', holiday)
            .pipe(map((res: SoarResponse<Holiday>) => res.Value!));
    }

    create(holiday: NewHoliday): Observable<Holiday> {
        return this.http.post<SoarResponse<Holiday>>(this.microServiceApis.getSchedulingUrl() + '/api/v0/holidays', holiday)
            .pipe(map((res: SoarResponse<Holiday>) => res.Value!));
    }

    delete(id: string): Observable<void> {
        return this.http.delete<void>(this.microServiceApis.getSchedulingUrl() + `/api/v0/holidays/${id}`);
    }
}