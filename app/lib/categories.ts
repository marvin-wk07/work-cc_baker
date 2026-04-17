import {
  collection,
  addDoc,
  deleteDoc,
  doc,
  updateDoc,
  onSnapshot,
  serverTimestamp,
} from 'firebase/firestore'
import { db } from './firebase'

export interface Category {
  id: string
  name: string
  order: number
}

export async function addCategory(name: string, order: number) {
  await addDoc(collection(db, 'categories'), { name, order, createdAt: serverTimestamp() })
}

export async function updateCategory(id: string, name: string) {
  await updateDoc(doc(db, 'categories', id), { name })
}

export async function deleteCategory(id: string) {
  await deleteDoc(doc(db, 'categories', id))
}

export function subscribeCategories(callback: (cats: Category[]) => void) {
  return onSnapshot(collection(db, 'categories'), snapshot => {
    const cats = snapshot.docs.map(d => ({ id: d.id, ...d.data() })) as Category[]
    callback(cats.sort((a, b) => a.order - b.order))
  })
}

// Default category names for seeding
export const DEFAULT_CATEGORY_NAMES = [
  '歐式麵包', '餐包', '老麵系列', '吐司', '手撕麵包', '包子饅頭', '特色',
]
