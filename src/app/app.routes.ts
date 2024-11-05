import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: 'dashboard',
    loadComponent: () =>
      import('./components/dashboard/dashboard.component').then(
        (m) => m.DashboardComponent
      ),
  },
  {
    path: 'add',
    loadComponent: () =>
      import('./components/add/add.component').then((m) => m.AddComponent),
  },
  {
    path: 'use/:name',
    loadComponent: () =>
      import('./components/userform/userform.component').then(
        (m) => m.UserformComponent
      ),
  },
  {
    path: 'template',
    loadComponent: () =>
      import('./components/template/template.component').then(
        (m) => m.TemplateComponent
      ),
  },
  { path: '', redirectTo: '/dashboard', pathMatch: 'full' },
];
