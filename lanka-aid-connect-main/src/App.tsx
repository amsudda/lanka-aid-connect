import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Index from "./pages/Index";
import PostNeed from "./pages/PostNeed";
import EmergencyCenters from "./pages/EmergencyCenters";
import Profile from "./pages/Profile";
import NeedDetail from "./pages/NeedDetail";
import MyPosts from "./pages/MyPosts";
import SelectUserType from "./pages/SelectUserType";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import NotFound from "./pages/NotFound";
import AdminLogin from "./pages/admin/Login";
import AdminDashboard from "./pages/admin/Dashboard";
import AdminPosts from "./pages/admin/Posts";
import AdminFlags from "./pages/admin/Flags";
import AdminUsers from "./pages/admin/Users";

const queryClient = new QueryClient();

// Check if user has auth token and user type
const isAuthenticated = () => {
  const hasStoredToken = !!localStorage.getItem("auth_token");
  // Also check if token is in URL (OAuth callback)
  const urlParams = new URLSearchParams(window.location.search);
  const hasUrlToken = !!urlParams.get('token');
  return hasStoredToken || hasUrlToken;
};

const getUserType = () => {
  return localStorage.getItem("user_type") || localStorage.getItem("selected_user_type");
};

const App = () => {
  const hasAuth = isAuthenticated();
  const hasUserType = getUserType();

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner position="top-center" />
        <BrowserRouter>
          <Routes>
            <Route path="/select-type" element={<SelectUserType />} />
            <Route path="/" element={hasAuth ? <Index /> : <Navigate to="/select-type" replace />} />
            <Route path="/post" element={<PostNeed />} />
            <Route path="/my-posts" element={<MyPosts />} />
            <Route path="/centers" element={<EmergencyCenters />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/need/:id" element={<NeedDetail />} />
            <Route path="/privacy-policy" element={<PrivacyPolicy />} />

            {/* Admin Routes */}
            <Route path="/admin/login" element={<AdminLogin />} />
            <Route path="/admin/dashboard" element={<AdminDashboard />} />
            <Route path="/admin/posts" element={<AdminPosts />} />
            <Route path="/admin/flags" element={<AdminFlags />} />
            <Route path="/admin/users" element={<AdminUsers />} />

            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
