const PREFERENCES_KEY = "calibrationNotificationPreferences";

const DEFAULT_PREFERENCES = [
  { type: "calibration_due", enabled: false },
  { type: "calibration_overdue", enabled: false },
  { type: "calibration_approval_pending", enabled: false },
  { type: "calibration_document_locked", enabled: false },
  { type: "calibration_result_ng", enabled: false }
];

const readPreferences = () => {
  try {
    const stored = JSON.parse(localStorage.getItem(PREFERENCES_KEY) || "[]");
    return DEFAULT_PREFERENCES.map((item) => ({
      ...item,
      enabled: stored.find((storedItem) => storedItem.type === item.type)?.enabled ?? item.enabled
    }));
  } catch {
    return DEFAULT_PREFERENCES;
  }
};

const writePreferences = (preferences) => {
  localStorage.setItem(PREFERENCES_KEY, JSON.stringify(preferences));
};

const getNotifications = async (params = {}) => ({
  success: true,
  message: "Notifications are not enabled yet.",
  data: {
    items: [],
    totalCount: 0,
    page: Number(params.page ?? params.Page ?? 1),
    pageSize: Number(params.pageSize ?? params.PageSize ?? 50),
    totalPages: 0,
    hasPreviousPage: false,
    hasNextPage: false
  }
});

const getUnreadNotificationCount = async () => ({
  success: true,
  message: "Notifications are not enabled yet.",
  data: { unreadCount: 0 }
});

const getNotificationPreferences = async () => ({
  success: true,
  message: "Notification preferences are stored locally until notifications are implemented.",
  data: readPreferences()
});

const updateNotificationPreference = async (type, data) => {
  const preferences = readPreferences().map((item) =>
    item.type === type ? { ...item, enabled: Boolean(data?.enabled) } : item
  );
  writePreferences(preferences);

  return {
    success: true,
    message: "Notification preference saved locally.",
    data: preferences
  };
};

const markNotificationAsRead = async () => ({
  success: true,
  message: "Notifications are not enabled yet."
});

const markAllNotificationsAsRead = async () => ({
  success: true,
  message: "Notifications are not enabled yet."
});

export {
  getNotificationPreferences,
  getNotifications,
  getUnreadNotificationCount,
  markAllNotificationsAsRead,
  markNotificationAsRead,
  updateNotificationPreference
};
