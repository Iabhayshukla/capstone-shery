import React, { lazy, Suspense, useState } from "react";
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
const PreviewPage = lazy(() => import("./pages/PreviewPage"));
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

class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean; error: Error | null }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false, error: null };
  }
  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }
  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-brand-dark flex items-center justify-center">
          <div className="text-center p-8">
            <h1 className="text-xl font-semibold text-white mb-2">Something went wrong</h1>
            <p className="text-sm text-[var(--text-muted)] mb-4">
              {this.state.error?.message || 'An unexpected error occurred.'}
            </p>
            <button
              onClick={() => { this.setState({ hasError: false, error: null }); window.location.href = '/dashboard'; }}
              className="px-4 py-2 rounded-lg bg-brand-primary text-white text-sm hover:opacity-90 transition-opacity"
            >
              Go to Dashboard
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

function App() {
  const [showLoading, setShowLoading] = useState(() => {
    return !window.location.pathname.startsWith("/preview/");
  });

  return (
    <>
      {showLoading && <LoadingScreen onComplete={() => setShowLoading(false)} />}
      <BrowserRouter>
        <AuthProvider>
          <ErrorBoundary>
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
              path="/preview/:projectId"
              element={
                <ProtectedRoute>
                  <PreviewPage />
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
        </ErrorBoundary>
      </AuthProvider>
    </BrowserRouter>
    </>
  );
  
} 

export default App;