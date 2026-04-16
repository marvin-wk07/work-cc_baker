import {
  collection,
  addDoc,
  deleteDoc,
  doc,
  onSnapshot,
  serverTimestamp,
} from 'firebase/firestore'
import { db } from './firebase'
import { Product } from '../data/products'

export async function addFirestoreProduct(product: Omit<Product, 'id'>) {
  await addDoc(collection(db, 'products'), {
    ...product,
    createdAt: serverTimestamp(),
  })
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
