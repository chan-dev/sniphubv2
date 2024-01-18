import { Injectable } from '@angular/core';
import { BehaviorSubject, map, shareReplay } from 'rxjs';

export type ChangeType = 'None' | 'Pending' | 'Cancelled' | 'Saved';

@Injectable({
  providedIn: 'root',
})
export class TrackUnsavedService {
  private readonly hasUnsavedSubject = new BehaviorSubject<ChangeType>('None');

  state$ = this.hasUnsavedSubject.asObservable().pipe(shareReplay(1));
  hasUnsaved$ = this.state$.pipe(map((value) => value === 'Pending'));

  trackChange(changeType: ChangeType) {
    this.hasUnsavedSubject.next(changeType);
  }

  changePending() {
    this.trackChange('Pending');
  }

  changeCancelled() {
    this.trackChange('Cancelled');
  }

  changeSaved() {
    this.trackChange('Saved');
  }
}
