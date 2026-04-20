import {
  collection,
  doc,
  getDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  onSnapshot,
  getDocs,
  writeBatch,
  runTransaction,
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
  shippingDateId?: string
  note: string
  items: { productId: string; name: string; price: number; quantity: number }[]
  totalPrice: number
  totalCapacity?: number
  status: OrderStatus
  createdAt: Timestamp | null
}

export async function saveOrder(data: {
  name: string
  phone: string
  date: string
  shippingDateId: string
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

  const dateRef = doc(db, 'shippingDates', data.shippingDateId)
  const orderRef = doc(collection(db, 'orders'))

  // Total capacity of this order
  const orderCapacity = data.items.reduce(
    (sum, i) => sum + (i.product.capacity ?? 10) * i.quantity, 0
  )

  await runTransaction(db, async (transaction) => {
    const dateDoc = await transaction.get(dateRef)
    if (!dateDoc.exists()) throw new Error('出貨日期不存在，請重新選擇')

    const raw = dateDoc.data()
    // backward-compat: support old field names
    const maxCapacity: number = raw.maxCapacity ?? raw.maxOrders ?? 0
    const usedCapacity: number = raw.usedCapacity ?? raw.orderCount ?? 0

    if (usedCapacity + orderCapacity > maxCapacity) {
      throw new Error('此出貨日期烘培能量已不足，請選擇其他日期或減少商品數量')
    }

    transaction.set(orderRef, {
      name: data.name,
      phone: data.phone,
      date: data.date,
      shippingDateId: data.shippingDateId,
      note: data.note,
      items: orderItems,
      totalPrice: data.totalPrice,
      totalCapacity: orderCapacity,
      status: 'pending' as OrderStatus,
      createdAt: serverTimestamp(),
    })

    transaction.update(dateRef, { usedCapacity: usedCapacity + orderCapacity })
  })
}

export async function updateOrderStatus(orderId: string, status: OrderStatus) {
  await updateDoc(doc(db, 'orders', orderId), { status })
}

export async function trashOrder(orderId: string) {
  const orderRef = doc(db, 'orders', orderId)
  const trashRef = doc(db, 'orderTrash', orderId)

  await runTransaction(db, async (tx) => {
    // ── All reads first ──
    const orderDoc = await tx.get(orderRef)
    if (!orderDoc.exists()) return
    const data = orderDoc.data()
    const capacity: number = data.totalCapacity ?? 0
    const shippingDateId: string | undefined = data.shippingDateId

    let usedCapacity: number | null = null
    let dateRef = null
    if (shippingDateId && capacity > 0) {
      dateRef = doc(db, 'shippingDates', shippingDateId)
      const dateDoc = await tx.get(dateRef)
      if (dateDoc.exists()) usedCapacity = dateDoc.data().usedCapacity ?? 0
    }

    // ── All writes after ──
    tx.set(trashRef, { ...data, trashedAt: serverTimestamp() })
    tx.delete(orderRef)
    if (dateRef !== null && usedCapacity !== null) {
      tx.update(dateRef, { usedCapacity: Math.max(0, usedCapacity - capacity) })
    }
  })
}

export async function restoreOrder(orderId: string) {
  const trashRef = doc(db, 'orderTrash', orderId)
  const orderRef = doc(db, 'orders', orderId)

  await runTransaction(db, async (tx) => {
    // ── All reads first ──
    const trashDoc = await tx.get(trashRef)
    if (!trashDoc.exists()) return
    const { trashedAt: _, ...data } = trashDoc.data() as Record<string, unknown>
    const capacity: number = (data.totalCapacity as number) ?? 0
    const shippingDateId = data.shippingDateId as string | undefined

    let usedCapacity: number | null = null
    let dateRef = null
    if (shippingDateId && capacity > 0) {
      dateRef = doc(db, 'shippingDates', shippingDateId)
      const dateDoc = await tx.get(dateRef)
      if (dateDoc.exists()) usedCapacity = dateDoc.data().usedCapacity ?? 0
    }

    // ── All writes after ──
    tx.set(orderRef, data)
    tx.delete(trashRef)
    if (dateRef !== null && usedCapacity !== null) {
      tx.update(dateRef, { usedCapacity: usedCapacity + capacity })
    }
  })
}

export async function permanentDeleteOrder(orderId: string) {
  await deleteDoc(doc(db, 'orderTrash', orderId))
}

export async function clearAllTrash() {
  const snapshot = await getDocs(collection(db, 'orderTrash'))
  const batch = writeBatch(db)
  snapshot.docs.forEach(d => batch.delete(d.ref))
  await batch.commit()
}

export function subscribeTrashOrders(callback: (orders: Order[]) => void) {
  const q = query(collection(db, 'orderTrash'), orderBy('trashedAt', 'desc'))
  return onSnapshot(q, snapshot => {
    const orders = snapshot.docs.map(d => ({ id: d.id, ...d.data() })) as Order[]
    callback(orders)
  })
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
    const orders = snapshot.docs.map(d => ({ id: d.id, ...d.data() })) as Order[]
    callback(orders)
  })
}
