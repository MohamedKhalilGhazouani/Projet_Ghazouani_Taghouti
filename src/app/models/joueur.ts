export interface Commentaire {
  nom: string;
  message: string;
}

export interface Joueur {
  id: string;
  nom: string;
  poste: string;
  prix: number;
  image: string;
  description: string;
  disponible: boolean;
  dateFinContrat: string;
  commentaires: Commentaire[];
}
