import { PrixMillionPipe } from './prix-million-pipe';

describe('PrixMillionPipe', () => {
  const pipe = new PrixMillionPipe();

  it('formate les montants en millions', () => {
    expect(pipe.transform(45000000)).toBe('45,0 M €');
  });

  it('formate les montants en milliers', () => {
    expect(pipe.transform(850000)).toBe('850 K €');
  });

  it('laisse les petits montants en euros', () => {
    expect(pipe.transform(950)).toBe('950 €');
  });

  it('retourne un tiret pour une valeur absente', () => {
    expect(pipe.transform(null)).toBe('-');
    expect(pipe.transform(undefined)).toBe('-');
  });
});
