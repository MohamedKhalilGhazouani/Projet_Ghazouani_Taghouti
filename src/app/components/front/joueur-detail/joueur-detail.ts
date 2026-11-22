import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { JoueurService } from '../../../services/joueur-service';
import { PrixMillionPipe } from '../../../pipes/prix-million-pipe';

@Component({
  selector: 'app-joueur-detail',
  imports: [RouterLink, DatePipe, PrixMillionPipe],
  templateUrl: './joueur-detail.html',
})
export class JoueurDetail implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly joueurService = inject(JoueurService);
  readonly id = this.route.snapshot.paramMap.get('id') ?? '';
  readonly chargement = signal(true);
  readonly erreurServeur = signal(false);
  readonly message = signal('');
  readonly joueur = computed(() => this.joueurService.getJoueurById(this.id));

  ngOnInit(): void {
    this.joueurService.chargerJoueurs().subscribe({
      next: () => this.chargement.set(false),
      error: () => {
        this.erreurServeur.set(true);
        this.chargement.set(false);
      },
    });
  }

  acheter(): void {
    const joueur = this.joueur();
    if (!joueur || !window.confirm(`Confirmer le recrutement de ${joueur.nom} ?`)) {
      return;
    }
    this.joueurService.changerDisponibilite(joueur.id, false).subscribe({
      next: () => this.message.set(`${joueur.nom} a été recruté : il n'est plus disponible.`),
      error: () => this.message.set('Action impossible : serveur JSON indisponible.'),
    });
  }
}
