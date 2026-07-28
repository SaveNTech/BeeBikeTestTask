import { Navigate, Route, Routes } from "react-router-dom";
import { Layout } from "./components/Layout";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { Customers } from "./pages/Customers";
import { Dashboard } from "./pages/Dashboard";
import { Login } from "./pages/Login";
import { Rentals } from "./pages/Rentals";
import { Scooters } from "./pages/Scooters";
import { Settings } from "./pages/Settings";

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <Layout>
              <Dashboard />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/scooters"
        element={
          <ProtectedRoute>
            <Layout>
              <Scooters />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/rentals"
        element={
          <ProtectedRoute>
            <Layout>
              <Rentals />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/customers"
        element={
          <ProtectedRoute>
            <Layout>
              <Customers />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/settings"
        element={
          <ProtectedRoute>
            <Layout>
              <Settings />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
