import { Injectable, inject } from '@angular/core';
import {
  Auth,
  GoogleAuthProvider,
  User,
  getAdditionalUserInfo,
  onAuthStateChanged,
  signInWithPopup,
  signOut,
} from '@angular/fire/auth';
import { Subject, shareReplay, tap } from 'rxjs';

import { UsersService } from './users.service';
import { NewUserDTO } from '../models/user';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private auth = inject(Auth);
  private authSubject = new Subject<User | null>();

  private usersService = inject(UsersService);

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
    return this.signInWithGoogle();
  }

  register() {
    return this.signInWithGoogle();
  }

  /**
   * Using single sign on blurs the line between creating a new user and signing in.
   *
   * We have to differentiate if it's the first time the user has signed in, only then
   * we create a new user document.
   */
  async signInWithGoogle() {
    const userCredential = await signInWithPopup(
      this.auth,
      new GoogleAuthProvider(),
    );
    const additionalUserInfo = getAdditionalUserInfo(userCredential);

    if (additionalUserInfo?.isNewUser) {
      const newUser: NewUserDTO = {
        email: userCredential.user.email || '',
        uid: userCredential.user.uid,
        username: userCredential.user.displayName || '',
        photoUrl: userCredential.user.photoURL || '',
      };

      await this.createNewUser(newUser.uid, newUser);
    }
  }

  logout() {
    return signOut(this.auth);
  }

  private createNewUser(newUserId: string, newUser: NewUserDTO) {
    return this.usersService.createNewUser(newUserId, {
      username: newUser.username,
      email: newUser.email,
      uid: newUser.uid,
      photoUrl: newUser.photoUrl,
    });
  }
}
