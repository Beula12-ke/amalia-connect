import { lazy, Suspense } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AuthProvider } from "@/contexts/AuthContext";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { AppShell } from "@/components/layout/AppShell";
import { PageLoader } from "@/components/ui/PageLoader";
import Home from "@/pages/public/Home";
import Login from "@/pages/auth/Login";
import { useAuth } from "@/contexts/AuthContext";

function HomeOrRedirect() {
  const { user, role, loading } = useAuth();
  if (loading) return null; // Or your PageLoader
  if (user && role === 'estate_admin') return <Navigate to="/management" replace />;
  if (user && role === 'security') return <Navigate to="/gate" replace />;
  if (user && role === 'service_provider') return <Navigate to="/provider" replace />;
  if (user && role === 'resident') return <Navigate to="/dashboard" replace />;
  return <Home />;
}

const Register = lazy(() => import("@/pages/auth/Register"));
const Dashboard = lazy(() => import("@/pages/resident/Dashboard"));
const MyVisitors = lazy(() => import("@/pages/resident/MyVisitors"));
const AddVisitor = lazy(() => import("@/pages/resident/AddVisitor"));
const VisitorPass = lazy(() => import("@/pages/resident/VisitorPass"));
const Announcements = lazy(() => import("@/pages/resident/Announcements"));
const ServiceRequests = lazy(() => import("@/pages/resident/ServiceRequests"));
const EmergencyHelp = lazy(() => import("@/pages/resident/EmergencyHelp"));
const GateConsole = lazy(() => import("@/pages/gate/GateConsole"));
const ManagementDashboard = lazy(() => import("@/pages/management/ManagementDashboard"));
const AnnouncementsManager = lazy(() => import("@/pages/management/AnnouncementsManager"));
const ServiceDesk = lazy(() => import("@/pages/management/ServiceDesk"));
const UsersManager = lazy(() => import("@/pages/management/UsersManager"));
const UnitsManager = lazy(() => import("@/pages/management/UnitsManager"));
const AuditLogs = lazy(() => import("@/pages/management/AuditLogs"));
const VisitorOversight = lazy(() => import("@/pages/management/VisitorOversight"));
const ProviderDashboard = lazy(() => import("@/pages/provider/ProviderDashboard"));
const VisitorPortal = lazy(() => import("@/pages/public/VisitorPortal"));
const ProviderApply = lazy(() => import("@/pages/public/ProviderApply"));
const PendingApproval = lazy(() => import("@/pages/auth/PendingApproval"));
const UserSettings = lazy(() => import("@/pages/settings/UserSettings"));
const NotFound = lazy(() => import("@/pages/NotFound"));

const qc = new QueryClient({
  defaultOptions: { queries: { staleTime: 30_000, refetchOnWindowFocus: false } },
});

export default function App() {
  return (
    <QueryClientProvider client={qc}>
      <AuthProvider>
        <BrowserRouter>
          <Suspense fallback={<PageLoader />}>
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />

              <Route element={<ProtectedRoute><AppShell /></ProtectedRoute>}>
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/visitors" element={<MyVisitors />} />
                <Route path="/visitors/new" element={<AddVisitor />} />
                <Route path="/visitors/:id/pass" element={<VisitorPass />} />
                <Route path="/announcements" element={<Announcements />} />
                <Route path="/services" element={<ServiceRequests />} />
                <Route path="/emergency" element={<EmergencyHelp />} />

                <Route
                  path="/gate"
                  element={<ProtectedRoute allow={["security", "estate_manager", "estate_admin"]}><GateConsole /></ProtectedRoute>}
                />
                <Route
                  path="/management"
                  element={<ProtectedRoute allow={["estate_manager", "estate_admin"]}><ManagementDashboard /></ProtectedRoute>}
                />
                <Route
                  path="/management/announcements"
                  element={<ProtectedRoute allow={["estate_manager", "estate_admin"]}><AnnouncementsManager /></ProtectedRoute>}
                />
                <Route
                  path="/management/services"
                  element={<ProtectedRoute allow={["estate_manager", "estate_admin"]}><ServiceDesk /></ProtectedRoute>}
                />
                <Route
                  path="/management/visitors"
                  element={<ProtectedRoute allow={["estate_manager", "estate_admin"]}><VisitorOversight /></ProtectedRoute>}
                />
                <Route
                  path="/management/users"
                  element={<ProtectedRoute allow={["estate_admin"]}><UsersManager /></ProtectedRoute>}
                />
                <Route
                  path="/management/units"
                  element={<ProtectedRoute allow={["estate_admin"]}><UnitsManager /></ProtectedRoute>}
                />
                <Route
                  path="/management/logs"
                  element={<ProtectedRoute allow={["estate_admin"]}><AuditLogs /></ProtectedRoute>}
                />
                <Route
                  path="/provider"
                  element={<ProtectedRoute allow={["service_provider"]}><ProviderDashboard /></ProtectedRoute>}
                />
                <Route path="/settings" element={<UserSettings />} />
              </Route>

              <Route path="/" element={<HomeOrRedirect />} />
              <Route path="/visitor-portal" element={<VisitorPortal />} />
              <Route path="/provider/apply" element={<ProviderApply />} />
              <Route path="/pending-approval" element={<PendingApproval />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Suspense>
        </BrowserRouter>
      </AuthProvider>
    </QueryClientProvider>
  );
}