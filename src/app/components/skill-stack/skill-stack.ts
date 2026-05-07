import { Component, input } from '@angular/core';

export interface SkillCategory {
  name: string;
  description: string;
  skills: readonly string[];
}

@Component({
  selector: 'app-skill-stack',
  templateUrl: './skill-stack.html',
  styleUrl: './skill-stack.scss',
})
export class SkillStack {
  readonly categories = input.required<readonly SkillCategory[]>();
}
