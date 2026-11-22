import { computed, inject, Service, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, catchError, map, of, tap } from 'rxjs';
import { Admin, Identifiants } from '../models/admin';

const API_URL = 'http://localhost:3000/admins';
const CLE_DEMO = 'mercato-foot-demo-admin';
const MODE_DEMO = !['localhost', '127.0.0.1'].includes(location.hostname);

@Service()
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly _admin = signal<Admin | null>(null);
  readonly admin = this._admin.asReadonly();
  readonly estConnecte = computed(() => this._admin() !== null);

  login(identifiants: Identifiants): Observable<Admin[]> {
    if (!MODE_DEMO) {
      return this.http.get<Admin[]>(API_URL, { params: { ...identifiants } });
    }

    const local = this.lireAdminDemo();
    if (local) {
      const ok = local.login === identifiants.login && local.motDePasse === identifiants.motDePasse;
      return of(ok ? [local] : []);
    }

    return this.http.get<{ admins: Admin[] }>('db.json').pipe(
      map((db) => {
        const admin = db.admins[0];
        return admin.login === identifiants.login && admin.motDePasse === identifiants.motDePasse ? [admin] : [];
      }),
      catchError(() => of([])),
    );
  }

  connecter(admin: Admin): void {
    this._admin.set(admin);
  }

  deconnecter(): void {
    this._admin.set(null);
  }

  changerMotDePasse(nouveauMotDePasse: string): Observable<Admin> {
    const admin = this._admin()!;

    if (!MODE_DEMO) {
      return this.http
        .put<Admin>(`${API_URL}/${admin.id}`, { ...admin, motDePasse: nouveauMotDePasse })
        .pipe(tap((modifie) => this.connecter(modifie)));
    }

    const maj = { ...admin, motDePasse: nouveauMotDePasse };
    localStorage.setItem(CLE_DEMO, JSON.stringify(maj));
    this.connecter(maj);
    return of(maj);
  }

  private lireAdminDemo(): Admin | null {
    try {
      const brut = localStorage.getItem(CLE_DEMO);
      return brut ? (JSON.parse(brut) as Admin) : null;
    } catch {
      return null;
    }
  }
}
