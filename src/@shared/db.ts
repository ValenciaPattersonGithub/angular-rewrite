import Dexie, { Table } from 'dexie';
import { Injectable } from "@angular/core";


export interface DbCacheItem 
{
    cacheKey: string,
    value: any,
    expiresAt: Date | null
}

@Injectable({
  providedIn: 'root',
})
export class AppDB extends Dexie {
    cacheItems!: Table<DbCacheItem, string>;
  
    constructor() {
      super('FuseCache');
      this.version(1).stores({
        cacheItems: 'cacheKey',
      });
    }
  }
  