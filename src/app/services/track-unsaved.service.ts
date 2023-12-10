import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class TrackUnsavedService {
  private readonly hasUnsavedSubject = new BehaviorSubject<boolean>(false);
  hasUnsaved$ = this.hasUnsavedSubject.asObservable();

  trackChange(hasChanged: boolean) {
    this.hasUnsavedSubject.next(hasChanged);
  }

  reset() {
    this.hasUnsavedSubject.next(false);
  }
}
