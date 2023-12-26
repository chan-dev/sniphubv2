import { Injectable, inject } from '@angular/core';
import {
  Firestore,
  doc,
  serverTimestamp,
  setDoc,
} from '@angular/fire/firestore';
import { NewUserDTO } from '../models/user';
import { defer } from 'rxjs';
import { wrapPromiseWithErrorHandler } from '../utils/promise';

@Injectable({ providedIn: 'root' })
export class UsersService {
  private db = inject(Firestore);

  createNewUser(userId: string, newUser: NewUserDTO) {
    const docRef = doc(this.db, 'users', userId);

    return defer(() => {
      return wrapPromiseWithErrorHandler(setDoc)(docRef, {
        username: newUser.username,
        email: newUser.email,
        uid: newUser.uid,
        created_at: serverTimestamp(),
        photoUrl: newUser.photoUrl,
      });
    });
  }
}
