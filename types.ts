
export interface Position {
  x: number;
  y: number;
}

export interface NodeStyle {
  backgroundColor: string;
  color: string;
  fontSize: number;
  borderRadius: number;
  borderColor?: string;
  borderWidth?: number;
}

export interface MindMapTheme {
  id: string;
  name: string;
  type: 'fill' | 'outline';
  background: string;
  lineColor: string;
  rootStyle: Partial<NodeStyle>;
  nodeStyle: Partial<NodeStyle>;
  palette: string[];
}

export interface MindMapNode {
  id: string;
  parentId: string | null;
  content: string;
  note?: string;
  position: Position;
  style: NodeStyle;
  isExpanded?: boolean;
  width?: number;
  height?: number;
}

export interface MindMapConnection {
  id: string;
  sourceId: string;
  targetId: string;
  label?: string; // Added label support
}

export type LayoutType = 'mindmap' | 'orgchart' | 'list';

export interface MindMapData {
  id: string;
  title: string;
  description?: string;
  nodes: MindMapNode[];
  connections: MindMapConnection[];
  themeId: string;
  layout?: LayoutType;
  createdAt: string;
  updatedAt: string;
}

export interface Viewport {
  x: number;
  y: number;
  scale: number;
}

export enum ThemeMode {
  LIGHT = 'light',
  DARK = 'dark',
}

export enum Page {
  LANDING = 'landing',
  DASHBOARD = 'dashboard',
  EDITOR = 'editor',
}
