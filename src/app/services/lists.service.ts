import { Injectable, inject } from '@angular/core';
import {
  Firestore,
  collection,
  collectionData,
  doc,
  docData,
  query,
  where,
} from '@angular/fire/firestore';
import { map } from 'rxjs';

import { List } from '../models/list';

@Injectable({ providedIn: 'root' })
export class ListsService {
  private db = inject(Firestore);

  getEmbeddedList(listId: string) {
    return docData(doc(this.db, 'lists', listId), {
      idField: 'id',
    }).pipe(
      map((list) => {
        return list as List;
      }),
    );
  }

  getLists(groupId: string) {
    const queryRef = query(
      collection(this.db, 'lists'),
      where('group_id', '==', groupId),
    );

    return collectionData(queryRef, {
      idField: 'id',
    }).pipe(
      map((lists) => {
        return lists as List[];
      }),
    );
  }
}
