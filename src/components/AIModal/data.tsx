import BACKGROUND_ANIME from '@/assets/model-anime.png';
import BACKGROUND_DREAMLIKE from '@/assets/model-dreamlike.png';
import BACKGROUND_GENERAL from '@/assets/model-general.png';
import { formatMessage } from '@@/exports';

export enum EngineType {
  General = 'stable-diffusion',
  Fantasy = 'openjourney',
  Anime = 'anything-v3',
}

export const EngineOptions: EngineType[] = [
  EngineType.General,
  EngineType.Fantasy,
  EngineType.Anime,
];

export const EngineName: Record<EngineType, string> = {
  [EngineType.General]: 'ai-creation.model.general',
  [EngineType.Fantasy]: 'ai-creation.model.fantasy',
  [EngineType.Anime]: 'ai-creation.model.anime',
};

export const EngineDesc: Record<EngineType, string> = {
  [EngineType.General]: 'ai-creation.model-desc.general',
  [EngineType.Fantasy]: 'ai-creation.model-desc.fantasy',
  [EngineType.Anime]: 'ai-creation.model-desc.anime',
};

export const EnginePlaceholder: Record<EngineType, string> = {
  [EngineType.General]: 'ai-creation.model-placeholder.general',
  [EngineType.Fantasy]: 'ai-creation.model-placeholder.fantasy',
  [EngineType.Anime]: 'ai-creation.model-placeholder.anime',
};

export const EngineBackground: Record<EngineType, string> = {
  [EngineType.General]: BACKGROUND_GENERAL,
  [EngineType.Fantasy]: BACKGROUND_DREAMLIKE,
  [EngineType.Anime]: BACKGROUND_ANIME,
};

export const RandomPrompt: Record<EngineType, string[]> = {
  [EngineType.General]: [
    formatMessage({ id: 'ai-creation.general-model-prompt-1' }),
    formatMessage({ id: 'ai-creation.general-model-prompt-2' }),
    formatMessage({ id: 'ai-creation.general-model-prompt-3' }),
    formatMessage({ id: 'ai-creation.general-model-prompt-4' }),
    formatMessage({ id: 'ai-creation.general-model-prompt-5' }),
  ],
  [EngineType.Fantasy]: [
    formatMessage({ id: 'ai-creation.fantasy-model-prompt-1' }),
    formatMessage({ id: 'ai-creation.fantasy-model-prompt-2' }),
    formatMessage({ id: 'ai-creation.fantasy-model-prompt-3' }),
    formatMessage({ id: 'ai-creation.fantasy-model-prompt-4' }),
    formatMessage({ id: 'ai-creation.fantasy-model-prompt-5' }),
  ],
  [EngineType.Anime]: [
    formatMessage({ id: 'ai-creation.anime-model-prompt-1' }),
    formatMessage({ id: 'ai-creation.anime-model-prompt-2' }),
    formatMessage({ id: 'ai-creation.anime-model-prompt-3' }),
    formatMessage({ id: 'ai-creation.anime-model-prompt-4' }),
    formatMessage({ id: 'ai-creation.anime-model-prompt-5' }),
  ],
};

export const Sizes = [
  {
    width: 1,
    height: 1,
  },
  {
    width: 2,
    height: 3,
  },
  {
    width: 3,
    height: 2,
  },
];
