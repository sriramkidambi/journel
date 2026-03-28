import React from 'react';
import * as Tabs from '@radix-ui/react-tabs';
import styles from './AISettingTabs.module.scss';
import { useAIContext } from 'renderer/context/AIContext';
import { CardIcon, OllamaIcon, BoxOpenIcon } from 'renderer/icons';

export default function AISettingTabs({ APIkey, setCurrentKey }) {
  const {
    setBaseUrl,
    model,
    setModel,
    embeddingModel,
    setEmbeddingModel,
    baseUrl,
    aiProvider,
    setAiProvider,
  } = useAIContext();

  const handleTabChange = (newValue) => {
    setAiProvider(newValue);
  };

  const handleInputChange = (setter) => (e) => setter(e.target.value);

  return (
    <Tabs.Root
      className={styles.tabsRoot}
      defaultValue="openai"
      value={aiProvider}
      onValueChange={handleTabChange}
    >
      <Tabs.List className={styles.tabsList} aria-label="Manage your account">
        <Tabs.Trigger
          className={`${styles.tabsTrigger} ${
            aiProvider === 'ollama' ? styles.activeCenter : ''
          } ${aiProvider === 'openai' ? styles.activeRight : ''}`}
          value="openrouter"
        >
          OpenRouter
          <CardIcon className={styles.icon} />
        </Tabs.Trigger>
        <Tabs.Trigger
          className={`${styles.tabsTrigger} ${
            aiProvider === 'openrouter' ? styles.activeLeft : ''
          } ${aiProvider === 'openai' ? styles.activeRight : ''}`}
          value="ollama"
        >
          Ollama
          <OllamaIcon className={styles.icon} />
        </Tabs.Trigger>
        <Tabs.Trigger
          className={`${styles.tabsTrigger} ${
            aiProvider === 'ollama' ? styles.activeCenter : ''
          }`}
          value="openai"
        >
          OpenAI
          <BoxOpenIcon className={styles.icon} />
        </Tabs.Trigger>
      </Tabs.List>

      <Tabs.Content className={styles.tabsContent} value="openrouter">
        <div className={styles.providers}>
          <div className={styles.pitch}>
            Use OpenRouter to connect to a wide range of hosted models from one
            API.
          </div>

          <div className={styles.group}>
            <fieldset className={styles.fieldset}>
              <label className={styles.label} htmlFor="openrouter-base-url">
                Base URL
              </label>
              <input
                id="openrouter-base-url"
                className={styles.input}
                onChange={handleInputChange(setBaseUrl)}
                value={baseUrl}
                placeholder="https://openrouter.ai/api/v1"
              />
            </fieldset>
            <fieldset className={styles.fieldset}>
              <label className={styles.label} htmlFor="openrouter-model">
                Model
              </label>
              <input
                id="openrouter-model"
                className={styles.input}
                onChange={handleInputChange(setModel)}
                value={model}
                placeholder="openai/gpt-4o-mini"
              />
            </fieldset>
          </div>

          <fieldset className={styles.fieldset}>
            <label className={styles.label} htmlFor="openrouter-api-key">
              OpenRouter API key
            </label>
            <input
              id="openrouter-api-key"
              className={styles.input}
              onChange={handleInputChange(setCurrentKey)}
              value={APIkey}
              placeholder="Paste your OpenRouter API key"
            />
          </fieldset>

          <div className={styles.disclaimer}>
            You can route different hosted models through OpenRouter while
            keeping the same journaling workflow inside the app.
          </div>
        </div>
      </Tabs.Content>

      <Tabs.Content className={styles.tabsContent} value="ollama">
        <div className={styles.providers}>
          <div className={styles.pitch}>
            Setup Ollama and set your preferred models here to use your local AI
            in the app.
          </div>

          <div className={styles.group}>
            <fieldset className={styles.fieldset}>
              <label className={styles.label} htmlFor="ollama-model">
                Model
              </label>
              <input
                id="ollama-model"
                className={styles.input}
                onChange={handleInputChange(setModel)}
                value={model}
                defaultValue="llama3.1:70b"
                placeholder="llama3.1:70b"
              />
            </fieldset>
            <fieldset className={styles.fieldset}>
              <label className={styles.label} htmlFor="ollama-embedding-model">
                Embedding model
              </label>
              <input
                id="ollama-embedding-model"
                className={styles.input}
                onChange={handleInputChange(setEmbeddingModel)}
                value={embeddingModel}
                defaultValue="mxbai-embed-large"
                placeholder="mxbai-embed-large"
                disabled
              />
            </fieldset>
          </div>

          <div className={styles.disclaimer}>
            Ollama is the easiest way to run AI models on your own computer.
            Remember to pull your models in Ollama before using them here.
            Learn more and download Ollama from{' '}
            <a href="https://ollama.com" target="_blank" rel="noreferrer">
              ollama.com
            </a>
            .
          </div>
        </div>
      </Tabs.Content>

      <Tabs.Content className={styles.tabsContent} value="openai">
        <div className={styles.providers}>
          <div className={styles.pitch}>
            Create an API key in your OpenAI account and paste it here to start
            using GPT models in the app.
          </div>

          <div className={styles.group}>
            <fieldset className={styles.fieldset}>
              <label className={styles.label} htmlFor="openai-base-url">
                Base URL
              </label>
              <input
                id="openai-base-url"
                className={styles.input}
                onChange={handleInputChange(setBaseUrl)}
                value={baseUrl}
                placeholder="https://api.openai.com/v1"
              />
            </fieldset>
            <fieldset className={styles.fieldset}>
              <label className={styles.label} htmlFor="openai-model">
                Model
              </label>
              <input
                id="openai-model"
                className={styles.input}
                onChange={handleInputChange(setModel)}
                value={model}
                placeholder="gpt-4o"
              />
            </fieldset>
          </div>
          <fieldset className={styles.fieldset}>
            <label className={styles.label} htmlFor="openai-api-key">
              OpenAI API key
            </label>
            <input
              id="openai-api-key"
              className={styles.input}
              onChange={handleInputChange(setCurrentKey)}
              value={APIkey}
              placeholder="Paste your OpenAI API key"
            />
          </fieldset>
          <div className={styles.disclaimer}>
            Remember to manage your spend by setting up a budget in the API
            service you choose to use.
          </div>
        </div>
      </Tabs.Content>
    </Tabs.Root>
  );
}
