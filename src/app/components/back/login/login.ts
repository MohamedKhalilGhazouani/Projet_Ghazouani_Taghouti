import { Component, inject, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { FormField, FormRoot, form, minLength, required } from '@angular/forms/signals';
import { AuthService } from '../../../services/auth-service';
import { Identifiants } from '../../../models/admin';

@Component({
  selector: 'app-login',
  imports: [FormRoot, FormField, RouterLink],
  templateUrl: './login.html',
  styleUrl: './login.css',
})
export class Login {
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  readonly modele = signal<Identifiants>({ login: '', motDePasse: '' });
  readonly formulaire = form(this.modele, (path) => {
    required(path.login, { message: 'Le login est obligatoire.' });
    required(path.motDePasse, { message: 'Le mot de passe est obligatoire.' });
    minLength(path.motDePasse, 4, { message: 'Le mot de passe doit contenir au moins 4 caractères.' });
  });
  readonly erreur = signal('');
  readonly enCours = signal(false);

  ngOnInit(): void {
    if (this.authService.estConnecte()) {
      this.router.navigate(['/admin/dashboard']);
    }
  }

  onSubmit(): void {
    if (this.enCours() || this.formulaire().invalid()) {
      return;
    }
    this.enCours.set(true);
    this.erreur.set('');
    this.authService.login(this.modele()).subscribe({
      next: (admins) => {
        this.enCours.set(false);
        if (admins.length === 0) {
          this.erreur.set('Login ou mot de passe incorrect.');
          return;
        }
        this.authService.connecter(admins[0]);
        this.router.navigate(['/admin/dashboard']);
      },
      error: () => {
        this.enCours.set(false);
        this.erreur.set('Serveur JSON indisponible. Lancez json-server puis réessayez.');
      },
    });
  }
}
