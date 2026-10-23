import { TestBed } from '@angular/core/testing';
import { LanguageService } from '../../i18n/language.service';
import { SiteHeader } from './site-header';

describe('Navbar language selection', () => {
  let originalLanguage: string | null;
  let originalDocumentLanguage: string;

  beforeEach(() => {
    originalLanguage = localStorage.getItem('portfolio-language');
    originalDocumentLanguage = document.documentElement.lang;
    localStorage.removeItem('portfolio-language');
    TestBed.configureTestingModule({ imports: [SiteHeader] });
  });

  afterEach(() => {
    if (originalLanguage === null) localStorage.removeItem('portfolio-language');
    else localStorage.setItem('portfolio-language', originalLanguage);
    document.documentElement.lang = originalDocumentLanguage;
  });

  it('switches navigation labels, document language and stored preference in both directions', () => {
    const fixture = TestBed.createComponent(SiteHeader);
    fixture.detectChanges();
    const header = fixture.nativeElement as HTMLElement;
    expect(header.textContent).toContain('Projetos');

    header.querySelector<HTMLButtonElement>('button[lang="en"]')!.click();
    fixture.detectChanges();
    expect(header.textContent).toContain('Projects');
    expect(header.textContent).toContain('About');
    expect(document.documentElement.lang).toBe('en');
    expect(localStorage.getItem('portfolio-language')).toBe('en');
    expect(header.querySelector('button[lang="en"]')?.getAttribute('aria-pressed')).toBe('true');
    expect(TestBed.inject(LanguageService).translate('Desenvolvedor full-stack criando aplicações web.'))
      .toBe('Full-stack developer building web applications.');

    header.querySelector<HTMLButtonElement>('button[lang="pt-BR"]')!.click();
    fixture.detectChanges();
    expect(header.textContent).toContain('Projetos');
    expect(document.documentElement.lang).toBe('pt-BR');
    expect(localStorage.getItem('portfolio-language')).toBe('pt');
  });

  it('restores the saved English preference', () => {
    localStorage.setItem('portfolio-language', 'en');
    const fixture = TestBed.createComponent(SiteHeader);
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain('Projects');
    expect(document.documentElement.lang).toBe('en');
  });
});
