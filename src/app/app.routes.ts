import { Routes } from '@angular/router';

import { unsavedChangesGuard } from './guards/handle-unsaved-changes.guard';

export const routes: Routes = [
  {
    path: 'home',
    loadComponent: () =>
      import('./pages/home/home.component').then((c) => c.HomeComponent),
    canDeactivate: [unsavedChangesGuard],
    runGuardsAndResolvers: 'pathParamsOrQueryParamsChange',
  },
  {
    path: 'login',
    loadComponent: () =>
      import('./pages/login/login.component').then((c) => c.LoginComponent),
  },
  {
    path: '',
    redirectTo: '/home',
    pathMatch: 'full',
  },
];
