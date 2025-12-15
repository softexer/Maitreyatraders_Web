import { Injectable } from "@angular/core";

@Injectable({
  providedIn: "root",
})
export class WindowService {
  static windowRef: any;

  constructor() { }

  get windowRef() {
    return window;
  }
  
}
