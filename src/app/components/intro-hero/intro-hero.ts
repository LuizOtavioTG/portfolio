import { Component, input } from '@angular/core';
import { TerminalPanel } from '../terminal-panel/terminal-panel';
import { ScrambleText } from "../../directives/scramble-text";

export interface PortfolioProfile {
  name: string;
  role: string;
  intro: string;
}

@Component({
  selector: 'app-intro-hero',
  imports: [TerminalPanel, ScrambleText],
  templateUrl: './intro-hero.html',
  styleUrl: './intro-hero.scss',
})
export class IntroHero {
  readonly profile = input.required<PortfolioProfile>();
}
