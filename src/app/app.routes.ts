import { Routes } from '@angular/router';
import { PublicLayout } from './layouts/public-layout/public-layout';
import { Catalogue } from './components/front/catalogue/catalogue';
import { JoueurList } from './components/front/joueur-list/joueur-list';
import { JoueurDetail } from './components/front/joueur-detail/joueur-detail';
import { APropos } from './components/front/a-propos/a-propos';

export const routes: Routes = [
  { path: 'admin', loadChildren: () => import('./admin.routes').then((m) => m.adminRoutes) },
  {
    path: '',
    component: PublicLayout,
    children: [
      { path: '', redirectTo: 'catalogue/liste', pathMatch: 'full' },
      {
        path: 'catalogue',
        component: Catalogue,
        children: [
          { path: '', redirectTo: 'liste', pathMatch: 'full' },
          { path: 'liste', title: 'Catalogue', component: JoueurList },
          { path: ':id', title: 'Fiche du joueur', component: JoueurDetail },
        ],
      },
      { path: 'a-propos', title: 'À propos', component: APropos },
      { path: '**', redirectTo: 'catalogue/liste' },
    ],
  },
];
