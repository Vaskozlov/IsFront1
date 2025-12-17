import {apiBaseUrl, createUrlWithParameters} from './query';
import {Operation, Person} from '../person.model';

export async function getPersons(): Promise<Person[]> {
  const url = createUrlWithParameters(`${apiBaseUrl}/person/get_persons`)
  const response = await fetch(url, {method: 'GET', mode: 'cors'})
  const data = await response.json()

  return data.map((p: any) => ({...p, creationTime: new Date(p.creationTime)}))
}

export async function getOperations(username: String): Promise<Operation[]> {
  const url = createUrlWithParameters(`${apiBaseUrl}/operations`, {"username": username})
  const response = await fetch(url, {method: 'GET', mode: 'cors'})
  const data = await response.json()
  return data.map((o: any) => ({...o, created: new Date(o.created)}))
}
