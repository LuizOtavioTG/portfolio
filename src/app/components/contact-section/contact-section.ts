import { Component, input } from '@angular/core';
import { ScrambleText } from '../../directives/scramble-text';

export interface ContactInfo {
  email: string;
  linkedin: string;
  github: string;
  resumeStatus: string;
}

@Component({
  selector: 'app-contact-section',
  imports: [ScrambleText],
  templateUrl: './contact-section.html',
  styleUrl: './contact-section.scss',
})
export class ContactSection {
  readonly contact = input.required<ContactInfo>();
}
