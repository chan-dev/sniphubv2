import { Injectable, inject } from '@angular/core';
import {
  Firestore,
  addDoc,
  collection,
  serverTimestamp,
} from '@angular/fire/firestore';
import { NewUserDTO } from '../models/user';
import { asyncScheduler, catchError, scheduled, throwError } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class UsersService {
  private db = inject(Firestore);

  createNewUser(newUser: NewUserDTO) {
    const collectionRef = collection(this.db, 'users');

    addDoc(collectionRef, {
      name: newUser.username,
      email: newUser.email,
      created_at: serverTimestamp(),
    });

    return scheduled(
      addDoc(collectionRef, {
        name: newUser.username,
        email: newUser.email,
        created_at: serverTimestamp(),
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
