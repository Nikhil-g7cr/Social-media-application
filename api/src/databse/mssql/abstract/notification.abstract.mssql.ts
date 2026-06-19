export abstract class NotificationAbsSQLDAO {
  abstract create(payload: any): Promise<any>;
  abstract getNotifications(userId: string, limit?: number): Promise<any[]>;
  abstract markAsRead(notificationId: string): Promise<void>;
  abstract markAllAsRead(userId: string): Promise<void>;
}
