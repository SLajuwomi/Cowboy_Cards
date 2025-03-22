// Define the allowed HTTP methods as a type union
type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE';

// Interface defining the structure of options that can be passed to fetch requests
interface FetchOptions {
  method?: HttpMethod;      // The HTTP method to use (GET, POST, PUT, DELETE)
  headers?: any;           // Custom headers to include in the request
  // body?: any;              // Data to send in the request body
  // credentials?: string;    // How to handle credentials (cookies, auth headers)
}

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
export async function fetchData<T>(url: string, options: FetchOptions = {}): Promise<T> {
  // Destructure options with default values
  const {
    method = 'GET',        // Default to GET if no method specified
    headers = {},          // Default to empty headers object
    // body,                  // Body is optional
    // credentials = 'include', // Include credentials by default (cookies, auth headers)
  } = options;

  // Prepare the request options object
  const requestOptions: RequestInit = {
    method,               // HTTP method to use
    headers: {
      'Content-Type': 'application/json',  // Set default content type to JSON
      ...headers,                          // Merge any custom headers
    },
    // credentials: 'include',                // Include credentials in the request
  };

  // Add body to request if it exists and method isn't GET
  // GET requests shouldn't have a body according to HTTP spec
  // if (body && method !== 'GET') {
  //   // If body is already a string, use it as is, otherwise stringify it
  //   requestOptions.body = typeof body === 'string' ? body : JSON.stringify(body);
  // }

  try {
    // Make the actual HTTP request
    const response = await fetch(url, requestOptions);
    
    // Check if the response was successful (status 200-299)
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
    
    // Check if the response is JSON
    const contentType = response.headers.get('content-type');
    // Content type is currently not returning as application/json. Danny is working on it.
    // if (contentType && contentType.includes('application/json')) {
    if (contentType) {
      // Parse and return JSON response
      const data = await response.json();
      return data as T;
    }
    
    // Return null for non-JSON responses
    return null as T;
  } catch (error) {
    // Log any errors that occur during the request
    console.error('API request failed:', error);
    throw error;  // Re-throw the error to be handled by the caller
  }
}

// Create a convenient API object with methods for each HTTP verb
// This makes it easier to make requests without specifying the method
 export const api ={
  // GET request helper
  get: <T>(url: string, options: Omit<FetchOptions, 'method'> = {}) => 
    fetchData<T>(url, { ...options, method: 'GET' }),
    
  // POST request helper
  post: <T>(url: string, options: Omit<FetchOptions, 'method' | 'body'> = {}) => 
    fetchData<T>(url, { ...options, method: 'POST'  }),
    
  // PUT request helper
  put: <T>(url: string, options: Omit<FetchOptions, 'method' | 'body'> = {}) => 
    fetchData<T>(url, { ...options, method: 'PUT'  }),
    
  // DELETE request helper
  delete: <T>(url: string, options: Omit<FetchOptions, 'method'> = {}) => 
    fetchData<T>(url, { ...options, method: 'DELETE' }),
};