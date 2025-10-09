import {apiBaseUrl, createUrlWithParameters} from './query';

export async function updatePerson(p: any) {
  const url = createUrlWithParameters(`${apiBaseUrl}/person/update`)
  return fetch(url, {method: 'POST', mode: 'cors', body: JSON.stringify(p)})
}
