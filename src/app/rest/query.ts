export const apiBaseUrl: string = 'http://localhost:8080/is-1/api';

export function createUrlWithParameters(
  endpoint: string,
  params: { [key: string]: any } = {},
  base: string = window.location.href
): string {
  const url = new URL(endpoint, base);

  Object.keys(params)
    .filter(key => params.hasOwnProperty(key))
    .forEach(key => url.searchParams.append(key, params[key].toString()));

  return url.toString();
}
