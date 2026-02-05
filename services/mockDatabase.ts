
import { db } from './firebase';
import { collection, getDocs, doc, setDoc } from 'firebase/firestore';
import { Product } from '../types';
import { MOCK_PRODUCTS } from '../constants';

const PRODUCTS_COLLECTION = 'products';

/**
 * Fetches all products from Firestore.
 * Merges Firestore products with Mock products for a rich initial experience.
 */
export const getProducts = async (): Promise<Product[]> => {
  try {
    const querySnapshot = await getDocs(collection(db, PRODUCTS_COLLECTION));
    
    const dbProducts: Product[] = [];
    querySnapshot.forEach((doc) => {
        dbProducts.push({ ...doc.data(), id: doc.id } as Product);
    });

    // Merge: Show DB products first, then mocks (filtering duplicates by name)
    const combined = [...dbProducts];
    MOCK_PRODUCTS.forEach(mock => {
        if (!combined.find(p => p.name === mock.name)) {
            combined.push(mock);
        }
    });

    return combined;
  } catch (e) {
    console.error("Error fetching products:", e);
    return MOCK_PRODUCTS; 
  }
};

/**
 * Adds a product to Firestore (Selling/Renting).
 */
export const addProduct = async (product: Product): Promise<void> => {
  try {
    const productRef = doc(db, PRODUCTS_COLLECTION, product.id);
    await setDoc(productRef, {
        ...product,
        createdAt: new Date().toISOString()
    });
    console.log("Product saved to Firestore:", product.id);
  } catch (e) {
    console.error("Error adding product:", e);
    throw e;
  }
};
