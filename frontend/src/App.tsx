import { lazy, Suspense } from 'react'
import { Routes, Route, Navigate, useParams } from 'react-router-dom'
import { useAuthStore } from './stores/auth-store'
import { AppLayout } from './components/layout/app-layout'
import { ProtectedRoute } from './components/layout/protected-route'
import { ErrorBoundary } from './components/error-boundary'
import { NavigationLoader } from './components/navigation-loader'
const LoginPage = lazy(() => import('./pages/auth/login-page').then((module) => ({ default: module.LoginPage })))
const RegisterPage = lazy(() => import('./pages/auth/register-page').then((module) => ({ default: module.RegisterPage })))
const HomePage = lazy(() => import('./pages/home/home-page').then((module) => ({ default: module.HomePage })))
const ThreadListPage = lazy(() => import('./pages/forum/thread-list-page').then((module) => ({ default: module.ThreadListPage })))
const ThreadDetailPage = lazy(() => import('./pages/forum/thread-detail-page').then((module) => ({ default: module.ThreadDetailPage })))
const ChatPage = lazy(() => import('./pages/chat/chat-page').then((module) => ({ default: module.ChatPage })))

function RouteLoader() {
  return (
    <div className="flex min-h-[40vh] items-center justify-center">
      <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
    </div>
  )
}

function LegacyThreadRedirect() {
  const { id } = useParams<{ id: string }>()
  return <Navigate to={id ? `/app/forum/threads/${id}` : '/app/forum'} replace />
}

function App() {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated)

  return (
    <ErrorBoundary>
      <NavigationLoader />
      <Suspense fallback={<RouteLoader />}>
        <Routes>
      {/* Public routes */}
      <Route path="/" element={<HomePage />} />

      <Route
        path="/login"
        element={
          isAuthenticated ? <Navigate to="/" replace /> : <LoginPage />
        }
      />
      <Route
        path="/register"
        element={
          isAuthenticated ? <Navigate to="/" replace /> : <RegisterPage />
        }
      />

      {/* Protected routes - require authentication */}
      <Route
        path="/app"
        element={
          <ProtectedRoute isAuthenticated={isAuthenticated}>
            <AppLayout />
          </ProtectedRoute>
        }
      >
        <Route path="forum" element={<ThreadListPage />} />
        <Route path="forum/threads/:id" element={<ThreadDetailPage />} />
        <Route path="chat" element={<ChatPage />} />
        <Route path="chat/:id" element={<ChatPage />} />
        {/* Default redirect within app */}
        <Route index element={<Navigate to="forum" replace />} />
      </Route>

      {/* Legacy redirects */}
      <Route path="/forum" element={<Navigate to="/app/forum" replace />} />
      <Route path="/chat" element={<Navigate to="/app/chat" replace />} />
      <Route path="/threads/:id" element={<LegacyThreadRedirect />} />

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Suspense>
    </ErrorBoundary>
  )
}

export default App
