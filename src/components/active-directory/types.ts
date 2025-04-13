export interface OrganizationalUnit {
  id: string;
  name: string;
  distinguishedName: string;
  path: string;
  description: string;
  parentOU?: string;
  protected: boolean;
  managedBy: string;
  created?: Date;
  modified?: Date;
} 