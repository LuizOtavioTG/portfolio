import { Component } from '@angular/core';
import { FeaturedProject, FeaturedProjects } from './components/featured-projects/featured-projects';
import { IntroHero } from './components/intro-hero/intro-hero';
import { SiteHeader } from './components/site-header/site-header';

@Component({
  selector: 'app-root',
  imports: [SiteHeader, IntroHero, FeaturedProjects],
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

  protected readonly featuredProjects: FeaturedProject[] = [
    {
      name: 'Pomodoro Timer',
      status: 'Aguardando deploy',
      summary:
        'Sistema de produtividade baseado na tecnica Pomodoro, com frontend Angular e backend Java/Spring Boot.',
      technologies: ['Angular', 'Java', 'Spring Boot'],
      highlights: ['Ciclos de foco', 'Pausas programadas', 'Historico de sessoes', 'Gerenciamento de dados'],
      decision:
        'Separar a experiencia de controle do timer no frontend e manter o backend preparado para persistencia e historico.',
      preview: {
        kind: 'placeholder',
        label: 'Preview do Pomodoro sera ativado apos o deploy.',
      },
    },
    {
      name: 'Stock Manager',
      status: 'Aguardando deploy',
      summary:
        'API para gerenciamento de produtos, categorias, estoque e inventario com autenticacao JWT e ambiente Docker.',
      technologies: ['Java 17', 'Spring Boot 3.4.5', 'PostgreSQL', 'Flyway', 'JWT', 'Docker'],
      highlights: ['Autenticacao JWT', 'Permissoes por perfil', 'CRUD de produtos', 'Controle de estoque'],
      decision:
        'Organizar a API em camadas, com validacao, seguranca e migrations para manter o dominio previsivel.',
      preview: {
        kind: 'placeholder',
        label: 'Preview do Stock Manager sera ativado apos o deploy.',
      },
    },
    {
      name: 'Sistema de Ordens de Servico',
      status: 'Aguardando deploy',
      summary:
        'Plataforma para gerenciamento de ordens de servico, clientes, equipe, agenda e operacao mobile/offline.',
      technologies: ['Next.js', 'React', 'TypeScript', 'Java 17', 'Spring Boot', 'PostgreSQL'],
      highlights: ['Dashboard de OS', 'Controle de acesso', 'Agenda', 'Mobile Android', 'Offline sync'],
      decision:
        'Combinar frontend web/mobile com API Spring Boot para suportar operacao em campo e sincronizacao posterior.',
      preview: {
        kind: 'placeholder',
        label: 'Preview das ordens de servico sera ativado apos o deploy.',
      },
    },
  ];
}
