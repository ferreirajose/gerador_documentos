
export type InputType = 'lista_de_origem' | 'buscar_documento' | 'id_da_defesa' | 'do_estado';

// um mapeamento nomeDeCampo → objeto { [inputType]: referência }
export type InputDefinition = {
  [field: string]: { [K in InputType]?: string }
};
// exemplo de InputDefinition
// const exemplo: InputDefinition = {
//   nome: { text: "nome" },  // campo nome espera uma string

export default class NodeEntitie {
  nome: string;
  agente: string;
  modelo_llm: string;
  prompt: string;
  chave_de_saida: string;
  entradas: InputDefinition;

  constructor(
    nome: string,
    agente: string,
    modelo_llm: string,
    prompt: string,
    chave_de_saida: string,
    entradas: InputDefinition
  ) {
    this.nome = nome;
    this.agente = agente;
    this.modelo_llm = modelo_llm;
    this.prompt = prompt;
    this.chave_de_saida = chave_de_saida;
    this.entradas = entradas;
  }
}
