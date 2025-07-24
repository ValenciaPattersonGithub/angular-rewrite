import { Inject, Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { HubConnection } from "@microsoft/signalr";
import * as signalR from "@microsoft/signalr";
import { Observable, Subject } from "rxjs";
import { MicroServiceApiService } from 'src/security/providers';
import { SignalRConnectionInfo } from "src/@shared/models/signalr-connection-info.model";
import { ConnectionEventMessageTypes } from "../serverless-signalr-hub-connection.service";

export class NotificationDto {
    NotificationDeliveryStatus: string;
    NotificationId: string;
    Message: string;
    NotificationType: string;
    TargetUrl: string;
    RecipientUserIds: string[];
    PracticeId: number;
    Title: string;
    UpdatedDateTimeUTC: Date;
}

@Injectable({
    providedIn: 'root'
})
export class NotificationSignalRHub {

    private readonly _http: HttpClient;
    private readonly _baseUrl: string;
    private readonly _connectionEvents: Subject<string> = new Subject();
    private readonly _messageEvents: Subject<NotificationDto> = new Subject();
    private _hubConnection: HubConnection;

    constructor(http: HttpClient, microserviceApis: MicroServiceApiService,
        @Inject('toastrFactory') private _toastrFactory,
        @Inject('localize') private _localize) {
        this._http = http;
        this._baseUrl = microserviceApis.getServerlessSignalRUrl();
    }

    public async start(practiceId: number): Promise<void> {
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
            await this.addUserToGroup(practiceId);

            window.addEventListener("beforeunload", () => {
                this._hubConnection.stop();
            });

        }
        catch (error: unknown) {
            if (this._hubConnection) {
                this._hubConnection?.stop();
            }
            this._connectionEvents.next(ConnectionEventMessageTypes.Close);

            console.error(error);
            this._toastrFactory.error(this._localize.getLocalizedString('Live Notifications Are Not Currently Connected.'), this._localize.getLocalizedString('Server Error'));
        }
    }

    private configureHubListeners(): void {
        this._hubConnection.onreconnecting((_) => {
            this._connectionEvents.next(ConnectionEventMessageTypes.Reconnecting);
        });

        this._hubConnection.onreconnected((_) => {
            this._connectionEvents.next(ConnectionEventMessageTypes.Reconnected);
        });

        this._hubConnection.on('notificationReceived', (message: NotificationDto) => {
            this._messageEvents.next(message);
        });

        this._hubConnection.onclose((error) => {
            this._connectionEvents.next(ConnectionEventMessageTypes.Close);
            if (this._hubConnection.state === 'Disconnected' && error) {
                console.error(error);
                this._toastrFactory.error(this._localize.getLocalizedString('Live Notifications Have Been Disrupted.'), this._localize.getLocalizedString('Server Error'));
            }
        });
    }

    private negotiate(): Promise<SignalRConnectionInfo> {
        const requestUrl = `${this._baseUrl}notification/negotiate`;
        return this._http.get<SignalRConnectionInfo>(requestUrl).toPromise();
    }

    private async addUserToGroup(practiceId: number): Promise<void> {
        let requestUrl = `${this._baseUrl}notification/addtogroup/${practiceId}/${this._hubConnection.connectionId}`;
        await this._http.post(requestUrl, {}).toPromise();
    }

    public onMessages(): Observable<NotificationDto> {
        return this._messageEvents.asObservable();
    }

    public onConnectionEvents(): Observable<string> {
        return this._connectionEvents.asObservable();
    }
}