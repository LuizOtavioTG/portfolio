import { Component, input } from '@angular/core';

export interface ContactInfo {
  email: string;
  linkedin: string;
  github: string;
  resumeStatus: string;
}

@Component({
  selector: 'app-contact-section',
  templateUrl: './contact-section.html',
  styleUrl: './contact-section.scss',
})
export class ContactSection {
  readonly contact = input.required<ContactInfo>();
}
