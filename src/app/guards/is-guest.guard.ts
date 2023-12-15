import { inject } from '@angular/core';
import { CanMatchFn, Router } from '@angular/router';
import { map, take, tap } from 'rxjs';

import { AuthService } from '../services/auth.service';

export const isGuestGuard: CanMatchFn = (route, segments) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  console.log('isGuestGuard triggered', route.path);

  return authService.isAuthenticated$.pipe(
    tap((isAuthenticated) => {
      console.log('isAuthenticated', { isAuthenticated });
    }),
    map((isAuthenticated) => {
      if (isAuthenticated) {
        return router.parseUrl('/home');
      }
      return true;
    }),
    take(1),
  );
};
