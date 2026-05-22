const navigations = [
  {
    name: "Calibration",
    icon: "dashboard",
    children: [
      {
        name: "Dashboard",
        iconText: "DB",
        path: "/dashboard"
      },
      {
        name: "Equipment Master",
        iconText: "EQ",
        path: "/equipment"
      },
      {
        name: "Plans & Actuals",
        iconText: "CA",
        path: "/calibration-documents"
      },
      {
        name: "Master Data",
        iconText: "MD",
        path: "/master-data"
      }
    ]
  },
  {
    name: "Administration",
    icon: "manage_accounts",
    children: [
      {
        name: "User",
        iconText: "US",
        path: "/users"
      },
      {
        name: "Notifications",
        iconText: "NT",
        path: "/inbox"
      }
    ]
  }
];

export default navigations;
