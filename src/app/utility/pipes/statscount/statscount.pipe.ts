import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'statsCount'
})
export class StatscountPipe implements PipeTransform {

  transform(value: any, ...args: any[]): any {
    let str = '';
    if (value <= 9) {
      str = value;
    } else if (value >= 10) {
      str = 9 + '+'
    }

    return str;
  }

}
