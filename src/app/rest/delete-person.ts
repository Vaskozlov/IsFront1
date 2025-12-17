import {apiBaseUrl, createUrlWithParameters} from './query';

export async function deletePerson(p: any) {
  const url = createUrlWithParameters(`${apiBaseUrl}/person/delete`, {"id": p.id})
  return await fetch(url, {
    method: 'DELETE',
    mode: 'cors',
  })
}
