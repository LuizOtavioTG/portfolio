import { inject, Pipe, PipeTransform } from '@angular/core';
import { LanguageService } from './language.service';

@Pipe({ name: 'translate', pure: false })
export class TranslatePipe implements PipeTransform {
  private readonly language = inject(LanguageService);

  transform(value: string): string;
  transform(value: number): number;
  transform(value: string | number): string | number {
    return this.language.translate(value);
  }
}
