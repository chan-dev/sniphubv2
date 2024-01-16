import { Routes } from '@angular/router';

import { unsavedChangesGuard } from './guards/handle-unsaved-changes.guard';
import { isAuthenticatedGuard } from './guards/is-authenticated.guard';
import { isGuestGuard } from './guards/is-guest.guard';

export const routes: Routes = [
  {
    path: 'home',
    loadComponent: () =>
      import('./pages/home/home.component').then((c) => c.HomeComponent),
    canMatch: [isAuthenticatedGuard],
    canDeactivate: [unsavedChangesGuard],
    runGuardsAndResolvers: 'pathParamsOrQueryParamsChange',
  },
  {
    path: 'login',
    loadComponent: () =>
      import('./pages/login/login.component').then((c) => c.LoginComponent),
    canMatch: [isGuestGuard],
    // runGuardsAndResolvers: 'pathParamsOrQueryParamsChange',
  },
  {
    path: '',
    redirectTo: '/home',
    pathMatch: 'full',
  },
];
