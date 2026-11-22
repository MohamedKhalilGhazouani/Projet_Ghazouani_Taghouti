import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'prixMillion',
})
export class PrixMillionPipe implements PipeTransform {
  transform(prix: number | null | undefined): string {
    if (prix === null || prix === undefined) {
      return '-';
    }
    if (prix >= 1_000_000) {
      return `${(prix / 1_000_000).toFixed(1).replace('.', ',')} M €`;
    }
    if (prix >= 1_000) {
      return `${Math.round(prix / 1_000)} K €`;
    }
    return `${prix} €`;
  }
}
