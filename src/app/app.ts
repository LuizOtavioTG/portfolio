import { Component } from '@angular/core';
import { AboutSection, AboutSectionContent } from './components/about-section/about-section';
import { ContactInfo, ContactSection } from './components/contact-section/contact-section';
import { CourseSection } from './components/course-section/course-section';
import { FeaturedProject, FeaturedProjects } from './components/featured-projects/featured-projects';
import { IntroHero } from './components/intro-hero/intro-hero';
import { SiteHeader } from './components/site-header/site-header';
import { SkillCategory, SkillStack } from './components/skill-stack/skill-stack';

@Component({
  selector: 'app-root',
  imports: [SiteHeader, IntroHero, FeaturedProjects, SkillStack, CourseSection, AboutSection, ContactSection],
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
      status: 'Deploy publicado',
      summary:
        'Sistema de produtividade baseado na técnica Pomodoro, publicado para uso direto no portfólio.',
      technologies: ['Angular', 'Java', 'Spring Boot'],
      highlights: ['Ciclos de foco', 'Pausas programadas', 'Uso embutido no portfólio', 'Deploy na Vercel'],
      decision:
        'Embutir a aplicação via iframe para permitir testar o timer sem sair do portfólio, mantendo também o link externo.',
      preview: {
        kind: 'iframe',
        label: 'Pomodoro Timer',
        url: 'https://pomodoro-timer-theta-pearl.vercel.app/',
      },
      liveUrl: 'https://pomodoro-timer-theta-pearl.vercel.app/',
    },
    {
      name: 'Stock Manager',
      status: 'Aguardando deploy',
      summary:
        'API para gerenciamento de produtos, categorias, estoque e inventário com autenticação JWT e ambiente Docker.',
      technologies: ['Java 17', 'Spring Boot 3.4.5', 'PostgreSQL', 'Flyway', 'JWT', 'Docker'],
      highlights: ['Autenticação JWT', 'Permissões por perfil', 'CRUD de produtos', 'Controle de estoque'],
      decision:
        'Organizar a API em camadas, com validação, segurança e migrations para manter o domínio previsível.',
      preview: {
        kind: 'placeholder',
        label: 'Preview do Stock Manager será ativado após o deploy.',
      },
    },
    {
      name: 'Sistema de Ordens de Serviço',
      status: 'Aguardando deploy',
      summary:
        'Plataforma para gerenciamento de ordens de serviço, clientes, equipe, agenda e operação mobile/offline.',
      technologies: ['Next.js', 'React', 'TypeScript', 'Java 17', 'Spring Boot', 'PostgreSQL'],
      highlights: ['Dashboard de OS', 'Controle de acesso', 'Agenda', 'Mobile Android', 'Offline sync'],
      decision:
        'Combinar frontend web/mobile com API Spring Boot para suportar operação em campo e sincronização posterior.',
      preview: {
        kind: 'placeholder',
        label: 'Preview das ordens de serviço será ativado após o deploy.',
      },
    },
  ];

  protected readonly skillCategories: SkillCategory[] = [
    {
      name: 'Front-end',
      description: 'Interfaces web, experiência do usuário e aplicações modernas.',
      skills: ['Angular', 'React', 'Next.js', 'TypeScript'],
    },
    {
      name: 'Back-end',
      description: 'APIs, regras de negócio, autenticação e integração entre sistemas.',
      skills: ['Java', 'Spring Boot', 'Node.js'],
    },
    {
      name: 'Banco de dados',
      description: 'Modelagem, persistência e consultas para aplicações transacionais.',
      skills: ['PostgreSQL', 'MySQL', 'MongoDB'],
    },
    {
      name: 'Ferramentas',
      description: 'Versionamento, conteinerização e infraestrutura de apoio ao deploy.',
      skills: ['Git', 'Docker', 'Nginx'],
    },
  ];

  protected readonly aboutContent: AboutSectionContent = {
    intro:
      'Sou desenvolvedor full-stack, formado em Administração pela UEL e estudante de Engenharia de Software. Minha trajetória combina negócios, marketing e tecnologia, passando por consultoria empresarial, gestão de marketing e desenvolvimento de software.',
    experience:
      'Atuei como desenvolvedor júnior na Integra.do, trabalhando com integrações de software e SDKs. Hoje trabalho como autônomo, focado no desenvolvimento de aplicações web modernas, funcionais e bem estruturadas.',
    difference:
      'Minha principal diferença é unir visão de negócio com conhecimento técnico para criar soluções que sejam úteis, bem pensadas e preparadas para uso real.',
    details: [
      {
        title: 'Busco',
        text: 'Vagas e projetos full-stack em que eu possa atuar em produtos web, APIs e sistemas com impacto prático para o negócio.',
      },
      {
        title: 'Como trabalho',
        text: 'Gosto de entender o problema antes da tela ou do código, quebrar entregas em etapas pequenas e manter a solução simples de evoluir.',
      },
      {
        title: 'Interesses',
        text: 'Aplicações web modernas, integrações, automação de processos, experiência do usuário, arquitetura de APIs e produtos SaaS.',
      },
      {
        title: 'Cursos',
        text: 'Mantenho uma base de cursos concluídos para evidenciar estudo contínuo em Angular, Java, APIs, Git, Docker e fundamentos de software.',
      },
    ],
  };

  protected readonly contactInfo: ContactInfo = {
    email: 'bc.luizo@gmail.com',
    linkedin: 'https://www.linkedin.com/in/luiz-otavio-torrecillas-gil/',
    github: 'https://github.com/LuizOtavioTG',
    resumeStatus: 'Currículo em PDF pendente',
  };
}
