import * as Select from '@ariakit/react/select';
import { Avatar, DropdownMenuSeparator, GearIcon } from '@librechat/client';
import { BarChart2, BookOpen, FileText, LogOut, Shield } from 'lucide-react';
import { memo, useRef, useState } from 'react';
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
  const accountSettingsButtonRef = useRef<HTMLButtonElement>(null);

  return (
    <Select.SelectProvider>
      <Select.Select
        ref={accountSettingsButtonRef}
        aria-label={localize('com_nav_account_settings')}
        data-testid="nav-user"
        className="mt-text-sm flex h-auto w-full items-center gap-2 rounded-xl p-2 text-sm transition-all duration-200 ease-in-out hover:bg-surface-active-alt aria-[expanded=true]:bg-surface-active-alt"
      >
        <div className="-ml-0.9 -mt-0.8 h-8 w-8 flex-shrink-0">
          <div className="relative flex">
            <Avatar user={user} size={32} />
          </div>
        </div>
        <div
          className="mt-2 grow overflow-hidden text-ellipsis whitespace-nowrap text-left text-text-primary"
          style={{ marginTop: '0', marginLeft: '0' }}
        >
          {user?.name ?? user?.username ?? localize('com_nav_user')}
        </div>
      </Select.Select>
      <Select.SelectPopover
        className="popover-ui z-[125] w-[305px] rounded-lg md:w-[244px]"
        style={{
          transformOrigin: 'bottom',
          translate: '0 -4px',
        }}
      >
        <div className="text-token-text-secondary ml-3 mr-2 py-2 text-sm" role="note">
          {user?.email ?? localize('com_nav_user')}
        </div>
        <DropdownMenuSeparator />
        {startupConfig?.balance?.enabled === true && balanceQuery.data != null && (
          <>
            <div className="text-token-text-secondary ml-3 mr-2 py-2 text-sm" role="note">
              {localize('com_nav_balance')}:{' '}
              {new Intl.NumberFormat().format(Math.round(balanceQuery.data.tokenCredits))}
            </div>
            <DropdownMenuSeparator />
          </>
        )}
        <Select.SelectItem
          value=""
          onClick={() => window.open('/reports', '_blank')}
          className="select-item text-sm"
        >
          <BarChart2 aria-hidden="true" size={18} />
          Dashboard
        </Select.SelectItem>
        <Select.SelectItem
          value=""
          onClick={() => window.open('/documentation', '_blank')}
          className="select-item text-sm"
        >
          <BookOpen aria-hidden="true" size={18} />
          Documentação
        </Select.SelectItem>
        <Select.SelectItem
          value=""
          onClick={() => setShowFiles(true)}
          className="select-item text-sm"
        >
          <FileText className="icon-md" aria-hidden="true" />
          {localize('com_nav_my_files')}
        </Select.SelectItem>

        <Select.SelectItem
          value=""
          onClick={() => window.open('/documentation/politica-de-uso-de-ia', '_blank')}
          className="select-item text-sm"
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
          className="select-item text-sm"
        >
          <GearIcon className="icon-md" aria-hidden="true" />
          {localize('com_nav_settings')}
        </Select.SelectItem>
        <DropdownMenuSeparator />
        <Select.SelectItem
          aria-selected={true}
          onClick={() => logout()}
          value="logout"
          className="select-item text-sm"
        >
          <LogOut className="icon-md" aria-hidden="true" />
          {localize('com_nav_log_out')}
        </Select.SelectItem>
      </Select.SelectPopover>
      {showFiles && <FilesView open={showFiles} onOpenChange={setShowFiles} />}
      {showSettings && <Settings open={showSettings} onOpenChange={setShowSettings} />}
    </Select.SelectProvider>
  );
}

export default memo(AccountSettings);
