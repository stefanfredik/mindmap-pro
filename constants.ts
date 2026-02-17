
import { MindMapData, NodeStyle, MindMapTheme } from './types';

export const DEFAULT_NODE_STYLE: NodeStyle = {
  backgroundColor: '#ffffff',
  color: '#1f2937',
  fontSize: 14,
  borderRadius: 8,
  borderColor: '#e5e7eb',
  borderWidth: 2,
};

export const ROOT_NODE_STYLE: NodeStyle = {
  backgroundColor: '#4A90E2',
  color: '#ffffff',
  fontSize: 18,
  borderRadius: 12,
  borderColor: '#3b82f6',
  borderWidth: 0,
};

export const THEMES: MindMapTheme[] = [
  {
    id: 'meister',
    name: 'Meister',
    type: 'outline',
    background: '#f8fafc',
    lineColor: '#cbd5e1',
    rootStyle: { backgroundColor: '#4A90E2', color: '#ffffff', borderRadius: 12, borderWidth: 0 },
    nodeStyle: { backgroundColor: '#ffffff', color: '#334155', borderRadius: 8, borderWidth: 2, borderColor: '#e2e8f0' },
    palette: ['#4A90E2', '#7ED321', '#F5A623', '#D0021B', '#9013FE', '#50E3C2']
  },
  {
    id: 'prism',
    name: 'Prism',
    type: 'outline',
    background: '#111827',
    lineColor: '#374151',
    rootStyle: { backgroundColor: '#F472B6', color: '#ffffff', borderRadius: 12, borderWidth: 0 },
    nodeStyle: { backgroundColor: '#1F2937', color: '#F3F4F6', borderRadius: 8, borderWidth: 2, borderColor: '#374151' },
    palette: ['#F472B6', '#A78BFA', '#34D399', '#60A5FA', '#FBBF24', '#F87171']
  },
  {
    id: 'color-burst',
    name: 'Color Burst',
    type: 'fill',
    background: '#ffffff',
    lineColor: '#e5e7eb',
    rootStyle: { backgroundColor: '#111827', color: '#ffffff', borderRadius: 50, borderWidth: 0 },
    nodeStyle: { backgroundColor: '#f3f4f6', color: '#ffffff', borderRadius: 20, borderWidth: 0 },
    palette: ['#ef4444', '#f59e0b', '#10b981', '#3b82f6', '#8b5cf6', '#ec4899']
  },
  {
    id: 'ocean',
    name: 'Ocean',
    type: 'fill',
    background: 'linear-gradient(135deg, #e0f7fa 0%, #80deea 100%)',
    lineColor: '#4dd0e1',
    rootStyle: { backgroundColor: '#006064', color: '#ffffff', borderRadius: 24, borderWidth: 0 },
    nodeStyle: { backgroundColor: '#ffffff', color: '#006064', borderRadius: 16, borderWidth: 2, borderColor: '#00acc1' },
    palette: ['#00acc1', '#0097a7', '#00838f', '#006064']
  },
  {
    id: 'sunset',
    name: 'Sunset',
    type: 'fill',
    background: 'linear-gradient(to top, #a18cd1 0%, #fbc2eb 100%)',
    lineColor: '#ffffff',
    rootStyle: { backgroundColor: '#ffffff', color: '#a18cd1', borderRadius: 30, borderWidth: 0 },
    nodeStyle: { backgroundColor: '#ffffff', color: '#4a4a4a', borderRadius: 15, borderWidth: 0 },
    palette: ['#ff9a9e', '#fad0c4', '#ffecd2', '#fcb69f']
  },
  {
    id: 'vintage',
    name: 'Vintage',
    type: 'outline',
    background: '#fdf6e3',
    lineColor: '#93a1a1',
    rootStyle: { backgroundColor: '#cb4b16', color: '#fdf6e3', borderRadius: 4, borderWidth: 0 },
    nodeStyle: { backgroundColor: '#eee8d5', color: '#586e75', borderRadius: 2, borderWidth: 2, borderColor: '#93a1a1' },
    palette: ['#b58900', '#cb4b16', '#dc322f', '#d33682', '#6c71c4', '#268bd2']
  },
  {
    id: 'midnight',
    name: 'Midnight',
    type: 'fill',
    background: '#0f172a',
    lineColor: '#334155',
    rootStyle: { backgroundColor: '#38bdf8', color: '#0f172a', borderRadius: 8, borderWidth: 0 },
    nodeStyle: { backgroundColor: '#1e293b', color: '#e2e8f0', borderRadius: 6, borderWidth: 1, borderColor: '#334155' },
    palette: ['#38bdf8', '#818cf8', '#c084fc', '#f472b6', '#fb7185']
  },
  {
    id: 'forest',
    name: 'Forest',
    type: 'fill',
    background: '#14251F',
    lineColor: '#4b5f54',
    rootStyle: { backgroundColor: '#8CAE68', color: '#0F2119', borderRadius: 20, borderWidth: 0 },
    nodeStyle: { backgroundColor: '#3A5A40', color: '#DAD7CD', borderRadius: 10, borderWidth: 0 },
    palette: ['#8CAE68', '#A3B18A', '#588157', '#3A5A40', '#344E41']
  },
  {
    id: 'cyberpunk',
    name: 'Cyberpunk',
    type: 'outline',
    background: '#050505',
    lineColor: '#00f3ff',
    rootStyle: { backgroundColor: 'transparent', color: '#fcee0a', borderRadius: 0, borderWidth: 2, borderColor: '#fcee0a' },
    nodeStyle: { backgroundColor: '#000000', color: '#00f3ff', borderRadius: 0, borderWidth: 1, borderColor: '#00f3ff' },
    palette: ['#00f3ff', '#ff0099', '#fcee0a', '#00ff9f']
  },
  {
    id: 'blueprint',
    name: 'Blueprint',
    type: 'outline',
    background: '#172B4D',
    lineColor: '#ffffff40',
    rootStyle: { backgroundColor: '#172B4D', color: '#ffffff', borderRadius: 4, borderWidth: 2, borderColor: '#ffffff' },
    nodeStyle: { backgroundColor: '#172B4D', color: '#ffffff', borderRadius: 2, borderWidth: 1, borderColor: '#ffffff80' },
    palette: ['#ffffff', '#ffffff', '#ffffff', '#ffffff']
  },
  {
    id: 'solar',
    name: 'Solar',
    type: 'fill',
    background: '#FDF6E3',
    lineColor: '#93A1A1',
    rootStyle: { backgroundColor: '#B58900', color: '#FDF6E3', borderRadius: 100, borderWidth: 0 },
    nodeStyle: { backgroundColor: '#EEE8D5', color: '#657B83', borderRadius: 50, borderWidth: 0 },
    palette: ['#CB4B16', '#DC322F', '#D33682', '#6C71C4', '#268BD2', '#2AA198', '#859900']
  },
  {
    id: 'monochrome',
    name: 'Monochrome',
    type: 'outline',
    background: '#ffffff',
    lineColor: '#000000',
    rootStyle: { backgroundColor: '#000000', color: '#ffffff', borderRadius: 0, borderWidth: 0 },
    nodeStyle: { backgroundColor: '#ffffff', color: '#000000', borderRadius: 0, borderWidth: 2, borderColor: '#000000' },
    palette: ['#000000', '#333333', '#666666']
  },
  {
    id: 'lavender',
    name: 'Lavender',
    type: 'fill',
    background: '#FAF5FF',
    lineColor: '#E9D5FF',
    rootStyle: { backgroundColor: '#8B5CF6', color: '#ffffff', borderRadius: 16, borderWidth: 0 },
    nodeStyle: { backgroundColor: '#ffffff', color: '#5B21B6', borderRadius: 12, borderWidth: 2, borderColor: '#DDD6FE' },
    palette: ['#C4B5FD', '#A78BFA', '#8B5CF6', '#7C3AED', '#6D28D9']
  },
  {
    id: 'corporate',
    name: 'Corporate',
    type: 'outline',
    background: '#F3F4F6',
    lineColor: '#9CA3AF',
    rootStyle: { backgroundColor: '#1F2937', color: '#F9FAFB', borderRadius: 4, borderWidth: 0 },
    nodeStyle: { backgroundColor: '#FFFFFF', color: '#374151', borderRadius: 4, borderWidth: 1, borderColor: '#D1D5DB' },
    palette: ['#3B82F6', '#10B981', '#F59E0B', '#6366F1']
  }
];

