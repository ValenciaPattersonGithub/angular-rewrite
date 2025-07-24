import { Component, HostListener, Inject, Input, OnInit, ViewContainerRef } from '@angular/core';
import { Subscription } from 'rxjs';
import { FuseFlag } from '../../../@core/feature-flags';
import { FeatureFlagService } from '../../../featureflag/featureflag.service';
import { RxService } from '../../../rx/common/providers/rx.service';
import { GetNotificationListRequest, GetNotificationListResponse, MarkNotificationsRequest, NotificationReadStatus } from './notification-model';
import { NotificationsService } from './notifications.service';
import { NotificationSignalRHub } from 'src/@shared/providers/signalR/notification-signalr-hub.service';

declare let _: any;

@Component({
    selector: 'notifications',
    templateUrl: './notifications.component.html',
    styleUrls: ['./notifications.component.scss']
})
export class NotificationsComponent implements OnInit {
    allMessages: GetNotificationListResponse[] = [];
    unreadMessages: GetNotificationListResponse[] = [];
    messages: GetNotificationListResponse[] = [];
    showUnread: boolean = false;
    isMarkAllRead: boolean = false;
    showMarkAllText: string = "Read";
    @Input() drawer: { isOpen: boolean };
    sub: Subscription;
    currentUser: string;
    readStatusIcon: string;
    unreadStatusIcon: string;
    showNotifications: boolean = false;
    rxUser: boolean = false;
    rxNotificationAttempts: number = 0;
    notifications:
        {
            newCounts: boolean;
            url: string;
        } = {
            newCounts: false,
            url: ''
        };
    private observer: (notification: any) => void;
    private locationChangeSubscription: Subscription;
    applicationId: number;
    allowPropagation: boolean = false;
    constructor(
        private featureFlagService: FeatureFlagService,
        private notificationSignalRHub: NotificationSignalRHub,
        @Inject('localize') private localize,
        @Inject('toastrFactory') private toastrFactory,
        private notificationService: NotificationsService,
        @Inject('platformSessionCachingService') private platformSessionCachingService,
        @Inject('ReportsFactory') private reportsFactory,
        @Inject('UserRxFactory') private userRxFactory,
        private rxService: RxService) { }

    ngOnInit(): void {
        this.allMessages = [];
        const userContext = this.platformSessionCachingService.userContext.get();
        if (userContext !== null) {
            this.currentUser = userContext.Result.User;
            this.applicationId = userContext.Result.Application?.ApplicationId;
        }

        this.observer = (notification: any) => {
            this.updateRxNotifications(notification);
        };

        this.featureFlagService.getOnce$(FuseFlag.ShowNotifications).subscribe((value) => {
            this.showNotifications = value;
            if (this.showNotifications) {
                this.callNotificationSignalRHub();
                this.locationChangeSubscription = this.notificationService.locationChange$.subscribe((locationData) => {
                    this.getRxNotifications();
                });
            }
        });

    }

    updateRxNotifications(res) {
        this.rxNotificationsSuccess(res);
    };

    getRxNotifications() {
        this.rxService
            .notificationsPreCheck(this.currentUser['UserId'])
            .then((res) => {
                if (res && res.result) {
                    this.rxUser = true;
                    // if this call failed for this location in the last 8 hours, the call won't be made again to prevent
                    // multiple error messages
                    if (
                        this.userRxFactory.getLocation() &&
                        this.userRxFactory.NotificationFailed(
                            this.currentUser['UserId']
                        ) === false
                    ) {
                        this.rxNotificationAttempts += 1;
                        this.userRxFactory
                            .RxNotifications(
                                this.currentUser['UserId'],
                                this.rxNotificationAttempts,
                                res.entId
                            )
                            .then((res) => {
                                // handle successful call
                                this.rxNotificationsSuccess(res);
                                // setup interval
                                this.userRxFactory.SetRxNotificationsTimer(
                                    this.currentUser['UserId'],
                                    res.entId
                                );
                            },
                                () => {
                                    // if call fails (for any reason)
                                    // note, this can happen if a user is setup in fuse for rx but not validated for Dosespot for a number of reasons
                                    // we will only show a failed message if first call or if location changes
                                    this.rxNotificationsFailed(res.entId);
                                }
                            );
                    }
                }
            })
            .catch(function () { });
    }

    rxNotificationsSuccess = function (res) {
        var previousCounts = this.notifications.counts;
        this.rxNotificationAttempts = 0;
        if (res) {
            var counts =
                res.RefillRequestsTotalCount +
                res.TransactionErrorsTotalCount +
                res.PendingPrescriptionsTotalCount;
            if (counts > previousCounts) {
                this.notifications.newCounts = true;
            }
            this.notifications.counts = counts;
            if (res.Counts.length > 0) {
                this.notifications.url = res.Counts[0].NotificationCountsUrl;
            }
            if (counts > 0)
                this.notificationService.updateRxNotificationIndicator(true);
        }
    };

