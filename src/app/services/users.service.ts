import { Injectable, inject } from '@angular/core';
import {
  Firestore,
  collection,
  doc,
  documentId,
  getDocs,
  query,
  serverTimestamp,
  setDoc,
  where,
  writeBatch,
} from '@angular/fire/firestore';
import { NewUserDTO } from '../models/user';
import { asyncScheduler, catchError, scheduled, throwError } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class UsersService {
  private db = inject(Firestore);

  createNewUser(userId: string, newUser: NewUserDTO) {
    const docRef = doc(this.db, 'users', userId);

    return scheduled(
      setDoc(docRef, {
        name: newUser.username,
        email: newUser.email,
        created_at: serverTimestamp(),
        photoUrl: newUser.photoUrl,
      }),
      asyncScheduler,
    ).pipe(
      // FIXME: error is not being caught from firstore addDoc
      catchError((err) => {
        return throwError(() => err);
      }),
    );
  }
}
