import * as Select from '@ariakit/react/select';
import { Avatar, DropdownMenuSeparator, GearIcon } from '@librechat/client';
import { BarChart2, BookOpen, FileText, LogOut, Shield } from 'lucide-react';
import { memo, useState } from 'react';
import { useRecoilState } from 'recoil';
import FilesView from '~/components/Chat/Input/Files/FilesView';
import { useGetStartupConfig, useGetUserBalance } from '~/data-provider';
import { useLocalize } from '~/hooks';
import { useAuthContext } from '~/hooks/AuthContext';
import store from '~/store';
import Settings from './Settings';

function AccountSettings() {
  const localize = useLocalize();
  const { user, isAuthenticated, logout } = useAuthContext();
  const { data: startupConfig } = useGetStartupConfig();
  const balanceQuery = useGetUserBalance({
    enabled: !!isAuthenticated && startupConfig?.balance?.enabled,
  });
  const [showSettings, setShowSettings] = useState(false);
  const [showFiles, setShowFiles] = useRecoilState(store.showFiles);

  return (
    <Select.SelectProvider>
      <Select.Select
        aria-label={localize('com_nav_account_settings')}
        data-testid="nav-user"
        className="flex gap-2 items-center p-2 w-full h-auto text-sm rounded-xl transition-all duration-200 ease-in-out mt-text-sm hover:bg-surface-hover"
      >
        <div className="-ml-0.9 -mt-0.8 h-8 w-8 flex-shrink-0">
          <div className="flex relative">
            <Avatar user={user} size={32} />
          </div>
        </div>
        <div
          className="overflow-hidden mt-2 text-left whitespace-nowrap grow text-ellipsis text-text-primary"
          style={{ marginTop: '0', marginLeft: '0' }}
        >
          {user?.name ?? user?.username ?? localize('com_nav_user')}
        </div>
      </Select.Select>
      <Select.SelectPopover
        className="popover-ui w-[235px]"
        style={{
          transformOrigin: 'bottom',
          marginRight: '0px',
          translate: '0px',
        }}
      >
        <div className="py-2 mr-2 ml-3 text-sm text-token-text-secondary" role="note">
          {user?.name}
        </div>
        {/* Break line if text is too long */}
        <div
          className="py-2 mr-2 ml-3 text-sm break-all text-token-text-secondary text-wrap"
          role="note"
        >
          {user?.email ?? localize('com_nav_user')}
          {/* Break line if text is too long */}
        </div>
        <DropdownMenuSeparator />
        {startupConfig?.balance?.enabled === true && balanceQuery.data != null && (
          <>
            <div className="py-2 mr-2 ml-3 text-sm text-token-text-secondary" role="note">
              {localize('com_nav_balance')}:{' '}
              {new Intl.NumberFormat().format(Math.round(balanceQuery.data.tokenCredits))}
            </div>
            <DropdownMenuSeparator />
          </>
        )}
        <Select.SelectItem
          value=""
          onClick={() => window.open('/reports', '_blank')}
          className="text-sm select-item"
        >
          <BarChart2 aria-hidden="true" size={18} />
          Dashboard
        </Select.SelectItem>
        <Select.SelectItem
          value=""
          onClick={() => window.open('/documentation', '_blank')}
          className="text-sm select-item"
        >
          <BookOpen aria-hidden="true" size={18} />
          Documentação
        </Select.SelectItem>
        <Select.SelectItem
          value=""
          onClick={() => setShowFiles(true)}
          className="text-sm select-item"
        >
          <FileText className="icon-md" aria-hidden="true" />
          {localize('com_nav_my_files')}
        </Select.SelectItem>

        <Select.SelectItem
          value=""
          onClick={() => window.open('/documentation/politica-de-uso-de-ia', '_blank')}
          className="text-sm select-item"
        >
          <Shield aria-hidden="true" size={18} />
          Política de Uso de IA
        </Select.SelectItem>

        {/* {startupConfig?.helpAndFaqURL !== '/' && (
          <Select.SelectItem
            value=""
            onClick={() => window.open(startupConfig?.helpAndFaqURL, '_blank')}
            className="text-sm select-item"
          >
            <Shield aria-hidden="true" size={18} />
            {localize('com_nav_help_faq')}
          </Select.SelectItem>
        )} */}
        <Select.SelectItem
          value=""
          onClick={() => setShowSettings(true)}
          className="text-sm select-item"
        >
          <GearIcon className="icon-md" aria-hidden="true" />
          {localize('com_nav_settings')}
        </Select.SelectItem>
        <DropdownMenuSeparator />
        <Select.SelectItem
          aria-selected={true}
          onClick={() => logout()}
          value="logout"
          className="text-sm select-item"
        >
          <LogOut className="icon-md" />
          {localize('com_nav_log_out')}
        </Select.SelectItem>
      </Select.SelectPopover>
      {showFiles && <FilesView open={showFiles} onOpenChange={setShowFiles} />}
      {showSettings && <Settings open={showSettings} onOpenChange={setShowSettings} />}
    </Select.SelectProvider>
  );
}

export default memo(AccountSettings);
