import { inject } from '@angular/core';
import { CanMatchFn, Router } from '@angular/router';
import { map, take, tap } from 'rxjs';

import { AuthService } from '../services/auth.service';

export const isGuestGuard: CanMatchFn = (route, segments) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  console.log('isGuestGuard triggered', route.path);

  return authService.currentUser$.pipe(
    tap((currentUser) => {
      console.log('[isGuestGuard]: currentUser', { currentUser });
    }),
    map((currentUser) => {
      if (currentUser) {
        return router.parseUrl('/home');
      }
      return true;
    }),
    take(1),
  );
};
