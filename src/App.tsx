import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import { PdfService, ExtractedPdfData } from './services/pdfService';
import { DocxExportService } from './services/docxExportService';
import { DocxImportService } from './services/docxImportService';
import { 
  ActiveTool, 
  TextElement, 
  Annotation, 
  PageMeta, 
  WatermarkConfig, 
  SecurityConfig, 
  HistoryState 
} from './types/pdf';
import { useHistory } from './hooks/useHistory';

import { HeaderBar } from './components/header/HeaderBar';
import { FormattingToolbar } from './components/toolbar/FormattingToolbar';
import { PageSidebar } from './components/sidebar/PageSidebar';
import { PdfViewerCanvas } from './components/editor/PdfViewerCanvas';
import { LandingPage } from './components/landing/LandingPage';
import { SignatureModal } from './components/modals/SignatureModal';
import { DocxConvertModal } from './components/modals/DocxConvertModal';
import { WatermarkModal } from './components/modals/WatermarkModal';
import { SecurityModal } from './components/modals/SecurityModal';
import { PageOrganizerModal } from './components/pageManager/PageOrganizerModal';

export const App: React.FC = () => {
  // Main state
  const [pdfBytes, setPdfBytes] = useState<ArrayBuffer | null>(null);
  const [documentName, setDocumentName] = useState<string>('Document.pdf');
  const [activePageIndex, setActivePageIndex] = useState<number>(0);
  const [zoom, setZoom] = useState<number>(1.0);
  const [activeTool, setActiveTool] = useState<ActiveTool>('select');
  const [selectedTextId, setSelectedTextId] = useState<string | null>(null);
  const [strokeColor, setStrokeColor] = useState<string>('#C85A32');
  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(true);
  const [isExporting, setIsExporting] = useState<boolean>(false);

  // Modals state
  const [isSignatureModalOpen, setIsSignatureModalOpen] = useState(false);
  const [isDocxModalOpen, setIsDocxModalOpen] = useState(false);
  const [isWatermarkModalOpen, setIsWatermarkModalOpen] = useState(false);
  const [isSecurityModalOpen, setIsSecurityModalOpen] = useState(false);
  const [isOrganizerModalOpen, setIsOrganizerModalOpen] = useState(false);

  // Watermark & Security config
  const [watermark, setWatermark] = useState<WatermarkConfig>({
    enabled: false,
    text: 'CONFIDENTIAL',
    opacity: 0.15,
    fontSize: 48,
    color: '#C85A32',
    rotation: -45,
  });

  const [security, setSecurity] = useState<SecurityConfig>({
    isPasswordProtected: false,
  });

  // History state for undo/redo
  const initialHistoryState: HistoryState = {
    textElements: [],
    annotations: [],
    pagesMeta: [],
  };

  const { currentState, pushState, undo, redo, canUndo, canRedo, resetHistory } = useHistory(initialHistoryState);

  const { textElements, annotations, pagesMeta } = currentState;

  // Keyboard Shortcuts (Ctrl+Z, Ctrl+Y, Delete)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'z') {
        e.preventDefault();
        if (canUndo) undo();
      } else if ((e.metaKey || e.ctrlKey) && e.key === 'y') {
        e.preventDefault();
        if (canRedo) redo();
      } else if (e.key === 'Delete' && selectedTextId) {
        handleDeleteSelected();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [canUndo, canRedo, undo, redo, selectedTextId]);

  // Load PDF file
  const handleLoadPdf = async (file: File | ArrayBuffer, name?: string) => {
    try {
      const extracted: ExtractedPdfData = await PdfService.loadPdf(file);
      setPdfBytes(extracted.pdfBytes);
      setDocumentName(name || (file instanceof File ? file.name : 'Document.pdf'));
      setActivePageIndex(0);

      const newState: HistoryState = {
        textElements: extracted.textElements,
        annotations: [],
        pagesMeta: extracted.pagesMeta,
      };
      resetHistory(newState);
    } catch (err) {
      console.error('Failed to load PDF:', err);
    }
  };

  // Load File (PDF or DOCX)
  const handleOpenFile = async (file: File) => {
    if (file.name.endsWith('.docx')) {
      const convertedBytes = await DocxImportService.convertDocxToPdf(file);
      const buffer = convertedBytes.buffer.slice(convertedBytes.byteOffset, convertedBytes.byteOffset + convertedBytes.byteLength) as ArrayBuffer;
      await handleLoadPdf(buffer, file.name.replace('.docx', '.pdf'));
    } else {
      await handleLoadPdf(file);
    }
  };

  // Select Page from Sidebar (scrolls to page in main viewport)
  const handleSelectPage = (pageIndex: number) => {
    setActivePageIndex(pageIndex);
    const element = document.getElementById(`pdf-page-container-${pageIndex}`);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  // Text Updates
  const handleUpdateText = (id: string, newText: string) => {
    const updated = textElements.map(t => {
      if (t.id === id) {
        return {
          ...t,
          text: newText,
          isModified: true,
        };
      }
      return t;
    });

    pushState({
      ...currentState,
      textElements: updated,
    });
  };

  const handleUpdateSelectedText = (updatedProps: Partial<TextElement>) => {
    if (!selectedTextId) return;

    const updated = textElements.map(t => {
      if (t.id === selectedTextId) {
        return {
          ...t,
          ...updatedProps,
          isModified: true,
        };
      }
      return t;
    });

    pushState({
      ...currentState,
      textElements: updated,
    });
  };

  const handleAddTextAtPosition = (xPercent: number, yPercent: number) => {
    const newText: TextElement = {
      id: `new-text-${Date.now()}`,
      pageIndex: activePageIndex,
      x: xPercent,
      y: yPercent,
      width: 25,
      height: 4,
      text: 'Click to edit text',
      fontSize: 14,
      fontFamily: '"Times New Roman", Times, serif',
      color: '#1C1917',
      fontWeight: 'normal',
      fontStyle: 'normal',
      textDecoration: 'none',
      textAlign: 'left',
      isNew: true,
      isModified: true,
    };

    pushState({
      ...currentState,
      textElements: [...textElements, newText],
    });

    setSelectedTextId(newText.id);
    setActiveTool('select');
  };

  // Delete Selected Element
  const handleDeleteSelected = () => {
    if (!selectedTextId) return;

    const updated = textElements.map(t => {
      if (t.id === selectedTextId) {
        return { ...t, isDeleted: true, isModified: true };
      }
      return t;
    });

    pushState({
      ...currentState,
      textElements: updated,
    });
    setSelectedTextId(null);
  };

  // Annotation Addition
  const handleAddAnnotation = (ann: Annotation) => {
    pushState({
      ...currentState,
      annotations: [...annotations, ann],
    });
  };

  // Signature Placement
  const handleSaveSignature = (dataUrl: string) => {
    const sigAnn: Annotation = {
      id: `sig-${Date.now()}`,
      pageIndex: activePageIndex,
      type: 'signature',
      x: 35,
      y: 70,
      width: 30,
      height: 12,
      strokeColor: '#000000',
      strokeWidth: 0,
      opacity: 1.0,
      imageSrc: dataUrl,
    };

    handleAddAnnotation(sigAnn);
  };

  // Image Insertion Trigger
  const handleInsertImageClick = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = (e: any) => {
      const file = e.target.files?.[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (event) => {
          if (event.target?.result) {
            const imgAnn: Annotation = {
              id: `img-${Date.now()}`,
              pageIndex: activePageIndex,
              type: 'image',
              x: 30,
              y: 40,
              width: 35,
              height: 25,
              strokeColor: '#000000',
              strokeWidth: 0,
              opacity: 1.0,
              imageSrc: event.target.result as string,
            };
            handleAddAnnotation(imgAnn);
          }
        };
        reader.readAsDataURL(file);
      }
    };
    input.click();
  };

  // Page Operations (Rotate, Duplicate, Delete)
  const handleRotatePage = (pageIndex: number, degreesDelta: number) => {
    const updatedMeta = pagesMeta.map((p, idx) => {
      if (idx === pageIndex) {
        const currentRot = p.rotation || 0;
        let nextRot = (currentRot + degreesDelta) % 360;
        if (nextRot < 0) nextRot += 360;
        return { ...p, rotation: nextRot };
      }
      return p;
    });

    pushState({
      ...currentState,
      pagesMeta: updatedMeta,
    });
  };

  const handleDeletePage = (pageIndex: number) => {
    if (pagesMeta.length <= 1) return;

    const updatedMeta = pagesMeta
      .filter((_, idx) => idx !== pageIndex)
      .map((p, idx) => ({ ...p, pageIndex: idx, pageNumber: idx + 1 }));

    pushState({
      ...currentState,
      pagesMeta: updatedMeta,
    });

    if (activePageIndex >= updatedMeta.length) {
      setActivePageIndex(updatedMeta.length - 1);
    }
  };

  const handleDuplicatePage = (pageIndex: number) => {
    const targetPage = pagesMeta[pageIndex];
    const newPageMeta: PageMeta = {
      ...targetPage,
      pageIndex: pageIndex + 1,
      pageNumber: pageIndex + 2,
    };

    const updatedMeta = [...pagesMeta];
    updatedMeta.splice(pageIndex + 1, 0, newPageMeta);

    const reindexedMeta = updatedMeta.map((p, idx) => ({
      ...p,
      pageIndex: idx,
      pageNumber: idx + 1,
    }));

    pushState({
      ...currentState,
      pagesMeta: reindexedMeta,
    });
  };

  // Export PDF Download
  const handleExportPdf = async () => {
    if (!pdfBytes) return;
    setIsExporting(true);

    try {
      const outputBytes = await PdfService.exportPdf(
        pdfBytes,
        pagesMeta,
        textElements,
        annotations,
        watermark,
        security
      );

      const blob = new Blob([outputBytes as unknown as BlobPart], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = documentName.endsWith('.pdf') ? documentName : `${documentName}.pdf`;
      link.click();
      URL.revokeObjectURL(url);

      // Trigger Confetti Celebration!
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#C85A32', '#4A7C59', '#1E3A8A', '#D97706'],
      });
    } catch (err) {
      console.error('Export failed:', err);
    } finally {
      setIsExporting(false);
    }
  };

  // Export to DOCX
  const handleExportDocx = async () => {
    try {
      const blob = await DocxExportService.exportToDocx(textElements, pagesMeta);
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = documentName.replace(/\.pdf$/i, '') + '.docx';
      link.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Docx Export failed:', err);
    }
  };

  const selectedTextElement = textElements.find(t => t.id === selectedTextId) || null;

  // Render Landing Page if no PDF loaded yet
  if (!pdfBytes || pagesMeta.length === 0) {
    return (
      <LandingPage
        onOpenFile={handleOpenFile}
        onLoadSamplePdf={() => {}}
      />
    );
  }

  return (
    <div className="h-screen w-screen bg-[#F7F5F0] dark:bg-[#141413] flex flex-col overflow-hidden font-sans">
      {/* Header */}
      <HeaderBar
        documentName={documentName}
        onDocumentNameChange={setDocumentName}
        onOpenFile={() => {
          const input = document.createElement('input');
          input.type = 'file';
          input.accept = '.pdf,.docx';
          input.onchange = (e: any) => {
            const file = e.target.files?.[0];
            if (file) handleOpenFile(file);
          };
          input.click();
        }}
        onExportPdf={handleExportPdf}
        onExportDocx={() => setIsDocxModalOpen(true)}
        onOpenPageOrganizer={() => setIsOrganizerModalOpen(true)}
        onOpenWatermarkModal={() => setIsWatermarkModalOpen(true)}
        onOpenSecurityModal={() => setIsSecurityModalOpen(true)}
        canUndo={canUndo}
        canRedo={canRedo}
        onUndo={undo}
        onRedo={redo}
        zoom={zoom}
        onZoomChange={setZoom}
        isExporting={isExporting}
      />

      {/* Workspace Area: Page Sidebar + Multi-Page Continuous Scroll Viewport + Right Inspector Panel */}
      <div className="flex-1 flex overflow-hidden">
        {/* Page Thumbnail Sidebar */}
        <PageSidebar
          pdfBytes={pdfBytes}
          pagesMeta={pagesMeta}
          activePageIndex={activePageIndex}
          onSelectPage={handleSelectPage}
          onRotatePage={handleRotatePage}
          onDeletePage={handleDeletePage}
          onDuplicatePage={handleDuplicatePage}
          isOpen={isSidebarOpen}
          onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
        />

        {/* Main Canvas Continuous Multi-Page Scroll Viewport */}
        <main className="flex-1 overflow-auto paper-grid-bg p-8 flex flex-col items-center justify-start min-h-0 space-y-10 scroll-smooth">
          {pagesMeta.map((pageMeta, idx) => (
            <div key={`page-container-${idx}`} id={`pdf-page-container-${idx}`}>
              <PdfViewerCanvas
                pdfBytes={pdfBytes}
                pageMeta={pageMeta}
                zoom={zoom}
                activeTool={activeTool}
                textElements={textElements}
                annotations={annotations}
                selectedTextId={selectedTextId}
                strokeColor={strokeColor}
                onSelectText={setSelectedTextId}
                onUpdateText={handleUpdateText}
                onAddAnnotation={handleAddAnnotation}
                onAddTextAtPosition={handleAddTextAtPosition}
              />
            </div>
          ))}
        </main>

        {/* Right Inspector Panel */}
        <FormattingToolbar
          activeTool={activeTool}
          onSelectTool={(tool) => {
            setActiveTool(tool);
            if (tool !== 'select' && tool !== 'text-edit') {
              setSelectedTextId(null);
            }
          }}
          selectedTextElement={selectedTextElement}
          onUpdateSelectedText={handleUpdateSelectedText}
          onDeleteSelected={handleDeleteSelected}
          onOpenSignatureModal={() => setIsSignatureModalOpen(true)}
          onInsertImageClick={handleInsertImageClick}
          strokeColor={strokeColor}
          onStrokeColorChange={setStrokeColor}
        />
      </div>

      {/* Modals */}
      <SignatureModal
        isOpen={isSignatureModalOpen}
        onClose={() => setIsSignatureModalOpen(false)}
        onSaveSignature={handleSaveSignature}
      />

      <DocxConvertModal
        isOpen={isDocxModalOpen}
        onClose={() => setIsDocxModalOpen(false)}
        onExportDocx={handleExportDocx}
        onImportDocx={handleOpenFile}
        isProcessing={isExporting}
      />

      <WatermarkModal
        isOpen={isWatermarkModalOpen}
        onClose={() => setIsWatermarkModalOpen(false)}
        watermark={watermark}
        onUpdateWatermark={setWatermark}
      />

      <SecurityModal
        isOpen={isSecurityModalOpen}
        onClose={() => setIsSecurityModalOpen(false)}
        security={security}
        onUpdateSecurity={setSecurity}
      />

      <PageOrganizerModal
        isOpen={isOrganizerModalOpen}
        onClose={() => setIsOrganizerModalOpen(false)}
        pdfBytes={pdfBytes}
        pagesMeta={pagesMeta}
        onRotatePage={handleRotatePage}
        onDeletePage={handleDeletePage}
        onDuplicatePage={handleDuplicatePage}
        onReorderPages={() => {}}
      />
    </div>
  );
};

export default App;
