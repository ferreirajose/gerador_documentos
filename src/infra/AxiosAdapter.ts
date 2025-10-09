// AxiosAdapter.ts
import axios, { AxiosResponse } from "axios";
import HttpClient, { HttpConfig } from "./HttpClient";
export default class AxiosAdapter implements HttpClient {
  private axiosInstance;

  constructor() {
    this.axiosInstance = axios.create();
  }

  async get<T = any>(url: string, config?: HttpConfig): Promise<T> {
    const response = await this.axiosInstance.get<T>(url, this.adaptConfig(config));
    return this.handleResponse(response, config);
  }

  async post<T = any>(url: string, body: any, config?: HttpConfig): Promise<T> {
    const response = await this.axiosInstance.post<T>(url, body, this.adaptConfig(config));
    return this.handleResponse(response, config);
  }

  async delete<T = any>(url: string, config?: HttpConfig): Promise<T> {
    const response = await this.axiosInstance.delete<T>(url, this.adaptConfig(config));
    return this.handleResponse(response, config);
  }

  async put<T = any>(url: string, body: any, config?: HttpConfig): Promise<T> {
    const response = await this.axiosInstance.put<T>(url, body, this.adaptConfig(config));
    return this.handleResponse(response, config);
  }

  async patch<T = any>(url: string, body: any, config?: HttpConfig): Promise<T> {
    const response = await this.axiosInstance.patch<T>(url, body, this.adaptConfig(config));
    return this.handleResponse(response, config);
  }

  private adaptConfig(config?: HttpConfig): any {
    if (!config) return undefined;

    const adaptedConfig: any = {
      headers: config.headers,
      params: config.params,
      timeout: config.timeout,
      responseType: config.responseType || 'json',
    };

    // Adiciona o signal do AbortController se existir
    if (config.signal) {
      adaptedConfig.signal = config.signal;
    }

    return adaptedConfig;
  }

  private handleResponse<T>(response: AxiosResponse<T>, config?: HttpConfig): T {
    // Se responseType for 'stream', retorna o stream diretamente
    if (config?.responseType === 'stream') {
      return response.data;
    }
    
    // Para outros tipos, retorna os dados processados
    return response.data;
  }
}