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

export async function addFirestoreProduct(product: Omit<Product, 'id'>): Promise<string> {
  const data: Record<string, unknown> = { ...product, createdAt: serverTimestamp() }
  // Firestore doesn't accept undefined values
  Object.keys(data).forEach(k => data[k] === undefined && delete data[k])
  const ref = await addDoc(collection(db, 'products'), data)
  return ref.id
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
  products: GroupProduct[]
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
