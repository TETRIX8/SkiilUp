// src/lib/sync.js - sync queued requests when back online
import { queueGetAll, queueRemove } from './db.js';
export class SyncManager {
  constructor(){ this.online = navigator.onLine; this.running = false; this._listen(); }
  _listen(){
    window.addEventListener('online', ()=>{ this.online = true; this.sync(); });
    window.addEventListener('offline', ()=>{ this.online = false; });
  }
  async sync(){ if(this.running || !this.online) return; this.running = true; try{
    const items = await queueGetAll();
    for(const item of items){ try{ await fetch(item.url, item.config); await queueRemove(item.id); } catch(_){} }
  } finally{ this.running = false; } }
}
export const syncManager = new SyncManager();
