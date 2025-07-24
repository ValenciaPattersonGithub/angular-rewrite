import { Inject, Injectable} from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { HubConnection } from "@microsoft/signalr";
import * as signalR from "@microsoft/signalr";
import { Observable, Subject} from "rxjs";
import { takeWhile } from "rxjs/operators";
import { MicroServiceApiService } from 'src/security/providers';
import { ToastService } from "src/@shared/components/toaster/toast.service";
import { SignalRConnectionInfo } from "src/@shared/models/signalr-connection-info.model";

export enum ConnectionEventMessageTypes {
    Close = "close",
    Reconnected = "reconnected",
    Reconnecting = "reconnecting",
};

@Injectable({
    providedIn: 'root',
})
export class ServerlessSignalrHubConnectionService {
    private readonly _http: HttpClient;
    readonly _baseUrl: string;
    messages: Subject<string> = new Subject();
    connectionEvents: Subject<string> = new Subject();
    groupName: string;
    userPractice: any;
    signalRIsDisconnected: boolean;
    onLoad: boolean;
    signalRErrorOnLoad: boolean;
    isBrowserTabClosed: boolean;
    hubConnection: HubConnection;
    alive: boolean;
    practiceId: any = "";
   

    constructor(http: HttpClient, microServiceApis: MicroServiceApiService, @Inject('$rootScope') private $rootScope, @Inject('toastrFactory') private toastrFactory, @Inject('localize') private localize, @Inject('practiceService') private practiceService,/*, private toastService: ToastService*/) {
        this._http = http;
        this._baseUrl = microServiceApis.getServerlessSignalRUrl();
        this.alive = false;
        this.hubConnection = null;
        this.isBrowserTabClosed = false;
        this.onLoad = true;
        this.signalRErrorOnLoad = false;

    }


    //This calls the negotiate method in the ServerlessAzureSignalR Azure Function
    getConnectionInfo(): Observable<SignalRConnectionInfo> {
        let requestUrl = `${this._baseUrl}negotiate`;
        return this._http.get<SignalRConnectionInfo>(requestUrl);
    }

    //This is the initial function called to kick off the signalr
    init() {
        this.startWatch();
    }

    //This is the listener for the PracticeId getting set in session storage
    private startWatch() {
        //Event Raised When Session Storage UserPractice Id is available
        this.practiceId = this.practiceService.getCurrentPractice()?.id;
        if (!this.practiceId) {
            this.$rootScope.$on('patCore:initpractice', () => {
                this.createSignalRConnection();
            });
        }
        else {
            this.createSignalRConnection();
        }
    }

   //This creates the SignalR Connection and listens for any appointment changes and for if the tab is closed.
   //It also calls the start method
   private createSignalRConnection() : void {
       try {
           if (!this.practiceId) {
               this.practiceId = JSON.parse(sessionStorage.getItem('userPractice')).id;
           }

           this.groupName = this.practiceId.toString();
       }
       catch (error) {
           console.error("Getting Practice Id failed", error);
       }
       
        //Don't need an else. This logic is for in case we have a connection and the watch gets fired again. We don't want to execute the code
        //inside this if condition again.
        if (!this.hubConnection) {
            this.alive = true;
            this.signalRIsDisconnected = false;

            this.getConnectionInfo().pipe(takeWhile(() => this.alive)).subscribe(async (info) => {
                let options = {
                    accessTokenFactory: () => info.accessToken,
                };

                // Establishes a Hub Connection with specified url.
                this.hubConnection = await new signalR.HubConnectionBuilder()
                    .withUrl(info.url, options)
                    .withAutomaticReconnect(/*[0,3]*/)//this will wait for 0, 5, 10, 15, and 30 seconds respectively before attempting each reconnection.Finally, it will stop after five failed attempts.
                    .configureLogging(signalR.LogLevel.Information)
                    .build();

                // On receiving an event when the signalr hub method with the specified method name is invoked.
                //This method name (appointmentCreated) has to match the name of the Target defined in the azure function for the SignalR.
                this.hubConnection.on("appointmentCreated", (data: any) => {
                    this.messages.next(data);
                });

                // On receiving an event when the signalr hub method with the specified method name is invoked.
                //This method name (appointmentUpdated) has to match the name of the Target defined in the azure function for the SignalR.
                this.hubConnection.on("appointmentUpdated", (data: any) => {
                    this.messages.next(data);
                });

                // On receiving an event when the signalr hub method with the specified method name is invoked.
                //This method name (appointmentDeleted) has to match the name of the Target defined in the azure function for the SignalR.
                this.hubConnection.on("appointmentDeleted", (data: any) => {
                   this.messages.next(data);
                });

                this.hubConnection.on("massUpdateCompleted", (data: any) => {
                    this.messages.next(data);
                });

                //Event raised when reconnecting to signalr
                //Example: This will get hit if signalr azure signalr service goes down and then comes back up
                this.hubConnection.onreconnecting((data) => {
                    console.log("On Reconnecting " + data);

                    this.connectionEvents.next(ConnectionEventMessageTypes.Reconnecting);
                });

                //Raised when the transport connection is reestablished to signalr. The OnReconnected event handler in the Hub executes.
                this.hubConnection.onreconnected((data) => {
                    console.log("On Reconnected. " + data);

                    this.connectionEvents.next(ConnectionEventMessageTypes.Reconnected);

                    //Must readd user to group after reconnecting
                    this.addUserToGroup();
                });

                //Event Raised when the disconnect timeout period expires while the SignalR client code is trying to reconnect after losing the 
                //transport connection.The default disconnect timeout is 30 seconds.
                this.hubConnection.onclose(async (data) => {
                    console.log("On Close " + data);

                    this.connectionEvents.next(ConnectionEventMessageTypes.Close);

                    //This should go into here if the user was Disconnected and the user did not force the disconnect by closing the browser tab.
                    if (this.hubConnection.state === 'Disconnected' && !this.isBrowserTabClosed) {
                        this.signalRIsDisconnected = true;

                        console.log('Got into Disconnected State');
                        this.displaySignalRDisconnectedMessage();
                        await this.start();
                    }
                });

                //This will fire when a browser tab is closed or the user logs out
                window.addEventListener("beforeunload", (event) => {
                    this.hubConnection.stop();//onclose event will get raised whe browser tab is closed. When we log out, browser tab is not closed, so onclose is not hit.
                    this.alive = false;
                    this.isBrowserTabClosed = true;
                });

                await this.start();

            });
        }
    }

