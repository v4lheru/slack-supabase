import axios from 'axios';
import {
  AIProvider, AIResponse, ConversationMessage,
  GenerateOptions, MessageContent
} from '../interfaces/provider';
import { env } from '../../config/environment';

export class PythonAgentClient implements AIProvider {
  public readonly name = 'PythonAgent';

  async generateResponse(
    prompt: string | MessageContent[],
    conversationHistory: ConversationMessage[],
    _unused?: unknown,
    options?: GenerateOptions
  ): Promise<AIResponse> {
    const res = await axios.post(`${env.PY_AGENT_URL}/generate`, {
      prompt,
      history: conversationHistory
    }, { timeout: 30000 });

    return res.data as AIResponse;
  }

  supportsFunctionCalling() { return true; }
  getAvailableModels() {
    return Promise.resolve([{
      id: 'python-agent',
      name: 'Agent-via-Python',
      provider: 'python-service',
      capabilities: { functionCalling: true, vision: false, streaming: false },
      contextWindow: 128000,
    }]);
  }
}
