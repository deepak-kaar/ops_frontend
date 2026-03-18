import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'filterBy',
  standalone: true
})
export class FilterByPipe implements PipeTransform {
  transform(items: any[], property: string, value: any): any[] {
    if (!items || !property) {
      return items;
    }
    return items.filter(item => item[property] === value);
  }
}
