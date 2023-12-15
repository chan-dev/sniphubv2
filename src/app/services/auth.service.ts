import { Injectable, inject } from '@angular/core';
import {
  Auth,
  GoogleAuthProvider,
  onAuthStateChanged,
  signInWithPopup,
  signOut,
} from '@angular/fire/auth';
import { Subject, shareReplay } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private auth = inject(Auth);
  private isAuthenticatedSubject = new Subject<boolean>();
  isAuthenticated$ = this.isAuthenticatedSubject
    .asObservable()
    .pipe(shareReplay(1));

  constructor() {
    console.log('AuthService initialized');
    onAuthStateChanged(this.auth, (user) => {
      console.log('onAuthStateChanged', user);
      this.isAuthenticatedSubject.next(!!user);
    });
  }

  login() {
    return signInWithPopup(this.auth, new GoogleAuthProvider());
  }

  logout() {
    return signOut(this.auth);
  }
}
