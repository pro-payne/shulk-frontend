import { Injectable } from '@angular/core';
import { PreloadingStrategy } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class CustomPreloadService implements PreloadingStrategy {
  preload(route: import("@angular/router").Route, fn: () => import("rxjs").Observable<any>): import("rxjs").Observable<any> {
    throw new Error("Method not implemented.");
  }

  constructor() { }
}
