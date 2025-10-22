export const llmModelsByProvider = {
  openai: {
    name: "OpenAI",
    models: [
      { value: 'gpt-4o', label: 'CursoLLM' },
      { value: 'gpt-4o-mini', label: 'GPT-4o Mini' },
      { value: 'gpt-4.1', label: 'GPT-4.1' },
      { value: 'gpt-4.1-mini', label: 'GPT-4.1 Mini' },
      { value: 'gpt-4.1-nano', label: 'GPT-4.1 Nano' },
      { value: 'gpt-5-chat', label: 'GPT-5 Chat' },
      { value: 'gpt-5-mini', label: 'GPT-5 Mini' },
      { value: 'gpt-5', label: 'GPT-5' },
      { value: 'o3', label: 'O3' },
      { value: 'o4-mini', label: 'O4 Mini' }
    ]
  },
  google: {
    name: "Google",
    models: [
      { value: 'gemini-2.5-flash', label: 'Gemini 2.5 Flash' },
      { value: 'gemini-2.5-pro', label: 'Gemini 2.5 Pro' },
      { value: 'gemini-2.0-flash', label: 'Gemini 2.0 Flash' }
    ]
  },
  anthropic: {
    name: "Anthropic",
    models: [
      { value: 'claude-3-5-sonnet@20240620', label: 'Claude 3.5 Sonnet' },
      { value: 'claude-3-7-sonnet@20250219', label: 'Claude 3.7 Sonnet' },
      { value: 'claude-sonnet-4@20250514', label: 'Claude Sonnet 4' },
      { value: 'claude-sonnet-4-5@20250929', label: 'Claude 4.5 Sonnet' }
    ]
  }
};