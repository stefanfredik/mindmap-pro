
import { MindMapNode, Position, MindMapTheme, LayoutType, MindMapData } from './types';
import { DEFAULT_NODE_STYLE } from './constants';

export const generateId = (): string => {
  return Math.random().toString(36).substr(2, 9);
};

export const getConnectionPath = (
  source: MindMapNode,
  target: MindMapNode,
  layout: LayoutType = 'mindmap'
): { path: string, center: Position } => {
  // Defaults if width/height missing (initial render or safety)
  const sw = source.width || 120;
  const sh = source.height || 40;
  const tw = target.width || 120;
  const th = target.height || 40;

  let sx, sy, ex, ey;

  if (layout === 'orgchart') {
    // Vertical Layout: Bottom of Parent -> Top of Child
    sx = source.position.x;
    sy = source.position.y + sh / 2;
    ex = target.position.x;
    ey = target.position.y - th / 2;

    // Vertical Cubic Bezier for smooth tree look
    const distY = Math.abs(ey - sy);
    const cp1y = sy + distY * 0.5;
    const cp2y = ey - distY * 0.5;
    
    const path = `M ${sx} ${sy} C ${sx} ${cp1y} ${ex} ${cp2y} ${ex} ${ey}`;
    
    // Approximate Midpoint
    const t = 0.5;
    const mt = 1 - t;
    const mx = (mt*mt*mt*sx) + (3*mt*mt*t*sx) + (3*mt*t*t*ex) + (t*t*t*ex);
    const my = (mt*mt*mt*sy) + (3*mt*mt*t*cp1y) + (3*mt*t*t*cp2y) + (t*t*t*ey);

    return { path, center: { x: mx, y: my } };

  } else if (layout === 'list') {
    // List Layout: L-shape
    // Connect from Bottom-Left-ish of Parent to Left-Center of Child
    // Assuming hierarchical indentation
    
    // Anchor Parent: Bottom Left corner (inset slightly)
    sx = source.position.x - sw / 2 + 12; 
    sy = source.position.y + sh / 2;
    
    // Anchor Child: Left Center
    ex = target.position.x - tw / 2;
    ey = target.position.y;
    
    // Orthogonal: Down then Right
    // M sx sy V ey H ex
    const path = `M ${sx} ${sy} V ${ey} H ${ex}`;
    
    // Marker at the corner? Or middle of horizontal segment?
    // Let's put it in the middle of the horizontal segment
    const mx = sx + (ex - sx) / 2;
    const my = ey;
    
    return { path, center: { x: mx, y: my } };
  }
  
  // Default: Mind Map (Left-Right)
  // Parent Right -> Child Left
  sx = source.position.x + sw / 2;
  sy = source.position.y;
  ex = target.position.x - tw / 2;
  ey = target.position.y;

  const dist = Math.abs(ex - sx);
  // Control points
  const cp1x = sx + dist * 0.4;
  const cp2x = ex - dist * 0.4;

  const path = `M ${sx} ${sy} C ${cp1x} ${sy} ${cp2x} ${ey} ${ex} ${ey}`;

  // Approximate Midpoint for Bezier
  const t = 0.5;
  const mt = 1 - t;
  const mx = (mt*mt*mt*sx) + (3*mt*mt*t*cp1x) + (3*mt*t*t*cp2x) + (t*t*t*ex);
  const my = (mt*mt*mt*sy) + (3*mt*mt*t*sy) + (3*mt*t*t*ey) + (t*t*t*ey);

  return { path, center: { x: mx, y: my } };
};

