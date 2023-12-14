import { Injectable, inject } from '@angular/core';
import {
  Firestore,
  addDoc,
  collection,
  collectionData,
  deleteDoc,
  doc,
  docData,
  query,
  serverTimestamp,
  updateDoc,
  where,
} from '@angular/fire/firestore';
import { asyncScheduler, catchError, map, scheduled, throwError } from 'rxjs';

import { EditListDTO, List, NewListDTO } from '../models/list';

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
    );

    return collectionData(queryRef, {
      idField: 'id',
    }).pipe(
      map((lists) => {
        return lists as List[];
      }),
    );
  }

  createList(newList: NewListDTO) {
    const collectionRef = collection(this.db, `lists`);

    const newListDoc = addDoc(collectionRef, {
      name: newList.name,
      uid: newList.uid,
      created_at: serverTimestamp(),
    });

    // return defer(async () => {
    //   return await newListDoc;
    // });

    return scheduled(newListDoc, asyncScheduler).pipe(
      // FIXME: error is not being caught from firstore addDoc
      catchError((err) => {
        return throwError(() => err);
      }),
    );
  }

  editList(list: EditListDTO) {
    const listRef = doc(this.db, `lists/${list.id}`);
    const updateListDoc = updateDoc(listRef, {
      name: list.name,
    });
    return scheduled(updateListDoc, asyncScheduler).pipe(
      // FIXME: error is not being caught from firstore addDoc
      catchError((err) => {
        return throwError(() => err);
      }),
    );
  }

  deleteList(id: string) {
    const listRef = doc(this.db, `lists/${id}`);
    const deleteListDoc = deleteDoc(listRef);
    return scheduled(deleteListDoc, asyncScheduler).pipe(
      // FIXME: error is not being caught from firstore addDoc
      catchError((err) => {
        return throwError(() => err);
      }),
    );
  }
}
