import {
  collection,
  addDoc,
  deleteDoc,
  doc,
  updateDoc,
  onSnapshot,
  serverTimestamp,
  getDocs,
  deleteField,
} from 'firebase/firestore'
import { db } from './firebase'
import { Product, seedProducts } from '../data/products'

export async function addFirestoreProduct(
  product: Omit<Product, 'id'> & { minQty?: number | null; maxQty?: number | null }
) {
  const data: Record<string, unknown> = { ...product, createdAt: serverTimestamp() }
  if (data.minQty == null) delete data.minQty
  if (data.maxQty == null) delete data.maxQty
  await addDoc(collection(db, 'products'), data)
}

export async function updateFirestoreProduct(
  id: string,
  product: Omit<Product, 'id'> & { minQty?: number | null; maxQty?: number | null }
) {
  const data: Record<string, unknown> = { ...product }
  // Explicitly remove optional fields when cleared
  if ('minQty' in data && data.minQty == null) data.minQty = deleteField()
  if ('maxQty' in data && data.maxQty == null) data.maxQty = deleteField()
  await updateDoc(doc(db, 'products', id), data)
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
