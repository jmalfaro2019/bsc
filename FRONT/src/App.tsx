import { BrowserRouter as Router, Routes, Route } from "react-router";
import NotFound from "./pages/OtherPage/NotFound";
import AppLayout from "./layout/AppLayout";
import { ScrollToTop } from "./components/common/ScrollToTop";
import StrategicLinesTab from "./pages/Dashboard/StrategicLinesTab";
import ProjectsTab from "./pages/Dashboard/ProjectsTab";
import ActionsTab from "./pages/Dashboard/ActionsTab";
import DataEntryTab from "./pages/Dashboard/DataEntryTab";
import WeightingsPage from "./pages/WeightingsPage";
import StructurePage from "./pages/Admin/StructurePage";
import UsersPage from "./pages/Admin/UsersPage";
import SignIn from "./pages/AuthPages/SignIn";
import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./components/auth/ProtectedRoute";
import RequireRole from "./components/auth/RequireRole";

export default function App() {
  return (
    <AuthProvider>
      <Router>
        <ScrollToTop />
        <Routes>
          <Route path="/signin" element={<SignIn />} />

          <Route
            element={
              <ProtectedRoute>
                <AppLayout />
              </ProtectedRoute>
            }
          >
            <Route index path="/" element={<StrategicLinesTab />} />
            <Route path="/proyectos" element={<ProjectsTab />} />
            <Route path="/acciones" element={<ActionsTab />} />
            <Route
              path="/ingreso-datos"
              element={
                <RequireRole role="admin">
                  <DataEntryTab />
                </RequireRole>
              }
            />
            <Route path="/ponderaciones" element={<WeightingsPage />} />
            <Route
              path="/admin/estructura"
              element={
                <RequireRole role="admin">
                  <StructurePage />
                </RequireRole>
              }
            />
            <Route
              path="/admin/usuarios"
              element={
                <RequireRole role="admin">
                  <UsersPage />
                </RequireRole>
              }
            />
          </Route>

          <Route path="*" element={<NotFound />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}