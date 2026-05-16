import { Component, input } from '@angular/core';
import { HoverLift } from '../../directives/hover-lift';
import { ScrambleText } from '../../directives/scramble-text';
import { ScrollReveal } from '../../directives/scroll-reveal';

export interface ContactInfo {
  email: string;
  linkedin: string;
  github: string;
  resumeStatus: string;
}

@Component({
  selector: 'app-contact-section',
  imports: [ScrambleText, ScrollReveal, HoverLift],
  templateUrl: './contact-section.html',
  styleUrl: './contact-section.scss',
})
export class ContactSection {
  readonly contact = input.required<ContactInfo>();
}
