import {Injectable} from '@angular/core';
import {HttpClient, HttpResponse} from '@angular/common/http';
import {Operation, Person} from '../person.model';
import {apiBaseUrl} from '../rest/query';
import {firstValueFrom} from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  constructor(private http: HttpClient) {
  }

  async savePerson(person: Person): Promise<HttpResponse<Person>> {
    const observable = this.http.post<Person>(`${apiBaseUrl}/person/save`, person, {observe: 'response'});
    return firstValueFrom(observable);
  }

// For updatePerson
  async updatePerson(person: any): Promise<HttpResponse<void>> {
    const observable = this.http.post<void>(`${apiBaseUrl}/person/update`, person, {observe: 'response'});
    return firstValueFrom(observable);
  }

// For deletePerson
  async deletePerson(id: number): Promise<HttpResponse<void>> {
    const observable = this.http.delete<void>(`${apiBaseUrl}/person/delete?id=${id}`, {observe: 'response'});
    return firstValueFrom(observable);
  }

// For uploadCsvFile (if it needs full response)
  async uploadCsvFile(csvContent: string, username: string): Promise<HttpResponse<any>> {
    const payload = {content: csvContent, username};
    const observable = this.http.post(`${apiBaseUrl}/person/save_all`, payload, {observe: 'response'});
    return firstValueFrom(observable);
  }

  async getPersons(): Promise<Person[]> {
    const observable = this.http.get<Person[]>(`${apiBaseUrl}/person/get_persons`);
    return firstValueFrom(observable);
  }

  async getOperations(username: string): Promise<Operation[]> {
    const observable = this.http.get<Operation[]>(`${apiBaseUrl}/operations?username=${username}`);
    return firstValueFrom(observable);
  }

  async downloadFile(objectName: string): Promise<Blob> {
    const observable = this.http.get(`${apiBaseUrl}/download?objectName=${objectName}`, {responseType: 'blob'});
    return firstValueFrom(observable);
  }
}
