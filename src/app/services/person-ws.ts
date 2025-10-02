import {Injectable, OnDestroy} from '@angular/core';
import {Observable, Subject} from 'rxjs';
import {Person} from '../person.model';

@Injectable({
  providedIn: 'root'
})
export class PersonWs implements OnDestroy
{
  private ws!: WebSocket
  private updatesSubject = new Subject<Person>()
  public updates$: Observable<Person> = this.updatesSubject.asObservable()
  private readonly url = 'ws://localhost:8080/is-1/ws/subscribe'

  constructor() {
    this.connect()
  }

  private connect(): void {
    this.ws = new WebSocket(this.url)

    this.ws.onopen = () => {
      console.log('WebSocket connected to server')
    }

    this.ws.onmessage = (event) => {
      try {
        const data: Person = JSON.parse(event.data);
        const person: Person = ({...data, creationTime: new Date(data.creationTime)});
        this.updatesSubject.next(person)
      } catch (e) {

      }
    }

    this.ws.onclose = () => {
      setTimeout(() => this.connect(), 2000)
    }

    this.ws.onerror = (err) => {
      console.log(`An error occurred ${err}`)
      this.ws.close()
    }
  }

  ngOnDestroy(): void {
    this.ws.close()
    this.updatesSubject.complete()
  }
}
