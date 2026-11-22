import { Component, input, output } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Joueur } from '../../../models/joueur';
import { PrixMillionPipe } from '../../../pipes/prix-million-pipe';

@Component({
  selector: 'app-joueur-card',
  imports: [RouterLink, PrixMillionPipe],
  templateUrl: './joueur-card.html',
})
export class JoueurCard {
  readonly joueur = input.required<Joueur>();
  readonly acheter = output<Joueur>();
}
