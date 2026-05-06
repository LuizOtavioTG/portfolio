import { Component, input } from '@angular/core';

@Component({
  selector: 'app-terminal-panel',
  templateUrl: './terminal-panel.html',
  styleUrl: './terminal-panel.scss',
})
export class TerminalPanel {
  readonly owner = input.required<string>();
  readonly role = input.required<string>();
}
