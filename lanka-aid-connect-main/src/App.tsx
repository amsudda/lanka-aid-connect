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
import NotFound from "./pages/NotFound";

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
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