    rxNotificationsFailed = function (entId) {
        if (this.rxNotificationAttempts < 3) {
            setTimeout(() => {
                this.getRxNotifications(entId);
            }, 10000);
        } else {
            // reset the ctrl.rxNotificationAttempts and show failed message
            this.rxNotificationAttempts = 0;
            this.toastrFactory.error(
                this.localize.getLocalizedString(
                    'Failed to retrieve {0}.',
                    ['Rx Notifications'],
                    this.localize.getLocalizedString('Error')
                )
            );
        }
    };

    /**
     * Initializes the SignalR service to start receiving notifications
     */

    callNotificationSignalRHub() {
        this.notificationSignalRHub.start(JSON.parse(sessionStorage.getItem('userPractice')).id);
        this.sub = this.notificationSignalRHub.onMessages().subscribe(
            (message: any) => {
                if (message?.NotificationId != undefined && message?.RecipientUserIds?.includes(this.currentUser['UserId'])) {
                    var notificationMessage = {
                        Title: `${message?.Title}`,
                        Body: message?.Message,
                        TargetUrl: message?.TargetUrl,
                        NotificationId: message?.NotificationId,
                        NotificationReadStatus: 'Unread',
                        NotificationType: message?.NotificationType,
                        Timespan: this.calculateTimespan(message?.UpdatedDateTimeUTC),
                        DeliveryStatus: message?.NotificationDeliveryStatus
                    };
                    if (message?.NotificationDeliveryStatus == "Completed") {
                        this.toastrFactory.success(this.localize.getLocalizedString(message?.Message),
                            this.localize.getLocalizedString(message?.Title));
                        this.loadReportData(notificationMessage);
                    }
                    if (message?.NotificationDeliveryStatus == "Pending") {
                        this.toastrFactory.info(this.localize.getLocalizedString(message?.Message),
                            this.localize.getLocalizedString(message?.Title));

                        notificationMessage.Timespan = this.convertTimeFromUTCToLocalTime(message?.UpdatedDateTimeUTC);
                    }
                    // Load report data if user is on same page

                    this.notificationService.updateNotificationBell(true);
                    // update the message if it already exists
                    const existingMessageIndex = this.messages.findIndex(m => m.NotificationId === notificationMessage.NotificationId);
                    if (existingMessageIndex !== -1) {
                        this.messages[existingMessageIndex] = notificationMessage;
                    } else {
                        this.messages.unshift(notificationMessage);
                    }

                }
            },
            (error: any) => { }
        );
    }

    convertTimeFromUTCToLocalTime(utcTime: string): string {
        var startDate = new Date(utcTime);
        var localDate = new Date(startDate.toLocaleString());
        var startHrs = localDate.getHours();
        var startMins = localDate.getMinutes();
        const ampm = startHrs >= 12 ? 'PM' : 'AM';

        // Convert hours to 12-hour format
        startHrs = startHrs % 12;
        startHrs = startHrs ? startHrs : 12;
        return `${startHrs}:${startMins < 10 ? '0' + startMins : startMins} ${ampm}`;
    }

    close() {
        this.allowPropagation = true;
    }

    showUnreadOnly($event) {
        this.showUnread = $event;
        this.getNotificationsList();
    }

    @HostListener('click', ['$event'])
    stopPropagation(event: Event) {
        if (this.allowPropagation === true) {
            this.allowPropagation = false;
            return;
        }
        event.stopPropagation();
    }

    openDropdownId: string = null;
    toggleDropdown(event: Event, id: string) {
      event.stopPropagation();
      this.openDropdownId = this.openDropdownId === id ? null : id;
    }

    getNotificationsList() {
        const req: GetNotificationListRequest = {
            UserId: this.currentUser["UserId"],
            ApplicationId: this.applicationId,
            NotificationReadStatus: this.showUnread ? NotificationReadStatus.Unread : NotificationReadStatus.All,
            PageSize: 10000
        };

        if (this.showNotifications) {
            this.notificationService.getNotificationsList(req).subscribe((data: GetNotificationListResponse[]) => {
                this.allMessages = [];
                this.unreadMessages = [];
                const notifications = data['notifications'];

                notifications.forEach(notification => {
                    const message: GetNotificationListResponse = {
                        Title: `${notification.title} Report`,
                        Body: 'The report is completed and ready to view.',
                        TargetUrl: notification.targetUrl,
                        NotificationId: notification.notificationId,
                        NotificationReadStatus: notification.notificationReadStatus,
                        NotificationType: notification.notificationType,
                        Timespan: notification.notificationDeliveryStatus === "Completed"
                            ? this.calculateTimespan(notification.updatedDateTimeUTC)
                            : this.convertTimeFromUTCToLocalTime(notification.updatedDateTimeUTC),
                        DeliveryStatus: notification.notificationDeliveryStatus
                    };

                    if (this.showUnread) {
                        this.unreadMessages.push(message);
                    } else if (notification.notificationReadStatus !== "Deleted") {
                        this.allMessages.push(message);
                    }
                });

                this.messages = this.showUnread ? this.unreadMessages : this.allMessages;
            });
        }
    }

