'use client'

import { useMicVAD, utils } from '@ricky0123/vad-react'
// import { useState } from 'react'
import { Howl } from 'howler'
import { Switch } from '@/components/ui/switch'
import { useRef } from 'react'

export const Demo = () => {
  const currentMessages = useRef([{}])
  const vad = useMicVAD({
    startOnLoad: false,
    onSpeechEnd: async (audio) => {
      const wavBuffer = utils.encodeWAV(audio)
      const blob = new Blob([wavBuffer], { type: 'audio/wav' })

      const formData = new FormData()
      formData.append('file', blob, 'audio.wav')
      formData.append('messages', JSON.stringify(currentMessages.current))
      let data
      try {
        const res = await fetch('/api/openai', {
          method: 'POST',
          body: formData,
        })

        if (!res.ok) {
          throw new Error(`HTTP error! Status: ${res.status}`)
        }

        data = await res.json()
        const messages = data.messages

        // Update current messages with the new response
        currentMessages.current = [...currentMessages.current, ...messages]
      } catch (error) {
        console.error('Error sending data to OpenAI API:', error)
        return
      }

      const sound = new Howl({
        src: [`data:audio/mp3;base64,${data.audio}`],
        format: ['mp3'],
      })
      sound.play()
    },
  })

  return (
    <div>
      <Switch
        onCheckedChange={() => {
          vad.toggle()
        }}
        disabled={vad.loading}
      />
      <button onClick={() => console.log(currentMessages.current)}>log ref current</button>
    </div>
  )
}

export default Demo
