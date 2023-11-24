import { Injectable, inject } from '@angular/core';
import {
  Firestore,
  collection,
  collectionData,
  query,
  where,
} from '@angular/fire/firestore';
import { map } from 'rxjs';

import { Group } from '../models/group';

@Injectable({ providedIn: 'root' })
export class GroupsService {
  private db = inject(Firestore);

  getGroups(id: string) {
    const queryRef = query(
      collection(this.db, 'groups'),
      where('user_id', '==', id),
    );

    return collectionData(queryRef, {
      idField: 'id',
    }).pipe(
      map((groups) => {
        return groups as Group[];
      }),
    );
  }
}
