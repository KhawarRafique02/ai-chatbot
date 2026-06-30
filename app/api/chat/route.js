import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

const SYSTEM_PROMPTS = {
  general:    `You are a helpful, intelligent AI assistant named KhawarAI. Answer questions clearly, concisely, and helpfully. Use markdown formatting when appropriate.`,
  code:       `You are an expert programming assistant named KhawarAI. Help with code, debugging, architecture, and technical questions. Always format code using markdown code blocks with the correct language identifier. Explain your code clearly.`,
  creative:   `You are a creative writing assistant named KhawarAI. Help with stories, poetry, scripts, essays, and creative content. Be imaginative, expressive, and inspiring.`,
  translator: `You are a professional multilingual translator named KhawarAI. Translate text accurately between English, Urdu, and Hindi. When given text, detect the source language, then translate it. Show both the original and translated text clearly.`,
}

export async function POST(req) {
  try {
    const { messages, mode, conversationId } = await req.json()

    const groqMessages = [
      { role: 'system', content: SYSTEM_PROMPTS[mode] || SYSTEM_PROMPTS.general },
      ...messages.map(m => ({ role: m.role, content: m.content })),
    ]

    const groqRes = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.GROQ_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        messages: groqMessages,
        stream: true,
      }),
    })

    if (!groqRes.ok) {
      const errText = await groqRes.text()
      throw new Error(`Groq API error: ${errText}`)
    }

    const lastMessage = messages[messages.length - 1].content

    const stream = new ReadableStream({
      async start(controller) {
        let fullText = ''
        const reader = groqRes.body.getReader()
        const decoder = new TextDecoder()
        let buffer = ''

        try {
          while (true) {
            const { done, value } = await reader.read()
            if (done) break
            buffer += decoder.decode(value, { stream: true })
            const lines = buffer.split('\n')
            buffer = lines.pop()

            for (const line of lines) {
              if (!line.startsWith('data: ')) continue
              const data = line.slice(6)
              if (data === '[DONE]') continue
              try {
                const json = JSON.parse(data)
                const delta = json.choices?.[0]?.delta?.content
                if (delta) {
                  fullText += delta
                  controller.enqueue(new TextEncoder().encode(delta))
                }
              } catch {}
            }
          }

          if (conversationId) {
            await supabase.from('messages').insert({
              conversation_id: conversationId,
              role: 'assistant',
              content: fullText,
            })
            if (messages.length === 1) {
              const title = lastMessage.length > 60 ? lastMessage.slice(0, 60) + '...' : lastMessage
              await supabase.from('conversations')
                .update({ title, updated_at: new Date().toISOString() })
                .eq('id', conversationId)
            } else {
              await supabase.from('conversations')
                .update({ updated_at: new Date().toISOString() })
                .eq('id', conversationId)
            }
          }
        } catch (err) {
          controller.enqueue(new TextEncoder().encode('\n\n[Error: ' + err.message + ']'))
        }
        controller.close()
      },
    })

    return new Response(stream, {
      headers: { 'Content-Type': 'text/plain; charset=utf-8' },
    })
  } catch (error) {
    console.error('Chat API error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}