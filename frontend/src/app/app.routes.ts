import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    title: 'Tayrell — Développeur Fullstack',
    data: { description: 'Portfolio de Tayrell Ajinca — Développeur fullstack Angular & Python. Projets, compétences et contact.' },
    loadComponent: () =>
      import('./pages/home/home-page.component').then((m) => m.HomePageComponent),
  },
  {
    path: 'projets',
    title: 'Projets — Tayrell',
    data: { description: 'Découvrez les projets fullstack de Tayrell Ajinca : applications Angular, APIs Flask, bases PostgreSQL.' },
    loadComponent: () =>
      import('./pages/projects/projects-page.component').then((m) => m.ProjectsPageComponent),
  },
  {
    path: 'projets/:slug',
    title: 'Projet — Tayrell',
    data: { description: 'Détails d\'un projet fullstack réalisé par Tayrell Ajinca.' },
    loadComponent: () =>
      import('./pages/project-detail/project-detail-page.component')
        .then((m) => m.ProjectDetailPageComponent),
  },
  {
    path: 'a-propos',
    title: 'À propos — Tayrell',
    data: { description: 'Parcours, formation et compétences techniques de Tayrell Ajinca, développeur fullstack en alternance.' },
    loadComponent: () =>
      import('./pages/about/about-page.component').then((m) => m.AboutPageComponent),
  },
  {
    path: 'hobbies',
    title: 'Hobbies — Tayrell',
    data: { description: 'Les centres d\'intérêt de Tayrell Ajinca : volley, gaming, manga et musique.' },
    loadComponent: () =>
      import('./pages/hobbies/hobbies-page.component').then((m) => m.HobbiesPageComponent),
  },
  {
    path: 'contact',
    title: 'Contact — Tayrell',
    data: { description: 'Contactez Tayrell Ajinca pour un projet, une collaboration ou une opportunité.' },
    loadComponent: () =>
      import('./pages/contact/contact-page.component').then((m) => m.ContactPageComponent),
  },
  {
    path: '**',
    redirectTo: '',
  },
];
