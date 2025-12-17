import {Person} from '../person.model';
import {PersonWs} from './person-ws';
import {Injectable} from '@angular/core';
import {ApiService} from './api.service';

@Injectable({
  providedIn: 'root'
})
export class PersonsStorage {
  public persons: Person[] = new Array<Person>();

  constructor(public personWs: PersonWs, private apiService: ApiService) {
    this.personWs.updates$.subscribe(p => this.onPersonUpdate(p))
    this.personWs.delete$.subscribe(id => this.onPersonDeleted(id));

    this.fullUpdate()
  }

  public fullUpdate() {
    this.apiService.getPersons().then(persons => {
      for (let p of persons) {
        this.onPersonUpdate(p)
      }
    });
  }

  public onPersonDeleted(id: Number): void {
    this.persons = this.persons.filter(p => p.id !== id)
  }

  public onPersonUpdate(updatedPerson: Person): void {
    const index = this.persons.findIndex(p => p.id === updatedPerson.id);
    console.log('updated at ' + index)

    if (index > -1) {
      this.persons[index] = updatedPerson;
    } else {
      this.persons.push(updatedPerson)
    }
  }
}
