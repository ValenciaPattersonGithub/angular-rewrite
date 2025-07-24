import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
interface Scripts {
  name: string;
  src: string;
}

@Injectable({
  providedIn: 'root',
})
export class ScriptService {
  scripts$: BehaviorSubject<{}> = new BehaviorSubject(null);
  scripts: any = {};
  constructor() {}

  loadScript(url: string) {
    this.scripts = {
      loaded: false,
      src: url,
    };
    return new Promise((resolve, reject) => {
      // load script
      const script = document.createElement('script');
      script.type = 'text/javascript';
      script.src = this.scripts.src;
      script.onload = () => {
        this.scripts.loaded = true;
        this.scripts$.next(this.scripts);
        resolve({ script: name, loaded: true, status: 'Loaded' });
      };
      script.onerror = (error: any) =>
        resolve({ script: name, loaded: false, status: 'Loaded' });
      document.getElementsByTagName('head')[0].appendChild(script);
    });
  }
}
