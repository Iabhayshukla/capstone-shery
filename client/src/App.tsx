import { lazy, Suspense, useState } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { EditorSkeleton } from "@/components/ui/Skeleton";
import { AuthProvider } from "@/features/auth";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { GuestRoute } from "@/components/auth/GuestRoute";
import LoadingScreen from "@/components/ui/LoadingScreen";


const LandingPage = lazy(() => import("./pages/LandingPage"));
const DashboardPage = lazy(() => import("./pages/DashboardPage"));
const EditorPage = lazy(() => import("./pages/EditorPage"));
const AccountPage = lazy(
  () => import("./features/account/components/AccountPage")
);
const LoginPage = lazy(() => import("./pages/LoginPage"));
const SignupPage = lazy(() => import("./pages/SignupPage"));
const ResetPasswordPage = lazy(() => import("./pages/ResetPasswordPage"));
const NotFoundPage = lazy(() => import("./pages/NotFoundPage"));

const PageLoader = () => (
  <div className="min-h-screen bg-brand-dark flex items-center justify-center">
    <div className="flex flex-col items-center gap-4">
      <div className="w-10 h-10 rounded-xl bg-brand-primary/20 flex items-center justify-center animate-glow-pulse">
        <div className="w-4 h-4 rounded-md bg-brand-primary animate-spin-slow" />
      </div>
      <p className="text-sm text-[var(--text-faint)] animate-pulse">Loading...</p>
    </div>
  </div>
); 

const EditorLoader = () => (
  <div className="h-screen bg-brand-dark">
    <EditorSkeleton />
  </div>
);

function App() {
  const [showLoading, setShowLoading] = useState(true);

  return (
    <>
      {showLoading && <LoadingScreen onComplete={() => setShowLoading(false)} />}
      <BrowserRouter>
        <AuthProvider>
          <Suspense fallback={<PageLoader />}>
            <Routes>
              <Route path="/" element={<LandingPage isAppLoading={showLoading} />} />
            
            <Route
              path="/dashboard"
              element={
                 <ProtectedRoute>
                  <DashboardPage />
                </ProtectedRoute> 
              }
            />
            
            <Route
              path="/editor/:projectId"
              element={
                <ProtectedRoute>
                  <Suspense fallback={<EditorLoader />}>
                    <EditorPage />
                  </Suspense>
                </ProtectedRoute>
              }
            />
            
            <Route
              path="/account"
              element={
                <ProtectedRoute>
                  <AccountPage />
                </ProtectedRoute>
              }
            />
            
            <Route
              path="/login"
              element={
                <GuestRoute>
                  <LoginPage />
                </GuestRoute>
              }
            />
            
            <Route
              path="/signup"
              element={
                <GuestRoute>
                  <SignupPage />
                </GuestRoute>
              }
            />

            <Route path="/reset-password" element={<ResetPasswordPage />} />

            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </Suspense>
      </AuthProvider>
    </BrowserRouter>
    </>
  );
  
} 

export default App;