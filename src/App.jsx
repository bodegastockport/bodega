import { useEffect, useState } from "react";
import { Toaster } from "@/components/ui/toaster";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClientInstance } from "@/lib/query-client";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import PageNotFound from "./lib/PageNotFound";
import { AuthProvider, useAuth } from "@/lib/AuthContext";
import Layout from "./components/Layout";
import ProtectedRoute from "./components/ProtectedRoute";

// Pages
import Home from "./pages/Home";
import Login from "./pages/Login";
import Admin from "./pages/Admin";
import Settings from "./pages/Settings";
import About from "./pages/About";
import Menu from "./pages/Menu";
import Events from "./pages/Events";
import Contact from "./pages/Contact";
import Gallery from "./pages/Gallery";
import CellarMemberDetail from "./pages/CellarMemberDetail";
import MyCellar from "./pages/MyCellar";
import CellarClub from "./pages/CellarClub";
import ScanBottle from "./pages/ScanBottle";
import ComingSoon from "./pages/ComingSoon";

const Spinner = () => (
  <div className="fixed inset-0 flex items-center justify-center" style={{ backgroundColor: "#f3f2ee" }}>
    <div
      style={{
        width: "24px",
        height: "24px",
        border: "2px solid #d8d6d0",
        borderTopColor: "#193c47",
        borderRadius: "50%",
        animation: "spin 0.8s linear infinite"
      }}
    />
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

    if (localStorage.getItem("bodega_preview") === "true") {
      setPreviewEnabled(true);
    }

    setCheckingPreview(false);
  }, []);

  if (isLoadingAuth || checkingPreview) return <Spinner />;

  if (!previewEnabled) {
    return <ComingSoon />;
  }

  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
        <Route path="/menu" element={<Menu />} />
        <Route path="/events" element={<Events />} />
        <Route path="/cellar-club" element={<CellarClub />} />
        <Route path="/gallery" element={<Gallery />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/login" element={<Login />} />

        <Route element={<ProtectedRoute redirectTo="/login" />}>
          <Route path="/admin" element={<Admin />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/my-cellar" element={<MyCellar />} />
          <Route path="/cellar/:id" element={<CellarMemberDetail />} />
          <Route path="/scan/:id" element={<ScanBottle />} />
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