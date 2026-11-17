import type { ReactNode } from 'react'

export interface NavigationItem {
  label: string
  path: string
  icon: ReactNode
}

export interface NavigationGroup {
  label?: string
  items: NavigationItem[]
}

export interface RoleNavigation {
  role: string
  title: string
  groups: NavigationGroup[]
}