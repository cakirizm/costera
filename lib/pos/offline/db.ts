/**
 * The terminal's local database.
 *
 * One place to open it: two modules opening the same IndexedDB name with
 * different versions is a deadlock waiting for the first venue that leaves an
 * old tab open beside a new one.
 */

const DB_NAME = "costera-pos";
const DB_VERSION = 2;

export const OUTBOX_STORE = "outbox";
export const SNAPSHOT_STORE = "snapshots";

export function isSupported(): boolean {
  return typeof indexedDB !== "undefined";
}

export function openDatabase(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(OUTBOX_STORE)) {
        db.createObjectStore(OUTBOX_STORE, { keyPath: "id" });
      }
      if (!db.objectStoreNames.contains(SNAPSHOT_STORE)) {
        db.createObjectStore(SNAPSHOT_STORE, { keyPath: "key" });
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

export function run<T>(
  store: string,
  mode: IDBTransactionMode,
  work: (target: IDBObjectStore) => IDBRequest<T>,
): Promise<T> {
  return openDatabase().then(
    (db) =>
      new Promise<T>((resolve, reject) => {
        const tx = db.transaction(store, mode);
        const request = work(tx.objectStore(store));
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
        tx.oncomplete = () => db.close();
      }),
  );
}
