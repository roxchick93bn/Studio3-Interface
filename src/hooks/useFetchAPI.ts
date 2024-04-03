import fetchAPI from '@/global/apiUtils';
import { APIRequestMethodType } from '@/global/types';
import {
  useAuthToken,
  useUpdateAuthToken,
  useUpdateAuthWallet,
} from '@/state/application/hooks';

export default function useFetchAPI() {
  const authToken = useAuthToken();
  const updateAuthToken = useUpdateAuthToken();
  const updateAuthWallet = useUpdateAuthWallet();

  return (
    url: string,
    method: APIRequestMethodType = 'GET',
    payload: any = null,
    isJSON = true,
    isParseJSON = true
  ) => {
    return fetchAPI(url, method, authToken, payload, isJSON, isParseJSON)
      .then((res) => res)
      .catch((error: Error) => {
        if (error.message === 'Invalid auth token') {
          updateAuthToken(null);
          updateAuthWallet(null);
        }
        throw error;
      });
  };
}
