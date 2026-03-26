import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, catchError, map, throwError } from 'rxjs';
import { environment } from '../../environments/environment';
import type { Project } from '../models/project.model';
import type { ContactForm } from '../models/contact.model';

@Injectable({ providedIn: 'root' })
export class ApiService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = environment.apiUrl;

  private get<T>(path: string): Observable<T> {
    return this.http.get<T>(`${this.baseUrl}${path}`).pipe(
      catchError(this.handleError),
    );
  }

  private post<T>(path: string, body: unknown): Observable<T> {
    return this.http.post<T>(`${this.baseUrl}${path}`, body).pipe(
      catchError(this.handleError),
    );
  }

  // -- Projects --

  getProjects(): Observable<Project[]> {
    return this.get<{ data: Project[]; count: number }>('/projects').pipe(
      map((res) => res.data),
    );
  }

  getFeaturedProjects(): Observable<Project[]> {
    return this.get<{ data: Project[]; count: number }>('/projects?featured=true').pipe(
      map((res) => res.data),
    );
  }

  getProjectBySlug(slug: string): Observable<Project> {
    return this.get<{ data: Project }>(`/projects/${slug}`).pipe(
      map((res) => res.data),
    );
  }

  // -- Contact --

  sendContactMessage(data: ContactForm): Observable<{ message: string }> {
    return this.post<{ message: string }>('/contact', data);
  }

  // -- Health --

  healthCheck(): Observable<{ status: string; timestamp: string; database: string }> {
    return this.get('/health');
  }

  // -- Error handling --

  private handleError(error: HttpErrorResponse): Observable<never> {
    let message: string;

    if (error.status === 0) {
      message = 'Impossible de contacter le serveur. Vérifiez votre connexion.';
    } else if (error.error?.error) {
      message = error.error.error;
    } else {
      message = `Erreur ${error.status}: ${error.statusText}`;
    }

    console.error('[ApiService]', message, error);
    return throwError(() => new Error(message));
  }
}
