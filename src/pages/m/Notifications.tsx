import { useNotifications } from '../../features/notifications/useNotifications';
import { NotificationsView } from '../../features/notifications/NotificationsView';

export function Notifications() {
  const logic = useNotifications();
  return <NotificationsView {...logic} />;
}