export const DEFAULT_THEME_ID = 'meister';

export const SAMPLE_MINDMAP: MindMapData = {
  id: "mindmap_001",
  title: "Project Planning",
  description: "Initial brainstorming for Q3 goals",
  themeId: 'meister',
  layout: 'mindmap',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  nodes: [
    {
      id: "node_001",
      parentId: null,
      content: "Main Goal",
      position: { x: 400, y: 300 },
      style: ROOT_NODE_STYLE,
      isExpanded: true
    },
    {
      id: "node_002",
      parentId: "node_001",
      content: "Phase 1: Research",
      position: { x: 200, y: 150 },
      style: { ...DEFAULT_NODE_STYLE, backgroundColor: '#ffffff', borderColor: '#7ED321', color: '#334155', borderWidth: 2 },
      isExpanded: true
    },
    {
      id: "node_003",
      parentId: "node_001",
      content: "Phase 2: Development",
      position: { x: 600, y: 150 },
      style: { ...DEFAULT_NODE_STYLE, backgroundColor: '#ffffff', borderColor: '#F5A623', color: '#334155', borderWidth: 2 },
      isExpanded: true
    },
    {
      id: "node_004",
      parentId: "node_002",
      content: "Market Analysis",
      position: { x: 100, y: 50 },
      style: { ...DEFAULT_NODE_STYLE, borderColor: '#7ED321' },
      isExpanded: true
    },
    {
      id: "node_005",
      parentId: "node_002",
      content: "User Interviews",
      position: { x: 300, y: 50 },
      style: { ...DEFAULT_NODE_STYLE, borderColor: '#7ED321' },
      isExpanded: true
    }
  ],
  connections: []
};
