import { SystemRoles } from 'librechat-data-provider';
import { Outlet } from 'react-router-dom';
import { useAuthContext, useLocalize } from '~/hooks';

export default function ReportLayout() {
  const { user } = useAuthContext();
  const localize = useLocalize();

  // Se não for admin, mostra aviso e redireciona
  if (user?.role !== SystemRoles.ADMIN) {
    console.log('Não é admin');

    return (
      <div className="flex h-screen w-full items-center justify-center bg-surface-primary p-4">
        <div className="max-w-md rounded-lg border border-red-200 bg-red-50 p-6 text-center dark:border-red-800 dark:bg-red-900/20">
          <div className="mb-4 text-4xl">🚫</div>
          <h2 className="mb-2 text-lg font-semibold text-red-800 dark:text-red-200">
            Acesso Negado
          </h2>
          <p className="mb-4 text-sm text-red-600 dark:text-red-300">
            Esta área é restrita apenas para administradores.
          </p>
          <button
            onClick={() => window.history.back()}
            className="rounded bg-red-600 px-4 py-2 text-white transition-colors hover:bg-red-700"
          >
            Voltar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div>
      <Outlet />
    </div>
  );
}
