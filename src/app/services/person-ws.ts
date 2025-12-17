import {Injectable, OnDestroy} from '@angular/core';
import {Observable, Subject} from 'rxjs';
import {BroadcastMessage, Person, PersonState} from '../person.model';

@Injectable({
  providedIn: 'root'
})
export class PersonWs implements OnDestroy {
  private ws!: WebSocket
  private updatesSubject = new Subject<Person>()
  public updates$: Observable<Person> = this.updatesSubject.asObservable()

  private deleteSubject = new Subject<Number>()
  public delete$: Observable<Number> = this.deleteSubject.asObservable()

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
        const message: BroadcastMessage = JSON.parse(event.data);

        if (message.state === PersonState.UPDATED) {
          const person: Person = ({...message.person, creationTime: new Date(message.person.creationTime!)});
          this.updatesSubject.next(person)
        } else if (message.person.id != null) {
          this.deleteSubject.next(message.person.id);
        }
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
