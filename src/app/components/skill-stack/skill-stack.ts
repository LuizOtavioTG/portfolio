import { Component, input } from '@angular/core';
import { ScrambleText } from '../../directives/scramble-text';

export interface SkillCategory {
  name: string;
  description: string;
  skills: readonly string[];
}

@Component({
  selector: 'app-skill-stack',
  imports: [ScrambleText],
  templateUrl: './skill-stack.html',
  styleUrl: './skill-stack.scss',
})
export class SkillStack {
  readonly categories = input.required<readonly SkillCategory[]>();
}
