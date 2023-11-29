import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class TrackUnsavedService {
  hasUnsavedChanges = false;

  trackChange(before: string, after: string) {
    this.hasUnsavedChanges = before !== after;
  }

  reset() {
    this.hasUnsavedChanges = false;
  }
}