    //This will start the hub connection and add the user to a group
    private async start(){

        try {
            await this.hubConnection.start().then(() => {
                this.onLoad = false;

                //Make sure that we have a connectionId to establish that we are connected
                if (this.hubConnection.connectionId) {
                  
                    this.displaySignalRReconnectedSuccessMessage();
                    this.displaySignalRConnectSuccessMessage();
                    this.addUserToGroup();
                }
            })

        } catch (e) {
            console.error(e);
            this.displaySignalRConnectErrorMessage();

            //Restart SignalR because Disconnect did not happen due to user closing browser or signing out
            setTimeout(async () => {
                await this.start();
            }, 10000); // Restart connection after 10 seconds.
        }
    }

    //Add User to SignalR Group
    //This request is to add a connectionId and groupName to a group so we know who to broadcast notifications to later on from the 
    //AppointmentCreated, AppointmentUpdated, or AppointmentDeleted Tasks in our ServerlessAzureSignalR Azure Function
    private addUserToGroup() {
        //This request is to add a connectionId and groupName to a group so we know who to broadcast notifications to later on from the 
        //AppointmentCreated, AppointmentUpdated, or AppointmentDeleted Tasks in our ServerlessAzureSignalR Azure Function
        let requestUrl = `${this._baseUrl}addtogroup/${this.groupName}/${this.hubConnection.connectionId}`;
        this._http.get(requestUrl).pipe(takeWhile(() => this.alive)).subscribe(data => {
           
        });
    }

    //SignalR Reconnected Success Message
    private displaySignalRReconnectedSuccessMessage() {
        //This success message will display when the user is reconnected to SignalR after a disconnect from SignalR occurred
        if (this.signalRIsDisconnected) {
            this.signalRIsDisconnected = false;
            this.toastrFactory.success(this.localize.getLocalizedString('Live Updates Have Resumed. Please Refresh.'), this.localize.getLocalizedString('Success'));
            
            //this.toastService.show(
             //  {
             //     type: "success",
             //     text: "Live Updates Have Resumed. Please Refresh.",
             //  },
             //    false
             //  );
        }
    }

    //SignalR Connect Success Message
    private displaySignalRConnectSuccessMessage() {
        //This success message will display if the user failed to connect to signalR and then established a successful connection after retry
        if (this.signalRErrorOnLoad) {
            this.signalRErrorOnLoad = false;
            this.toastrFactory.success(this.localize.getLocalizedString('Live Updates Are Now Connected.'), this.localize.getLocalizedString('Success'));

             //this.toastService.show(
             //  {
             //     type: "success",
             //     text: "Live Updates Are Now Connected.",
             //  },
             //    false
             //  );
        }
    }

    //SignalR Connect Error Message
    private displaySignalRConnectErrorMessage() {

        //This error message is displayed if SignalR fails on a first time connect
        if (this.onLoad) {
            this.signalRErrorOnLoad = true;
            this.toastrFactory.error(this.localize.getLocalizedString('Live Updates Are Not Currently Connected.'), this.localize.getLocalizedString('Server Error'));

               //this.toastService.show(
               //{
               //   type: "error",
               //        text: "Live Updates Are Not Currently Connected.",
               //},
               //  false
               //);
        }
    }

    //SignalR Disconnected Error Message
    private displaySignalRDisconnectedMessage() {
        this.toastrFactory.error(this.localize.getLocalizedString('Live Updates Have Been Disrupted.'), this.localize.getLocalizedString('Server Error'));

        //this.toastService.show(
        //    {
        //        type: "error",
        //        text: "Live Updates Have Been Disrupted.",
        //    },
        //    false
        //);
    }

    //This will listen for when messages are received from SignalR.
    //We subscribe to this throughout the UI to get the messages so that we can update the UI.
    signalRObservable(): Observable<any> {

        return this.messages.asObservable();
    }

    //This will listen for when messages are received from SignalR.
    //We subscribe to this throughout the UI to get the messages so that we can update the UI.
    connectionObservable(): Observable<any> {

        return this.connectionEvents.asObservable();
    }

    //ngOnDestroy() {
    //    this.toastService.close();
    //}
}