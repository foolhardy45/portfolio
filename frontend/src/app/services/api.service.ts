import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, catchError, throwError } from 'rxjs';
import { environment } from '../../environments/environment';
import type { Project } from '../models/project.model';
import type { ContactForm } from '../models/contact.model';
import type { ApiResponse } from '../models/api-response.model';

@Injectable({ providedIn: 'root' })
export class ApiService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = environment.apiUrl;

  // -- Generic HTTP methods --

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
    return this.get<Project[]>('/projects?all=true');
  }

  getFeaturedProjects(): Observable<Project[]> {
    return this.get<Project[]>('/projects');
  }

  getProjectById(id: string): Observable<Project> {
    return this.get<Project>(`/projects/${id}`);
  }

  getProjectBySlug(slug: string): Observable<Project> {
    return this.get<Project>(`/projects/slug/${slug}`);
  }

  // -- Contact --

  sendContactMessage(data: ContactForm): Observable<ApiResponse<null>> {
    return this.post<ApiResponse<null>>('/contact', data);
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
