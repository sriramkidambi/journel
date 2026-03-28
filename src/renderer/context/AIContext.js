import {
  useState,
  createContext,
  useContext,
  useEffect,
  useCallback,
} from 'react';
import OpenAI from 'openai';
import { useJournalsContext } from './JournalsContext';
import { useElectronStore } from 'renderer/hooks/useElectronStore';

const OLLAMA_URL = 'http://localhost:11434/api';
const OPENAI_URL = 'https://api.openai.com/v1';
const OPENROUTER_URL = 'https://openrouter.ai/api/v1';
const DEFAULT_PROMPT =
  'You are an AI within a journaling app. Your job is to help the user reflect on their thoughts in a thoughtful and kind manner. The user can never directly address you or directly respond to you. Try not to repeat what the user said, instead try to seed new ideas, encourage or debate. Keep your responses concise, but meaningful.';

export const AIContext = createContext();

export const AIContextProvider = ({ children }) => {
  const { currentJournal, updateCurrentJournal } = useJournalsContext();
  const [ai, setAi] = useState(null);
  const [prompt, setPrompt] = useState(DEFAULT_PROMPT);
  const [aiProvider, setAiProvider] = useElectronStore(
    'aiProvider',
    'openai'
  );
  const [openAIModel, setOpenAIModel] = useElectronStore(
    'openAIModel',
    'gpt-4o'
  );
  const [openRouterModel, setOpenRouterModel] = useElectronStore(
    'openRouterModel',
    'openai/gpt-4o-mini'
  );
  const [ollamaModel, setOllamaModel] = useElectronStore(
    'ollamaModel',
    'llama3.1:8b'
  );
  const [openAIEmbeddingModel, setOpenAIEmbeddingModel] = useElectronStore(
    'openAIEmbeddingModel',
    'text-embedding-3-small'
  );
  const [openRouterEmbeddingModel, setOpenRouterEmbeddingModel] =
    useElectronStore('openRouterEmbeddingModel', 'text-embedding-3-small');
  const [ollamaEmbeddingModel, setOllamaEmbeddingModel] = useElectronStore(
    'ollamaEmbeddingModel',
    'mxbai-embed-large'
  );
  const [openAIBaseUrl, setOpenAIBaseUrl] = useElectronStore(
    'openAIBaseUrl',
    OPENAI_URL
  );
  const [openRouterBaseUrl, setOpenRouterBaseUrl] = useElectronStore(
    'openRouterBaseUrl',
    OPENROUTER_URL
  );

  const model =
    aiProvider === 'ollama'
      ? ollamaModel
      : aiProvider === 'openrouter'
      ? openRouterModel
      : openAIModel;

  const setModel =
    aiProvider === 'ollama'
      ? setOllamaModel
      : aiProvider === 'openrouter'
      ? setOpenRouterModel
      : setOpenAIModel;

  const embeddingModel =
    aiProvider === 'ollama'
      ? ollamaEmbeddingModel
      : aiProvider === 'openrouter'
      ? openRouterEmbeddingModel
      : openAIEmbeddingModel;

  const setEmbeddingModel =
    aiProvider === 'ollama'
      ? setOllamaEmbeddingModel
      : aiProvider === 'openrouter'
      ? setOpenRouterEmbeddingModel
      : setOpenAIEmbeddingModel;

  const baseUrl =
    aiProvider === 'openrouter' ? openRouterBaseUrl : openAIBaseUrl;

  const setBaseUrl =
    aiProvider === 'openrouter' ? setOpenRouterBaseUrl : setOpenAIBaseUrl;

  const setupAi = useCallback(async () => {
    const key = await window.electron.ipc.invoke('get-ai-key', aiProvider);
    if (!key && aiProvider !== 'ollama') {
      setAi(null);
      return;
    }

    if (aiProvider === 'ollama') {
      setAi({ type: 'ollama' });
    } else {
      const openaiInstance = new OpenAI({
        baseURL: baseUrl,
        apiKey: key,
        dangerouslyAllowBrowser: true,
      });
      setAi({ type: aiProvider, instance: openaiInstance });
    }
  }, [aiProvider, baseUrl]);

  useEffect(() => {
    if (currentJournal) {
      console.log('🧠 Syncing current journal');
      if (currentJournal.AIPrompt) setPrompt(currentJournal.AIPrompt);
      setupAi();
    }
  }, [currentJournal, baseUrl, setupAi]);

  const generateCompletion = useCallback(
    async (context, callback) => {
      if (!ai) return;

      try {
        if (ai.type === 'ollama') {
          const response = await fetch(`${OLLAMA_URL}/chat`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ model, messages: context }),
          });

          if (!response.ok)
            throw new Error(`HTTP error! status: ${response.status}`);

          const reader = response.body.getReader();
          const decoder = new TextDecoder();

          while (true) {
            const { value, done } = await reader.read();
            if (done) break;

            const chunk = decoder.decode(value);
            const lines = chunk.split('\n');

            for (const line of lines) {
              if (line.trim() !== '') {
                const jsonResponse = JSON.parse(line);
                if (!jsonResponse.done) {
                  callback(jsonResponse.message.content);
                }
              }
            }
          }
        } else {
          const stream = await ai.instance.chat.completions.create({
            model,
            stream: true,
            max_tokens: 500,
            messages: context,
          });

          for await (const part of stream) {
            callback(part.choices[0].delta.content);
          }
        }
      } catch (error) {
        console.error('AI request failed:', error);
        throw error;
      }
    },
    [ai, model]
  );

  const prepareCompletionContext = useCallback(
    (thread) => {
      return [
        { role: 'system', content: prompt },
        {
          role: 'system',
          content: 'You can only respond in plaintext, do NOT use HTML.',
        },
        ...thread.map((post) => ({ role: 'user', content: post.content })),
      ];
    },
    [prompt]
  );

  const checkApiKeyValidity = async () => {
    if (aiProvider === 'ollama') return true;

    const key = await window.electron.ipc.invoke('get-ai-key', aiProvider);
    return key !== null;
  };

  const AIContextValue = {
    ai,
    baseUrl,
    setBaseUrl,
    prompt,
    setPrompt,
    setKey: (secretKey) =>
      window.electron.ipc.invoke('set-ai-key', secretKey, aiProvider),
    getKey: () => window.electron.ipc.invoke('get-ai-key', aiProvider),
    validKey: checkApiKeyValidity,
    deleteKey: () => window.electron.ipc.invoke('delete-ai-key', aiProvider),
    updateSettings: (newPrompt) =>
      updateCurrentJournal({ ...currentJournal, AIPrompt: newPrompt }),
    model,
    setModel,
    embeddingModel,
    setEmbeddingModel,
    generateCompletion,
    prepareCompletionContext,
    aiProvider,
    setAiProvider,
  };

  return (
    <AIContext.Provider value={AIContextValue}>{children}</AIContext.Provider>
  );
};

export const useAIContext = () => useContext(AIContext);
