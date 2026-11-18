import { useState } from 'react';
import { Button, DataTableSkeleton, Tab, TabList, TabPanel, TabPanels, Tabs } from '@carbon/react';
import { CheckmarkOutline } from '@carbon/icons-react';
import NotificationsTable from '../components/NotificationsTable';
import { getNotifications, markAllAsRead, markAsRead } from '../services/notificationService';
import { useApiData } from '../../../hooks/useApiData';
import ApiErrorNotice from '../../../components/shared/ApiErrorNotice';
import { showToast } from '../../../components/shared/toast/toast';
import { useCurrentUser } from '../../../context/currentUserContext';
import type { AppNotification, NotificationCategory } from '../types/notification.types';
import './NotificationsPage.scss';

interface NotificationTab {
  label: string;
  matches: (notification: AppNotification) => boolean;
}

function inCategories(...categories: NotificationCategory[]) {
  return (notification: AppNotification) => categories.includes(notification.category);
}

const tabs: NotificationTab[] = [
  { label: 'All', matches: () => true },
  { label: 'Unread', matches: (notification) => !notification.read },
  { label: 'Action needed', matches: inCategories('assigned', 'acceptance-needed', 'approval-needed') },
  { label: 'Reminders', matches: inCategories('reminder') },
  { label: 'Escalations', matches: inCategories('escalated', 'overdue') },
  { label: 'Decisions', matches: inCategories('approved', 'rejected', 'cancelled') },
];

function NotificationsPage() {
  const [selectedTab, setSelectedTab] = useState(0);
  const { currentUser } = useCurrentUser();
  const userId = currentUser?.id ?? '';

  const {
    data: notifications,
    loading,
    failed,
    reload,
  } = useApiData<AppNotification[]>(() => getNotifications(userId), [], [userId]);

  const shown = notifications.filter(tabs[selectedTab].matches);
  const unreadCount = notifications.filter((notification) => !notification.read).length;

  async function handleMarkAllRead() {
    try {
      await markAllAsRead(notifications);
      reload();
    } catch {
      showToast("Couldn't update the notifications.", 'error');
    }
  }

  function handleOpen(notification: AppNotification) {
    if (!notification.read) {
      markAsRead(notification.id).catch(() => undefined);
    }
  }

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1>Notifications</h1>
          <p className="page-subtitle">
            Assignments, reminders, escalations and decisions on your recommendations.
          </p>
        </div>
        <Button
          kind="ghost"
          renderIcon={CheckmarkOutline}
          disabled={unreadCount === 0}
          onClick={handleMarkAllRead}
        >
          Mark all as read
        </Button>
      </div>

      {failed && <ApiErrorNotice />}

      <Tabs selectedIndex={selectedTab} onChange={({ selectedIndex }) => setSelectedTab(selectedIndex)}>
        <TabList aria-label="Filter notifications" className="notifications__tabs">
          {tabs.map((tab) => (
            <Tab key={tab.label}>{tab.label}</Tab>
          ))}
        </TabList>
        <TabPanels>
          {tabs.map((tab, index) => (
            <TabPanel key={tab.label} className="notifications__panel">
              {index !== selectedTab ? null : loading ? (
                <DataTableSkeleton columnCount={5} rowCount={4} showHeader={false} showToolbar={false} />
              ) : (
                <NotificationsTable notifications={shown} onOpen={handleOpen} />
              )}
            </TabPanel>
          ))}
        </TabPanels>
      </Tabs>
    </div>
  );
}

export default NotificationsPage;