export const getCrossLinkPath = (
  source: MindMapNode,
  target: MindMapNode
): { path: string, center: Position } => {
    const sw = source.width || 120;
    const sh = source.height || 40;
    const tw = target.width || 120;
    const th = target.height || 40;

    let sx, sy, ex, ey;

    // Determine best attachment points based on relative position
    const dx = target.position.x - source.position.x;
    const dy = target.position.y - source.position.y;

    // Simple heuristic: connect closest sides
    if (Math.abs(dx) > Math.abs(dy)) {
        // Horizontal dominance
        if (dx > 0) {
            // Target is to the right
            sx = source.position.x + sw / 2;
            sy = source.position.y;
            ex = target.position.x - tw / 2;
            ey = target.position.y;
        } else {
            // Target is to the left
            sx = source.position.x - sw / 2;
            sy = source.position.y;
            ex = target.position.x + tw / 2;
            ey = target.position.y;
        }
    } else {
        // Vertical dominance
        if (dy > 0) {
            // Target is below
            sx = source.position.x;
            sy = source.position.y + sh / 2;
            ex = target.position.x;
            ey = target.position.y - th / 2;
        } else {
             // Target is above
            sx = source.position.x;
            sy = source.position.y - sh / 2;
            ex = target.position.x;
            ey = target.position.y + th / 2;
        }
    }

    // Use a quadratic curve for a "loose" connection feel
    // Calculate control point: offset perpendicular to the midpoint?
    // Or just simple Bezier. Let's use simple Cubic Bezier with handles extending out.
    
    const dist = Math.sqrt(Math.pow(ex - sx, 2) + Math.pow(ey - sy, 2));
    const handleLen = dist * 0.4;

    let cp1x, cp1y, cp2x, cp2y;

    if (Math.abs(dx) > Math.abs(dy)) {
        // Horizontal handles
        const dir = dx > 0 ? 1 : -1;
        cp1x = sx + handleLen * dir;
        cp1y = sy;
        cp2x = ex - handleLen * dir;
        cp2y = ey;
    } else {
        // Vertical handles
        const dir = dy > 0 ? 1 : -1;
        cp1x = sx;
        cp1y = sy + handleLen * dir;
        cp2x = ex;
        cp2y = ey - handleLen * dir;
    }

    const path = `M ${sx} ${sy} C ${cp1x} ${cp1y} ${cp2x} ${cp2y} ${ex} ${ey}`;
    
    // Midpoint
    const t = 0.5;
    const mt = 1 - t;
    const mx = (mt*mt*mt*sx) + (3*mt*mt*t*cp1x) + (3*mt*t*t*cp2x) + (t*t*t*ex);
    const my = (mt*mt*mt*sy) + (3*mt*mt*t*cp1y) + (3*mt*t*t*cp2y) + (t*t*t*ey);

    return { path, center: { x: mx, y: my } };
};

// Helper to determine text color (black or white) based on background hex
const getLegibleTextColor = (hex: string): string => {
    // Remove hash if present
    const cleanHex = hex.replace('#', '');
    
    // Parse RGB
    const r = parseInt(cleanHex.substring(0, 2), 16);
    const g = parseInt(cleanHex.substring(2, 4), 16);
    const b = parseInt(cleanHex.substring(4, 6), 16);
    
    // Calculate relative luminance (YIQ formula)
    const yiq = ((r * 299) + (g * 587) + (b * 114)) / 1000;
    
    // Threshold of 128 is standard; if brighter than 128, use dark text.
    return (yiq >= 128) ? '#1f2937' : '#ffffff';
};

export const applyTheme = (nodes: MindMapNode[], theme: MindMapTheme): MindMapNode[] => {
  const newNodes = nodes.map(n => ({ ...n })); 
  const nodeMap = new Map(newNodes.map(n => [n.id, n]));
  const childrenMap = new Map<string, string[]>();
  
  newNodes.forEach(n => {
    if (n.parentId) {
      if (!childrenMap.has(n.parentId)) childrenMap.set(n.parentId, []);
      childrenMap.get(n.parentId)!.push(n.id);
    }
  });

  const root = newNodes.find(n => !n.parentId);
  if (!root) return newNodes;

  root.style = { ...DEFAULT_NODE_STYLE, ...theme.rootStyle };
  // Ensure root text is legible if type is fill and color isn't explicitly contrasted (safety check)
  if (theme.type === 'fill' && theme.rootStyle.backgroundColor) {
      // We respect the theme definition for root, but could override if needed. 
      // Usually constants.ts has good root pairs.
  }

  const level1Ids = childrenMap.get(root.id) || [];
  
  level1Ids.forEach((id, index) => {
    const color = theme.palette[index % theme.palette.length];
    const node = nodeMap.get(id);
    if (node) {
        const branchStyle = { ...DEFAULT_NODE_STYLE, ...theme.nodeStyle };
        if (theme.type === 'outline') {
            branchStyle.borderColor = color;
        } else {
            branchStyle.backgroundColor = color;
            // Automatically calculate legible text color for filled nodes
            branchStyle.color = getLegibleTextColor(color);
        }
        node.style = branchStyle;

        const queue = [id];
        while(queue.length > 0) {
            const currId = queue.shift()!;
            const children = childrenMap.get(currId) || [];
            
            children.forEach(childId => {
                const childNode = nodeMap.get(childId);
                if (childNode) {
                    const childStyle = { ...DEFAULT_NODE_STYLE, ...theme.nodeStyle };
                     if (theme.type === 'outline') {
                        childStyle.borderColor = color;
                    } else {
                        childStyle.backgroundColor = color;
                        // Automatically calculate legible text color for filled nodes
                        childStyle.color = getLegibleTextColor(color);
                    }
                    childNode.style = childStyle;
                    queue.push(childId);
                }
            });
        }
    }
  });

  return newNodes;
};

