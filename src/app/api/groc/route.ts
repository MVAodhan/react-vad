import OpenAI from 'openai'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

export async function POST(request: Request) {
  const data = await request.formData()
  const audioFile = data.get('file')
  const response = await openai.audio.transcriptions.create({
    model: 'whisper-1',
    file: audioFile as File,
  })

  const completition = await openai.chat.completions.create({
    model: 'gpt-4o-mini-2024-07-18',
    messages: [
      {
        role: 'user',
        content: response.text,
      },
    ],
  })

  const voiceReply = await openai.audio.speech.create({
    model: 'tts-1',
    voice: 'shimmer',
    input: completition.choices[0].message.content!,
  })

  // res.setHeader('Content-Type', 'audio/mp3')
  // res.setHeader('Content-Disposition', 'inline; filename="audio.mp3"')

  // // Stream the audio back to the client
  const buffer = Buffer.from(await voiceReply.arrayBuffer())
  // res.send(buffer)
  return new Response(buffer, {
    status: 200,
    headers: { 'Content-Type': 'audio/mp3', 'Content-Disposition': 'inline; filename="audio.mp3"' },
  })
}
