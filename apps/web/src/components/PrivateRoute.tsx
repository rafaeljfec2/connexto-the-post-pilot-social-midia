import { Navigate, useLocation } from 'react-router-dom'
import { useAuthContext } from '@/contexts/AuthContext'

interface PrivateRouteProps {
  children: React.ReactNode
}

export function PrivateRoute({ children }: Readonly<PrivateRouteProps>) {
  const { isAuthenticated, isLoadingUser } = useAuthContext()
  const location = useLocation()
  const token = window.localStorage.getItem('token')

  // Log estratégico para depuração
  console.log(
    '[PrivateRoute] isAuthenticated:',
    isAuthenticated,
    'isLoadingUser:',
    isLoadingUser,
    'token:',
    token
  )

  if (isLoadingUser || (token && !isAuthenticated)) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    )
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  return <>{children}</>
}
