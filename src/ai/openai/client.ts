import OpenAI from 'openai';
import {
  AIProvider, AIResponse, ConversationMessage, FunctionDefinition,
  FunctionCall, GenerateOptions, MessageContent
} from '../interfaces/provider';
import { env } from '../../config/environment';
import { logger, logEmoji } from '../../utils/logger';
import { DEFAULT_MODEL } from '../openrouter/models';

export class OpenAIClient implements AIProvider {
  public readonly name = 'OpenAI';
  private readonly client = new OpenAI({ apiKey: env.OPENAI_API_KEY });

  async generateResponse(
    prompt: string | MessageContent[],
    conversationHistory: ConversationMessage[],
    functions?: FunctionDefinition[],
    options?: GenerateOptions
  ): Promise<AIResponse> {
    const model = options?.model || DEFAULT_MODEL;

    // Build instructions from system messages and input from the user turn
    const instructions = conversationHistory
      .filter(m => m.role === 'system')
      .map(m => typeof m.content === 'string' ? m.content : '')
      .join('\n');
    const input = typeof prompt === 'string' ? prompt : JSON.stringify(prompt);

    const tools = functions?.map(fn => ({
      type: 'function' as const,
      // The Response endpoint expects the flat FunctionTool shape
      name: fn.name,
      description: fn.description,
      parameters: fn.parameters,
      // required by the SDK typings
      strict: false as const,
    }));

    const res = await this.client.responses.create({
      model,
      instructions,
      input,
      tools,
      tool_choice: tools?.length ? 'auto' : 'none',
    });

    // The SDK's Response type is a union that hides `tool_calls` & `finish_reason`;
    // cast to loosen the type for result-parsing.
    const anyRes = res as any;

    // Map SDK shape  AIResponse
    const functionCalls: FunctionCall[] | undefined = anyRes.tool_calls?.map((tc: any) => ({
      name: tc.function.name,
      arguments: JSON.parse(tc.function.arguments ?? '{}'),
    }));

    return {
      content: anyRes.output_text ?? '',
      functionCalls,
      metadata: { model: anyRes.model, finishReason: anyRes.finish_reason },
    };
  }

  supportsFunctionCalling() { return true; }
  async getAvailableModels() { return [{ id: DEFAULT_MODEL, name: 'GPT-4o Mini', provider: 'OpenAI', capabilities: { functionCalling: true, vision: true, streaming: true }, contextWindow: 128000 }]; }
}
