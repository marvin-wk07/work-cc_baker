import {
  collection,
  addDoc,
  doc,
  updateDoc,
  deleteDoc,
  query,
  orderBy,
  onSnapshot,
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
  const orderItems = data.items.map(i => ({
    productId: i.product.id,
    name: i.variant ? `${i.product.name}（${i.variant.label}）` : i.product.name,
    price: i.variant?.price ?? i.product.price,
    quantity: i.quantity,
  }))

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
