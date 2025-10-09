enum InputType {
  TEXT = "text",
  NUMBER = "number",
  ARRAY = "array",
  OBJECT = "object"
}

// um mapeamento nomeDeCampo → objeto { [inputType]: referência }
type InputDefinition = {
  [field: string]: { [K in InputType]?: string }
};
// exemplo de InputDefinition
// const exemplo: InputDefinition = {
//   nome: { text: "nome" },  // campo nome espera uma string

export default class Node {
  nome: string;
  agente: string;
  modelo_llm: string;
  prompt: string;
  chaveDeSaida: string;
  entradas: InputDefinition;

  constructor(
    nome: string,
    agente: string,
    modelo_llm: string,
    prompt: string,
    chaveDeSaida: string,
    entradas: InputDefinition
  ) {
    this.nome = nome;
    this.agente = agente;
    this.modelo_llm = modelo_llm;
    this.prompt = prompt;
    this.chaveDeSaida = chaveDeSaida;
    this.entradas = entradas;
  }
}
