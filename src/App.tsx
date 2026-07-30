import { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { WebSocketProvider } from './context/WebSocketContext';
import { ThemeProvider } from './context/ThemeContext';
import Loading from './components/Common/Loading';
import Dashboard from './pages/Dashboard';

// Home pulls in Three.js for the 3D hero scene - lazy-loaded so that weight
// only hits visitors landing on "/", not the rest of the app (login, dashboard, etc).
const Home = lazy(() => import('./pages/Home'));
const LastScan = lazy(() => import('./pages/LastScan'));
const Messages = lazy(() => import('./pages/Messages'));
import AddTag from './pages/AddTag';
import TagDetail from './pages/TagDetail';
import PublicScan from './pages/PublicScan';
import RequestSafeTag from './pages/RequestSafeTag';
import Profile from './pages/Profile';
import Settings from './pages/Settings';
import Terms from './pages/Terms';
import Privacy from './pages/Privacy';
import About from './pages/About';
import Contact from './pages/Contact';
import Careers from './pages/Careers';
import AdminPanel from './pages/AdminPanel';
import AdminSafeTagsQueue from './pages/admin/AdminSafeTagsQueue';
import AdminSafeTagDetail from './pages/admin/AdminSafeTagDetail';
import AdminSafeTagRequestsQueue from './pages/admin/AdminSafeTagRequestsQueue';
import AdminPrintBatches from './pages/admin/AdminPrintBatches';
import Login from './components/Auth/Login';
import Register from './components/Auth/Register';
import ForgotPassword from './components/Auth/ForgotPassword';
import ResetPassword from './components/Auth/ResetPassword';
import VerifyEmail from './pages/VerifyEmail';
import ChangePassword from './pages/ChangePassword';
import NotFound from './pages/NotFound';
import ScanNotificationPopup from './components/ScanNotificationPopup';
import IncomingCallModal from './components/IncomingCallModal';
import SosAlertPopup from './components/SosAlertPopup';
import { useAuth } from './hooks/useAuth';
import { useFcmTokenRegistration } from './hooks/useFcmTokenRegistration';

// No UI of its own - just keeps this device's FCM token registered with the backend while
// logged in (native only), so incoming calls can reach it even backgrounded/killed.
function FcmTokenRegistrar() {
  useFcmTokenRegistration();
  return null;
}

function PrivateRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, user, initializing } = useAuth();
  if (initializing) return <Loading fullScreen />;
  if (!isAuthenticated) return <Navigate to="/login" />;
  // Mirrors PasswordChangeGateFilter server-side - a temp-password account can't reach any
  // other private route (including a stale one already in the URL/history) until this clears.
  if (user?.mustChangePassword) return <Navigate to="/change-password" />;
  return <>{children}</>;
}

function RequireAuthOnly({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, initializing } = useAuth();
  if (initializing) return <Loading fullScreen />;
  return isAuthenticated ? <>{children}</> : <Navigate to="/login" />;
}

function AdminRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, user, initializing } = useAuth();
  if (initializing) return <Loading fullScreen />;
  return isAuthenticated && user?.role === 'ADMIN' ? <>{children}</> : <Navigate to="/dashboard" />;
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ThemeProvider>
          <WebSocketProvider>
            <ScanNotificationPopup />
            <IncomingCallModal />
            <SosAlertPopup />
            <FcmTokenRegistrar />
            <Routes>
              <Route path="/" element={
                <Suspense fallback={<Loading fullScreen />}>
                  <Home />
                </Suspense>
              } />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />
              <Route path="/reset-password" element={<ResetPassword />} />
              <Route path="/verify-email" element={<VerifyEmail />} />
              <Route path="/change-password" element={
                // Deliberately not wrapped in PrivateRoute - PrivateRoute redirects here
                // *because of* mustChangePassword, so reusing it here would loop forever.
                <RequireAuthOnly>
                  <ChangePassword />
                </RequireAuthOnly>
              } />
              <Route path="/scan/:code" element={<PublicScan />} />
              <Route path="/request-safetag" element={<RequestSafeTag />} />
              <Route path="/terms" element={<Terms />} />
              <Route path="/privacy" element={<Privacy />} />
              <Route path="/about" element={<About />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="/careers" element={<Careers />} />

              <Route path="/dashboard" element={
                <PrivateRoute>
                  <Dashboard />
                </PrivateRoute>
              } />

              <Route path="/tags/new" element={
                <PrivateRoute>
                  <AddTag />
                </PrivateRoute>
              } />

              <Route path="/tags/:id" element={
                <PrivateRoute>
                  <TagDetail />
                </PrivateRoute>
              } />

              <Route path="/profile" element={
                <PrivateRoute>
                  <Profile />
                </PrivateRoute>
              } />

              <Route path="/last-scan" element={
                <PrivateRoute>
                  <Suspense fallback={<Loading fullScreen />}>
                    <LastScan />
                  </Suspense>
                </PrivateRoute>
              } />

              <Route path="/messages" element={
                <PrivateRoute>
                  <Suspense fallback={<Loading fullScreen />}>
                    <Messages />
                  </Suspense>
                </PrivateRoute>
              } />

              <Route path="/settings" element={
                <PrivateRoute>
                  <Settings />
                </PrivateRoute>
              } />

              <Route path="/admin" element={
                <AdminRoute>
                  <AdminPanel />
                </AdminRoute>
              } />

              <Route path="/admin/safetags" element={
                <AdminRoute>
                  <AdminSafeTagsQueue />
                </AdminRoute>
              } />

              <Route path="/admin/safetags/:id" element={
                <AdminRoute>
                  <AdminSafeTagDetail />
                </AdminRoute>
              } />

              <Route path="/admin/safetag-requests" element={
                <AdminRoute>
                  <AdminSafeTagRequestsQueue />
                </AdminRoute>
              } />

              <Route path="/admin/print-batches" element={
                <AdminRoute>
                  <AdminPrintBatches />
                </AdminRoute>
              } />

              <Route path="*" element={<NotFound />} />
            </Routes>
          </WebSocketProvider>
        </ThemeProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
