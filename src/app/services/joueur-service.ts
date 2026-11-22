import { inject, Service, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map, of, tap, throwError } from 'rxjs';
import { Joueur } from '../models/joueur';

const API_URL = 'http://localhost:3000/joueurs';
const CLE_DEMO = 'mercato-foot-demo-joueurs';
const MODE_DEMO = !['localhost', '127.0.0.1'].includes(location.hostname);

@Service()
export class JoueurService {
  private readonly http = inject(HttpClient);
  private readonly _joueurs = signal<Joueur[]>([]);
  readonly joueurs = this._joueurs.asReadonly();

  chargerJoueurs(): Observable<Joueur[]> {
    if (!MODE_DEMO) {
      return this.http.get<Joueur[]>(API_URL).pipe(tap((liste) => this._joueurs.set(liste)));
    }

    const local = localStorage.getItem(CLE_DEMO);
    if (local) {
      this._joueurs.set(JSON.parse(local));
      return of(this._joueurs());
    }

    return this.http.get<{ joueurs: Joueur[] }>('db.json').pipe(
      tap((db) => this._joueurs.set(db.joueurs)),
      map(() => this._joueurs()),
    );
  }

  getJoueurById(id: string): Joueur | undefined {
    return this._joueurs().find((j) => j.id === id);
  }

  ajouterJoueur(joueur: Joueur): Observable<Joueur> {
    if (MODE_DEMO) {
      const cree = { ...joueur, id: crypto.randomUUID() };
      this._joueurs.update((l) => [...l, cree]);
      this.sauverDemo();
      return of(cree);
    }
    const { id, ...sansId } = joueur;
    return this.http.post<Joueur>(API_URL, sansId).pipe(tap((ajoute) => this._joueurs.update((l) => [...l, ajoute])));
  }

  modifierJoueur(joueur: Joueur): Observable<Joueur> {
    if (MODE_DEMO) {
      this._joueurs.update((l) => l.map((j) => (j.id === joueur.id ? joueur : j)));
      this.sauverDemo();
      return of(joueur);
    }
    return this.http.put<Joueur>(`${API_URL}/${joueur.id}`, joueur).pipe(
      tap((modifie) => this._joueurs.update((l) => l.map((j) => (j.id === modifie.id ? modifie : j)))),
    );
  }

  supprimerJoueur(id: string): Observable<void> {
    if (MODE_DEMO) {
      this._joueurs.update((l) => l.filter((j) => j.id !== id));
      this.sauverDemo();
      return of(undefined);
    }
    return this.http.delete<void>(`${API_URL}/${id}`).pipe(tap(() => this._joueurs.update((l) => l.filter((j) => j.id !== id))));
  }

  changerDisponibilite(id: string, disponible: boolean): Observable<Joueur> {
    const joueur = this.getJoueurById(id);
    return joueur ? this.modifierJoueur({ ...joueur, disponible }) : throwError(() => new Error(`Joueur ${id} introuvable`));
  }

  private sauverDemo(): void {
    localStorage.setItem(CLE_DEMO, JSON.stringify(this._joueurs()));
  }
}
