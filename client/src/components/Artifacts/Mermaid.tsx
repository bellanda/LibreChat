// Using HTML button instead of Button component
import { RefreshCw, ZoomIn, ZoomOut } from 'lucide-react';
import mermaid from 'mermaid';
import React, { useEffect, useRef, useState } from 'react';
import { ReactZoomPanPinchRef, TransformComponent, TransformWrapper } from 'react-zoom-pan-pinch';

interface MermaidDiagramProps {
  content: string;
}

/** Note: this is just for testing purposes, don't actually use this component */
const MermaidDiagram: React.FC<MermaidDiagramProps> = ({ content }) => {
  const mermaidRef = useRef<HTMLDivElement>(null);
  const transformRef = useRef<ReactZoomPanPinchRef>(null);
  const [isRendered, setIsRendered] = useState(false);

  useEffect(() => {
    mermaid.initialize({
      startOnLoad: false,
      theme: 'default', // 🎨 Tema padrão do site oficial
      securityLevel: 'loose', // 🔓 Configuração do site oficial
      logLevel: 'fatal',
      deterministicIds: true,
      deterministicIDSeed: 'mermaid-diagram',
      // 🔧 Adicione estas configurações para corrigir o layout:
      layout: 'dagre', // 📐 Layout engine padrão
      // ✨ Removendo themeVariables personalizadas para usar as padrões
      themeVariables: {
        // 🎨 Cores oficiais do Mermaid
        primaryColor: '#fff2cc',
        primaryTextColor: '#333',
        primaryBorderColor: '#d6b656',
        lineColor: '#333333',
        secondaryColor: '#eff2f5',
        tertiaryColor: '#ffffff',
        background: '#ffffff',
        mainBkg: '#fff2cc',
        secondaryBkg: '#eff2f5',
        tertiaryBkg: '#ffffff',
        // 🔤 Texto
        textColor: '#333333',
        fontSize: '16px',
        fontFamily: '"trebuchet ms", verdana, arial, sans-serif',
        // 🔲 Nós
        nodeBkg: '#fff2cc',
        nodeBorder: '#d6b656',
        // 🏷️ Labels
        labelTextColor: '#333333',
        labelBoxBkgColor: '#fff2cc',
        labelBoxBorderColor: '#d6b656',
        // 📊 Flowchart específico
        edgeLabelBackground: '#ffffff',
        // 🎯 Classes
        classText: '#131300',
        // 🔄 State diagrams
        fillType0: '#fff2cc',
        fillType1: '#eff2f5',
        fillType2: '#d5e8d4',
        fillType3: '#f8cecc',
        fillType4: '#fff2cc',
        fillType5: '#f5f5f5',
        fillType6: '#fff2cc',
        fillType7: '#eff2f5',
        // 📈 Gantt
        gridColor: '#e0e0e0',
        section0: '#fff2cc',
        section1: '#eff2f5',
        section2: '#d5e8d4',
        section3: '#f8cecc',
        // 🔗 Git
        git0: '#fff2cc',
        git1: '#eff2f5',
        git2: '#d5e8d4',
        git3: '#f8cecc',
        git4: '#fff2cc',
        git5: '#eff2f5',
        git6: '#d5e8d4',
        git7: '#f8cecc',
        gitBranchLabel0: '#333333',
        gitBranchLabel1: '#333333',
        gitBranchLabel2: '#333333',
        gitBranchLabel3: '#333333',
        gitBranchLabel4: '#333333',
        gitBranchLabel5: '#333333',
        gitBranchLabel6: '#333333',
        gitBranchLabel7: '#333333',
      },
      // 🌊 Configurações específicas do Flowchart
      flowchart: {
        diagramPadding: 8,
        htmlLabels: false,
        curve: 'basis',
        useMaxWidth: true,
        rankSpacing: 50,
        nodeSpacing: 50,
        padding: 15,
        wrappingWidth: 200,
        // 🎯 Configurações cruciais para orientação:
        rankdir: 'TB', // Top to Bottom (padrão oficial)
        ranksep: 50, // Separação entre ranks
        nodesep: 50, // Separação entre nós
      },
      // 🔧 Configuração específica do Dagre (se necessário):
      dagre: {
        rankdir: 'TB', // Top to Bottom
        ranksep: 50,
        nodesep: 50,
        edgesep: 10,
      },
      // 🔄 Configurações de Sequence Diagrams
      sequence: {
        diagramMarginX: 50,
        diagramMarginY: 10,
        actorMargin: 50,
        width: 150,
        height: 65,
        boxMargin: 10,
        boxTextMargin: 5,
        noteMargin: 10,
        messageMargin: 35,
        messageAlign: 'center',
        mirrorActors: true,
        bottomMarginAdj: 1,
        useMaxWidth: true,
      },
      // 🍰 Configurações de Pie Charts
      pie: {
        textPosition: 0.75,
      },
      // 📊 Configurações de Gantt
      gantt: {
        titleTopMargin: 25,
        barHeight: 20,
        fontSizeFactor: 1,
        fontSize: 11,
        gridLineStartPadding: 35,
        leftPadding: 75,
        topPadding: 50,
        rightPadding: 75,
        bottomPadding: 50,
      },
      // 🗂️ Configurações de Class Diagrams
      class: {
        arrowMarkerAbsolute: false,
      },
      // 🌐 Configurações de State Diagrams
      state: {
        dividerMargin: 10,
        sizeUnit: 5,
        fontSize: 24,
      },
      // ⚙️ Configurações de Journey
      journey: {
        diagramMarginX: 50,
        diagramMarginY: 10,
        leftMargin: 150,
        width: 150,
        height: 50,
        boxMargin: 10,
        boxTextMargin: 5,
        noteMargin: 10,
        messageMargin: 35,
        messageAlign: 'center',
        bottomMarginAdj: 1,
        useMaxWidth: true,
        rightAngles: false,
      },
    });

    const renderDiagram = async () => {
      if (mermaidRef.current) {
        try {
          const { svg } = await mermaid.render('mermaid-diagram', content);
          mermaidRef.current.innerHTML = svg;

          const svgElement = mermaidRef.current.querySelector('svg');
          if (svgElement) {
            // 🎨 Configurações básicas do SVG
            svgElement.style.width = '100%';
            svgElement.style.height = '100%';
            svgElement.style.maxWidth = '100%';

            // 🔤 Font padrão do site oficial
            svgElement.style.fontFamily = '"trebuchet ms", verdana, arial, sans-serif';

            // 🔧 Removendo forçar cores - deixando o tema padrão funcionar
            // Comentando as personalizações para usar o tema oficial
            /*
            const backgroundElements = svgElement.querySelectorAll(
              'rect[fill*="#282C34"], rect[fill*="#333842"], rect[fill*="#212121"]',
            );
            backgroundElements.forEach((rect) => {
              rect.setAttribute('fill', '#ffffff');
            });

            const mainRect = svgElement.querySelector('rect:first-child');
            if (mainRect) {
              mainRect.setAttribute('fill', '#ffffff');
            }

            const pathElements = svgElement.querySelectorAll('path');
            pathElements.forEach((path) => {
              path.style.strokeWidth = '1.5px';
            });

            const rectElements = svgElement.querySelectorAll('rect');
            rectElements.forEach((rect) => {
              const parent = rect.parentElement;
              if (parent && parent.classList.contains('node')) {
                rect.style.stroke = '#d1d5db';
                rect.style.strokeWidth = '1px';
              } else {
                rect.style.stroke = 'none';
              }
            });
            */
          }
          setIsRendered(true);
        } catch (error) {
          console.error('Mermaid rendering error:', error);
          mermaidRef.current.innerHTML = 'Error rendering diagram';
        }
      }
    };

    renderDiagram();
  }, [content]);

  const centerAndFitDiagram = () => {
    if (transformRef.current && mermaidRef.current) {
      const { centerView, zoomToElement } = transformRef.current;
      zoomToElement(mermaidRef.current as HTMLElement);
      centerView(1, 0);
    }
  };

  useEffect(() => {
    if (isRendered) {
      centerAndFitDiagram();
    }
  }, [isRendered]);

  const handlePanning = () => {
    if (transformRef.current) {
      const { state, instance } = (transformRef.current as ReactZoomPanPinchRef | undefined) ?? {};
      if (!state || !instance) {
        return;
      }
      const { scale, positionX, positionY } = state;
      const { wrapperComponent, contentComponent } = instance;

      if (wrapperComponent && contentComponent) {
        const wrapperRect = wrapperComponent.getBoundingClientRect();
        const contentRect = contentComponent.getBoundingClientRect();
        const maxX = wrapperRect.width - contentRect.width * scale;
        const maxY = wrapperRect.height - contentRect.height * scale;

        let newX = positionX;
        let newY = positionY;

        if (newX > 0) {
          newX = 0;
        }
        if (newY > 0) {
          newY = 0;
        }
        if (newX < maxX) {
          newX = maxX;
        }
        if (newY < maxY) {
          newY = maxY;
        }

        if (newX !== positionX || newY !== positionY) {
          instance.setTransformState(scale, newX, newY);
        }
      }
    }
  };

  return (
    <div className="relative p-5 w-screen h-screen bg-white cursor-move">
      <TransformWrapper
        ref={transformRef}
        initialScale={1}
        minScale={0.1}
        maxScale={4}
        limitToBounds={false}
        centerOnInit={true}
        initialPositionY={0}
        wheel={{ step: 0.1 }}
        panning={{ velocityDisabled: true }}
        alignmentAnimation={{ disabled: true }}
        onPanning={handlePanning}
      >
        {({ zoomIn, zoomOut }) => (
          <>
            <TransformComponent
              wrapperStyle={{ width: '100%', height: '100%', overflow: 'hidden' }}
            >
              <div
                ref={mermaidRef}
                style={{ width: 'auto', height: 'auto', minWidth: '100%', minHeight: '100%' }}
              />
            </TransformComponent>
            <div className="flex absolute right-2 bottom-2 space-x-2">
              <button
                onClick={() => zoomIn(0.1)}
                className="flex justify-center items-center w-8 h-8 bg-white rounded border border-gray-300 hover:bg-gray-50"
              >
                <ZoomIn className="w-4 h-4" />
              </button>
              <button
                onClick={() => zoomOut(0.1)}
                className="flex justify-center items-center w-8 h-8 bg-white rounded border border-gray-300 hover:bg-gray-50"
              >
                <ZoomOut className="w-4 h-4" />
              </button>
              <button
                onClick={centerAndFitDiagram}
                className="flex justify-center items-center w-8 h-8 bg-white rounded border border-gray-300 hover:bg-gray-50"
              >
                <RefreshCw className="w-4 h-4" />
              </button>
            </div>
          </>
        )}
      </TransformWrapper>
    </div>
  );
};

export default MermaidDiagram;
