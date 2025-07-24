import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class LocationChangeService {
  private handlers = [];
  constructor() { }

  public subscribe(handler) {
    this.handlers.push(handler);
    let isSubscribed = true;
    return () => {
      if(!isSubscribed) return;
      isSubscribed = false;
      this.handlers = this.handlers.filter(x => x !== handler)
    }
  }

  public emit() {
    if(this.handlers) this.handlers.forEach(x => x());
  }
}
