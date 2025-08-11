import React from "react";
import { BrowserRouter, Routes as RouterRoutes, Route } from "react-router-dom";
import ScrollToTop from "components/ScrollToTop";
import ErrorBoundary from "components/ErrorBoundary";
import { AuthProvider } from "./contexts/AuthContext";
import NotFound from "pages/NotFound";
import Login from './pages/login';
import Signup from './pages/signup';
import AttackResults from './pages/attack-results';
import Dashboard from './pages/dashboard';
import AttackMonitoring from './pages/attack-monitoring';
import AttackConfiguration from './pages/attack-configuration';

const Routes = () => {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ErrorBoundary>
        <ScrollToTop />
        <RouterRoutes>
          {/* Define your route here */}
          <Route path="/" element={<Dashboard />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/attack-results" element={<AttackResults />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/attack-monitoring" element={<AttackMonitoring />} />
          <Route path="/attack-configuration" element={<AttackConfiguration />} />
          <Route path="*" element={<NotFound />} />
        </RouterRoutes>
        </ErrorBoundary>
      </AuthProvider>
    </BrowserRouter>
  );
};

export default Routes;