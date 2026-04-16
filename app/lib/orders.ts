import {
  collection,
  addDoc,
  doc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  onSnapshot,
  getDocs,
  serverTimestamp,
  Timestamp,
} from 'firebase/firestore'
import { db } from './firebase'
import { CartItem } from '../context/CartContext'

export type OrderStatus = 'pending' | 'confirmed' | 'ready' | 'completed' | 'cancelled'

export interface Order {
  id: string
  name: string
  phone: string
  date: string
  note: string
  items: { productId: string; name: string; price: number; quantity: number }[]
  totalPrice: number
  status: OrderStatus
  createdAt: Timestamp | null
}

export async function saveOrder(data: {
  name: string
  phone: string
  date: string
  note: string
  items: CartItem[]
  totalPrice: number
}) {
  const orderItems = data.items.map(i => {
    const parts = [i.product.name]
    if (i.variant) parts.push(`（${i.variant.label}）`)
    if (i.addon) parts.push(`加${i.addon.label}`)
    return {
      productId: i.product.id,
      name: parts.join(''),
      price: (i.variant?.price ?? i.product.price) + (i.addon?.price ?? 0),
      quantity: i.quantity,
    }
  })

  await addDoc(collection(db, 'orders'), {
    name: data.name,
    phone: data.phone,
    date: data.date,
    note: data.note,
    items: orderItems,
    totalPrice: data.totalPrice,
    status: 'pending' as OrderStatus,
    createdAt: serverTimestamp(),
  })
}

export async function updateOrderStatus(orderId: string, status: OrderStatus) {
  await updateDoc(doc(db, 'orders', orderId), { status })
}

export async function deleteOrder(orderId: string) {
  await deleteDoc(doc(db, 'orders', orderId))
}

export async function getOrdersByPhone(phone: string): Promise<Order[]> {
  const q = query(collection(db, 'orders'), where('phone', '==', phone.trim()))
  const snapshot = await getDocs(q)
  const orders = snapshot.docs.map(d => ({ id: d.id, ...d.data() })) as Order[]
  return orders.sort((a, b) => (b.createdAt?.seconds ?? 0) - (a.createdAt?.seconds ?? 0))
}

export function subscribeOrders(callback: (orders: Order[]) => void) {
  const q = query(collection(db, 'orders'), orderBy('createdAt', 'desc'))
  return onSnapshot(q, snapshot => {
    const orders = snapshot.docs.map(d => ({
      id: d.id,
      ...d.data(),
    })) as Order[]
    callback(orders)
  })
}
