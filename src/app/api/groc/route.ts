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

  // if (!audioFile) {
  //   return Response.json({ error: 'No file provided' }, { status: 400 })
  // }
  // try {
  //   // Use Groq client to process the audio
  //   return Response.json({  })
  // } catch (error) {
  //   console.error('Error processing audio:', error)
  //   return Response.json({ error: 'Failed to process audio' }, { status: 500 })
  // }

  return Response.json({ message: response })
}
