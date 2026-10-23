import { inject } from '@angular/core';
import { LanguageService } from '../../i18n/language.service';
import { TranslatePipe } from '../../i18n/translate.pipe';
import { AfterViewInit, Component, HostBinding, NgZone, OnDestroy } from '@angular/core';

@Component({
  imports: [TranslatePipe],
  selector: 'app-site-header',
  templateUrl: './site-header.html',
  styleUrl: './site-header.scss',
})
export class SiteHeader implements AfterViewInit, OnDestroy {
  protected readonly language = inject(LanguageService);

  @HostBinding('class.is-scrolled') protected isScrolled = false;

  private readonly scrollThreshold = 28;
  private removeScrollListener?: () => void;

  constructor(private readonly ngZone: NgZone) {}

  ngAfterViewInit(): void {
    this.ngZone.runOutsideAngular(() => {
      const updateHeaderState = (): void => {
        const nextIsScrolled = window.scrollY > this.scrollThreshold;

        if (nextIsScrolled === this.isScrolled) {
          return;
        }

        this.ngZone.run(() => {
          this.isScrolled = nextIsScrolled;
        });
      };

      window.addEventListener('scroll', updateHeaderState, { passive: true });
      updateHeaderState();

      this.removeScrollListener = () => window.removeEventListener('scroll', updateHeaderState);
    });
  }

  ngOnDestroy(): void {
    this.removeScrollListener?.();
  }
}
