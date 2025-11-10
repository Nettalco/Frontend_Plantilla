import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'currencyPe'
})
export class CurrencyPePipe implements PipeTransform {

  transform(value: unknown, ...args: unknown[]): unknown {
    return null;
  }

}
