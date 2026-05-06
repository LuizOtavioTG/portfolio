import { Component } from '@angular/core';
import { IntroHero } from './components/intro-hero/intro-hero';
import { SiteHeader } from './components/site-header/site-header';

@Component({
  selector: 'app-root',
  imports: [SiteHeader, IntroHero],
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App {
  protected readonly profile = {
    name: 'Luiz',
    role: 'Desenvolvedor full-stack',
    intro:
      'Desenvolvedor full-stack focado em criar aplicações web rápidas, acessíveis e bem estruturadas, com atenção à experiência do usuário, performance e qualidade do código.',
  };
}
