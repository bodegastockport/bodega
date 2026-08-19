import { useEffect, useState } from "react";
import { Toaster } from "@/components/ui/toaster";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClientInstance } from "@/lib/query-client";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import PageNotFound from "./lib/PageNotFound";
import { AuthProvider, useAuth } from "@/lib/AuthContext";
import Layout from "./components/Layout";
import ProtectedRoute from "./components/ProtectedRoute";

import Home from "./pages/Home";
import Login from "./pages/Login";
import TeamLogin from "./pages/TeamLogin";
import ResetPassword from "./pages/ResetPassword";
import AuthConfirm from "./pages/AuthConfirm";
import Admin from "./pages/Admin";
import Settings from "./pages/Settings";
import About from "./pages/About";
import Events from "./pages/Events";
import EventBookingSuccess from "./pages/EventBookingSuccess";
import Menu from "./pages/Menu";
import Contact from "./pages/Contact";
import Gallery from "./pages/Gallery";
import CellarMemberDetail from "./pages/CellarMemberDetail";
import MyCellar from "./pages/MyCellar";
import CellarClub from "./pages/CellarClub";
import CellarClubTerms from "./pages/CellarClubTerms";
import CellarClubSuccess from "./pages/CellarClubSuccess";
import CellarClubCancellation from "./pages/CellarClubCancellation";
import WeirMillOffer from "./pages/WeirMillOffer";
import GiftCards from "./pages/GiftCards";
import ScanBottle from "./pages/ScanBottle";
import ScanEvent from "./pages/ScanEvent";
import ComingSoon from "./pages/ComingSoon";
import Privacy from "./pages/Privacy";
import Terms from "./pages/Terms";

const BYPASS_PATHS = ["/cellar-club/success", "/cellar-club/terms", "/cellar-club/cancellation-request", "/login", "/my-cellar", "/scan", "/reset-password", "/auth/confirm", "/events/success"];

const Spinner = () => (
  <div className="fixed inset-0 flex items-center justify-center" style={{ backgroundColor: "#f3f2ee" }}>
    <div style={{ width: "24px", height: "24px", border: "2px solid #d8d6d0", borderTopColor: "#1E4D5A", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
    <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
  </div>
);

const AppRoutes = () => {
  const { isLoadingAuth } = useAuth();
  const [previewEnabled, setPreviewEnabled] = useState(false);
  const [checkingPreview, setCheckingPreview] = useState(true);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const preview = params.get("preview");
    if (preview === "bodega2026") {
      localStorage.setItem("bodega_preview", "true");
      setPreviewEnabled(true);
      setCheckingPreview(false);
      return;
    }
    if (localStorage.getItem("bodega_preview") === "true") setPreviewEnabled(true);
    setCheckingPreview(false);
  }, []);

  if (isLoadingAuth || checkingPreview) return <Spinner />;

  const isBypass = BYPASS_PATHS.some(p => window.location.pathname.startsWith(p));
  if (!previewEnabled && !isBypass) return <ComingSoon />;

  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
        <Route path="/events" element={<Events />} />
        <Route path="/events/success" element={<EventBookingSuccess />} />
        <Route path="/menu" element={<Menu />} />
        <Route path="/cellar-club" element={<CellarClub />} />
        <Route path="/cellar-club/terms" element={<CellarClubTerms />} />
        <Route path="/cellar-club/success" element={<CellarClubSuccess />} />
        <Route path="/cellar-club/cancellation-request" element={<CellarClubCancellation />} />
        <Route path="/weir-mill" element={<WeirMillOffer />} />
        <Route path="/gift-cards" element={<GiftCards />} />
        <Route path="/gallery" element={<Gallery />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/login" element={<Login />} />
        <Route path="/team-login" element={<TeamLogin />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/auth/confirm" element={<AuthConfirm />} />
        <Route path="/my-cellar" element={<MyCellar />} />
        <Route path="/scan/:id" element={<ScanBottle />} />
        <Route path="/scan-event/:id" element={<ScanEvent />} />
        <Route path="/privacy" element={<Privacy />} />
        <Route path="/terms" element={<Terms />} />

        <Route element={<ProtectedRoute redirectTo="/team-login" />}>
          <Route path="/admin" element={<Admin />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/cellar/:id" element={<CellarMemberDetail />} />
        </Route>

        <Route path="*" element={<PageNotFound />} />
      </Route>
    </Routes>
  );
};

function App() {
  return (
    <AuthProvider>
      <QueryClientProvider client={queryClientInstance}>
        <Router>
          <AppRoutes />
        </Router>
        <Toaster />
      </QueryClientProvider>
    </AuthProvider>
  );
}

export default App;