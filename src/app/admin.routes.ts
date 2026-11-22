import { Routes } from '@angular/router';
import { authGuard } from './services/auth-guard';
import { AdminLayout } from './layouts/admin-layout/admin-layout';
import { Login } from './components/back/login/login';

export const adminRoutes: Routes = [
  { path: 'login', title: 'Connexion administrateur', component: Login },
  {
    path: '',
    component: AdminLayout,
    canActivate: [authGuard],
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      {
        path: 'dashboard',
        title: 'Tableau de bord',
        loadComponent: () => import('./components/back/dashboard/dashboard').then((m) => m.Dashboard),
      },
      {
        path: 'joueurs',
        title: 'Gestion des joueurs',
        loadComponent: () => import('./components/back/admin-joueur-list/admin-joueur-list').then((m) => m.AdminJoueurList),
      },
      {
        path: 'joueurs/nouveau',
        title: 'Ajouter un joueur',
        loadComponent: () => import('./components/back/joueur-form/joueur-form').then((m) => m.JoueurForm),
      },
      {
        path: 'joueurs/modifier/:id',
        title: 'Modifier un joueur',
        loadComponent: () => import('./components/back/joueur-form/joueur-form').then((m) => m.JoueurForm),
      },
    ],
  },
];
