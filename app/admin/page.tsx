import type { Metadata } from 'next'
import AdminClient from './AdminClient'

export const metadata: Metadata = {
  title: '管理後台 — CC Baker',
}

export default function AdminPage() {
  return <AdminClient />
}
