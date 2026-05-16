import { Component, input } from '@angular/core';
import { ScrollReveal } from '../../directives/scroll-reveal';
import { ScrambleText } from '../../directives/scramble-text';
import { TerminalPanel } from '../terminal-panel/terminal-panel';

export interface PortfolioProfile {
  name: string;
  role: string;
  intro: string;
}

@Component({
  selector: 'app-intro-hero',
  imports: [TerminalPanel, ScrambleText, ScrollReveal],
  templateUrl: './intro-hero.html',
  styleUrl: './intro-hero.scss',
})
export class IntroHero {
  readonly profile = input.required<PortfolioProfile>();
}
