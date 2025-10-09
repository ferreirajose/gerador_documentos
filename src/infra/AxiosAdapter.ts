// AxiosAdapter.ts
import axios from "axios";
import HttpClient, { HttpConfig } from "./HttpClient";
export default class AxiosAdapter implements HttpClient {
  private axiosInstance;

  constructor() {
    this.axiosInstance = axios.create({
      timeout: 10000, // 10 seconds default
    });
  }

  async get<T = any>(url: string, config?: HttpConfig): Promise<T> {
    const response = await this.axiosInstance.get<T>(url, this.adaptConfig(config));
    return response.data;
  }

  async post<T = any>(url: string, body: any, config?: HttpConfig): Promise<T> {
    const response = await this.axiosInstance.post<T>(url, body, this.adaptConfig(config));
    return response.data;
  }

  async delete<T = any>(url: string, config?: HttpConfig): Promise<T> {
    const response = await this.axiosInstance.delete<T>(url, this.adaptConfig(config));
    return response.data;
  }

  async put<T = any>(url: string, body: any, config?: HttpConfig): Promise<T> {
    const response = await this.axiosInstance.put<T>(url, body, this.adaptConfig(config));
    return response.data;
  }

  async patch<T = any>(url: string, body: any, config?: HttpConfig): Promise<T> {
    const response = await this.axiosInstance.patch<T>(url, body, this.adaptConfig(config));
    return response.data;
  }

  private adaptConfig(config?: HttpConfig): any {
    if (!config) return undefined;

    return {
      headers: config.headers,
      params: config.params,
      timeout: config.timeout,
    };
  }
}
