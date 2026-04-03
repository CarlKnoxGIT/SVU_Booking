import Anthropic from '@anthropic-ai/sdk'
import { anthropic, MODEL, MAX_ITERATIONS } from './client'
import type { AgentResult } from '@/types'

export interface AgentConfig {
  systemPrompt: string
  tools: Anthropic.Tool[]
  toolHandlers: Record<string, (input: Record<string, unknown>) => Promise<unknown>>
}

/**
 * Core agent runner — handles the tool-use loop.
 * Call this from each specialist agent module.
 */
export async function runAgent(
  config: AgentConfig,
  initialMessage: string
): Promise<AgentResult> {
  const messages: Anthropic.MessageParam[] = [
    { role: 'user', content: initialMessage },
  ]

  let iterations = 0

  while (iterations < MAX_ITERATIONS) {
    iterations++

    const response = await anthropic.messages.create({
      model: MODEL,
      max_tokens: 4096,
      system: config.systemPrompt,
      tools: config.tools,
      messages,
    })

    // Push assistant response into messages
    messages.push({ role: 'assistant', content: response.content })

    // If the model is done (no tool calls), extract the final text result
    if (response.stop_reason === 'end_turn') {
      const textBlock = response.content.find((b) => b.type === 'text')
      const text = textBlock && 'text' in textBlock ? textBlock.text : ''

      try {
        // Expect agent to return JSON-encoded AgentResult in final message
        return JSON.parse(text) as AgentResult
      } catch {
        return {
          success: true,
          action_taken: text,
          requires_human_review: false,
        }
      }
    }

    // Process tool calls
    if (response.stop_reason === 'tool_use') {
      const toolResults: Anthropic.ToolResultBlockParam[] = []

      for (const block of response.content) {
        if (block.type !== 'tool_use') continue

        const handler = config.toolHandlers[block.name]
        if (!handler) {
          toolResults.push({
            type: 'tool_result',
            tool_use_id: block.id,
            content: JSON.stringify({ error: `Unknown tool: ${block.name}` }),
            is_error: true,
          })
          continue
        }

        try {
          const result = await handler(block.input as Record<string, unknown>)
          toolResults.push({
            type: 'tool_result',
            tool_use_id: block.id,
            content: JSON.stringify(result),
          })
        } catch (err) {
          toolResults.push({
            type: 'tool_result',
            tool_use_id: block.id,
            content: JSON.stringify({ error: String(err) }),
            is_error: true,
          })
        }
      }

      messages.push({ role: 'user', content: toolResults })
    }
  }

  return {
    success: false,
    action_taken: 'Max iterations reached without completion',
    requires_human_review: true,
    error: 'Agent loop exceeded maximum iterations',
  }
}
