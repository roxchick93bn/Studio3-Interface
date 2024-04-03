import { APIRequestMethodType } from './types';

export async function handleResponse(response: any) {
  const jsonData = response.json();
  if (response.ok) return jsonData;
  if (response.status === 400) {
    // So, a server-side validation error occurred.
    // Server side validation returns a string error message,
    // so parse as text instead of json.
    const error = await response.text();
    throw new Error(error);
  }
  throw new Error('Network response was not ok.');
}

export async function handleTokenResponse(response: any) {
  if (response.ok) return response.text();
  throw new Error('Token response was not ok.');
}

// In a real app, would likely call an error logging service.
export function handleError(error: any) {
  // eslint-disable-next-line no-console
  console.error(`API call failed. ${error}`);
  throw error;
}

export function getHeaderInfo(authToken: string | null, isJSON: boolean) {
  const headerInfo: { [key: string]: string } = {
    ...(isJSON
      ? {
          'Content-Type': 'application/json;charset=utf-8',
          Accept: 'application/vnd.api+json',
        }
      : {}),
    credentials: 'include',
    mode: 'cors',
    ...(authToken
      ? {
          'x-access-tokens': `${authToken}`,
        }
      : {}),
  };

  return headerInfo;
}

async function parseJSON(response: any, isParseJSON: boolean) {
  if (response.status === 204 || response.status === 205) {
    return null;
  }
  if (isParseJSON) return response.json();
  return response.blob();
}

function checkStatus(response: any) {
  if (response.status >= 200 && response.status < 300) {
    return response;
  }
  if (response.status === 401) {
    // store.dispatch(signoutRequest());
  }
  const error = new Error(response.statusText);
  throw error;
}

export function fetchAPI(
  url: string,
  method: APIRequestMethodType = 'GET',
  authToken: string | null = null,
  payload: any = null,
  isJSON = true,
  isParseJSON = true
) {
  const options: { method: APIRequestMethodType; body?: any } = { method };

  const headers = getHeaderInfo(authToken, isJSON);
  // maybe we need to set global API loading status const store = getStore();
  // store.dispatch(setAPILoading(true));
  if (payload) {
    // convert into snake case first
    options.body = isJSON ? JSON.stringify(payload) : payload;
  }
  return fetch(url, {
    ...options,
    headers,
  })
    .then(checkStatus)
    .then((resp) => parseJSON(resp, isParseJSON))
    .then((resp) => {
      if (
        resp.message === 'token is invalid' ||
        resp.message === 'a valid token is missing'
      ) {
        throw new Error('Invalid auth token');
      }
      return resp;
    })
    .catch((err) => {
      throw err;
    });
}

export default fetchAPI;