    markAllNotifications() {
        this.isMarkAllRead = true;
        var setReadStatus;
        var notificationsIds: string[] = [];
        for (let m in this.messages) {
            notificationsIds.push(this.messages[m]['NotificationId']);
        }
        if (this.isMarkAllRead)
            setReadStatus = NotificationReadStatus.Read;
        this.callMarkService(notificationsIds, setReadStatus);
    }

    onSuccess() {
        this.getNotificationsList();
    }

    onFailure() {
        this.toastrFactory.error(
            this.localize.getLocalizedString('Failed')
        );
    }

    markOneNotification(dataItem, readStatus) {
        var setReadStatus;
        if (readStatus == "Read")
            setReadStatus = NotificationReadStatus.Unread;
        else if (readStatus == "Unread")
            setReadStatus = NotificationReadStatus.Read;
        else if (readStatus == "Deleted")
            setReadStatus = NotificationReadStatus.Deleted;
        var notificationsIds: string[] = [];
        notificationsIds.push(dataItem);
        this.callMarkService(notificationsIds, setReadStatus);

    }

    callMarkService(notificationsIds, setReadStatus) {

        var req: MarkNotificationsRequest = {
            NotificationIds: notificationsIds,
            UserId: this.currentUser['UserId'],
            NotificationReadStatus: setReadStatus
        };
        this.notificationService
            .markAllNotifications(req).then((res) => {
                if (res)
                    this.onSuccess();
            }, () => {
                this.onFailure();
            })
    }

    calculateTimespan(createDateTime?: Date): string {
        const now = new Date();
        const startDate = new Date(createDateTime) || now;
        const timeSpanMs = now.getTime() - startDate.getTime();

        const seconds = Math.floor(timeSpanMs / 1000);
        const minutes = Math.floor(seconds / 60);
        const hours = Math.floor(minutes / 60);
        const days = Math.floor(hours / 24);

        if (days > 0) {
            return `${days} d`;
        }
        if (hours > 0) {
            return `${hours} h`;
        }
        if (minutes > 0) {
            return `${minutes} m`;
        }
        return `${seconds} s`;
    }

    ngOnDestroy() {
        if (this.showNotifications) {
            this.sub.unsubscribe();
            if (this.userRxFactory.notificationObservers){
                const index = this.userRxFactory.notificationObservers.indexOf(this.observer);
                if (index !== -1) {
                    this.userRxFactory.notificationObservers.splice(index, 1);
                }
            }
            
            if (this.locationChangeSubscription) {
                this.locationChangeSubscription.unsubscribe();
            }
        }
    }

    openReport(message) {
        this.allowPropagation = true;
        var route = message.TargetUrl;
        var reportId = route.split('reportId=')[1].split('&')[0];
        var blobId = route.split('blobId=')[1].split('&')[0];
        this.markOneNotification(message.NotificationId, "Unread");
        this.reportsFactory.GetSpecificReports([reportId]).then((res) => {
            if (res && res?.Value) {
                const report = res?.Value[0]
                report.Route = '/BusinessCenter/' + `${report?.Route?.charAt(0).toUpperCase() as string}${report?.Route?.slice(1) as string}` + '?bid=' + blobId;
                report.FilterProperties = report?.RequestBodyProperties;
                report.Amfa = this.reportsFactory.GetAmfaAbbrev(report?.ActionId);

                this.reportsFactory.OpenReportPage(report,
                    report.Route,
                    true);
            }
        });
    }

    loadReportData(message) {
        var route = message.TargetUrl;
        var reportId = route.split('reportId=')[1].split('&')[0];
        var blobId = route.split('blobId=')[1].split('&')[0];
        this.reportsFactory.GetSpecificReports([reportId]).then((res) => {
            if (res && res?.Value) {
                const report = res?.Value[0]
                let currentUrl = window.location.href.toLowerCase();
                let cleanUrl = currentUrl.split('?')[0];
                if (cleanUrl.endsWith(report.Route.toLowerCase())) {
                    this.markOneNotification(message.NotificationId, "Read");
                    report.Route = '/BusinessCenter/' + `${report?.Route?.charAt(0).toUpperCase() as string}${report?.Route?.slice(1) as string}` + '?bid=' + blobId;
                    report.FilterProperties = report?.RequestBodyProperties;
                    report.Amfa = this.reportsFactory.GetAmfaAbbrev(report?.ActionId);

                    this.reportsFactory.OpenReportPageSameTab(report,
                        report.Route,
                        true,
                        blobId);
                }
            }
        });
    }
}