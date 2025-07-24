
import { Injectable, Inject } from '@angular/core';
import { HttpEvent, HttpInterceptor, HttpHandler, HttpRequest, HttpErrorResponse } from '@angular/common/http';
import { Observable, of, throwError} from "rxjs";
import { TranslateService } from '@ngx-translate/core';

import { catchError, filter, tap, take } from 'rxjs/operators';

import { ConfirmationModalOverlayRef } from 'src/@shared/components/confirmation-modal/confirmation-modal.overlayref';
import { ConfirmationModalService } from 'src/@shared/components/confirmation-modal/confirmation-modal.service';
import { Subscription } from 'rxjs';

@Injectable()
export class UltInterceptorService implements HttpInterceptor {

    constructor(        
        @Inject('patSecurityService') private patSecurityService,
        @Inject('ULTModalService') private ultModalService,
        private translate: TranslateService,
        private confirmationModalService: ConfirmationModalService) {
    }
    
    confirmationRef: ConfirmationModalOverlayRef;
    confirmationModalSubscription: Subscription;

    openModalCount = 0;
    ultMessaging = {
        header: this.translate.instant('Unauthorized due to login times restriction'),
        message: 'You are unable to complete this action due to your Restrict Day and Time Access settings.',
        message2: 'Please contact your Practice Administrator.',
        boldTextMessage: '',
        confirm: this.translate.instant('Logout'),        
        height: 240,
        width: 500
    }

    intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {

        return next.handle(request).pipe(
            catchError((err) => {
                if (err.status === 403 && err.error
                    && err.error.Title === 'Unauthorized due to login times restriction.') {

                    this.ultModalService.openUltMessage(err.error.Detail);
                    //return an of to satisfy the observable and prevent a console error, won't trigger toaster errors
                    return of(err);
                }
                else {
                    //pass the error back to whoever made the http call so it can handle the error properly
                    return throwError(err);                
                }                
                
            }));    
    }   

}