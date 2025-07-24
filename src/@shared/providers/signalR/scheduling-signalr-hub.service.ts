import { Inject, Injectable} from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { HubConnection } from "@microsoft/signalr";
import * as signalR from "@microsoft/signalr";
import { Observable, Subject} from "rxjs";
import { MicroServiceApiService } from 'src/security/providers';
import { SignalRConnectionInfo } from "src/@shared/models/signalr-connection-info.model";
import { ConnectionEventMessageTypes } from "../serverless-signalr-hub-connection.service";

export enum Operation {
    Create = 0,
    Update = 1,
    Delete = 2
};

export class MessageDto<T> {
    Resource: string;
    Operation: Operation;
    Data: T;
};

export class AppointmentEventDto {
    PracticeId: number;
    AppointmentId: string;
    LocationId: number;
    TreatmentRoomId: string | null;
    ExaminingDentist: string | null;
    UserId: string | null;
    StartTime: Date | null;
    EndTime: Date | null;
};

/**
 * This is a signalR service dedicated to the schedulinghub hub.
 * 
 * As more hubs are created this class can be abstracted in some way to pull out the common functionality between hubs.
 */
@Injectable({
    providedIn: 'root'
})
export class SchedulingSignalRHub {

    private readonly _http: HttpClient;
    private readonly _baseUrl: string;
    private readonly _connectionEvents: Subject<string> = new Subject();
    private readonly _messageEvents: Subject<MessageDto<AppointmentEventDto>> = new Subject();

    private _hubConnection: HubConnection;

    constructor(http: HttpClient, microserviceApis: MicroServiceApiService, 
        @Inject('practiceService') private _practiceService, @Inject('toastrFactory') private _toastrFactory,
        @Inject('localize') private _localize, @Inject('locationService') private _locationService) {
        this._http = http;
        this._baseUrl = microserviceApis.getServerlessSignalRUrl();
    }

    /**
     * Inititializes the signalR hub to start receiving messages
     */
    public async start(): Promise<void> {
        try {
            const info = await this.negotiate();
            const connectionOptions = {
                accessTokenFactory: () => info.accessToken,
            };

            this._hubConnection = new signalR.HubConnectionBuilder()
                .withUrl(info.url, connectionOptions)
                .withAutomaticReconnect()
                .configureLogging(signalR.LogLevel.Information)
                .build();
            
            this.configureHubListeners();

            await this._hubConnection.start();

            // This event is necessary to close the websocket whenever we are moving pages.
            // Without this you won't be able to re-negotiate when the page loads again
            window.addEventListener("beforeunload", (event) => {
                this._hubConnection.stop();
            });

            this._hubConnection.on('update', message => this._messageEvents.next(message));

            // Have to add the user to the group to start receiving messages properly
            await this.addUserToGroup();
        }
        catch (error: unknown) {

            // if we got an error, make sure the connection is stopped, we don't need open connections with no messages being sent
            if (this._hubConnection) {
                this._hubConnection?.stop();
            }
            this._connectionEvents.next(ConnectionEventMessageTypes.Close);

            console.error(error);
            this._toastrFactory.error(this._localize.getLocalizedString('Live Updates Are Not Currently Connected.'), this._localize.getLocalizedString('Server Error'));
        }
    }

    private configureHubListeners(): void {
        this._hubConnection.onreconnecting((_) => {

            this._connectionEvents.next(ConnectionEventMessageTypes.Reconnecting);
        });

        this._hubConnection.onreconnected((_) => {

            this._connectionEvents.next(ConnectionEventMessageTypes.Reconnected);

            // This is necessary according to the signalR docs because groups aren't maintained in the connection
            // so when you reconnect, with a new connection id, you need to get added back to any groups you were in
            this.addUserToGroup();
        });

        this._hubConnection.onclose((error) => {

            this._connectionEvents.next(ConnectionEventMessageTypes.Close);

            //This should go into here if the user was Disconnected and the user did not force the disconnect by closing the browser tab.
            if (this._hubConnection.state === 'Disconnected' && error) {

                console.error(error);
                this._toastrFactory.error(this._localize.getLocalizedString('Live Updates Have Been Disrupted.'), this._localize.getLocalizedString('Server Error'));
            }
        });
    }

    private async addUserToGroup(): Promise<any> {
        const requestUrl = `${this._baseUrl}v2/scheduling/group/join`;
        const requestBody = {
            ConnectionId: this._hubConnection.connectionId,
            LocationId: this._locationService.getCurrentLocation().id
        };
        return this._http.post(requestUrl, requestBody).pipe(res => <any>res).toPromise();
    }

    private negotiate(): Promise<SignalRConnectionInfo> {
        const requestUrl = `${this._baseUrl}v2/scheduling/negotiate`;
        return this._http.get<SignalRConnectionInfo>(requestUrl).toPromise();
    }

    public onMessages(): Observable<MessageDto<AppointmentEventDto>> {
        return this._messageEvents.asObservable();
    }

    public onConnectionEvents(): Observable<string> {
        return this._connectionEvents.asObservable();
    }
}