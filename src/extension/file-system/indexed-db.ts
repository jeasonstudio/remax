import * as vscode from "vscode";
import {
  FILE_SYSTEM_DB_NAME,
  FILE_SYSTEM_OBJECTSTORE_NAME,
} from "../../constants";
import { Entry } from "./entry";

export class Transaction {
  public transaction!: IDBTransaction;
  public objectStore!: IDBObjectStore;

  public constructor(
    public readonly db: WrapperedIndexedDB,
    mode?: IDBTransactionMode,
  ) {
    this.transaction = db.indexeddb.transaction(
      [FILE_SYSTEM_OBJECTSTORE_NAME],
      mode ?? "readwrite",
    );
    this.objectStore = this.transaction.objectStore(
      FILE_SYSTEM_OBJECTSTORE_NAME,
    );
  }

  /**
   * Get entry from indexeddb
   * @param uri {vscode.Uri} uri
   * @param silent {boolean} should throw error
   */
  public async get<E extends Entry>(uri: vscode.Uri, silent: false): Promise<E>;
  public async get<E extends Entry>(
    uri: vscode.Uri,
    silent: boolean,
  ): Promise<E | undefined>;
  public async get<E extends Entry>(
    uri: vscode.Uri,
    silent: boolean,
  ): Promise<E | undefined> {
    const entryPathname = uri.path;
    const request = this.objectStore.get(entryPathname);
    return new Promise<E | undefined>((resolve, reject) => {
      request.onsuccess = (event) => {
        const entry: E | undefined = (<any>event.target).result;
        if (!silent && !entry) {
          reject(vscode.FileSystemError.FileNotFound(uri));
        } else {
          resolve(entry || undefined);
        }
      };
      request.onerror = () => {
        if (!silent) {
          reject(vscode.FileSystemError.NoPermissions(uri));
        } else {
          resolve(undefined);
        }
      };
    });
  }

  /**
   * Put entry to indexeddb
   * @param uri {vscode.Uri} uri
   * @param entry {Entry} entry
   */
  public async put<E extends Entry>(uri: vscode.Uri, entry: E): Promise<void> {
    const entryPathname = uri.path;
    const request = this.objectStore.put(entry, entryPathname);
    return new Promise<void>((resolve, reject) => {
      request.onsuccess = () => resolve();
      request.onerror = () => reject(vscode.FileSystemError.NoPermissions(uri));
    });
  }

  /**
   * Delete entry from indexeddb
   * @param uri {vscode.Uri} uri
   */
  public async delete(uri: vscode.Uri): Promise<void> {
    const entryPathname = uri.path;
    const request = this.objectStore.delete(entryPathname);
    return new Promise<void>((resolve, reject) => {
      request.onsuccess = () => resolve();
      request.onerror = () => reject(vscode.FileSystemError.NoPermissions(uri));
    });
  }

  public commit() {
    this.transaction.commit();
  }
}

export class WrapperedIndexedDB {
  public promise!: Promise<void>;
  public indexeddb!: IDBDatabase;
  public name!: string;
  public objectName!: string;

  /**
   * Check if indexeddb is available
   * @returns {boolean} is indexeddb available
   */
  public static isAvailable(): boolean {
    // In Safari's private browsing mode, indexedDB.open returns NULL.
    // In Firefox, it throws an exception.
    // In Chrome, it "just works", and clears the database when you leave the page.
    // Untested: Opera, IE.
    try {
      return (
        typeof self.indexedDB !== "undefined" &&
        null !== self.indexedDB.open("__browserfs_test__")
      );
    } catch (e) {
      return false;
    }
  }

  public constructor(dbName?: string, objectStoreName?: string) {
    this.name = dbName || FILE_SYSTEM_DB_NAME;
    this.objectName = objectStoreName || FILE_SYSTEM_OBJECTSTORE_NAME;
  }

  public async prepare() {
    // const hasCreated = !!(await self.indexedDB.databases()).find(
    //   (item) => item.name === this.name && item.version === 1,
    // );
    const request = self.indexedDB.open(this.name, 1);
    return new Promise<void>((resolve, reject) => {
      request.onerror = () => {
        reject(
          vscode.FileSystemError.Unavailable("IndexedDB is not available"),
        );
      };
      request.onsuccess = (event) => {
        const db: IDBDatabase = (<any>event.target).result;
        this.indexeddb = db;
        resolve();
      };
      request.onupgradeneeded = (event) => {
        // means the database is not exist or should update
        const db: IDBDatabase = (<any>event.target).result;
        this.indexeddb = db;
        // Huh. This should never happen; we're at version 1. Why does another database exist?
        if (db.objectStoreNames.contains(this.objectName)) {
          db.deleteObjectStore(this.objectName);
        }
        db.createObjectStore(this.objectName);
        (<any>event.target).transaction.commit();
      };
    });
  }

  // create a transaction
  public async transaction(mode?: IDBTransactionMode) {
    return new Transaction(this, mode);
  }
}
