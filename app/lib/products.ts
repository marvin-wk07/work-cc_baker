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

export async function addFirestoreProduct(product: Omit<Product, 'id'>) {
  const data: Record<string, unknown> = { ...product, createdAt: serverTimestamp() }
  // Firestore doesn't accept undefined values
  Object.keys(data).forEach(k => data[k] === undefined && delete data[k])
  await addDoc(collection(db, 'products'), data)
}

export async function updateFirestoreProduct(id: string, product: Omit<Product, 'id'>) {
  const data: Record<string, unknown> = { ...product }
  // Convert undefined optional fields to deleteField() so Firestore removes them
  if (product.minQty === undefined) data.minQty = deleteField()
  if (product.maxQty === undefined) data.maxQty = deleteField()
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
