import { collection, addDoc, updateDoc, deleteDoc, doc, onSnapshot } from 'firebase/firestore'
import { db } from './firebase'

export interface ShippingDate {
  id: string
  date: string        // "YYYY-MM-DD"
  maxOrders: number
  orderCount: number
  note: string
}

export function formatShippingDate(dateStr: string): string {
  const d = new Date(dateStr + 'T00:00:00')
  const days = ['日', '一', '二', '三', '四', '五', '六']
  return `${d.getMonth() + 1}月${d.getDate()}日（週${days[d.getDay()]}）`
}

export async function addShippingDate(data: Omit<ShippingDate, 'id' | 'orderCount'>) {
  await addDoc(collection(db, 'shippingDates'), { ...data, orderCount: 0 })
}

export async function updateShippingDate(id: string, data: Partial<Omit<ShippingDate, 'id' | 'orderCount'>>) {
  await updateDoc(doc(db, 'shippingDates', id), data)
}

export async function deleteShippingDate(id: string) {
  await deleteDoc(doc(db, 'shippingDates', id))
}

export function subscribeShippingDates(callback: (dates: ShippingDate[]) => void) {
  return onSnapshot(collection(db, 'shippingDates'), snapshot => {
    const dates = snapshot.docs.map(d => ({ id: d.id, ...d.data() })) as ShippingDate[]
    dates.sort((a, b) => a.date.localeCompare(b.date))
    callback(dates)
  })
}
