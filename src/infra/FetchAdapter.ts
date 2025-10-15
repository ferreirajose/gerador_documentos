import HttpClient, { HttpConfig } from "./HttpClient";

export default class FetchAdapter implements HttpClient {
  async get<T = any>(url: string, config?: HttpConfig): Promise<T> {
    return this.request<T>("GET", url, undefined, config);
  }

  async post<T = any>(url: string, body: any, config?: HttpConfig): Promise<T> {
    return this.request<T>("POST", url, body, config);
  }

  async delete<T = any>(url: string, config?: HttpConfig): Promise<T> {
    return this.request<T>("DELETE", url, undefined, config);
  }

  async put<T = any>(url: string, body: any, config?: HttpConfig): Promise<T> {
    return this.request<T>("PUT", url, body, config);
  }

  async patch<T = any>(url: string, body: any, config?: HttpConfig): Promise<T> {
    return this.request<T>("PATCH", url, body, config);
  }

  private async request<T>(
    method: string,
    url: string,
    body?: any,
    config?: HttpConfig
  ): Promise<T> {
    const headers = new Headers(config?.headers);
    
    // Configura content-type automaticamente se não especificado
    if (body && !headers.has("Content-Type")) {
      if (body instanceof FormData) {
        // FormData define seu próprio content-type com boundary
      } else if (typeof body === "object") {
        headers.set("Content-Type", "application/json");
      }
    }

    const requestConfig: RequestInit = {
      method,
      headers,
      signal: config?.signal,
    };

    // Adiciona body se necessário
    if (body) {
      if (body instanceof FormData) {
        requestConfig.body = body;
      } else if (typeof body === "object") {
        requestConfig.body = JSON.stringify(body);
      } else {
        requestConfig.body = body;
      }
    }

    // Adiciona parâmetros de query se especificados
    let finalUrl = url;
    if (config?.params) {
      const urlParams = new URLSearchParams();
      Object.entries(config.params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          urlParams.append(key, String(value));
        }
      });
      finalUrl = `${url}?${urlParams.toString()}`;
    }

    try {
      const response = await fetch(finalUrl, requestConfig);

      // Para responseType 'stream', retorna o Response completo
      if (config?.responseType === 'stream') {
        return response as any;
      }

      // Processa a resposta baseado no content-type
      const contentType = response.headers.get("content-type");
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new HttpError(
          `HTTP error! status: ${response.status}`,
          response.status,
          errorText
        );
      }

      if (contentType?.includes("application/json")) {
        return await response.json() as T;
      } else if (config?.responseType === 'blob' || contentType?.includes("application/octet-stream")) {
        return await response.blob() as T;
      } else if (config?.responseType === 'arraybuffer') {
        return await response.arrayBuffer() as T;
      } else {
        return await response.text() as T;
      }

    } catch (error) {
      if (error instanceof HttpError) {
        throw error;
      }
      if (error.name === "AbortError") {
        throw new HttpError("Request cancelado", 0, "", true);
      }
      throw new HttpError(
        error instanceof Error ? error.message : "Erro desconhecido",
        0
      );
    }
  }
}

class HttpError extends Error {
  constructor(
    message: string,
    public status: number,
    public responseText?: string,
    public cancelled?: boolean
  ) {
    super(message);
    this.name = "HttpError";
  }
}