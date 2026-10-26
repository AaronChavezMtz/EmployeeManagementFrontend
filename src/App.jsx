import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import ProtectedRoute from './components/ProtectedRoute';
import Layout from './components/Layout';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import EmployeesPage from './pages/EmployeesPage';
import EmployeeFormPage from './pages/EmployeeFormPage';
import EmployeeDetailPage from './pages/EmployeeDetailPage';
import DepartmentsPage from './pages/DepartmentsPage';
import UsersPage from './pages/UsersPage';
import MyProfilePage from './pages/MyProfilePage';
import MyLeavePage from './pages/MyLeavePage';
import LeaveRequestsPage from './pages/LeaveRequestsPage';

export default function App() {
  return (
    <BrowserRouter>
      <ToastProvider>
        <AuthProvider>
          <Routes>
            <Route path="/login" element={<LoginPage />} />

            <Route element={<ProtectedRoute role="Admin" />}>
              <Route element={<Layout />}>
                <Route path="/" element={<DashboardPage />} />
                <Route path="/empleados" element={<EmployeesPage />} />
                <Route path="/empleados/nuevo" element={<EmployeeFormPage />} />
                <Route path="/empleados/:id" element={<EmployeeDetailPage />} />
                <Route path="/empleados/:id/editar" element={<EmployeeFormPage />} />
                <Route path="/departamentos" element={<DepartmentsPage />} />
                <Route path="/usuarios" element={<UsersPage />} />
                <Route path="/solicitudes" element={<LeaveRequestsPage />} />
              </Route>
            </Route>

            <Route element={<ProtectedRoute role="Employee" />}>
              <Route element={<Layout />}>
                <Route path="/mi-perfil" element={<MyProfilePage />} />
                <Route path="/mis-ausencias" element={<MyLeavePage />} />
              </Route>
            </Route>

            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </AuthProvider>
      </ToastProvider>
    </BrowserRouter>
  );
}
