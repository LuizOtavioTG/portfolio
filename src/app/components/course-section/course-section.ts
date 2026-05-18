import { Component, computed, signal } from '@angular/core';
import { HoverLift } from '../../directives/hover-lift';
import { ScrambleText } from '../../directives/scramble-text';
import { ScrollReveal } from '../../directives/scroll-reveal';
import coursesData from '../../../assets/data/alura-courses.json';

type CourseTrack = 'Angular' | 'Java e Spring' | 'Git' | 'Docker' | 'IA' | 'Outros';

interface AluraCourse {
  id: number;
  name: string;
  slug: string;
  progress: number;
  finished: boolean;
  platform: string;
  courseUrl: string;
  certificateUrl: string;
}

interface AluraCoursesData {
  updatedAt: string;
  platform: string;
  totalCourses: number;
  courses: readonly AluraCourse[];
}

interface CourseFilter {
  label: CourseTrack | 'Todos';
  count: number;
}

const COURSE_TRACKS: readonly CourseTrack[] = ['Angular', 'Java e Spring', 'Git', 'Docker', 'IA', 'Outros'];
const ALL_FILTER = 'Todos';
const data = coursesData as AluraCoursesData;

@Component({
  selector: 'app-course-section',
  imports: [ScrambleText, ScrollReveal, HoverLift],
  templateUrl: './course-section.html',
  styleUrl: './course-section.scss',
})
export class CourseSection {
  protected readonly activeFilter = signal<CourseFilter['label']>(ALL_FILTER);

  protected readonly courses = data.courses.map((course) => ({
    ...course,
    track: this.resolveTrack(course.name),
  }));

  protected readonly filters = computed<readonly CourseFilter[]>(() => [
    { label: ALL_FILTER, count: this.courses.length },
    ...COURSE_TRACKS.map((track) => ({
      label: track,
      count: this.courses.filter((course) => course.track === track).length,
    })),
  ]);

  protected readonly filteredCourses = computed(() => {
    const activeFilter = this.activeFilter();

    if (activeFilter === ALL_FILTER) {
      return this.courses;
    }

    return this.courses.filter((course) => course.track === activeFilter);
  });

  protected readonly trackHighlights = computed(() =>
    COURSE_TRACKS.map((track) => ({
      name: track,
      count: this.courses.filter((course) => course.track === track).length,
      description: this.trackDescription(track),
    })),
  );

  protected selectFilter(filter: CourseFilter['label']): void {
    this.activeFilter.set(filter);
  }

  private resolveTrack(courseName: string): CourseTrack {
    const normalizedName = courseName.toLowerCase();

    if (normalizedName.includes('angular')) {
      return 'Angular';
    }

    if (normalizedName.includes('java') || normalizedName.includes('spring')) {
      return 'Java e Spring';
    }

    if (normalizedName.includes('git')) {
      return 'Git';
    }

    if (normalizedName.includes('docker')) {
      return 'Docker';
    }

    if (
      normalizedName.includes('chatgpt') ||
      normalizedName.includes('ia') ||
      normalizedName.includes('inteligencia artificial')
    ) {
      return 'IA';
    }

    return 'Outros';
  }

  private trackDescription(track: CourseTrack): string {
    const descriptions: Record<CourseTrack, string> = {
      Angular: 'Componentes, rotas, forms, acessibilidade, animações e consumo de APIs.',
      'Java e Spring': 'APIs, orientação a objetos, boas práticas, testes e fundamentos back-end.',
      Git: 'Versionamento, colaboração e fluxo de trabalho com repositórios.',
      Docker: 'Containers e ambiente de execução para aplicações.',
      IA: 'Uso prático de ferramentas de IA no fluxo de estudo e produtividade.',
      Outros: 'Fundamentos complementares, produtividade e desenvolvimento profissional.',
    };

    return descriptions[track];
  }
}
