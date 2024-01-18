import { CanDeactivateFn } from '@angular/router';
import { DestroyRef, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { map } from 'rxjs';

import { TrackUnsavedService } from '../services/track-unsaved.service';

export const unsavedChangesGuard: CanDeactivateFn<unknown> = (
  _component,
  _currentRoute,
  _currentState,
  _nextState,
) => {
  const trackUnsavedService = inject(TrackUnsavedService);
  const destroyRef = inject(DestroyRef);

  destroyRef.onDestroy(() => {
    console.log('route guard destroyed');
  });

  return trackUnsavedService.hasUnsaved$.pipe(
    map((hasChanged) => {
      if (hasChanged) {
        const shouldLeaveRoute = confirm(
          'You have unsaved changes. Are you sure you want to leave?',
        );

        if (shouldLeaveRoute) {
          trackUnsavedService.changeCancelled();
          return true;
        } else {
          return false;
        }
      } else {
        return true;
      }
    }),
    takeUntilDestroyed(destroyRef),
  );
};
