import { createBrowserRouter } from 'react-router-dom'
import { ErrorBoundary } from '@/components/error/ErrorBoundary'
import { ErrorPage } from '@/components/error/ErrorPage'
import { Layout } from '@/components/layout'
import { PendingPosts } from '@/pages/PendingPosts'
import { History } from '@/pages/History'
import { Settings } from '@/pages/Settings'
import { Login } from '@/pages/Login'
import { LandingPage } from '@/pages/LandingPage'
import { Profile } from '@/pages/Profile'
import { Subscription } from '@/pages/Subscription'
import { PrivateRoute } from '@/components/PrivateRoute'
import { Dashboard } from '@/pages/Dashboard'
import { RootLayout } from '@/components/RootLayout'
import { AuthProvider } from '@/contexts/AuthContext'
import { Suggestions } from '@/pages/Suggestions'

export const router = createBrowserRouter([
  {
    element: (
      <AuthProvider>
        <RootLayout />
      </AuthProvider>
    ),
    children: [
      {
        path: '/',
        element: <LandingPage />,
      },
      {
        path: '/login',
        element: <Login />,
      },
      {
        path: '/app',
        element: (
          <ErrorBoundary>
            <PrivateRoute>
              <Layout />
            </PrivateRoute>
          </ErrorBoundary>
        ),
        children: [
          {
            index: true,
            element: <Dashboard />,
          },
          {
            path: 'pending',
            element: <PendingPosts />,
          },
          {
            path: 'suggestions',
            element: <Suggestions />,
          },
          {
            path: 'history',
            element: <History />,
          },
          {
            path: 'settings',
            element: <Settings />,
          },
          {
            path: 'profile',
            element: <Profile />,
          },
          {
            path: 'subscription',
            element: <Subscription />,
          },
        ],
      },
      {
        path: '*',
        element: <ErrorPage code={404} />,
      },
    ],
  },
])
