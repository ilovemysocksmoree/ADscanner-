/**
 * Active Directory Entity Interfaces
 * Defines the data structures for various AD entities
 */

// Base interface for all AD entities
export interface ADEntity {
  id: string;
  distinguishedName: string;
  name: string;
  description?: string;
  created?: Date;
  modified?: Date;
}

// User entity
export interface ADUser extends ADEntity {
  samAccountName: string;
  userPrincipalName?: string;
  firstName?: string;
  lastName?: string;
  displayName: string;
  email?: string;
  enabled: boolean;
  locked: boolean;
  passwordExpired?: boolean;
  lastLogon?: Date;
  groups?: string[];
  manager?: string;
  phoneNumber?: string;
  department?: string;
  title?: string;
  company?: string;
}

// Group entity
export interface ADGroup extends ADEntity {
  samAccountName: string;
  groupType: string;
  groupScope: string;
  memberCount: number;
  members?: ADEntity[];
  managedBy?: string;
  isSecurityGroup: boolean;
}

// Organizational Unit entity
export interface ADOrganizationalUnit extends ADEntity {
  path: string;
  parentOU?: string;
  protected?: boolean;
  childOUs?: ADOrganizationalUnit[];
  users?: ADUser[];
  groups?: ADGroup[];
  computers?: ADComputer[];
  managedBy?: string;
}

// Computer entity
export interface ADComputer extends ADEntity {
  samAccountName: string;
  dnsHostName?: string;
  operatingSystem?: string;
  operatingSystemVersion?: string;
  enabled: boolean;
  lastLogon?: Date;
  managedBy?: string;
  location?: string;
  trusted: boolean;
}

// Domain Controller entity
export interface ADDomainController extends ADComputer {
  domain: string;
  site?: string;
  isGlobalCatalog: boolean;
  roles: string[];
  services: string[];
}

// GPO entity
export interface ADGroupPolicy extends ADEntity {
  displayName: string;
  gpoStatus: string;
  wmiFilter?: string;
  createdBy?: string;
  modifiedBy?: string;
  computerSettings?: boolean;
  userSettings?: boolean;
  enabled: boolean;
  links?: string[];
}

// Pagination response for AD queries
export interface PaginatedResponse<T> {
  items: T[];
  totalCount: number;
  page: number;
  pageSize: number;
  hasMore: boolean;
}

// Search parameters for AD queries
export interface ADSearchParams {
  searchTerm?: string;
  page?: number;
  pageSize?: number;
  filters?: Record<string, any>;
  sortBy?: string;
  sortDirection?: 'asc' | 'desc';
}

// OU Tree Node for hierarchical display
export interface OUTreeNode {
  id: string;
  name: string;
  distinguishedName: string;
  path: string;
  parentOU?: string;
  children?: OUTreeNode[];
  level: number;
  expanded?: boolean;
  childCount?: number;
} 