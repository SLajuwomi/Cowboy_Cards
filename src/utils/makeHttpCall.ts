type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE';
type CredentialOptions = 'include' | 'omit' | 'same-origin';

// Interface defining the structure of options that can be passed to fetch requests
interface FetchOptions {
  method: HttpMethod;
  headers: any;
  credentials?: CredentialOptions;
  body?: string; //JSON
}

const defaultOpts: FetchOptions = {
  method: 'GET',
  headers: {},
  credentials: 'include', //dev only, remove in prod same origin
};

// *****************************
// comment one, uncomment the other:
// const API_BASE = import.meta.env.VITE_API_BASE_LIVE;
const API_BASE = import.meta.env.VITE_API_BASE_OLD;
// const API_BASE = import.meta.env.VITE_API_BASE_LOCAL;
// *****************************

/**
 * Universal fetch utility for making HTTP requests
 * This is a wrapper around the native fetch API that provides consistent error handling
 * and response parsing
 * Can return any type of data
 *
 * @param url The URL to fetch from
 * @param options Request options including method, headers, and body
 * @returns Promise with the parsed response data
 */
export async function makeHttpCall<T>(
  url: string = '',
  options: FetchOptions = defaultOpts
): Promise<T> {
  const finalOpts = {
    ...defaultOpts,
    ...options,
  };
  try {
    // Make the actual HTTP request
    const response = await fetch(API_BASE + url, finalOpts);

    // Check if the response was successful (status 200-299)
    if (!response.ok) {
      console.log('resp', response);
      // Handle specific auth error types
      //   if (data.code === 'duplicate_email') {
      //     throw new Error('This email is already registered');
      //   } else if (data.code === 'duplicate_username') {
      //     throw new Error('This username is already taken');
      //   } else if (data.code === 'invalid_credentials') {
      //     throw new Error('Invalid email or password');
      //   } else {
      //     throw new Error(data.message || 'Authentication failed');
      //   }
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    // all responses should be json now
    const data = await response.json();
    return data as T;
  } catch (error) {
    console.error('API request failed:', error);
    throw error;
  }
}
