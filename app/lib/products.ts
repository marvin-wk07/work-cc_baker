import {
  collection,
  addDoc,
  deleteDoc,
  doc,
  getDoc,
  updateDoc,
  onSnapshot,
  serverTimestamp,
  getDocs,
  writeBatch,
  deleteField,
} from 'firebase/firestore'
import { db } from './firebase'
import { Product, seedProducts } from '../data/products'

export async function addFirestoreProduct(product: Omit<Product, 'id'>): Promise<string> {
  const data: Record<string, unknown> = { ...product, active: true, createdAt: serverTimestamp() }
  // Firestore doesn't accept undefined values
  Object.keys(data).forEach(k => data[k] === undefined && delete data[k])
  const ref = await addDoc(collection(db, 'products'), data)
  return ref.id
}

export async function toggleProductActive(id: string, active: boolean) {
  await updateDoc(doc(db, 'products', id), { active })
}

export async function trashFirestoreProduct(id: string) {
  const ref = doc(db, 'products', id)
  const trashRef = doc(db, 'productTrash', id)
  const snap = await getDoc(ref)
  if (!snap.exists()) return
  const batch = writeBatch(db)
  batch.set(trashRef, { ...snap.data(), trashedAt: serverTimestamp() })
  batch.delete(ref)
  await batch.commit()
}

export async function restoreFirestoreProduct(id: string) {
  const trashRef = doc(db, 'productTrash', id)
  const ref = doc(db, 'products', id)
  const snap = await getDoc(trashRef)
  if (!snap.exists()) return
  const { trashedAt: _, ...data } = snap.data() as Record<string, unknown>
  const batch = writeBatch(db)
  batch.set(ref, data)
  batch.delete(trashRef)
  await batch.commit()
}

export async function permanentDeleteFirestoreProduct(id: string) {
  await deleteDoc(doc(db, 'productTrash', id))
}

export async function clearProductTrash() {
  const snapshot = await getDocs(collection(db, 'productTrash'))
  const batch = writeBatch(db)
  snapshot.docs.forEach(d => batch.delete(d.ref))
  await batch.commit()
}

export function subscribeProductTrash(callback: (products: Product[]) => void) {
  return onSnapshot(collection(db, 'productTrash'), snapshot => {
    const products = snapshot.docs.map(d => ({ id: d.id, ...d.data() })) as Product[]
    callback(products)
  })
}

export async function updateFirestoreProduct(id: string, product: Omit<Product, 'id'>) {
  const data: Record<string, unknown> = { ...product }
  // Convert undefined optional fields to deleteField() so Firestore removes them
  if (product.minQty === undefined) data.minQty = deleteField()
  if (product.maxQty === undefined) data.maxQty = deleteField()
  if (product.capacity === undefined) data.capacity = deleteField()
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

// ── Product Groups ────────────────────────────────────────────

export interface GroupProduct {
  originalId: string
  name: string
  description: string
  price: number
  category: string
  icon: string
  bgColor: string
  variants?: { label: string; price: number }[]
  addons?: { label: string; price: number }[]
  minQty?: number
  maxQty?: number
  capacity?: number
}

export interface ProductGroup {
  id: string
  name: string
  products?: GroupProduct[]      // new format
  productIds?: string[]          // old format (backward compat)
}

export async function saveProductGroup(name: string, products: Product[]) {
  const groupProducts: GroupProduct[] = products.map(p => {
    const gp: GroupProduct = {
      originalId: p.id,
      name: p.name,
      description: p.description,
      price: p.price,
      category: p.category,
      icon: p.icon,
      bgColor: p.bgColor,
    }
    if (p.variants?.length) gp.variants = p.variants
    if (p.addons?.length) gp.addons = p.addons
    if (p.minQty !== undefined) gp.minQty = p.minQty
    if (p.maxQty !== undefined) gp.maxQty = p.maxQty
    if (p.capacity !== undefined) gp.capacity = p.capacity
    return gp
  })
  await addDoc(collection(db, 'productGroups'), { name, products: groupProducts, createdAt: serverTimestamp() })
}

export async function deleteProductGroup(groupId: string) {
  await deleteDoc(doc(db, 'productGroups', groupId))
}

export function subscribeProductGroups(callback: (groups: ProductGroup[]) => void) {
  return onSnapshot(collection(db, 'productGroups'), snapshot => {
    const groups = snapshot.docs.map(d => ({ id: d.id, ...d.data() })) as ProductGroup[]
    callback(groups.sort((a, b) => a.name.localeCompare(b.name, 'zh-Hant')))
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
