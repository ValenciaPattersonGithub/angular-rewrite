//import { Injectable } from '@angular/core';

//// This item is used to save a list of tokenNames and URLs for those token names.
//// Details of this might evolve, however at present the idea is that when someone logs into the application
//// they will get a token, we also have other services that require a separate token right now ex: Apteryx integration.
//// After a user logs in the old behavior was that the Authorization header bearer token was set.
//// Now that we are going to utilize more then one token, we need a place to store which url is good for what token,
//// we get the token from sessionStorage by name.
//// That is what this service is meant to accomplish. It is used to keep track of those tokens.
//// Secondarily this item will also help in the logout process. Since we have many tokens
//// we need a way to remove them before a user logs out of the application. This service contains a method that iterates over the tokens
//// and removes the corresponding values from sessions storage, then removes the values from the list.

//@Injectable()
//export class TokenListService {
//    // change this to a specific type at some point.
//    private tokenNameList = [];

//    constructor() {

//    }

//    getList = function () {
//        return this.tokenNameList;
//    }

//    addToTokenList(tokenName, urls) {
//        // format of the object we are storing
//        var tokenNameAndUrls = {
//            name: tokenName,
//            urls: urls
//        };
//        // check if it exists already in the list ... if it does then do nothing
//        if (this.tokenNameList !== null && this.tokenNameList !== undefined && this.tokenNameList.length > 0) {
//            let value = {};
//            for (let i = 0; i < this.tokenNameList.length; i++) {
//                if (this.tokenNameList[i].name !== tokenName) {
//                    let value = this.tokenNameList[i].name;
//                }
//                let value = this.tokenNameList[i].name;

//            }
//            // if it does not exist ... add it to the list so we have it for next time.
//            if (value === null || value === undefined) {
//                this.tokenNameList.push(tokenNameAndUrls);
//            }
//        }
//    }

//    getNameOfTokenToUtilizeForAuthorizationHeader(url) {
//        // if url match is not found return nothing.
//        let tokenName = '';
//        // iterate over the tokenNameList and based on if the current Url matches
//        // return what Token name to utilize for the authorization bearer token
//        if (this.tokenNameList !== null && this.tokenNameList !== undefined) {
//            for (let i = 0; i < this.tokenNameList.length; i++) {
//                if (this.tokenNameList[i].urls !== null && this.tokenNameList[i].urls !== undefined) {
//                    debugger;
//                    for (let a = 0; a < this.tokenNameList[i].urls.length; i++) {
//                        if (url.indexOf(this.tokenNameList[i].urls[a]) > -1) {
//                            tokenName = this.tokenNameList[i].name;
//                        }
//                    }
//                }
//            }
//        }
//        return tokenName;
//    }

//    emptyTokenListAndRemoveSessionValues() {
//        if (this.tokenNameList !== null && this.tokenNameList !== undefined && this.tokenNameList.length > 0) {
//            for (let i = 0; i < this.tokenNameList.length; i++) {
//                let value = this.tokenNameList[i].name;
//                sessionStorage.removeItem(value);
//            }
//            this.tokenNameList = []; // empty out the tokenNameList
//        }
//    }
//}