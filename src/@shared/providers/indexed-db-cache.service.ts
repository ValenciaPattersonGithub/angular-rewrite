import { Injectable } from '@angular/core';
import { AppDB } from '../db';
import moment from 'moment';
import { DexieError } from 'dexie';

@Injectable()
export class IndexedDbCacheService {
  constructor(private db: AppDB) {}

  async getOrAdd<T>(cacheKey: string, addFunc: () => Promise<T>): Promise<T>;
  async getOrAdd<T>(
    cacheKey: string,
    addFunc: () => Promise<T>,
    cacheDurationInMs: number
  ): Promise<T>;
  async getOrAdd<T>(
    cacheKey: string,
    addFunc: () => Promise<T>,
    cacheDurationInMs?: number
  ): Promise<T> {
    let cacheItem = await this.db.cacheItems
      .where({ cacheKey })
      .first()
      .catch((err: DexieError) => console.error(err.message));

    if (cacheItem && cacheItem.expiresAt && cacheItem.expiresAt < new Date()) {
      await this.remove(cacheKey);
      cacheItem = null;
    }

    if (!cacheItem) {
      const value: T = await addFunc();

      let expiresAt: Date | null = null;
      if (cacheDurationInMs > 0)
        expiresAt = moment().add(cacheDurationInMs, 'milliseconds').toDate();

      cacheItem = { cacheKey, value, expiresAt };

      await this.db.cacheItems
        .add(cacheItem)
        .catch((err: DexieError) => console.error(err.message));
    }

    return cacheItem.value;
  }

  async remove(cacheKey: string) {
    await this.db.cacheItems.delete(cacheKey);
  }
}
