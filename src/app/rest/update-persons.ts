import {apiBaseUrl, createUrlWithParameters} from './query';
import {Person} from '../person.model';

export async function updatePerson(p: Person) {
  const url = createUrlWithParameters(`${apiBaseUrl}/person/update`)
  const response = await fetch(url, {method: 'POST', mode: 'cors', body: JSON.stringify(p)})
  return response.ok
}