// --- Measurement & Layout Algorithms ---

// Helper: Measure text to calculate node dimensions
const measureText = (text: string, fontSize: number): { width: number, height: number } => {
  const canvas = document.createElement('canvas');
  const context = canvas.getContext('2d');
  
  // Defaults matching NodeComponent
  const minWidth = 120;
  const maxWidth = 300;
  const paddingX = 24; // p-3 (12px) * 2
  const paddingY = 24; // p-3 (12px) * 2
  const border = 4; // Allowance for borders
  const lineHeightRatio = 1.5;

  if (!context) return { width: minWidth, height: 40 + paddingY };

  context.font = `${fontSize}px Inter, sans-serif`;

  // Estimate wrapping
  const words = text.split(/\s+/);
  let line = '';
  let maxLineWidth = 0;
  let lineCount = 1;

  for (let i = 0; i < words.length; i++) {
    const testLine = line + words[i] + ' ';
    const metrics = context.measureText(testLine);
    const testWidth = metrics.width;
    
    if (testWidth > (maxWidth - paddingX) && i > 0) {
       line = words[i] + ' ';
       lineCount++;
    } else {
       line = testLine;
       maxLineWidth = Math.max(maxLineWidth, testWidth);
    }
  }

  // Handle single very long word
  if (words.length === 1) {
     const w = context.measureText(text).width;
     if (w > maxWidth - paddingX) {
         // Assume it wraps char by char or similar
         const estimatedLines = Math.ceil(w / (maxWidth - paddingX));
         lineCount = Math.max(lineCount, estimatedLines);
         maxLineWidth = maxWidth - paddingX;
     } else {
         maxLineWidth = Math.max(maxLineWidth, w);
     }
  }

  const width = Math.min(Math.max(maxLineWidth + paddingX + border, minWidth), maxWidth);
  const height = (lineCount * fontSize * lineHeightRatio) + paddingY + border;

  return { width, height };
};

const buildTree = (nodes: MindMapNode[]) => {
  const nodeMap = new Map(nodes.map(n => [n.id, { ...n }]));
  const childrenMap = new Map<string, string[]>();
  nodes.forEach(n => {
    if (n.parentId) {
      if (!childrenMap.has(n.parentId)) childrenMap.set(n.parentId, []);
      childrenMap.get(n.parentId)!.push(n.id);
    }
  });
  const roots = nodes.filter(n => !n.parentId);
  return { nodeMap, childrenMap, roots };
};

