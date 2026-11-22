import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { JoueurCard } from '../joueur-card/joueur-card';
import { JoueurService } from '../../../services/joueur-service';
import { Joueur } from '../../../models/joueur';

@Component({
  selector: 'app-joueur-list',
  imports: [JoueurCard],
  templateUrl: './joueur-list.html',
})
export class JoueurList implements OnInit {
  private readonly joueurService = inject(JoueurService);
  readonly joueurs = this.joueurService.joueurs;
  readonly nom = signal('');
  readonly prixMax = signal<number | null>(null);
  readonly poste = signal('');
  readonly erreurServeur = signal(false);
  readonly message = signal('');

  readonly postes = computed(() => [...new Set(this.joueurs().map((j) => j.poste))].sort());

  readonly joueursFiltres = computed(() => {
    const nom = this.nom().trim().toLowerCase();
    const prixMax = this.prixMax();
    const poste = this.poste();
    return this.joueurs().filter(
      (j) =>
        (!nom || j.nom.toLowerCase().split(' ').some((mot) => mot.startsWith(nom))) &&
        (prixMax === null || j.prix <= prixMax) &&
        (!poste || j.poste === poste),
    );
  });

  ngOnInit(): void {
    this.joueurService.chargerJoueurs().subscribe({ error: () => this.erreurServeur.set(true) });
  }

  changerPrixMax(valeur: string): void {
    this.prixMax.set(valeur === '' ? null : Number(valeur));
  }

  reinitialiser(): void {
    this.nom.set('');
    this.prixMax.set(null);
    this.poste.set('');
  }

  onAcheter(joueur: Joueur): void {
    if (!window.confirm(`Confirmer le recrutement de ${joueur.nom} ?`)) {
      return;
    }
    this.joueurService.changerDisponibilite(joueur.id, false).subscribe({
      next: () => this.message.set(`${joueur.nom} a été recruté : il n'est plus disponible.`),
      error: () => this.message.set('Action impossible : serveur JSON indisponible.'),
    });
  }
}
