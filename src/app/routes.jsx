import { lazy } from "react";
import { Navigate } from "react-router-dom";

import AuthGuard from "./auth/AuthGuard";
import { authRoles } from "./auth/authRoles";

import Loadable from "./components/Loadable";
import MatxLayout from "./components/MatxLayout/MatxLayout";
import sessionRoutes from "./views/sessions/session-routes";

const CalibrationDashboard = Loadable(lazy(() => import("app/views/calibration/CalibrationDashboard")));
const EquipmentPage = Loadable(lazy(() => import("app/views/calibration/EquipmentPage")));
const CalibrationDocumentsPage = Loadable(lazy(() => import("app/views/calibration/CalibrationDocumentsPage")));
const CalibrationDocumentDetailPage = Loadable(lazy(() => import("app/views/calibration/CalibrationDocumentDetailPage")));
const CalibrationMasterDataPage = Loadable(lazy(() => import("app/views/calibration/CalibrationMasterDataPage")));
const UsersPage = Loadable(lazy(() => import("app/views/users/UsersPage")));
const InboxPage = Loadable(lazy(() => import("app/views/notifications/InboxPage")));
const ProfilePage = Loadable(lazy(() => import("app/views/account/ProfilePage")));
const ForcePasswordChangePage = Loadable(lazy(() => import("app/views/account/ForcePasswordChangePage")));

const routes = [
  { path: "/", element: <Navigate to="/dashboard" /> },
  {
    element: (
      <AuthGuard>
        <MatxLayout />
      </AuthGuard>
    ),
    children: [
      { path: "/dashboard", element: <CalibrationDashboard />, auth: authRoles.user },
      { path: "/equipment", element: <EquipmentPage />, auth: authRoles.user },
      { path: "/calibration-documents", element: <CalibrationDocumentsPage />, auth: authRoles.user },
      { path: "/calibration-documents/:documentId", element: <CalibrationDocumentDetailPage />, auth: authRoles.user },
      { path: "/master-data", element: <CalibrationMasterDataPage />, auth: authRoles.admin },
      { path: "/users", element: <UsersPage />, auth: authRoles.admin },
      { path: "/inbox", element: <InboxPage />, auth: authRoles.user },
      { path: "/account/profile", element: <ProfilePage />, auth: authRoles.user },
      { path: "/account/change-password", element: <ForcePasswordChangePage />, auth: authRoles.user }
    ]
  },

  ...sessionRoutes
];

export default routes;
