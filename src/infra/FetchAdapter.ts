// // FetchAdapter.ts
// import HttpClient, { HttpConfig } from "./HttpClient";

// export default class FetchAdapter implements HttpClient {
//   async get<T = any>(url: string, config?: HttpConfig): Promise<T> {
//     return this.request<T>('GET', url, null, config);
//   }

//   async post<T = any>(url: string, body: any, config?: HttpConfig): Promise<T> {
//     return this.request<T>('POST', url, body, config);
//   }

//   async delete<T = any>(url: string, config?: HttpConfig): Promise<T> {
//     return this.request<T>('DELETE', url, null, config);
//   }

//   async put<T = any>(url: string, body: any, config?: HttpConfig): Promise<T> {
//     return this.request<T>('PUT', url, body, config);
//   }

//   async patch<T = any>(url: string, body: any, config?: HttpConfig): Promise<T> {
//     return this.request<T>('PATCH', url, body, config);
//   }

//   private async request<T>(
//     method: string,
//     url: string,
//     body: any,
//     config?: HttpConfig
//   ): Promise<T> {
//     const {
//       headers = {},
//       params,
//       timeout = 0,
//       responseType = 'json',
//       signal
//     } = config || {};

//     // Construir URL com query parameters
//     const urlWithParams = this.buildUrlWithParams(url, params);

//     // Preparar corpo da requisição
//     const { requestBody, contentType } = this.prepareRequestBody(body, headers);

//     // Configurar headers
//     const requestHeaders: HeadersInit = { ...headers };
//     if (contentType && !requestHeaders['Content-Type']) {
//       requestHeaders['Content-Type'] = contentType;
//     }

//     // Configurar opções do fetch
//     const fetchOptions: RequestInit = {
//       method,
//       headers: requestHeaders,
//       signal,
//     };

//     // Adicionar body se existir (exceto para GET e HEAD)
//     if (body && method !== 'GET' && method !== 'HEAD') {
//       fetchOptions.body = requestBody;
//     }

//     // Configurar timeout usando AbortController
//     let timeoutId: NodeJS.Timeout;
//     const abortController = new AbortController();
    
//     if (timeout > 0) {
//       timeoutId = setTimeout(() => {
//         abortController.abort(`Request timeout after ${timeout}ms`);
//       }, timeout);
//       fetchOptions.signal = abortController.signal;
//     }

//     // Se já existe um signal, combinar com o timeout signal
//     if (signal) {
//       fetchOptions.signal = this.combineSignals(signal, abortController.signal);
//     }

//     try {
//       const response = await fetch(urlWithParams, fetchOptions);

//       // Limpar timeout se a requisição completar
//       if (timeoutId) {
//         clearTimeout(timeoutId);
//       }

//       // Verificar se a resposta é OK
//       if (!response.ok) {
//         throw new FetchError(
//           `HTTP error! status: ${response.status}`,
//           response.status,
//           response.statusText,
//           await response.text().catch(() => '')
//         );
//       }

//       // Processar resposta baseado no responseType
//       return this.handleResponse<T>(response, responseType);
//     } catch (error) {
//       // Limpar timeout em caso de erro
//       if (timeoutId) {
//         clearTimeout(timeoutId);
//       }

//       if (error instanceof FetchError) {
//         throw error;
//       }

//       if (error.name === 'AbortError') {
//         throw new Error('Request cancelled');
//       }

//       throw new Error(`Network error: ${error.message}`);
//     }
//   }

//   private buildUrlWithParams(url: string, params?: Record<string, any>): string {
//     if (!params) return url;

//     const urlObj = new URL(url);
//     Object.keys(params).forEach(key => {
//       const value = params[key];
//       if (Array.isArray(value)) {
//         value.forEach(v => urlObj.searchParams.append(key, v));
//       } else {
//         urlObj.searchParams.append(key, value);
//       }
//     });

//     return urlObj.toString();
//   }

//   private prepareRequestBody(body: any, headers: Record<string, string>): {
//     requestBody: BodyInit | null;
//     contentType: string | null;
//   } {
//     if (!body) {
//       return { requestBody: null, contentType: null };
//     }

//     // Se já é FormData, usar diretamente
//     if (body instanceof FormData) {
//       return { requestBody: body, contentType: null };
//     }

//     // Se é Blob ou ArrayBuffer, usar diretamente
//     if (body instanceof Blob || body instanceof ArrayBuffer) {
//       return { requestBody: body, contentType: headers['Content-Type'] || 'application/octet-stream' };
//     }

//     // Para objetos e arrays, converter para JSON
//     if (typeof body === 'object') {
//       return {
//         requestBody: JSON.stringify(body),
//         contentType: headers['Content-Type'] || 'application/json'
//       };
//     }

//     // Para strings e outros tipos, usar como está
//     return {
//       requestBody: String(body),
//       contentType: headers['Content-Type'] || 'text/plain'
//     };
//   }

//   private async handleResponse<T>(response: Response, responseType: string): Promise<T> {
//     switch (responseType) {
//       case 'stream':
//         // Para stream, retornar o body como ReadableStream
//         return response.body as unknown as T;

//       case 'arraybuffer':
//         return response.arrayBuffer() as unknown as T;

//       case 'blob':
//         return response.blob() as unknown as T;

//       case 'text':
//         return response.text() as unknown as T;

//       case 'json':
//       default:
//         try {
//           return await response.json();
//         } catch (error) {
//           // Se não for JSON válido, retornar texto
//           const text = await response.text();
//           return text as unknown as T;
//         }
//     }
//   }

//   private combineSignals(...signals: (AbortSignal | undefined)[]): AbortSignal {
//     const validSignals = signals.filter(s => s !== undefined) as AbortSignal[];
    
//     if (validSignals.length === 0) {
//       return AbortSignal.timeout(0); // Signal que nunca aborta
//     }

//     if (validSignals.length === 1) {
//       return validSignals[0];
//     }

//     const controller = new AbortController();
    
//     const onAbort = () => {
//       controller.abort();
//     };

//     validSignals.forEach(signal => {
//       if (signal.aborted) {
//         onAbort();
//       } else {
//         signal.addEventListener('abort', onAbort);
//       }
//     });

//     // Cleanup
//     controller.signal.addEventListener('abort', () => {
//       validSignals.forEach(signal => {
//         signal.removeEventListener('abort', onAbort);
//       });
//     });

//     return controller.signal;
//   }
// }

// // Classe de erro personalizada para Fetch
// class FetchError extends Error {
//   constructor(
//     message: string,
//     public status: number,
//     public statusText: string,
//     public responseText: string
//   ) {
//     super(message);
//     this.name = 'FetchError';
//   }
// }

// HttpClientFetch.ts
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