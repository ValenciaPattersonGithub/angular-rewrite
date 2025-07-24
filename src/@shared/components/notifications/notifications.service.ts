import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Inject, Injectable } from '@angular/core';
import { Observable, of, Subject, throwError } from 'rxjs';
import { GetNotificationListRequest, MarkNotificationsRequest } from './notification-model';
import { catchError, delay, retryWhen, scan, switchMap } from 'rxjs/operators';

@Injectable({
    providedIn: 'root',
})
export class NotificationsService {
    private responseSubject = new Subject<any>();
    private locationChangeSubject = new Subject<any>();
    private rxNotificationSubject = new Subject<any>();
    private apimNotiSubscriptionKey: string;
    response$ = this.responseSubject.asObservable();
    locationChange$ = this.locationChangeSubject.asObservable();
    rxNotification$ = this.rxNotificationSubject.asObservable();

    constructor(
        @Inject('SoarConfig') private soarConfig,
        @Inject('configSettingsService') private configSettingsService,
        private httpClient: HttpClient
    ) {
        // Try retrieving the APIM key once on initialization
        this.apimNotiSubscriptionKey = this.configSettingsService.apimNotiSubscriptionKey;
    }

    getNotificationsList(req: GetNotificationListRequest): Observable<any> {
        let params = new HttpParams();
        for (const key of Object.keys(req)) {
            params = params.append(key, req[key]);
        }

        return of(null).pipe(
            // Retry fetching APIM key if not available
            switchMap(() => {
                if (!this.apimNotiSubscriptionKey) {
                    return this.retryFetchingApimKey();
                }
                return of(this.apimNotiSubscriptionKey);
            }),
            switchMap(apimKey => {
                if (!apimKey) {
                    console.error('APIM key is still missing after retries.');
                    return throwError(() => new Error('APIM key is missing.'));
                }

                const headers = new HttpHeaders({
                    'Ocp-Apim-Subscription-Key': apimKey
                });

                return this.httpClient.get(
                    this.soarConfig.fuseNotificationGatewayServiceUrl + '/api/v1/notifications/',
                    { headers, params }
                );
            }),
            retryWhen(errors =>
                errors.pipe(
                    scan((retryCount, error) => {
                        if (retryCount >= 3) {
                            throw error; // Fail after 3 attempts
                        }
                        return retryCount + 1;
                    }, 0),
                    delay(2000) // Delay between retries (2 seconds)
                )
            ),
            catchError(error => {
                console.error('Error fetching notifications:', error);
                return throwError(() => error);
            })
        );
    }

    markAllNotifications(req: MarkNotificationsRequest): Promise<any> {
        return new Promise((resolve, reject) => {
            let attempts = 0;
            const maxRetries = 3;
            const retryDelay = 2000; // 2 seconds
    
            const attemptRequest = () => {
                if (!this.apimNotiSubscriptionKey) {
                    console.warn(`APIM key is missing, retrying in ${retryDelay / 1000} seconds...`);
                    if (attempts < maxRetries) {
                        attempts++;
                        setTimeout(attemptRequest, retryDelay);
                        return;
                    } else {
                        console.error('APIM key is still missing after retries.');
                        reject(new Error('APIM key is missing.'));
                        return;
                    }
                }
    
                const url = `${String(this.soarConfig.fuseNotificationGatewayServiceUrl)}/api/v1/notifications/`;
                const headers = new HttpHeaders({
                    'Ocp-Apim-Subscription-Key': this.apimNotiSubscriptionKey
                });
    
                this.httpClient.put(url, req, { headers })
                    .pipe(
                        retryWhen(errors =>
                            errors.pipe(
                                scan((retryCount, error) => {
                                    if (retryCount >= maxRetries) {
                                        throw error; // Stop retrying after max attempts
                                    }
                                    console.warn(`Retrying markAllNotifications... Attempt ${retryCount + 1}`);
                                    return retryCount + 1;
                                }, 0),
                                delay(retryDelay)
                            )
                        ),
                        catchError(error => {
                            console.error('Error marking notifications:', error);
                            return throwError(() => error);
                        })
                    )
                    .toPromise()
                    .then(resolve)
                    .catch(reject);
            };
    
            attemptRequest(); // Start the process
        });
    }
    

    updateNotificationBell(data) {
        this.responseSubject.next(data);
    }

    closeNotification(data) {
        this.responseSubject.next(data);
    }
    notifyLocationChange(locationData: any): void {
        this.locationChangeSubject.next(locationData);
    }
    updateRxNotificationIndicator(data) {
        this.rxNotificationSubject.next(data);
    }

    private retryFetchingApimKey(): Observable<string | null> {
        return of(null).pipe(
            switchMap(() => {
                this.apimNotiSubscriptionKey = this.configSettingsService.apimNotiSubscriptionKey;
                return this.apimNotiSubscriptionKey ? of(this.apimNotiSubscriptionKey) : throwError(() => new Error('APIM key unavailable'));
            }),
            retryWhen(errors =>
                errors.pipe(
                    scan((retryCount, error) => {
                        if (retryCount >= 3) {
                            throw error; // Stop retrying after 3 attempts
                        }
                        console.warn(`Retrying to fetch APIM key... Attempt ${retryCount + 1}`);
                        return retryCount + 1;
                    }, 0),
                    delay(2000) // Wait 2 seconds between retries
                )
            )
        );
    }
}
