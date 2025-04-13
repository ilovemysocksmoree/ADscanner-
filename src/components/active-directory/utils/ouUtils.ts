import { OrganizationalUnit } from '../types';
import { OUTreeNode, ADOrganizationalUnit } from '../../../models/ad-entities';

/**
 * Extracts parent OU from Distinguished Name
 */
export const extractParentOUFromDN = (dn: string): string | undefined => {
  const parts = dn.split(',');
  if (parts.length <= 1) return undefined;
  return parts.slice(1).join(',');
};

/**
 * Generate avatar background color based on OU name
 */
export const getAvatarColor = (name: string) => {
  const colors = [
    '#1976d2', '#388e3c', '#d32f2f', '#f57c00', '#7b1fa2',
    '#0288d1', '#689f38', '#e64a19', '#fbc02d', '#512da8'
  ];
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return colors[Math.abs(hash) % colors.length];
};

/**
 * Format date to be more readable
 */
export const formatDate = (date: Date | undefined) => {
  if (!date) return 'N/A';
  return new Date(date).toLocaleString();
};

/**
 * Formats raw OU data from API
 */
export const formatOUData = (data: any[]): OrganizationalUnit[] => {
  return data.map(ou => ({
    id: ou.objectGUID || ou.distinguishedName,
    name: ou.name || ou.cn || '',
    distinguishedName: ou.distinguishedName,
    path: ou.distinguishedName,
    description: ou.description || '',
    parentOU: extractParentOUFromDN(ou.distinguishedName),
    protected: ou.protected || false,
    managedBy: ou.managedBy || '',
    created: ou.whenCreated ? new Date(ou.whenCreated) : undefined,
    modified: ou.whenChanged ? new Date(ou.whenChanged) : undefined
  }));
};

/**
 * Build a simple OU tree from flat OU list
 */
export const buildOUTree = (ouList: ADOrganizationalUnit[]): OUTreeNode[] => {
  // Create a map of parent -> children
  const ouMap: Record<string, OUTreeNode> = {};
  const rootNodes: OUTreeNode[] = [];
  
  // First pass: create all nodes
  ouList.forEach(ou => {
    const node: OUTreeNode = {
      id: ou.id,
      name: ou.name,
      distinguishedName: ou.distinguishedName,
      path: ou.path || ou.distinguishedName,
      parentOU: ou.parentOU,
      children: [],
      level: 0,
      expanded: true
    };
    
    ouMap[ou.distinguishedName] = node;
  });
  
  // Second pass: build the tree
  Object.values(ouMap).forEach(node => {
    if (node.parentOU && ouMap[node.parentOU]) {
      // Has a parent in our list
      const parent = ouMap[node.parentOU];
      if (parent.children) {
        parent.children.push(node);
      } else {
        parent.children = [node];
      }
      node.level = parent.level + 1;
    } else {
      // Root node
      rootNodes.push(node);
    }
  });
  
  return rootNodes;
}; 