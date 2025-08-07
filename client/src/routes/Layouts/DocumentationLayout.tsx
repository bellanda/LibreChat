import { Outlet } from 'react-router-dom';
import { ModelDescriptionsProvider } from '~/Providers/ModelDescriptionsContext';

export default function DocumentationLayouts() {
  return (
    <ModelDescriptionsProvider>
      <div>
        <Outlet />
      </div>
    </ModelDescriptionsProvider>
  );
}
