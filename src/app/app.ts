import { AfterViewInit, Component, NgZone, OnDestroy } from '@angular/core';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { AboutSection, AboutSectionContent } from './components/about-section/about-section';
import { ContactInfo, ContactSection } from './components/contact-section/contact-section';
import { CourseSection } from './components/course-section/course-section';
import { FeaturedProject, FeaturedProjects } from './components/featured-projects/featured-projects';
import { IntroHero } from './components/intro-hero/intro-hero';
import { SiteFooter } from './components/site-footer/site-footer';
import { SiteHeader } from './components/site-header/site-header';
import { SkillCategory, SkillStack } from './components/skill-stack/skill-stack';

@Component({
  selector: 'app-root',
  imports: [SiteHeader, IntroHero, FeaturedProjects, SkillStack, CourseSection, AboutSection, ContactSection, SiteFooter],
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App implements AfterViewInit, OnDestroy {
  private animationFrameIds: number[] = [];
  private readonly handleHashChange = (): void => this.scheduleHashScrollRefresh();

  constructor(private readonly ngZone: NgZone) {
    gsap.registerPlugin(ScrollTrigger);
  }

  ngAfterViewInit(): void {
    this.ngZone.runOutsideAngular(() => {
      window.addEventListener('hashchange', this.handleHashChange);
      this.scheduleHashScrollRefresh();
    });
  }

  ngOnDestroy(): void {
    window.removeEventListener('hashchange', this.handleHashChange);

    for (const frameId of this.animationFrameIds) {
      window.cancelAnimationFrame(frameId);
    }

    this.animationFrameIds = [];
  }

  protected readonly profile = {
    name: 'Luiz',
    role: 'Desenvolvedor full-stack',
    intro:
      'Desenvolvedor full-stack com foco em aplicações web, APIs e integrações. Projetos construídos com atenção à performance, acessibilidade, organização de código e valor para o negócio.',
  };

  protected readonly featuredProjects: FeaturedProject[] = [
    {
      name: 'Pomodoro Timer',
      status: 'Deploy publicado',
      summary:
        'Aplicação de produtividade para organizar o tempo em ciclos de foco e descanso. O usuário escolhe uma tarefa, inicia uma sessão de concentração e acompanha quantos ciclos concluiu ao longo do dia.',
      technologies: ['Angular', 'TypeScript', 'HTML', 'SCSS'],
      highlights: [
        'Ciclos de foco e pausa',
        'Tarefas ativas',
        'Ciclos por tarefa',
        'Histórico diário',
        'Tema, notificações e localStorage',
      ],
      decision:
        'Construí em Angular com serviços para temporizador, tarefas, configurações e histórico. Usei localStorage para persistir dados e testes para validar os principais fluxos.',
      preview: {
        kind: 'iframe',
        label: 'Pomodoro Timer',
        url: 'https://pomodoro-timer-theta-pearl.vercel.app/',
      },
      liveUrl: 'https://pomodoro-timer-theta-pearl.vercel.app/',
      githubUrl: 'https://github.com/LuizOtavioTG/pomodoro-timer',
    },
    {
      name: 'Stock Manager',
      status: 'Deploy publicado',
      summary:
        'Sistema de gerenciamento de estoque criado para controlar produtos, locais de armazenamento, inventário e movimentações de entrada e saída. O projeto simula uma solução usada por empresas para manter o estoque organizado, rastreável e atualizado.',
      technologies: ['Java 17', 'Spring Boot 3.4.5', 'PostgreSQL', 'Flyway', 'JWT', 'Docker'],
      highlights: [
        'Cadastro e gerenciamento de produtos',
        'Controle de inventário',
        'Registro de entradas e saídas de estoque',
        'Organização por locais de armazenamento',
        'Consulta de movimentações com paginação',
        'Validação dos dados enviados ao sistema',
      ],
      decision:
        'Organizei o sistema em camadas com Spring Boot, separando regras de negócio, acesso a dados e objetos de transferência. Usei PostgreSQL, JPA, Flyway e JWT para criar uma estrutura segura, versionada e próxima de um cenário real.',
      preview: {
        kind: 'iframe',
        label: 'Stock Manager',
        url: 'https://stock-manager.ludev.com.br/',
      },
      liveUrl: 'https://stock-manager.ludev.com.br/',
      githubUrl: 'https://github.com/LuizOtavioTG/stock-manager',
    },
    {
      name: 'Sistema de Ordens de Serviço',
      status: 'Aguardando deploy',
      summary:
        'Sistema para gerenciamento de ordens de serviço, criado para organizar atendimentos, clientes, equipe técnica e agenda de trabalho. O projeto simula uma solução usada por empresas que precisam controlar solicitações, acompanhar o andamento dos serviços e manter a operação funcionando em campo.',
      technologies: ['Next.js', 'React', 'TypeScript', 'Java 17', 'Spring Boot', 'PostgreSQL'],
      highlights: [
        'Cadastro e acompanhamento de ordens de serviço',
        'Gerenciamento de clientes',
        'Organização da equipe técnica',
        'Agenda de atendimentos',
        'Controle de acesso',
        'Visualização de informações em dashboard',
        'Suporte a operação mobile',
        'Sincronização para uso offline e atualização posterior',
      ],
      decision:
        'Estruturei o projeto combinando uma interface web/mobile com backend em Spring Boot, pensando em uma operação que também funcione fora do ambiente de escritório. A proposta técnica foi permitir que a equipe consulte e registre informações em campo, com sincronização posterior dos dados quando houver conexão disponível.',
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
        text: 'Busco novos desafios como desenvolvedor full-stack, especialmente em produtos web, integrações, APIs e sistemas internos. Quero atuar em projetos onde tecnologia seja usada para melhorar processos, automatizar tarefas e gerar impacto real para usuários e empresas.',
      },
      {
        title: 'Como trabalho',
        text: 'Antes de começar pelo código, procuro entender o problema, o usuário e o contexto do negócio. Depois, divido a entrega em etapas menores, priorizo uma solução funcional e mantenho o código organizado para que o projeto possa evoluir com segurança.',
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

  private scheduleHashScrollRefresh(): void {
    const firstFrame = window.requestAnimationFrame(() => {
      const secondFrame = window.requestAnimationFrame(() => {
        ScrollTrigger.refresh();

        this.scrollToCurrentHash();

        const thirdFrame = window.requestAnimationFrame(() => {
          ScrollTrigger.refresh();
        });

        this.animationFrameIds.push(thirdFrame);
      });

      this.animationFrameIds.push(secondFrame);
    });

    this.animationFrameIds.push(firstFrame);
  }

  private scrollToCurrentHash(): void {
    const hash = window.location.hash.replace('#', '');

    if (!hash) {
      return;
    }

    const target = document.getElementById(decodeURIComponent(hash));

    if (!target) {
      return;
    }

    const root = document.documentElement;
    const previousScrollBehavior = root.style.scrollBehavior;

    root.style.scrollBehavior = 'auto';

    try {
      target.scrollIntoView({
        block: 'start',
        inline: 'nearest',
        behavior: 'auto',
      });
    } finally {
      root.style.scrollBehavior = previousScrollBehavior;
    }
  }
}
