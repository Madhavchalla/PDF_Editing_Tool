export type ActiveTool = 
  | 'select'
  | 'text-edit'
  | 'text-add'
  | 'draw-pen'
  | 'draw-highlighter'
  | 'shape-rect'
  | 'shape-circle'
  | 'shape-line'
  | 'shape-arrow'
  | 'signature'
  | 'stamp'
  | 'image'
  | 'eraser';

export type FontCategory = 'sans' | 'serif' | 'mono' | 'handwriting';

export interface TextElement {
  id: string;
  pageIndex: number;
  x: number; // Percentage or points relative to page dimensions (0-100%)
  y: number;
  width: number;
  height: number;
  text: string;
  originalText?: string;
  fontSize: number; // in pt
  fontFamily: string;
  color: string;
  fontWeight: 'normal' | 'bold';
  fontStyle: 'normal' | 'italic';
  textDecoration: 'none' | 'underline' | 'line-through';
  textAlign: 'left' | 'center' | 'right' | 'justify';
  backgroundColor?: string;
  isModified?: boolean;
  isDeleted?: boolean;
  isNew?: boolean;
  rotation?: number;
}

export interface DrawingPoint {
  x: number;
  y: number;
}

export interface Annotation {
  id: string;
  pageIndex: number;
  type: 'pen' | 'highlighter' | 'rect' | 'circle' | 'line' | 'arrow' | 'stamp' | 'image' | 'signature';
  points?: DrawingPoint[]; // for pen & highlighter
  x: number;
  y: number;
  width: number;
  height: number;
  strokeColor: string;
  fillColor?: string;
  strokeWidth: number;
  opacity: number;
  stampText?: string;
  imageSrc?: string;
  rotation?: number;
}

export interface SignatureItem {
  id: string;
  title: string;
  type: 'draw' | 'type' | 'upload';
  dataUrl: string;
  createdAt: string;
}

export interface PageMeta {
  pageIndex: number;
  pageNumber: number;
  width: number;
  height: number;
  rotation: number; // 0, 90, 180, 270
}

export interface WatermarkConfig {
  enabled: boolean;
  text: string;
  opacity: number; // 0.1 to 1.0
  fontSize: number;
  color: string;
  rotation: number; // -90 to 90 degrees
}

export interface SecurityConfig {
  isPasswordProtected: boolean;
  userPassword?: string;
  ownerPassword?: string;
}

export interface HistoryState {
  textElements: TextElement[];
  annotations: Annotation[];
  pagesMeta: PageMeta[];
}
