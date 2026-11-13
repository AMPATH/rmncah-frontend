
export type AdminUserRole =
  | 'Program Lead'
  | 'County Mentor / RH / MOH'
  | 'Mentor'
  | 'Mentee'
  | 'System Administrator'

export type AccountStatus =
  | 'Active'
  | 'Pending'
  | 'Inactive'
  | 'Suspended'

export type ModuleStatus =
  | 'Draft'
  | 'Published'
  | 'Archived'

export interface AdminUser {
  id: string
  name: string
  email: string
  role: AdminUserRole
  facility: string
  status: AccountStatus
  createdAt: string
  lastActive: string
}

export interface AdminModule {
  id: string
  title: string
  category: string
  owner: string
  status: ModuleStatus
  sections: number
  updatedAt: string
}

export interface AdminActivity {
  id: string
  actor: string
  action: string
  resource: string
  description: string
  date: string
  result: 'Successful' | 'Failed' | 'Pending'
}

export interface AdminStatistic {
  id: string
  label: string
  value: string | number
  description: string
  trend?: string
}

export interface PermissionDefinition {
  id: string
  category: string
  label: string
  description: string
}

export interface SystemSetting {
  id: string
  label: string
  description: string
  value: string
  category: string
}
