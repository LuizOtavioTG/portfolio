import { Component, input } from '@angular/core';
import { TerminalPanel } from '../terminal-panel/terminal-panel';

export interface PortfolioProfile {
  name: string;
  role: string;
  intro: string;
}

@Component({
  selector: 'app-intro-hero',
  imports: [TerminalPanel],
  templateUrl: './intro-hero.html',
  styleUrl: './intro-hero.scss',
})
export class IntroHero {
  readonly profile = input.required<PortfolioProfile>();
}
