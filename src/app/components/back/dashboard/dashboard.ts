import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { FormField, FormRoot, form, minLength, required } from '@angular/forms/signals';
import { JoueurService } from '../../../services/joueur-service';
import { AuthService } from '../../../services/auth-service';
import { PrixMillionPipe } from '../../../pipes/prix-million-pipe';
import { ChangementMotDePasse } from '../../../models/admin';

@Component({
  selector: 'app-dashboard',
  imports: [RouterLink, FormRoot, FormField, PrixMillionPipe],
  templateUrl: './dashboard.html',
})
export class Dashboard implements OnInit {
  private readonly joueurService = inject(JoueurService);
  private readonly authService = inject(AuthService);
  readonly joueurs = this.joueurService.joueurs;
  readonly admin = this.authService.admin;
  readonly erreurServeur = signal(false);

  readonly nombre = computed(() => this.joueurs().length);
  readonly disponibles = computed(() => this.joueurs().filter((j) => j.disponible).length);
  readonly indisponibles = computed(() => this.nombre() - this.disponibles());
  readonly valeur = computed(() => this.joueurs().reduce((total, j) => total + j.prix, 0));
  readonly moyenne = computed(() => (this.nombre() ? this.valeur() / this.nombre() : 0));

  readonly modele = signal<ChangementMotDePasse>({ ancienMotDePasse: '', nouveauMotDePasse: '', confirmation: '' });
  readonly formulaire = form(this.modele, (path) => {
    required(path.ancienMotDePasse, { message: "L'ancien mot de passe est obligatoire." });
    required(path.nouveauMotDePasse, { message: 'Le nouveau mot de passe est obligatoire.' });
    minLength(path.nouveauMotDePasse, 6, { message: 'Le nouveau mot de passe doit contenir au moins 6 caractères.' });
    required(path.confirmation, { message: 'La confirmation est obligatoire.' });
  });
  readonly message = signal('');
  readonly erreur = signal('');
  readonly enCours = signal(false);

  ngOnInit(): void {
    this.joueurService.chargerJoueurs().subscribe({ error: () => this.erreurServeur.set(true) });
  }

  changerMotDePasse(): void {
    if (this.enCours() || this.formulaire().invalid()) {
      return;
    }
    const admin = this.admin();
    const valeurs = this.modele();
    this.message.set('');
    this.erreur.set('');

    if (!admin) {
      this.erreur.set('Aucun administrateur connecté.');
      return;
    }
    if (valeurs.ancienMotDePasse !== admin.motDePasse) {
      this.erreur.set("L'ancien mot de passe est incorrect.");
      return;
    }
    if (valeurs.nouveauMotDePasse !== valeurs.confirmation) {
      this.erreur.set('La confirmation ne correspond pas au nouveau mot de passe.');
      return;
    }
    if (valeurs.nouveauMotDePasse === valeurs.ancienMotDePasse) {
      this.erreur.set("Le nouveau mot de passe doit être différent de l'ancien.");
      return;
    }

    this.enCours.set(true);
    this.authService.changerMotDePasse(valeurs.nouveauMotDePasse).subscribe({
      next: () => {
        this.enCours.set(false);
        this.message.set('Votre mot de passe a été modifié avec succès.');
        this.modele.set({ ancienMotDePasse: '', nouveauMotDePasse: '', confirmation: '' });
      },
      error: () => {
        this.enCours.set(false);
        this.erreur.set('La modification a échoué (serveur JSON).');
      },
    });
  }
}
