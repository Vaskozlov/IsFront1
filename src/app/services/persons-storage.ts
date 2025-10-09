import {Person} from '../person.model';
import {PersonWs} from './person-ws';
import {getPersons} from '../rest/get-persons';
import {Injectable} from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class PersonsStorage {
  public persons: Person[] = new Array<Person>();

  constructor(private personWs: PersonWs) {
    this.personWs.updates$.subscribe(p => this.onPersonUpdate(p))
    this.personWs.delete$.subscribe(id => this.onPersonDeleted(id));

    this.fullUpdate()
  }

  public fullUpdate() {
    getPersons().then(persons => {
      for (const p of persons) {
        this.onPersonUpdate(p)
      }
    })
  }

  public onPersonDeleted(id: Number): void {
    this.persons = this.persons.filter(p => p.id !== id)
  }

  public onPersonUpdate(updatedPerson: Person): void {
    const index = this.persons.findIndex(p => p.id === updatedPerson.id);

    if (index > -1) {
      this.persons[index] = updatedPerson;
    } else {
      this.persons.push(updatedPerson)
    }
  }
}
