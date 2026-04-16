import {
  collection,
  addDoc,
  deleteDoc,
  doc,
  updateDoc,
  onSnapshot,
  serverTimestamp,
  getDocs,
} from 'firebase/firestore'
import { db } from './firebase'
import { Product, seedProducts } from '../data/products'

export async function addFirestoreProduct(product: Omit<Product, 'id'>) {
  await addDoc(collection(db, 'products'), {
    ...product,
    createdAt: serverTimestamp(),
  })
}

export async function updateFirestoreProduct(id: string, product: Omit<Product, 'id'>) {
  await updateDoc(doc(db, 'products', id), { ...product })
}

export async function deleteFirestoreProduct(productId: string) {
  await deleteDoc(doc(db, 'products', productId))
}

export function subscribeFirestoreProducts(callback: (products: Product[]) => void) {
  return onSnapshot(collection(db, 'products'), snapshot => {
    const products = snapshot.docs.map(d => ({
      id: d.id,
      ...d.data(),
    })) as Product[]
    callback(products)
  })
}

export async function seedMenuProducts(): Promise<number> {
  const existing = await getDocs(collection(db, 'products'))
  if (!existing.empty) return 0

  for (const product of seedProducts) {
    await addDoc(collection(db, 'products'), {
      ...product,
      createdAt: serverTimestamp(),
    })
  }
  return seedProducts.length
}
