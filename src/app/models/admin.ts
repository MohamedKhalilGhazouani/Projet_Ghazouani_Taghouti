export interface Admin {
  id: string;
  login: string;
  motDePasse: string;
}

export interface Identifiants {
  login: string;
  motDePasse: string;
}

export interface ChangementMotDePasse {
  ancienMotDePasse: string;
  nouveauMotDePasse: string;
  confirmation: string;
}
