import { useEffect, useState } from 'react';
import { Outlet } from 'react-router-dom';
import type { ContextType } from '~/common';
import { Banner } from '~/components/Banners';
import { MobileNav, Nav } from '~/components/Nav';
import TermsAndConditionsModal from '~/components/ui/TermsAndConditionsModal';
import { useGetStartupConfig, useHealthCheck, useUserTermsQuery } from '~/data-provider';
import {
  useAgentsMap,
  useAssistantsMap,
  useAuthContext,
  useFileMap,
  useSearchEnabled,
} from '~/hooks';
import {
  AgentsMapContext,
  AssistantsMapContext,
  FileMapContext,
  ModelDescriptionsProvider,
  SetConvoProvider,
} from '~/Providers';

export default function Root() {
  const [showTerms, setShowTerms] = useState(false);
  const [bannerHeight, setBannerHeight] = useState(0);
  const [navVisible, setNavVisible] = useState(() => {
    const savedNavVisible = localStorage.getItem('navVisible');
    return savedNavVisible !== null ? JSON.parse(savedNavVisible) : true;
  });

  const { isAuthenticated, logout } = useAuthContext();

  // Global health check - runs once per authenticated session
  useHealthCheck(isAuthenticated);

  const assistantsMap = useAssistantsMap({ isAuthenticated });
  const agentsMap = useAgentsMap({ isAuthenticated });
  const fileMap = useFileMap({ isAuthenticated });

  const { data: config } = useGetStartupConfig();
  const { data: termsData } = useUserTermsQuery({
    enabled: isAuthenticated && config?.interface?.termsOfService?.modalAcceptance === true,
  });

  useSearchEnabled(isAuthenticated);

  useEffect(() => {
    if (termsData) {
      setShowTerms(!termsData.termsAccepted);
    }
  }, [termsData]);

  const handleAcceptTerms = () => {
    setShowTerms(false);
  };

  const handleDeclineTerms = () => {
    setShowTerms(false);
    logout('/login?redirect=false');
  };

  if (!isAuthenticated) {
    return null;
  }

  return (
    <SetConvoProvider>
      <ModelDescriptionsProvider>
        <FileMapContext.Provider value={fileMap}>
          <AssistantsMapContext.Provider value={assistantsMap}>
            <AgentsMapContext.Provider value={agentsMap}>
              <Banner onHeightChange={setBannerHeight} />
              <div className="flex" style={{ height: `calc(100dvh - ${bannerHeight}px)` }}>
                <div className="flex overflow-hidden relative z-0 w-full h-full">
                  <Nav navVisible={navVisible} setNavVisible={setNavVisible} />
                  <div className="flex overflow-hidden relative flex-col flex-1 max-w-full h-full">
                    <MobileNav setNavVisible={setNavVisible} />
                    <Outlet context={{ navVisible, setNavVisible } satisfies ContextType} />
                  </div>
                </div>
              </div>
            </AgentsMapContext.Provider>
            {config?.interface?.termsOfService?.modalAcceptance === true && (
              <TermsAndConditionsModal
                open={showTerms}
                onOpenChange={setShowTerms}
                onAccept={handleAcceptTerms}
                onDecline={handleDeclineTerms}
                title={config.interface.termsOfService.modalTitle}
                modalContent={config.interface.termsOfService.modalContent}
              />
            )}
          </AssistantsMapContext.Provider>
        </FileMapContext.Provider>
      </ModelDescriptionsProvider>
    </SetConvoProvider>
  );
}
