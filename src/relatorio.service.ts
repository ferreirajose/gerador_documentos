export interface StatusEvent {
  type: 'status';
  node: string;
  status: 'iniciado' | 'finalizado';
}

export interface ErrorEvent {
  type: 'error';
  message: string;
}

export interface ResultadoFinalEvent {
  type: 'resultado_final'  | 'relatorio_financeiro_final';
  payload: {
    relatorio_final: string;
  };
}

export type RelatorioEvent = StatusEvent | ErrorEvent | ResultadoFinalEvent;

export interface RelatorioService {
  gerarRelatorio(data: any): Promise<ReadableStream<RelatorioEvent>>;
  cancelarGeracao(): void;
}


const BASE_URL = import.meta.env.VITE_API_URL;
const BASE_URL_MINUTA = import.meta.env.VITE_API_URL_MINUTA;
const AUTH_TOKEN = import.meta.env.VITE_API_AUTH_TOKEN;

console.log(BASE_URL, 'BASE_URL')
console.log(BASE_URL_MINUTA, 'BASE_URL_MINUTA')
console.log(AUTH_TOKEN, 'AUTH_TOKEN')

class RelatorioServiceImpl implements RelatorioService {
  private controller: AbortController | null = null;

  async gerarRelatorio(data: any): Promise<ReadableStream<RelatorioEvent>> {
    // Cancela requisição anterior se existir
    this.cancelarGeracao();

    this.controller = new AbortController();
    
    try {
      const response = await fetch(`${BASE_URL}/gerar_relatorio_stream`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
                    accept: "text/event-stream",
          'Authorization': `Bearer ${AUTH_TOKEN}`,
        },
        body: data,
      });

      if (!response.ok) {
        throw new Error(`Erro na requisição: ${response.status} ${response.statusText}`);
      }

      if (!response.body) {
        throw new Error('Response body está vazio');
      }

      return this.processarStream(response.body);
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        throw new Error('Requisição cancelada pelo usuário');
      }
      throw error;
    }
  }

  private processarStream(body: ReadableStream<Uint8Array>): ReadableStream<RelatorioEvent> {
    const reader = body.getReader();
    const decoder = new TextDecoder();
    let buffer = '';

    return new ReadableStream<RelatorioEvent>({
      start: (controller) => {
        const push = () => {
          reader.read().then(({ done, value }) => {
            if (done) {
              if (buffer.trim()) {
                // Processa qualquer dado restante no buffer
                this.processarLinha(buffer, controller);
              }
              controller.close();
              return;
            }

            buffer += decoder.decode(value, { stream: true });
            const lines = buffer.split('\n');
            
            // Mantém a última linha incompleta no buffer
            buffer = lines.pop() || '';

            // Processa cada linha completa
            for (const line of lines) {
              this.processarLinha(line, controller);
            }

            push();
          }).catch(error => {
            controller.error(error);
          });
        };

        push();
      },

      cancel: () => {
        reader.cancel();
        this.controller = null;
      }
    });
  }
    
  //   if (!trimmedLine || !trimmedLine.startsWith('data: ')) {
  //     return;
  //   }

  //   try {
  //     const jsonStr = trimmedLine.substring(6); // Remove "data: " prefix
  //     const eventData: RelatorioEvent = JSON.parse(jsonStr);
  //     controller.enqueue(eventData);
  //   } catch (error) {
  //     console.warn('Erro ao processar linha do stream:', error, 'Linha:', trimmedLine);
  //   }
  // }

  // Atualize a função processarLinha no relatorio.service.ts
  private processarLinha(line: string, controller: ReadableStreamDefaultController<RelatorioEvent>) {
      const trimmedLine = line.trim();
      
      if (!trimmedLine) {
          return;
      }

      try {
          // Verifica se é a nova estrutura com "message"
          if (trimmedLine.startsWith('message')) {
              const jsonStr = trimmedLine.substring(8); // Remove "message\t" prefix
              const eventData: RelatorioEvent = JSON.parse(jsonStr);
              controller.enqueue(eventData);
          }
          // Mantém compatibilidade com estrutura anterior
          else if (trimmedLine.startsWith('data: ')) {
              const jsonStr = trimmedLine.substring(6); // Remove "data: " prefix
              const eventData: RelatorioEvent = JSON.parse(jsonStr);
              controller.enqueue(eventData);
          }
      } catch (error) {
          console.warn('Erro ao processar linha do stream:', error, 'Linha:', trimmedLine);
      }
  }

  cancelarGeracao(): void {
    if (this.controller) {
      this.controller.abort();
      this.controller = null;
    }
  }
}

// Export da instância do service
export const relatorioService: RelatorioService = new RelatorioServiceImpl();