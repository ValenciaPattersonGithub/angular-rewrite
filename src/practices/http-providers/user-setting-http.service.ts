import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpResponse} from '@angular/common/http';
import { Observable} from "rxjs";
import { shareReplay, catchError, map, tap } from 'rxjs/operators';


import { UserSetting } from '../models/user-setting';
import { MicroServiceApiService } from '../../security/providers';

@Injectable()
export class UserSettingHttpService {
    private cachedUserSetting$: Observable<UserSetting>;

    constructor(private http: HttpClient, private microServiceApis: MicroServiceApiService) {
    }
    
    getUserSetting() {
        if (!this.cachedUserSetting$) {
            this.cachedUserSetting$ = this.http.get(this.microServiceApis.getPracticesUrl() + '/api/v1/usersettings')
                .pipe(
                    map(res => <UserSetting>res),
                    shareReplay(1) // caches the result until we call clearUserSettingsCache which we can do on any update. Has other options as well
                );
        }

        return this.cachedUserSetting$.toPromise();
    }

    getOrCreateUserSettings() {
        if (!this.cachedUserSetting$) {
            this.cachedUserSetting$ = this.http.get(this.microServiceApis.getPracticesUrl() + '/api/v1/usersettings/getorcreate')
                .pipe(
                    map(res => <UserSetting>res),
                    shareReplay(1) // caches the result until we call clearUserSettingsCache which we can do on any update. Has other options as well
                );
        }

        return this.cachedUserSetting$.toPromise();
    }

    clearUserSettingCache() {
        this.cachedUserSetting$ = null;
    }
};
