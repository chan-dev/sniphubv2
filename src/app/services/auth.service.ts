import { Injectable, inject } from '@angular/core';
import {
  Auth,
  GoogleAuthProvider,
  User,
  onAuthStateChanged,
  signInWithPopup,
  signOut,
} from '@angular/fire/auth';
import { Subject, shareReplay, tap } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private auth = inject(Auth);
  private authSubject = new Subject<User | null>();

  currentUser$ = this.authSubject.asObservable().pipe(
    tap((user) => (this.currentUser = user)),
    shareReplay(1),
  );

  currentUser: User | null = null;

  constructor() {
    console.log('AuthService initialized');
    onAuthStateChanged(this.auth, (user) => {
      console.log('onAuthStateChanged', user);
      this.authSubject.next(user);
    });
  }

  login() {
    return signInWithPopup(this.auth, new GoogleAuthProvider());
  }

  logout() {
    return signOut(this.auth);
  }
}
