
import * as falApi from '@fal-ai/client';
import { ModelType } from '@/types/modelTypes';

export const generateText = async (prompt: string, selectedModel: ModelType) => {
  return await falApi.fal.subscribe('fal-ai/any-llm', {
    input: {
      prompt,
      model: selectedModel,
    },
    logs: true,
    onQueueUpdate: (update) => {
      if (update.status === 'IN_PROGRESS') {
        console.log('Generation progress:', update.logs.map((log) => log.message));
      }
    },
  });
};
