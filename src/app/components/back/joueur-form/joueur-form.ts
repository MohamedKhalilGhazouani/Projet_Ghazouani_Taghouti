import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { FormField, FormRoot, form, maxLength, min, minLength, pattern, required } from '@angular/forms/signals';
import { JoueurService } from '../../../services/joueur-service';
import { Joueur } from '../../../models/joueur';

@Component({
  selector: 'app-joueur-form',
  imports: [FormRoot, FormField, RouterLink],
  templateUrl: './joueur-form.html',
})
export class JoueurForm implements OnInit {
  private readonly joueurService = inject(JoueurService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  readonly idModifie = signal<string | null>(null);
  readonly modeEdition = computed(() => this.idModifie() !== null);
  readonly postes = ['Gardien', 'Défenseur', 'Milieu', 'Attaquant'];

  readonly modele = signal<Joueur>({
    id: '',
    nom: '',
    poste: 'Attaquant',
    prix: 0,
    image: '',
    description: '',
    disponible: true,
    dateFinContrat: '',
    commentaires: [],
  });

  readonly formulaire = form(this.modele, (path) => {
    required(path.nom, { message: 'Le nom est obligatoire.' });
    minLength(path.nom, 3, { message: 'Le nom doit contenir au moins 3 caractères.' });
    required(path.prix, { message: "L'indemnité est obligatoire." });
    min(path.prix, 1000, { message: "L'indemnité doit être supérieure ou égale à 1 000 €." });
    required(path.image, { message: "L'image est obligatoire." });
    pattern(path.image, /^(https?:\/\/|\/?joueurs\/).+$/, {
      message: 'Saisissez une URL http(s) ou un chemin de type joueurs/photo.svg.',
    });
    required(path.description, { message: 'La description est obligatoire.' });
    maxLength(path.description, 400, { message: 'La description ne doit pas dépasser 400 caractères.' });
    required(path.dateFinContrat, { message: 'La date de fin de contrat est obligatoire.' });
  });

  readonly erreur = signal('');
  readonly enCours = signal(false);
  readonly donneesChargees = signal(false);

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.idModifie.set(id);
    }
    this.joueurService.chargerJoueurs().subscribe({
      next: () => {
        this.donneesChargees.set(true);
        const joueur = id ? this.joueurService.getJoueurById(id) : undefined;
        if (joueur) {
          this.modele.set({ ...joueur });
        } else if (id) {
          this.erreur.set('Joueur introuvable.');
        }
      },
      error: () => this.erreur.set('Impossible de charger les données (serveur JSON).'),
    });
  }

  onSubmit(): void {
    if (this.enCours() || !this.donneesChargees()) {
      return;
    }
    if (this.formulaire().invalid()) {
      this.erreur.set('Veuillez corriger les champs signalés en rouge.');
      return;
    }

    this.enCours.set(true);
    this.erreur.set('');
    const requete = this.modeEdition()
      ? this.joueurService.modifierJoueur(this.modele())
      : this.joueurService.ajouterJoueur(this.modele());

    requete.subscribe({
      next: () => this.router.navigate(['/admin/joueurs']),
      error: () => {
        this.enCours.set(false);
        this.erreur.set("L'enregistrement a échoué (serveur JSON).");
      },
    });
  }
}
