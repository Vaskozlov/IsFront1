import {apiBaseUrl, createUrlWithParameters} from './query';

export async function savePerson(p: any) {
  const url = createUrlWithParameters(`${apiBaseUrl}/person/save`)
  const response = await fetch(url, {
    method: 'POST', mode: 'cors', body: JSON.stringify(p), headers: {
      'Content-Type': 'application/json',
    },
  })
  return response.ok
}
