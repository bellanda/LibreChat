import { isAgentsEndpoint, isAssistantsEndpoint } from 'librechat-data-provider';
import {
  BrainIcon,
  CalculatorIcon,
  CheckCircleIcon,
  ClockIcon,
  CodeIcon,
  EarthIcon,
  ImageIcon,
  StarIcon,
  ZapIcon,
} from 'lucide-react';
import type { Endpoint } from '~/common';
import {
  HoverCard,
  HoverCardContent,
  HoverCardPortal,
  HoverCardTrigger,
  TooltipAnchor,
} from '~/components/ui';
import { useModelDescriptions } from '~/hooks/useModelDescriptions';
import { CustomMenuItem as MenuItem } from '../CustomMenu';
import { useModelSelectorContext } from '../ModelSelectorContext';

interface EndpointModelItemProps {
  modelId: string | null;
  endpoint: Endpoint;
  isSelected: boolean;
}

export function EndpointModelItem({ modelId, endpoint, isSelected }: EndpointModelItemProps) {
  const { handleSelectModel } = useModelSelectorContext();
  const { getModelDescription } = useModelDescriptions();

  let isGlobal = false;
  let modelName = modelId;
  const avatarUrl = endpoint?.modelIcons?.[modelId ?? ''] || null;
  const modelDescription = getModelDescription(modelId);

  // Use custom names if available
  if (endpoint && modelId && isAgentsEndpoint(endpoint.value) && endpoint.agentNames?.[modelId]) {
    modelName = endpoint.agentNames[modelId];

    const modelInfo = endpoint?.models?.find((m) => m.name === modelId);
    isGlobal = modelInfo?.isGlobal ?? false;
  } else if (
    endpoint &&
    modelId &&
    isAssistantsEndpoint(endpoint.value) &&
    endpoint.assistantNames?.[modelId]
  ) {
    modelName = endpoint.assistantNames[modelId];
  }

  const getSpeedIcon = (speed: string) => {
    switch (speed) {
      case 'very-fast':
        return <ZapIcon className="size-3 fill-current text-emerald-500" />;
      case 'fast':
        return <ZapIcon className="size-3 text-green-500" />;
      case 'medium':
        return <ClockIcon className="size-3 text-yellow-500" />;
      case 'slow':
        return <ClockIcon className="size-3 text-red-500" />;
      default:
        return null;
    }
  };

  const getIntelligenceIcon = (intelligence: string) => {
    switch (intelligence) {
      case 'very-high':
        return <StarIcon className="size-3 fill-current text-purple-500" />;
      case 'high':
        return <StarIcon className="size-3 text-blue-500" />;
      case 'medium':
        return <StarIcon className="size-3 text-gray-500" />;
      default:
        return null;
    }
  };

  return (
    <MenuItem
      key={modelId}
      onClick={() => handleSelectModel(endpoint, modelId ?? '')}
      className="flex h-[40px] w-full cursor-pointer items-center justify-start rounded-lg px-3 py-2 text-sm"
    >
      {modelDescription ? (
        <HoverCard openDelay={100}>
          <HoverCardTrigger asChild>
            <div className="flex w-full items-center justify-between">
              <div className="flex items-center gap-2">
                {avatarUrl ? (
                  <div className="flex h-5 w-5 items-center justify-center overflow-hidden rounded-full">
                    <img
                      src={avatarUrl}
                      alt={modelName ?? ''}
                      className="h-full w-full object-cover"
                    />
                  </div>
                ) : (isAgentsEndpoint(endpoint.value) || isAssistantsEndpoint(endpoint.value)) &&
                  endpoint.icon ? (
                  <div className="flex h-5 w-5 items-center justify-center overflow-hidden rounded-full">
                    {endpoint.icon}
                  </div>
                ) : null}
                <div className="flex flex-col">
                  <span>{modelDescription.name}</span>
                  <span className="text-xs text-text-secondary">
                    {modelDescription.shortUseCase}
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {isGlobal && <EarthIcon className="size-4 text-green-400" />}
                {isSelected && (
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    className="block"
                  >
                    <path
                      fillRule="evenodd"
                      clipRule="evenodd"
                      d="M2 12C2 6.47715 6.47715 2 12 2C17.5228 2 22 6.47715 22 12C22 17.5228 17.5228 22 12 22C6.47715 22 2 17.5228 2 12ZM16.0755 7.93219C16.5272 8.25003 16.6356 8.87383 16.3178 9.32549L11.5678 16.0755C11.3931 16.3237 11.1152 16.4792 10.8123 16.4981C10.5093 16.517 10.2142 16.3973 10.0101 16.1727L7.51006 13.4227C7.13855 13.014 7.16867 12.3816 7.57733 12.0101C7.98598 11.6386 8.61843 11.6687 8.98994 12.0773L10.6504 13.9039L14.6822 8.17451C15 7.72284 15.6238 7.61436 16.0755 7.93219Z"
                      fill="currentColor"
                    />
                  </svg>
                )}
              </div>
            </div>
          </HoverCardTrigger>
          <HoverCardPortal>
            <HoverCardContent
              side="right"
              align="start"
              sideOffset={20}
              alignOffset={-10}
              className="z-49 w-80 p-3"
            >
              <img
                src={
                  modelDescription.image ||
                  'https://sm.ign.com/ign_br/screenshot/default/image-2025-01-28t120749844_jm1s.jpg'
                }
                alt={modelName ?? ''}
                className="mb-3 h-32 w-full rounded-lg object-cover"
              />
              <div className="space-y-3 p-1">
                <div>
                  <h4 className="font-semibold text-text-primary">{modelDescription.title}</h4>
                  <p className="mt-1 text-sm text-text-secondary">{modelDescription.description}</p>
                </div>

                {/* Características */}
                {modelDescription.characteristics && (
                  <div>
                    <h5 className="mb-2 text-sm font-medium text-text-primary">Características</h5>
                    <div className="flex flex-wrap gap-2">
                      {modelDescription.characteristics.reasoning && (
                        <TooltipAnchor description="Capacidade avançada de raciocínio lógico e resolução de problemas complexos">
                          <div className="flex cursor-help items-center gap-1 rounded-full bg-blue-100 px-2 py-1 dark:bg-blue-900/30">
                            <BrainIcon className="size-3 text-blue-600" />
                            <span className="text-xs text-blue-700 dark:text-blue-300">
                              Reasoning
                            </span>
                          </div>
                        </TooltipAnchor>
                      )}
                      {modelDescription.characteristics.speed && (
                        <TooltipAnchor
                          description={
                            modelDescription.characteristics.speed === 'very-fast'
                              ? 'Velocidade excepcional - ideal para aplicações móveis e edge computing'
                              : modelDescription.characteristics.speed === 'fast'
                                ? 'Respostas rápidas e eficientes'
                                : modelDescription.characteristics.speed === 'medium'
                                  ? 'Velocidade equilibrada entre rapidez e qualidade'
                                  : 'Processamento mais lento, mas com maior precisão'
                          }
                        >
                          <div className="flex cursor-help items-center gap-1 rounded-full bg-gray-100 px-2 py-1 dark:bg-gray-800">
                            {getSpeedIcon(modelDescription.characteristics.speed)}
                            <span className="text-xs capitalize text-gray-700 dark:text-gray-300">
                              {modelDescription.characteristics.speed.replace('-', ' ')}
                            </span>
                          </div>
                        </TooltipAnchor>
                      )}
                      {modelDescription.characteristics.intelligence && (
                        <TooltipAnchor
                          description={
                            modelDescription.characteristics.intelligence === 'very-high'
                              ? 'Inteligência excepcional para tarefas mais complexas'
                              : modelDescription.characteristics.intelligence === 'high'
                                ? 'Alta capacidade intelectual e compreensão avançada'
                                : 'Inteligência sólida para tarefas do dia a dia'
                          }
                        >
                          <div className="flex cursor-help items-center gap-1 rounded-full bg-purple-100 px-2 py-1 dark:bg-purple-900/30">
                            {getIntelligenceIcon(modelDescription.characteristics.intelligence)}
                            <span className="text-xs capitalize text-purple-700 dark:text-purple-300">
                              {modelDescription.characteristics.intelligence.replace('-', ' ')}
                            </span>
                          </div>
                        </TooltipAnchor>
                      )}
                      {modelDescription.characteristics.coding && (
                        <TooltipAnchor description="Especializado em programação, debug e desenvolvimento de software">
                          <div className="flex cursor-help items-center gap-1 rounded-full bg-green-100 px-2 py-1 dark:bg-green-900/30">
                            <CodeIcon className="size-3 text-green-600" />
                            <span className="text-xs text-green-700 dark:text-green-300">
                              Coding
                            </span>
                          </div>
                        </TooltipAnchor>
                      )}
                      {modelDescription.characteristics.math && (
                        <TooltipAnchor description="Excelente em cálculos matemáticos e resolução de problemas numéricos">
                          <div className="flex cursor-help items-center gap-1 rounded-full bg-orange-100 px-2 py-1 dark:bg-orange-900/30">
                            <CalculatorIcon className="size-3 text-orange-600" />
                            <span className="text-xs text-orange-700 dark:text-orange-300">
                              Math
                            </span>
                          </div>
                        </TooltipAnchor>
                      )}
                      {modelDescription.characteristics.multimodal && (
                        <TooltipAnchor description="Capaz de processar texto, imagens e outros tipos de mídia">
                          <div className="flex cursor-help items-center gap-1 rounded-full bg-pink-100 px-2 py-1 dark:bg-pink-900/30">
                            <ImageIcon className="size-3 text-pink-600" />
                            <span className="text-xs text-pink-700 dark:text-pink-300">
                              Multimodal
                            </span>
                          </div>
                        </TooltipAnchor>
                      )}
                    </div>
                  </div>
                )}

                {/* Casos de Uso */}
                {modelDescription.useCases && modelDescription.useCases.length > 0 && (
                  <div>
                    <h5 className="mb-2 text-sm font-medium text-text-primary">Casos de Uso</h5>
                    <ul className="space-y-1">
                      {modelDescription.useCases.map((useCase: string, index: number) => (
                        <li
                          key={index}
                          className="flex items-start gap-2 text-xs text-text-secondary"
                        >
                          <CheckCircleIcon className="mt-0.5 size-3 flex-shrink-0 text-green-500" />
                          <span>{useCase}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </HoverCardContent>
          </HoverCardPortal>
        </HoverCard>
      ) : (
        <div className="flex w-full items-center justify-between">
          <div className="flex items-center gap-2">
            {avatarUrl ? (
              <div className="flex h-5 w-5 items-center justify-center overflow-hidden rounded-full">
                <img src={avatarUrl} alt={modelName ?? ''} className="h-full w-full object-cover" />
              </div>
            ) : (isAgentsEndpoint(endpoint.value) || isAssistantsEndpoint(endpoint.value)) &&
              endpoint.icon ? (
              <div className="flex h-5 w-5 items-center justify-center overflow-hidden rounded-full">
                {endpoint.icon}
              </div>
            ) : null}
            <span>{modelName}</span>
          </div>
          <div className="flex items-center gap-2">
            {isGlobal && <EarthIcon className="size-4 text-green-400" />}
            {isSelected && (
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="block"
              >
                <path
                  fillRule="evenodd"
                  clipRule="evenodd"
                  d="M2 12C2 6.47715 6.47715 2 12 2C17.5228 2 22 6.47715 22 12C22 17.5228 17.5228 22 12 22C6.47715 22 2 17.5228 2 12ZM16.0755 7.93219C16.5272 8.25003 16.6356 8.87383 16.3178 9.32549L11.5678 16.0755C11.3931 16.3237 11.1152 16.4792 10.8123 16.4981C10.5093 16.517 10.2142 16.3973 10.0101 16.1727L7.51006 13.4227C7.13855 13.014 7.16867 12.3816 7.57733 12.0101C7.98598 11.6386 8.61843 11.6687 8.98994 12.0773L10.6504 13.9039L14.6822 8.17451C15 7.72284 15.6238 7.61436 16.0755 7.93219Z"
                  fill="currentColor"
                />
              </svg>
            )}
          </div>
        </div>
      )}
    </MenuItem>
  );
}

export function renderEndpointModels(
  endpoint: Endpoint | null,
  models: Array<{ name: string; isGlobal?: boolean }>,
  selectedModel: string | null,
  filteredModels?: string[],
) {
  const modelsToRender = filteredModels || models.map((model) => model.name);

  return modelsToRender.map(
    (modelId) =>
      endpoint && (
        <EndpointModelItem
          key={modelId}
          modelId={modelId}
          endpoint={endpoint}
          isSelected={selectedModel === modelId}
        />
      ),
  );
}
