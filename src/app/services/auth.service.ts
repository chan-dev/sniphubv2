import { Injectable } from '@angular/core';
import { Subject, shareReplay } from 'rxjs';
import { Session, User } from '@supabase/supabase-js';

import { db } from '../db';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private client = db;
  private authSubject = new Subject<User | null>();
  private userSession: Session | null = null;

  currentUser$ = this.authSubject.asObservable().pipe(shareReplay(1));

  constructor() {
    this.onAuthStateChange((session) => {
      console.log('session', session);
    });
  }

  get session() {
    return this.userSession;
  }

  onAuthStateChange(callback: (session: Session | null) => void) {
    this.client.auth.onAuthStateChange((event, session) => {
      this.userSession = session;
      this.authSubject.next(session?.user ?? null);
      callback(session);
    });
  }

  async login() {
    return this.client.auth.signInWithOAuth({
      provider: 'google',
    });
  }

  logout() {
    return this.client.auth.signOut();
  }

  fetchLists() {
    return this.client;
  }
}
