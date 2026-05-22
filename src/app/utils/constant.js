export const topBarHeight = 64;
export const sideNavWidth = 260;
export const navbarHeight = 60;
export const sidenavCompactWidth = 80;
export const containedLayoutWidth = 1200;

export const CALIBRATION_TYPES = ["Internal", "External"];
export const CALIBRATION_PHASES = ["Plan", "Actual"];
export const CALIBRATION_STATUSES = ["Draft", "Ongoing", "Pending", "Prepared", "Checked", "Approved", "Locked"];
export const CALIBRATION_ROLES = ["Preparer", "Checker", "Approver"];
export const EQUIPMENT_STATUSES = ["Active", "Out Of Service", "Scrap"];
export const OVERDUE_HANDLING_OPTIONS = ["Use Actual Result Date", "Use Persisted Next Calib Date"];

export const CALIBRATION_STATUS_COLOR = {
  Draft: "default",
  Ongoing: "info",
  Pending: "warning",
  Prepared: "primary",
  Checked: "secondary",
  Approved: "success",
  Locked: "success"
};

export const DUE_STATUS_COLOR = {
  Due: "info",
  Overdue: "error",
  "Will Be Overdue": "warning"
};

export const EQUIPMENT_STATUS_COLOR = {
  Active: "success",
  "Out Of Service": "error",
  Scrap: "default"
};
