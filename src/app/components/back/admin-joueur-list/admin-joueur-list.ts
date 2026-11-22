import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { JoueurService } from '../../../services/joueur-service';
import { Joueur } from '../../../models/joueur';
import { PrixMillionPipe } from '../../../pipes/prix-million-pipe';

@Component({
  selector: 'app-admin-joueur-list',
  imports: [RouterLink, DatePipe, PrixMillionPipe],
  templateUrl: './admin-joueur-list.html',
})
export class AdminJoueurList implements OnInit {
  private readonly joueurService = inject(JoueurService);
  readonly joueurs = this.joueurService.joueurs;
  readonly recherche = signal('');
  readonly erreurServeur = signal(false);
  readonly message = signal('');
  readonly suppressionRatee = signal(false);

  readonly joueursFiltres = computed(() => {
    const texte = this.recherche().trim().toLowerCase();
    if (!texte) {
      return this.joueurs();
    }
    return this.joueurs().filter((j) => j.nom.toLowerCase().includes(texte) || j.id.toLowerCase().includes(texte));
  });

  ngOnInit(): void {
    this.joueurService.chargerJoueurs().subscribe({ error: () => this.erreurServeur.set(true) });
  }

  supprimer(joueur: Joueur): void {
    if (!window.confirm(`Supprimer définitivement ${joueur.nom} du catalogue ?`)) {
      return;
    }
    this.message.set('');
    this.suppressionRatee.set(false);
    this.joueurService.supprimerJoueur(joueur.id).subscribe({
      next: () => this.message.set(`${joueur.nom} a été supprimé.`),
      error: () => {
        this.suppressionRatee.set(true);
        this.message.set('Suppression impossible : serveur JSON indisponible.');
      },
    });
  }
}
