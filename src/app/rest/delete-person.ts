import {apiBaseUrl, createUrlWithParameters} from './query';

export async function deletePerson(p: any) {
  const url = createUrlWithParameters(`${apiBaseUrl}/person/delete`)
  return await fetch(url, {
    method: 'POST', mode: 'cors', body: JSON.stringify(p), headers: {
      'Content-Type': 'application/json',
    },
  })
}
