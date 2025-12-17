import {apiBaseUrl, createUrlWithParameters} from './query';

export async function savePerson(p: any) {
  const url = createUrlWithParameters(`${apiBaseUrl}/person/save`)
  return await fetch(url, {
    method: 'POST',
    mode: 'cors',
    body: JSON.stringify(p),
    headers: {
      'Content-Type': 'application/json',
    },
  })
}

export async function savePersons(p: any) {
  const url = createUrlWithParameters(`${apiBaseUrl}/person/save_all`)
  return await fetch(url, {
    method: 'POST',
    mode: 'cors',
    body: JSON.stringify(p),
    headers: {
      'Content-Type': 'application/json',
    },
  })
}
