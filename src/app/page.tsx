'use client'

import { useMicVAD, utils } from '@ricky0123/vad-react'
// import { useState } from 'react'

import { Switch } from '@/components/ui/switch'

export const Demo = () => {
  // const [spokenText, setSpokenText] = useState<string>('')
  // const [audioList, setAudioList] = useState<string[]>([])
  const vad = useMicVAD({
    startOnLoad: false,
    onSpeechEnd: async (audio) => {
      const wavBuffer = utils.encodeWAV(audio)
      const blob = new Blob([wavBuffer], { type: 'audio/wav' })
      // const base64 = utils.arrayBufferToBase64(wavBuffer)
      // const url = `data:audio/wav;base64,${base64}`
      // setAudioList((old) => {
      //   return [url, ...old]
      // })
      const formData = new FormData()
      formData.append('file', blob, 'audio.wav')
      const res = await fetch('/api/groc', {
        method: 'POST',
        body: formData,
      })

      const audioBlob = await res.blob()
      // setSpokenText((prev) => `${prev} ${data.message.text} `)
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
    </div>
  )
}

export default Demo
