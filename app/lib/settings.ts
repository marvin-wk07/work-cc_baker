import { doc, setDoc, onSnapshot } from 'firebase/firestore'
import { db } from './firebase'

export interface OrderSettings {
  maxItemsPerOrder: number  // 0 = unlimited
}

const SETTINGS_REF = doc(db, 'settings', 'order')

export async function updateOrderSettings(data: Partial<OrderSettings>) {
  await setDoc(SETTINGS_REF, data, { merge: true })
}

export function subscribeOrderSettings(callback: (settings: OrderSettings) => void) {
  return onSnapshot(SETTINGS_REF, snap => {
    callback(snap.exists() ? (snap.data() as OrderSettings) : { maxItemsPerOrder: 0 })
  })
}
