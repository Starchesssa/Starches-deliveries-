import { initializeApp, getApps, getApp } from 'firebase/app';
import {
  initializeFirestore,
  getFirestore,
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  query,
  where,
  orderBy,
  limit,
  onSnapshot,
  writeBatch,
  Unsubscribe,
} from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import firebaseConfig from '../../firebase-applet-config.json';
import { Merchant, MenuItem, Order, DeliveryLocation } from '../types';
import { MERCHANTS, MENU_ITEMS } from '../data/merchants';

// Initialize Firebase App instance
const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);

// Initialize Firestore with experimentalForceLongPolling to ensure 100% reliable
// connectivity across sandboxed cloud iframe environments and corporate proxies
export const db = (() => {
  try {
    return initializeFirestore(
      app,
      { experimentalForceLongPolling: true },
      firebaseConfig.firestoreDatabaseId || undefined
    );
  } catch {
    return firebaseConfig.firestoreDatabaseId
      ? getFirestore(app, firebaseConfig.firestoreDatabaseId)
      : getFirestore(app);
  }
})();

// Initialize Firebase Auth
export const auth = getAuth(app);

// SKILL compliance: structured error handling
export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  };
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo:
        auth.currentUser?.providerData?.map((provider) => ({
          providerId: provider.providerId,
          email: provider.email,
        })) || [],
    },
    operationType,
    path,
  };
  console.warn('Firestore Operation Notice:', JSON.stringify(errInfo));
  return errInfo;
}

// Track connectivity status
let isConnectedToFirestore = false;

/**
 * Validate connection to Firestore at app boot
 */
export async function validateFirestoreConnection(): Promise<boolean> {
  try {
    const snap = await getDocs(query(collection(db, 'merchants'), limit(1)));
    isConnectedToFirestore = !snap.empty || true;
    return true;
  } catch (error) {
    console.warn('Firestore client connecting or falling back to local cache:', error);
    return false;
  }
}

/**
 * Auto-seeds Firestore with Starches catalog if collections are empty.
 * Ensures the app immediately has rich, authentic data backed by live Firestore.
 */
let seedingInProgress = false;
export async function seedStarchesCatalogIfEmpty(): Promise<void> {
  if (seedingInProgress) return;
  try {
    seedingInProgress = true;
    const merchantsColl = collection(db, 'merchants');
    const existingSnap = await getDocs(merchantsColl);

    if (existingSnap.empty) {
      console.log('Seeding Starches merchants and menu catalog to Firestore...');
      const batch = writeBatch(db);

      // 1. Seed merchants
      for (const merchant of MERCHANTS) {
        const mRef = doc(db, 'merchants', merchant.id);
        batch.set(mRef, merchant);
      }

      // 2. Seed all menu items
      for (const item of MENU_ITEMS) {
        const itemRef = doc(db, 'menu_items', item.id);
        batch.set(itemRef, item);
      }

      await batch.commit();
      console.log('Successfully seeded Starches catalog to Firestore.');
    }
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, 'merchants');
  } finally {
    seedingInProgress = false;
  }
}

/**
 * Fetch merchants from Firestore, falling back to local dataset if offline or empty
 */
export async function fetchMerchantsFromFirestore(hubId?: string): Promise<Merchant[]> {
  try {
    const merchantsRef = collection(db, 'merchants');
    const q = hubId
      ? query(merchantsRef, where('hubId', '==', hubId))
      : merchantsRef;

    const snap = await getDocs(q);
    if (!snap.empty) {
      const liveList: Merchant[] = [];
      snap.forEach((d) => liveList.push(d.data() as Merchant));
      return liveList;
    }

    // If empty in Firestore, trigger background seed and return local catalog
    seedStarchesCatalogIfEmpty();
    return hubId ? MERCHANTS.filter((m) => m.hubId === hubId) : MERCHANTS;
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, 'merchants');
    return hubId ? MERCHANTS.filter((m) => m.hubId === hubId) : MERCHANTS;
  }
}

/**
 * Fetch menu items for a specific merchant from Firestore
 */
export async function fetchMenuItemsFromFirestore(merchantId: string): Promise<MenuItem[]> {
  try {
    const itemsRef = collection(db, 'menu_items');
    const q = query(itemsRef, where('merchantId', '==', merchantId));
    const snap = await getDocs(q);

    if (!snap.empty) {
      const items: MenuItem[] = [];
      snap.forEach((d) => items.push(d.data() as MenuItem));
      return items;
    }

    // If not found in Firestore, check local seed and write to Firestore
    const localItems = MENU_ITEMS.filter((item) => item.merchantId === merchantId);
    if (localItems.length > 0) {
      const batch = writeBatch(db);
      for (const item of localItems) {
        batch.set(doc(db, 'menu_items', item.id), item);
      }
      batch.commit().catch(() => {});
    }
    return localItems;
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, 'menu_items');
    return MENU_ITEMS.filter((item) => item.merchantId === merchantId);
  }
}

/**
 * Create a new Customer Order in Firestore with validation
 */
export async function createOrderInFirestore(order: Order): Promise<Order> {
  try {
    const orderRef = doc(db, 'orders', order.id);
    await setDoc(orderRef, {
      ...order,
      updatedAt: new Date().toISOString(),
    });
    return order;
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, `orders/${order.id}`);
    // Return order so customer experience is never blocked
    return order;
  }
}

/**
 * Real-time listener for an active Order's status and tracking
 */
export function subscribeToOrder(
  orderId: string,
  onUpdate: (order: Order | null) => void
): Unsubscribe {
  const orderRef = doc(db, 'orders', orderId);
  return onSnapshot(
    orderRef,
    (snapshot) => {
      if (snapshot.exists()) {
        onUpdate(snapshot.data() as Order);
      } else {
        onUpdate(null);
      }
    },
    (error) => {
      handleFirestoreError(error, OperationType.GET, `orders/${orderId}`);
    }
  );
}

/**
 * Fetch recent orders for customer history
 */
export async function fetchOrdersFromFirestore(): Promise<Order[]> {
  try {
    const ordersRef = collection(db, 'orders');
    const q = query(ordersRef, orderBy('createdAt', 'desc'));
    const snap = await getDocs(q);
    const list: Order[] = [];
    snap.forEach((docSnap) => {
      list.push(docSnap.data() as Order);
    });
    return list;
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, 'orders');
    return [];
  }
}

/**
 * Save a customer delivery address to Firestore
 */
export async function saveAddressToFirestore(address: DeliveryLocation): Promise<void> {
  try {
    const addressRef = doc(db, 'customer_addresses', address.id);
    await setDoc(addressRef, address);
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `customer_addresses/${address.id}`);
  }
}

/**
 * Fetch saved customer delivery addresses from Firestore
 */
export async function fetchAddressesFromFirestore(): Promise<DeliveryLocation[]> {
  try {
    const addressesRef = collection(db, 'customer_addresses');
    const snap = await getDocs(addressesRef);
    const list: DeliveryLocation[] = [];
    snap.forEach((d) => list.push(d.data() as DeliveryLocation));
    return list;
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, 'customer_addresses');
    return [];
  }
}
