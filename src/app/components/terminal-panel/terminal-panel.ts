import { AfterViewInit, Component, ElementRef, OnDestroy, input } from '@angular/core';
import { gsap } from 'gsap';
import { TextPlugin } from 'gsap/TextPlugin';

@Component({
  selector: 'app-terminal-panel',
  templateUrl: './terminal-panel.html',
  styleUrl: './terminal-panel.scss',
})
export class TerminalPanel implements AfterViewInit, OnDestroy {
  readonly owner = input.required<string>();
  readonly role = input.required<string>();
  readonly buildOutput = `Initial chunk files | Names         |  Raw size
main.js             | main          | 186.99 kB |
styles.css          | styles        |   1.60 kB |
polyfills.js        | polyfills     |  95 bytes |

                    | Initial total | 188.68 kB

Application bundle generation complete. [2.109 seconds] - ${new Date().toISOString()}`;

  private readonly prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  private terminalTimeline?: gsap.core.Timeline;

  constructor(private readonly elementRef: ElementRef<HTMLElement>) {
    gsap.registerPlugin(TextPlugin);
  }

  ngAfterViewInit(): void {
    this.playTerminalSequence();
  }

  ngOnDestroy(): void {
    this.terminalTimeline?.kill();
  }

  private playTerminalSequence(): void {
    const lines = Array.from(
      this.elementRef.nativeElement.querySelectorAll<HTMLElement>('.typed-text'),
    );
    const cursor = this.elementRef.nativeElement.querySelector<HTMLElement>('.terminal-cursor');

    if (!lines.length) {
      return;
    }

    const terminalTexts = lines.map((line) => this.getTerminalText(line));
    lines.forEach((line) => {
      line.textContent = '';
    });

    if (this.prefersReducedMotion.matches) {
      lines.forEach((line, index) => {
        this.setTerminalLine(line, terminalTexts[index]);
      });
      this.scrollTerminalToBottom();
      cursor?.classList.add('is-visible');
      return;
    }

    const timeline = gsap.timeline({ delay: 0.45 });
    this.terminalTimeline = timeline;
    cursor?.classList.remove('is-visible');

    lines.forEach((line, index) => {
      timeline.call(() => {
        if (cursor) {
          line.after(cursor);
          cursor.classList.add('is-visible', 'is-typing');
          this.scrollTerminalToBottom();
        }
      });

      this.typeTerminalText(timeline, line, terminalTexts[index]);
      timeline
        .call(() => {
          this.setTerminalLine(line, terminalTexts[index]);
          this.scrollTerminalToBottom();
          cursor?.classList.remove('is-typing');
        })
        .to({}, { duration: index === 0 || index === 3 ? 0.34 : 0.18 });
    });
  }

  private typeTerminalText(timeline: gsap.core.Timeline, line: HTMLElement, text: string): void {
    Array.from(text).forEach((character, index) => {
      timeline
        .to({}, { duration: this.getTypingDelay(character, index, line) })
        .call(() => {
          line.textContent = text.slice(0, index + 1);
          this.scrollTerminalToBottom();
        });
    });
  }

  private getTypingDelay(character: string, index: number, line: HTMLElement): number {
    const rhythm = [0.048, 0.072, 0.055, 0.095, 0.063, 0.082];
    const baseDelay = rhythm[index % rhythm.length];
    const speedMultiplier = line.dataset['terminalSpeed'] === 'fast' ? 0.08 : 1;

    if (character === ' ') {
      return (baseDelay + 0.055) * speedMultiplier;
    }

    if (['/', ':', '-'].includes(character)) {
      return (baseDelay + 0.035) * speedMultiplier;
    }

    return baseDelay * speedMultiplier;
  }

  private getTerminalText(line: HTMLElement): string {
    const text = line.dataset['terminalText'] ?? '';

    return line.classList.contains('command-line') ? `$ ${text}` : text;
  }

  private setTerminalLine(line: HTMLElement, text: string): void {
    if (!line.classList.contains('command-line')) {
      line.textContent = text;
      return;
    }

    line.innerHTML = `<span class="prompt">$</span> ${text.replace(/^\$\s*/, '')}`;
  }

  private scrollTerminalToBottom(): void {
    const terminalBody = this.elementRef.nativeElement.querySelector<HTMLElement>('.terminal-body');

    if (!terminalBody) {
      return;
    }

    requestAnimationFrame(() => {
      terminalBody.scrollTop = terminalBody.scrollHeight;
    });
  }
}
