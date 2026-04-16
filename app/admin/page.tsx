import type { Metadata } from 'next'
import AdminClient from './AdminClient'

export const metadata: Metadata = {
  title: '管理後台 — 岐蓁手作烘培',
}

export default function AdminPage() {
  return <AdminClient />
}
