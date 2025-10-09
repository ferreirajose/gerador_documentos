export default interface HttpClient {
  get<T = any>(url: string, config?: HttpConfig): Promise<T>;
  post<T = any>(url: string, body: any, config?: HttpConfig): Promise<T>;
  delete<T = any>(url: string, config?: HttpConfig): Promise<T>;
  put<T = any>(url: string, body: any, config?: HttpConfig): Promise<T>;
  patch<T = any>(url: string, body: any, config?: HttpConfig): Promise<T>;
}

export interface HttpConfig {
  headers?: Record<string, string>;
  params?: Record<string, any>;
  timeout?: number;
}   