import { GoogleGenerativeAI } from '@google/generative-ai'
import { createClient } from '@/lib/supabase-server'
import { NextResponse } from 'next/server'

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY)

const SYSTEM_PROMPTS = {
  general: `You are a helpful, intelligent AI assistant named KhawarAI. Answer questions clearly, concisely, and helpfully. Use markdown formatting when appropriate.`,
  code: `You are an expert programming assistant named KhawarAI. Help with code, debugging, architecture, and technical questions. Always format code using markdown code blocks with the correct language identifier. Explain your code clearly.`,
  creative: `You are a creative writing assistant named KhawarAI. Help with stories, poetry, scripts, essays, and creative content. Be imaginative, expressive, and inspiring.`,
  translator: `You are a professional multilingual translator named KhawarAI. Translate text accurately between English, Urdu, and Hindi. When given text, detect the source language, then translate it. Show both the original and translated text clearly.`,
}

export async function POST(req) {
  try {
    const { messages, mode, conversationId } = await req.json()
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const model = genAI.getGenerativeModel({
      model: 'gemini-1.5-flash',
      systemInstruction: SYSTEM_PROMPTS[mode] || SYSTEM_PROMPTS.general,
    })

    // Build Gemini history from previous messages
    const history = messages.slice(0, -1).map(m => ({
      role: m.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: m.content }],
    }))

    const lastMessage = messages[messages.length - 1].content
    const chat = model.startChat({ history })
    const result = await chat.sendMessageStream(lastMessage)

    const stream = new ReadableStream({
      async start(controller) {
        let fullText = ''
        try {
          for await (const chunk of result.stream) {
            const text = chunk.text()
            fullText += text
            controller.enqueue(new TextEncoder().encode(text))
          }

          // Save assistant message to DB
          if (conversationId) {
            await supabase.from('messages').insert({
              conversation_id: conversationId,
              role: 'assistant',
              content: fullText,
            })

            // Auto-title: first message of conversation
            if (messages.length === 1) {
              const title = lastMessage.length > 60
                ? lastMessage.slice(0, 60) + '...'
                : lastMessage
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
