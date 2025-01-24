import OpenAI from 'openai'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

interface Message {
  role: 'user' | 'assistant'
  content: string
}

export async function POST(request: Request) {
  if (request.method !== 'POST') {
    return Response.json({ error: 'Method Not Allowed' }, { status: 405 })
  }
  try {
    const data = await request.formData()
    const messageData = data.get('messages')
    const audioFile = data.get('file') as File

    // Parse messages and validate structure
    let parsedMessages: Message[] = []
    if (messageData && typeof messageData === 'string') {
      parsedMessages = JSON.parse(messageData)
    }

    // Transcribe audio using Whisper
    const transcription = await openai.audio.transcriptions.create({
      model: 'whisper-1',
      file: audioFile,
    })

    // Add user message to the conversation
    const userMessage: Message = {
      role: 'user',
      content: transcription.text,
    }
    const updatedMessages = [...parsedMessages, userMessage]

    // Filter out empty or invalid messages
    const filteredMessages = updatedMessages.filter((message) => message.role && message.content)

    const completion = await openai.chat.completions.create({
      model: 'gpt-4', // Updated model name
      messages: filteredMessages,
    })

    // Add assistant's response to the conversation
    const systemMessage: Message = {
      role: 'assistant',
      content: completion.choices[0].message.content!,
    }
    const finalMessages = [...filteredMessages, systemMessage]

    // Generate audio response using TTS
    const voiceReply = await openai.audio.speech.create({
      model: 'tts-1',
      voice: 'shimmer',
      input: systemMessage.content,
    })

    // Convert audio to base64
    const buffer = Buffer.from(await voiceReply.arrayBuffer())
    const base64Audio = buffer.toString('base64')

    const responseData = {
      audio: base64Audio,
      messages: JSON.stringify(finalMessages),
    }

    return Response.json(responseData, {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
      },
    })
  } catch (error) {
    console.error('Error in OpenAI API handler:', error)
    Response.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}

//   const data = await request.formData()
//   const audioFile = data.get('file')

//   const messageData = data.get('messages')

//   const parsedMessages = JSON.parse(messageData as string)
//   console.log('parsed messages', parsedMessages)

//   const response = await openai.audio.transcriptions.create({
//     model: 'whisper-1',
//     file: audioFile as File,
//   })

//   const userMessage = {
//     role: 'user',
//     content: response.text,
//   }

//   const messages = [...parsedMessages, userMessage]

//   const filteredMessages = messages.filter((message: { role: string; content: string }) => {
//     return Object.keys(message).length > 0 // Keep only non-empty objects
//   })

//   if (typeof filteredMessages[0] === 'string') {
//     const parsedFilteredMessages = JSON.parse(filteredMessages[0] as string)
//     filteredMessages.splice(0, 1, ...parsedFilteredMessages)
//   }

//   console.log('filtered after parsing', filteredMessages)

//   const completition = await openai.chat.completions.create({
//     model: 'gpt-4o-mini',
//     messages: filteredMessages,
//   })

//   const systemMessage = {
//     role: 'assistant',
//     content: completition.choices[0].message.content,
//   }

//   const filteredMessagesWithSystem = [...filteredMessages, systemMessage]

//   console.log('filteredMessagesWithSystem', filteredMessagesWithSystem)

//   const voiceReply = await openai.audio.speech.create({
//     model: 'tts-1',
//     voice: 'shimmer',
//     input: completition.choices[0].message.content!,
//   })

//   const buffer = Buffer.from(await voiceReply.arrayBuffer())
//   const base64Audio = buffer.toString('base64')

//   const responseData = {
//     audio: base64Audio,
//     messages: JSON.stringify(filteredMessagesWithSystem),
//   }

//   return Response.json(responseData, {
//     status: 200,
//     headers: {
//       'Content-Type': 'application/json',
//     },
//   })
// }
