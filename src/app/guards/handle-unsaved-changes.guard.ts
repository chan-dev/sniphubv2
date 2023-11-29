import { CanDeactivateFn } from '@angular/router';
import { TrackUnsavedService } from '../services/track-unsaved.service';
import { inject } from '@angular/core';

export const unsavedChangesGuard: CanDeactivateFn<unknown> = (
  _component,
  _currentRoute,
  _currentState,
  _nextState,
) => {
  const trackUnsavedService = inject(TrackUnsavedService);

  if (trackUnsavedService.hasUnsavedChanges) {
    // TODO: replace with modal
    const shouldLeaveRoute = confirm(
      'You have unsaved changes. Are you sure you want to leave?',
    );

    if (shouldLeaveRoute) {
      trackUnsavedService.reset();
      return true;
    } else {
      return false;
    }
  } else {
    return true;
  }
};
