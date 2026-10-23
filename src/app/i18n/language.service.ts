import { DOCUMENT } from '@angular/common';
import { inject, Injectable, signal } from '@angular/core';
import translations from './en.json';

export type Language = 'pt' | 'en';

@Injectable({ providedIn: 'root' })
export class LanguageService {
  private readonly document = inject(DOCUMENT);
  private readonly currentLanguage = signal<Language>(this.savedLanguage());
  readonly language = this.currentLanguage.asReadonly();

  constructor() {
    this.updateDocument();
  }

  setLanguage(language: Language): void {
    this.currentLanguage.set(language);
    this.updateDocument();
    try {
      this.document.defaultView?.localStorage.setItem('portfolio-language', language);
    } catch {
      // Language switching also works when browser storage is unavailable.
    }
  }

  translate<T extends string | number>(value: T): T | string {
    return this.language() === 'en' && typeof value === 'string'
      ? (translations as Record<string, string>)[value] ?? value
      : value;
  }

  private savedLanguage(): Language {
    try {
      return this.document.defaultView?.localStorage.getItem('portfolio-language') === 'en' ? 'en' : 'pt';
    } catch {
      return 'pt';
    }
  }

  private updateDocument(): void {
    this.document.documentElement.lang = this.language() === 'en' ? 'en' : 'pt-BR';
  }
}
