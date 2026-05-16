import { Component, input } from '@angular/core';
import { HoverLift } from '../../directives/hover-lift';
import { ScrambleText } from '../../directives/scramble-text';
import { ScrollReveal } from '../../directives/scroll-reveal';

export interface SkillCategory {
  name: string;
  description: string;
  skills: readonly string[];
}

@Component({
  selector: 'app-skill-stack',
  imports: [ScrambleText, ScrollReveal, HoverLift],
  templateUrl: './skill-stack.html',
  styleUrl: './skill-stack.scss',
})
export class SkillStack {
  readonly categories = input.required<readonly SkillCategory[]>();
}