// 1. Mind Map (Horizontal Tree)
const layoutMindMap = (nodes: MindMapNode[]): MindMapNode[] => {
  if (nodes.length === 0) return nodes;
  const { nodeMap, childrenMap, roots } = buildTree(nodes);

  const HORIZONTAL_GAP = 50;
  const VERTICAL_GAP = 20;

  // Calculate subtree sizes (height is dominant for horizontal layout)
  const subtreeSizes = new Map<string, number>();

  const calculateSubtreeHeight = (nodeId: string): number => {
    const node = nodeMap.get(nodeId)!;
    const children = childrenMap.get(nodeId) || [];
    
    if (node.isExpanded === false || children.length === 0) {
      subtreeSizes.set(nodeId, node.height || 50);
      return node.height || 50;
    }

    let childrenHeight = 0;
    children.forEach(childId => {
      childrenHeight += calculateSubtreeHeight(childId);
    });
    
    // Add gaps between children
    childrenHeight += (children.length - 1) * VERTICAL_GAP;

    // The subtree height is the max of the node's own height and the children's block
    const h = Math.max(node.height || 50, childrenHeight);
    subtreeSizes.set(nodeId, h);
    return h;
  };

  const layoutRecursive = (nodeId: string, x: number, yCenter: number) => {
    const node = nodeMap.get(nodeId)!;
    const children = childrenMap.get(nodeId) || [];
    
    node.position = { x, y: yCenter };

    if (node.isExpanded !== false && children.length > 0) {
      let currentY = yCenter - (subtreeSizes.get(nodeId)! / 2); // Start at top of subtree area
      // Center the children block relative to the parent center.
      
      const childrenBlockHeight = children.reduce((acc, cid) => acc + (subtreeSizes.get(cid) || 0), 0) + (children.length - 1) * VERTICAL_GAP;
      let childStartY = yCenter - childrenBlockHeight / 2;

      children.forEach(childId => {
        const h = subtreeSizes.get(childId)!;
        const childCenter = childStartY + h / 2;
        // X position: Parent X + Parent Width/2 + Gap + Child Width/2
        // Since anchor is center, we add half widths.
        const childNode = nodeMap.get(childId)!;
        const nextX = x + (node.width! / 2) + HORIZONTAL_GAP + (childNode.width! / 2);
        
        layoutRecursive(childId, nextX, childCenter);
        childStartY += h + VERTICAL_GAP;
      });
    }
  };

  if (roots.length > 0) {
    const root = roots[0];
    calculateSubtreeHeight(root.id);
    // Keep root at its current position approx or center?
    layoutRecursive(root.id, root.position.x, root.position.y);
  }

  return Array.from(nodeMap.values());
};

// 2. Org Chart (Vertical Tree)
const layoutOrgChart = (nodes: MindMapNode[]): MindMapNode[] => {
  if (nodes.length === 0) return nodes;
  const { nodeMap, childrenMap, roots } = buildTree(nodes);

  const VERTICAL_GAP = 60;
  const HORIZONTAL_GAP = 30;

  const subtreeWidths = new Map<string, number>();

  const calculateSubtreeWidth = (nodeId: string): number => {
    const node = nodeMap.get(nodeId)!;
    const children = childrenMap.get(nodeId) || [];

    if (node.isExpanded === false || children.length === 0) {
      subtreeWidths.set(nodeId, node.width || 120);
      return node.width || 120;
    }

    let childrenWidth = 0;
    children.forEach(childId => {
      childrenWidth += calculateSubtreeWidth(childId);
    });
    childrenWidth += (children.length - 1) * HORIZONTAL_GAP;

    const w = Math.max(node.width || 120, childrenWidth);
    subtreeWidths.set(nodeId, w);
    return w;
  };

  const layoutRecursive = (nodeId: string, xCenter: number, y: number) => {
    const node = nodeMap.get(nodeId)!;
    const children = childrenMap.get(nodeId) || [];
    
    node.position = { x: xCenter, y };

    if (node.isExpanded !== false && children.length > 0) {
      const childrenBlockWidth = children.reduce((acc, cid) => acc + (subtreeWidths.get(cid) || 0), 0) + (children.length - 1) * HORIZONTAL_GAP;
      let childStartX = xCenter - childrenBlockWidth / 2;

      children.forEach(childId => {
        const w = subtreeWidths.get(childId)!;
        const childCenter = childStartX + w / 2;
        
        const childNode = nodeMap.get(childId)!;
        const nextY = y + (node.height! / 2) + VERTICAL_GAP + (childNode.height! / 2);
        
        layoutRecursive(childId, childCenter, nextY);
        childStartX += w + HORIZONTAL_GAP;
      });
    }
  };

  if (roots.length > 0) {
    const root = roots[0];
    calculateSubtreeWidth(root.id);
    layoutRecursive(root.id, root.position.x, root.position.y);
  }

  return Array.from(nodeMap.values());
};

