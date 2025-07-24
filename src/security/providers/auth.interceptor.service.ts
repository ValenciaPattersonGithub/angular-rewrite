//import { Injectable } from '@angular/core';
//import { HttpEvent, HttpInterceptor, HttpHandler, HttpRequest } from '@angular/common/http';
//import { Observable } from "rxjs";

//import { TokenListService } from '../providers/token-list.service';
//import { SessionStorageService } from '../providers/session-storage.service';

//@Injectable()
//export class AuthInterceptorService implements HttpInterceptor {

//    constructor(private tokenListService: TokenListService, private sessionStorageService: SessionStorageService) {

//    }

//    intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {

//        // When a user signs in they are given a token and the token name is setup as part of that.  
//        // The token names and url patterns associated with the different tokens are stored in a separate service 
//        // That service (globalTokenList) is used to determine what token is added for the authentication header as a bearer token.

//        //let list = tokenListService.getList();
//        //let name = 'fuseLogin';

//        //let name = globalTokenList.getNameOfTokenToUtilizeForAuthorizationHeader(request.url);
//        debugger;
//        let name = this.tokenListService.getNameOfTokenToUtilizeForAuthorizationHeader(request.url);
//        if (name !== '') {
//            let value = this.sessionStorageService.getSessionStorage(name);
//            if (value !== null && value !== undefined) {
//                let headers = request.headers
//                    .set('Authorization', `Bearer ${value.access_token}`);
//                debugger;
//                const cloneReq = request.clone({ headers });
//                // we return at this location if everything went ok
//                return next.handle(cloneReq);
//            } else if (value.access_token !== null && value.access_token !== '') {
//                console.log('Error: Attempted to use token ' + name + ' but access_token is empty.');
//            }
//        }

//        return next.handle(request);
//    }
//}