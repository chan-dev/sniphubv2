import { Injectable, inject } from '@angular/core';
import {
  Firestore,
  addDoc,
  collection,
  collectionData,
  deleteDoc,
  doc,
  docData,
  orderBy,
  query,
  updateDoc,
  where,
} from '@angular/fire/firestore';
import { defer, map } from 'rxjs';

import { EditListDTO, List, NewListWithTimestampDTO } from '../models/list';
import { wrapPromiseWithErrorHandler } from '../utils/promise';

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

  getLists(uid: string) {
    const queryRef = query(
      collection(this.db, 'lists'),
      where('uid', '==', uid),
      orderBy('created_at', 'asc'),
    );

    return collectionData(queryRef, {
      idField: 'id',
    }).pipe(
      map((lists) => {
        return lists as List[];
      }),
    );
  }

  createList(newList: NewListWithTimestampDTO) {
    const collectionRef = collection(this.db, `lists`);

    return defer(() => {
      let newListDocPromise = wrapPromiseWithErrorHandler(addDoc)(
        collectionRef,
        newList,
      );
      return newListDocPromise;
    });
  }

  editList(list: EditListDTO) {
    const listRef = doc(this.db, `lists/${list.id}`);

    return defer(async () => {
      const updateListDocPromise = wrapPromiseWithErrorHandler(updateDoc)(
        listRef,
        {
          name: list.name,
        },
      );
      return updateListDocPromise;
    });
  }

  deleteList(id: string) {
    const listRef = doc(this.db, `lists/${id}`);

    return defer(() => {
      const deleteListDocPromise =
        wrapPromiseWithErrorHandler(deleteDoc)(listRef);
      return deleteListDocPromise;
    });
  }
}