// 3. List Layout (Linear Vertical)
const layoutList = (nodes: MindMapNode[]): MindMapNode[] => {
  if (nodes.length === 0) return nodes;
  const { nodeMap, childrenMap, roots } = buildTree(nodes);

  const VERTICAL_GAP = 20;
  const INDENTATION = 40;

  let currentY = roots.length > 0 ? roots[0].position.y : 0;
  // Reset X to align with root
  const startX = roots.length > 0 ? roots[0].position.x : 0;

  const layoutRecursive = (nodeId: string, depth: number) => {
    const node = nodeMap.get(nodeId)!;
    
    // Position: X is depth, Y is accumulated
    // Use node height
    const h = node.height || 40;
    const w = node.width || 120;
    
    // Center anchor compensation:
    // x is center, y is center.
    // List usually top-left aligned visually, but our nodes are center anchored.
    // Let's align left side:
    // x = startX + depth * indent + w/2
    node.position = {
      x: startX + (depth * INDENTATION) + (w / 2),
      y: currentY + (h / 2)
    };
    
    currentY += h + VERTICAL_GAP;

    if (node.isExpanded !== false) {
      const children = childrenMap.get(nodeId) || [];
      children.forEach(childId => layoutRecursive(childId, depth + 1));
    }
  };

  if (roots.length > 0) {
    // We restart Y from the root's current top (approx)
    const root = roots[0];
    // Start slightly higher to keep root in place if possible, 
    // but list flows down, so we just start at current root Y.
    currentY = root.position.y - ((root.height || 40) / 2);
    
    layoutRecursive(root.id, 0);
  }

  return Array.from(nodeMap.values());
};

export const autoLayout = (nodes: MindMapNode[], type: LayoutType = 'mindmap'): MindMapNode[] => {
  // 1. Measure all nodes first
  const measuredNodes = nodes.map(node => {
      const { width, height } = measureText(node.content, node.style.fontSize);
      return { ...node, width, height };
  });

  // 2. Apply Layout
  switch (type) {
    case 'orgchart':
      return layoutOrgChart(measuredNodes);
    case 'list':
      return layoutList(measuredNodes);
    case 'mindmap':
    default:
      return layoutMindMap(measuredNodes);
  }
};

export const triggerDownload = (content: string, filename: string, mimeType: string) => {
    const blob = new Blob([content], { type: mimeType });
    const href = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = href;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(href);
};

export const downloadJson = (data: object, filename: string) => {
    triggerDownload(JSON.stringify(data, null, 2), filename, 'application/json');
};

export const generateMarkdown = (data: MindMapData): string => {
    const { nodes, title } = data;
    const { childrenMap, roots } = buildTree(nodes);
    let md = `# ${title}\n\n`;

    const traverse = (nodeId: string, depth: number) => {
        const node = nodes.find(n => n.id === nodeId);
        if (!node) return;

        const indent = '  '.repeat(depth);
        const bullet = depth === 0 ? '##' : '-';
        md += `${indent}${bullet} ${node.content}\n`;
        
        if (node.note) {
             // Basic HTML to Markdown strip could happen here, but simplest is just appending
             md += `${indent}  > Note: ${node.note.replace(/<[^>]*>?/gm, '')}\n`;
        }

        const children = childrenMap.get(nodeId) || [];
        children.forEach(childId => traverse(childId, depth + (depth === 0 ? 0 : 1)));
    };

    roots.forEach(root => traverse(root.id, 0));
    return md;
};

export const generatePlainText = (data: MindMapData): string => {
    const { nodes, title } = data;
    const { childrenMap, roots } = buildTree(nodes);
    let text = `${title}\n${'='.repeat(title.length)}\n\n`;

    const traverse = (nodeId: string, depth: number) => {
        const node = nodes.find(n => n.id === nodeId);
        if (!node) return;

        const indent = '\t'.repeat(depth);
        text += `${indent}${node.content}\n`;
        
        const children = childrenMap.get(nodeId) || [];
        children.forEach(childId => traverse(childId, depth + 1));
    };

    roots.forEach(root => traverse(root.id, 0));
    return text;
};
