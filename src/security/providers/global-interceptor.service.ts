
import { Injectable, Inject } from '@angular/core';
import { HttpEvent, HttpInterceptor, HttpHandler, HttpRequest } from '@angular/common/http';
import { Observable } from "rxjs";

import * as moment from 'moment-timezone';

@Injectable()
export class GlobalInterceptorService implements HttpInterceptor {

    constructor(
        @Inject('patAuthenticationService') private patAuthenticationService,
        @Inject('instanceIdentifier') private instanceIdentifier,
        @Inject('uniqueIdentifier') private uniqueIdentifier,
        @Inject('applicationService') private applicationService,
        @Inject('practiceService') private practiceService,
        @Inject('locationService') private locationService,
        @Inject('platformSessionCachingService') private platformSessionCachingService,
        @Inject('configSettingsService') private configSettingsService,
        @Inject('SoarConfig') private soarConfig) {
    }

    // Part of migrating the unique identifier code .... just leave it here until we can write tests and change the interceptor logic to point at this.
    //    getPart() {
    //        return Math.floor(
    //                    Math.random() * 0x10000 /* 65536 */
    //                ).toString(16);
    //    }

    //    getUniqueRequestId() {
    //        var identifier = this.getPart() + this.getPart() + "-" +
    //            this.getPart() + "-" +
    //            this.getPart() + "-" +
    //            this.getPart() + "-" +
    //            this.getPart() + this.getPart() + this.getPart();
    //        return identifier;
    //    }


    intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
        //debugger;
        // not sure we should be using this.
        var token = this.patAuthenticationService.getCachedToken();

        let instanceId = this.instanceIdentifier.getIdentifier();

        let requestId = this.uniqueIdentifier.getId();

        // application Id
        let appId = this.applicationService.getApplicationId();

        // Practice Id
        var currentPractice = this.practiceService.getCurrentPractice();
        var practiceId = 0;
        if (currentPractice !== null) {
            practiceId = currentPractice.id;
        }
        var userContext = this.platformSessionCachingService.userContext.get();
        if (userContext !== null) {
            var user = userContext.Result.User;
            if (user.AccessLevel === 2) {
                practiceId = user.AccessLevelId;
            }
        }

        let currentLocation = this.locationService.getCurrentLocation();
        let locationId = 0;
        let locationTimezone = '';
        if (currentLocation != null) {
            locationId = currentLocation.id;
            locationTimezone = currentLocation.timezone;
        }

        var utcOffset = moment().utcOffset() / 60; // e.g. -5

        const apimSubscriptionKey: string = this.configSettingsService.apimSubscriptionKey;
        const apimSubscriptionHeader = 'Ocp-Apim-Subscription-Key';

        if (!request.headers.has('Ocp-Apim-Subscription-Key')) {
            request = request.clone({
                headers: request.headers.set(apimSubscriptionHeader, apimSubscriptionKey)
            });            
        }
        
        //debugger;

        let headers = request.headers
            .set('Authorization', 'Bearer ' + token)
            .set('PAT-Application-Instance-ID', instanceId) // used for AppInsights logging
            .set('PAT-Request-ID', requestId)               // used for AppInsights logging
            .set('PAT-Application-ID', appId.toString())            
            .set('ApplicationID', appId.toString())
            .set('PAT-Practice-ID', practiceId.toString())
            .set('PAT-Location-ID', locationId.toString())
            .set('PtcSoarUtcOffset', utcOffset.toString())
            .set('Location-TimeZone', locationTimezone.toString())
            .set('TimeZone', locationTimezone.toString())
            .set('Accept', 'application/json, text/plain, */*');
        
        const qaOdontogramSnapshotBypass = localStorage.getItem("qaOdontogramSnapshotBypass");
        if (qaOdontogramSnapshotBypass) {
            headers = request.headers
                .set('Authorization', 'Bearer ' + token)
                .set('PAT-Application-Instance-ID', instanceId) // used for AppInsights logging
                .set('PAT-Request-ID', requestId)               // used for AppInsights logging
                .set('PAT-Application-ID', appId.toString())
                .set('ApplicationID', appId.toString())
                .set('PAT-Practice-ID', practiceId.toString())
                .set('PAT-Location-ID', locationId.toString())
                .set('PtcSoarUtcOffset', utcOffset.toString())
                .set('Location-TimeZone', locationTimezone.toString())
                .set('TimeZone', locationTimezone.toString())
                .set('Accept', 'application/json, text/plain, */*')
                .set('PAT-Fuse-QaSnapshotBypass', 'True');
        }        

        var cloneReq;

        if (this.soarConfig && (this.soarConfig.environmentName === 'FuseQA')) {
            var hostName = window.location.hostname;
            var domain = hostName.substring(hostName.lastIndexOf('.', hostName.lastIndexOf('.') - 1) + 1);

            // ensure request is going to a fuse domain before including cookies
            if (request.url.indexOf(domain) >= 0) {
                cloneReq = request.clone({ headers, withCredentials: true });
            }
            else
                cloneReq = request.clone({ headers });
        }
        else {
            cloneReq = request.clone({ headers });
        }

        return next.handle(cloneReq);

        // need to tack on some error handling logic to put the message in the console each time nothing fancy just want to console log messages 
        // when a 404 or 409 happen for right now.
        // need to test this out more before full implementation
        // the below code can be found in fuse to handle this kind of problems, it is shown for references only.
        //var httpErrorResponseHandler = function (rejection) {
        //    var errorMessage;
        //    var localize = $injector.get('localize');
        //    switch (rejection.status) {
        //        case 409:
        //            errorMessage = localize
        //                .getLocalizedString("Another user has made changes, refresh the page to see the latest information.");
        //            errorResponseFunc(errorMessage, rejection);
        //            break;

        //        case 404:
        //            errorMessage = localize.getLocalizedString("Another user has made changes, refresh your screen.");
        //            errorResponseFunc(errorMessage, rejection);
        //            break;
        //    }
        //};

    }

}