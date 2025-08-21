import { isDark, useMediaQuery, useTheme } from '@librechat/client';
import { getConfigDefaults, Permissions, PermissionTypes } from 'librechat-data-provider';
import { useMemo } from 'react';
import { useOutletContext } from 'react-router-dom';
import type { ContextType } from '~/common';
import { useGetStartupConfig } from '~/data-provider';
import { useHasAccess } from '~/hooks';
import AddMultiConvo from './AddMultiConvo';
import ExportAndShareMenu from './ExportAndShareMenu';
import { HeaderNewChat, OpenSidebar, PresetsMenu } from './Menus';
import BookmarkMenu from './Menus/BookmarkMenu';
import ModelSelector from './Menus/Endpoints/ModelSelector';
import { TemporaryChat } from './TemporaryChat';

const defaultInterface = getConfigDefaults().interface;

export default function Header() {
  const { data: startupConfig } = useGetStartupConfig();
  const { navVisible, setNavVisible } = useOutletContext<ContextType>();
  const { theme } = useTheme();
  const interfaceConfig = useMemo(
    () => startupConfig?.interface ?? defaultInterface,
    [startupConfig],
  );

  const hasAccessToBookmarks = useHasAccess({
    permissionType: PermissionTypes.BOOKMARKS,
    permission: Permissions.USE,
  });

  const hasAccessToMultiConvo = useHasAccess({
    permissionType: PermissionTypes.MULTI_CONVO,
    permission: Permissions.USE,
  });

  const isSmallScreen = useMediaQuery('(max-width: 768px)');
  const isThemeDark = isDark(theme);

  return (
    <div className="flex sticky top-0 z-10 justify-between items-center p-2 w-full h-14 font-semibold bg-white text-text-primary dark:bg-gray-800">
      <div className="flex overflow-x-auto gap-2 justify-between items-center w-full hide-scrollbar">
        <div className="flex gap-2 items-center mx-1">
          <div
            className={`flex items-center gap-2 ${
              !isSmallScreen ? 'transition-all duration-200 ease-in-out' : ''
            } ${
              !navVisible
                ? 'opacity-100 translate-x-0'
                : 'opacity-0 pointer-events-none translate-x-[-100px]'
            }`}
          >
            <OpenSidebar setNavVisible={setNavVisible} className="max-md:hidden" />
            <HeaderNewChat />
          </div>
          <div
            className={`flex items-center gap-2 ${
              !isSmallScreen ? 'transition-all duration-200 ease-in-out' : ''
            } ${!navVisible ? 'translate-x-0' : 'translate-x-[-100px]'}`}
          >
            <ModelSelector startupConfig={startupConfig} />
            {interfaceConfig.presets === true && interfaceConfig.modelSelect && <PresetsMenu />}
            {hasAccessToBookmarks === true && <BookmarkMenu />}
            {hasAccessToMultiConvo === true && <AddMultiConvo />}
            {isSmallScreen && (
              <>
                <ExportAndShareMenu
                  isSharedButtonEnabled={startupConfig?.sharedLinksEnabled ?? false}
                />
                <TemporaryChat />
              </>
            )}
            <img
              src={
                isThemeDark ? '/assets/hpe-ia-neural-dark-mode.png' : '/assets/hpe-ia-neural.png'
              }
              alt="logo"
              className="ml-[18vw] mt-6 h-[70px] rounded-[10px] bg-white"
            />
          </div>
        </div>
        {!isSmallScreen && (
          <div className="flex gap-2 items-center">
            <ExportAndShareMenu
              isSharedButtonEnabled={startupConfig?.sharedLinksEnabled ?? false}
            />
            <TemporaryChat />
          </div>
        )}
      </div>
      {/* Empty div for spacing */}
      <div />
    </div>
  );
}
