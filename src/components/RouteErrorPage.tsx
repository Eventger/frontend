import { isRouteErrorResponse, useNavigate, useRouteError } from 'react-router'

import { LoadErrorState } from '@/components/LoadErrorState'
import { PageTitle } from '@/components/layout/PageTitle'

export function RouteErrorPage({ notFound = false }: { notFound?: boolean }) {
  const error = useRouteError()
  const navigate = useNavigate()
  const isNotFound = notFound || (isRouteErrorResponse(error) && error.status === 404)

  return (
    <main className="flex min-h-svh items-center justify-center bg-[#f7f8fc] px-5 py-10">
      <div className="w-full max-w-[760px]">
        <PageTitle>{isNotFound ? 'Página no encontrada' : 'Algo salió mal'}</PageTitle>
        <div className="mt-6">
          <LoadErrorState
            title={isNotFound ? 'No encontramos esta página' : 'No pudimos mostrar esta página'}
            description={isNotFound
              ? 'El enlace puede haber cambiado o la dirección no existe. Vuelve al inicio para continuar.'
              : 'Ocurrió un problema inesperado. Recarga la página para intentarlo de nuevo.'}
            iconLabel={isNotFound ? 'Página no encontrada' : 'Error al mostrar la página'}
            actionLabel={isNotFound ? 'Ir al inicio' : 'Recargar página'}
            onRetry={() => {
              if (isNotFound) {
                void navigate('/', { replace: true })
              } else {
                window.location.reload()
              }
            }}
          />
        </div>
      </div>
    </main>
  )
}
