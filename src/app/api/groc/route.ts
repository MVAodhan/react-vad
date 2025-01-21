import Groq from 'groq-sdk'

export async function POST(request: Request) {
  console.log(request.body)
  console.log(request.formData)
  const data = await request.formData()
  const audioFile = data.get('file')

  try {
    // Use Groq client to process the audio
    const groqClient = new Groq({
      apiKey: process.env.GROQ_API_KEY,
    })
    const transcription = await groqClient.audio.transcriptions.create({
      file: audioFile as File, // Required audio file
      model: 'whisper-large-v3-turbo', // Required model to use for transcription
      language: 'en', // Optional
      temperature: 0.0, // Optional
    })

    console.log(transcription)
    return Response.json({ transcription })
  } catch (error) {
    console.error('Error processing audio:', error)
    return Response.json({ error: 'Failed to process audio' }, { status: 500 })
  }
}
