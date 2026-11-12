import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AuthProvider } from "@/contexts/AuthContext";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { AppShell } from "@/components/layout/AppShell";
import Login from "@/pages/auth/Login";
import Register from "@/pages/auth/Register";
import Dashboard from "@/pages/resident/Dashboard";
import MyVisitors from "@/pages/resident/MyVisitors";
import AddVisitor from "@/pages/resident/AddVisitor";
import VisitorPass from "@/pages/resident/VisitorPass";
import Announcements from "@/pages/resident/Announcements";
import ServiceRequests from "@/pages/resident/ServiceRequests";
import EmergencyHelp from "@/pages/resident/EmergencyHelp";
import GateConsole from "@/pages/gate/GateConsole";
import ManagementDashboard from "@/pages/management/ManagementDashboard";
import AnnouncementsManager from "@/pages/management/AnnouncementsManager";
import ServiceDesk from "@/pages/management/ServiceDesk";
import UsersManager from "@/pages/management/UsersManager";
import VisitorOversight from "@/pages/management/VisitorOversight";
import Home from "@/pages/public/Home";
import VisitorPortal from "@/pages/public/VisitorPortal";
import NotFound from "@/pages/NotFound";

const qc = new QueryClient({
  defaultOptions: { queries: { staleTime: 30_000, refetchOnWindowFocus: false } },
});

export default function App() {
  return (
    <QueryClientProvider client={qc}>
      <AuthProvider>
        <BrowserRouter>
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
            </Route>

            <Route path="/" element={<Home />} />
            <Route path="/visitor-portal" element={<VisitorPortal />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </QueryClientProvider>
  );
}