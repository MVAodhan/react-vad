'use client'

import { useMicVAD, utils } from '@ricky0123/vad-react'
import { useState } from 'react'

export const Demo = () => {
  const [spokenText, setSpokenText] = useState<string>('')
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

      const data = await res.json()
      console.log(data)
      setSpokenText((prev) => `${prev} ${data.transcription.text} `)
    },
  })

  return (
    <div>
      <h6>Listening</h6>
      {!vad.listening && 'Not'} listening
      <h6>Loading</h6>
      {!vad.loading && 'Not'} loading
      <h6>Errored</h6>
      {!vad.errored && 'Not'} errored
      <h6>User Speaking</h6>
      {!vad.userSpeaking && 'Not'} speaking
      <h6>Audio count</h6>
      {/* {audioList.length} */}
      <h6>Start/Pause</h6>
      <button onClick={vad.pause}>Pause</button>
      <button onClick={vad.start}>Start</button>
      <button onClick={vad.toggle}>Toggle</button>
      {/* <div>
        {audioList.map((url, i) => (
          <audio key={i} controls src={url}></audio>
        ))}
      </div> */}
      <textarea
        style={{ color: 'blue', height: '100px', width: '100%' }}
        value={spokenText}
        readOnly
      ></textarea>
    </div>
  )
}

export default Demo
