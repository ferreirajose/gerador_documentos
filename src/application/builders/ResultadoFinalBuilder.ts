
// ========== BUILDER PARA RESULTADO FINAL ==========

import { SaidaFinal, ResultadoFinal } from "@/domain/entities/ResultadoFinal";
import { WorkflowBuilder } from "./WorkflowBuilder";

export class ResultadoFinalBuilder {
  private saidas: SaidaFinal[] = [];

  constructor(private workflowBuilder: WorkflowBuilder) {}

  public addSaidaOriginal(nome: string): ResultadoFinalBuilder {
    this.saidas.push({
      nome,
      manter_original: true
    });
    return this;
  }

  public addSaidaCombinada(
    nome: string, 
    combinar: string[], 
    template: string
  ): ResultadoFinalBuilder {
    this.saidas.push({
      nome,
      combinar,
      template
    });
    return this;
  }

  public build(): ResultadoFinal {
    return new ResultadoFinal(this.saidas);
  }

  public endResultadoFinal(): WorkflowBuilder {
    const resultadoFinal = this.build();
    return this.workflowBuilder.setResultadoFinal(resultadoFinal);
  }
}