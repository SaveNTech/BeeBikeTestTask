import type { ReactNode } from "react";
import { NavLink } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useTestMode } from "../context/TestModeContext";

export function Layout({ children }: { children: ReactNode }) {
  const { user, logout } = useAuth();
  const { isTestMode } = useTestMode();

  return (
    <div className="app-shell">
      {isTestMode && (
        <div className="test-mode-banner">⚡ Тестовый режим включён — платежи и данные мокаются</div>
      )}
      <header className="topbar">
        <div className="topbar-brand">
          <span className="brand-dot" />
          BeeBike CRM
        </div>
        <nav className="topbar-nav">
          <NavLink to="/" end className={({ isActive }) => (isActive ? "nav-link active" : "nav-link")}>
            Аналитика
          </NavLink>
          <NavLink to="/scooters" className={({ isActive }) => (isActive ? "nav-link active" : "nav-link")}>
            Самокаты
          </NavLink>
          <NavLink to="/rentals" className={({ isActive }) => (isActive ? "nav-link active" : "nav-link")}>
            Аренды
          </NavLink>
          <NavLink to="/customers" className={({ isActive }) => (isActive ? "nav-link active" : "nav-link")}>
            Клиенты
          </NavLink>
          <NavLink to="/settings" className={({ isActive }) => (isActive ? "nav-link active" : "nav-link")}>
            Настройки
          </NavLink>
        </nav>
        <div className="topbar-user">
          <span>{user?.full_name ?? user?.email}</span>
          <button className="btn btn-ghost" onClick={logout}>
            Выйти
          </button>
        </div>
      </header>
      <main className="page-content">{children}</main>
    </div>
  );
}
