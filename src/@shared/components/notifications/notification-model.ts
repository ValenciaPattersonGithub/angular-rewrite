export class GetNotificationListRequest {

    UserId: string;
    ApplicationId: number;
    NotificationReadStatus: NotificationReadStatus;
    PageSize: number;
}

export class GetNotificationListResponse {
    NotificationId: string;
    Body: string;
    Title: string;
    TargetUrl: string;
    Timespan: string;
    NotificationType: string;
    NotificationReadStatus: string;
    DeliveryStatus: string;
}

export class MarkNotificationsRequest {
    UserId: string;
    NotificationReadStatus: NotificationReadStatus;
    NotificationIds: string[];
}

export enum NotificationReadStatus {
    All = 1,
    Read = 2,
    Unread = 3,
    Deleted = 4
}