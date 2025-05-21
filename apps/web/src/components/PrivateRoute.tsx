import { Navigate, useLocation } from 'react-router-dom'
import { useAuthContext } from '@/contexts/AuthContext'
import { authUtils } from '@/utils/auth'

interface PrivateRouteProps {
  children: React.ReactNode
}

export function PrivateRoute({ children }: Readonly<PrivateRouteProps>) {
  const { isAuthenticated, isLoadingUser } = useAuthContext()
  const location = useLocation()
  const token = authUtils.getToken()

  // Se está carregando ou tem token mas ainda não autenticou, mostra loading
  if (isLoadingUser || (token && !isAuthenticated)) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    )
  }

  // Se não está autenticado, redireciona para login
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  // Se está autenticado, renderiza o conteúdo protegido
  return <>{children}</>
}
