'use client'

import { useMicVAD, utils } from '@ricky0123/vad-react'
// import { useState } from 'react'
import { Howl } from 'howler'
import { useRef } from 'react'
import clsx from 'clsx'
import { Mic } from 'lucide-react'

export const Demo = () => {
  const currentMessages = useRef([{}])
  const vad = useMicVAD({
    startOnLoad: false,
    onSpeechEnd: async (audio) => {
      const wavBuffer = utils.encodeWAV(audio)
      const blob = new Blob([wavBuffer], { type: 'audio/wav' })

      const formData = new FormData()
      console.log('message sent from client side', currentMessages.current)
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

        console.log('messages recieved on client side', messages)

        // Update current messages with the new response
        currentMessages.current = [...JSON.parse(messages)]
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
    <div className="w-screen h-screen flex justify-center items-center">
      <div className=" relative">
        <button
          onMouseDown={() => {
            vad.start()
          }}
          onMouseUp={() => {
            setTimeout(() => {
              vad.pause()
            }, 2000)
          }}
          className="rounded-full border border-red-500 p-5"
        >
          <Mic className="text-2xl" />
        </button>
        <div
          className={clsx(
            'absolute size-36 blur-3xl rounded-full bg-gradient-to-b from-red-200 to-red-400 dark:from-red-600 dark:to-red-800 -z-50 transition ease-in-out top-0 left-0 -translate-x-[50px] -translate-y-[50px]',
            {
              'opacity-0': vad.loading || vad.errored,
              'opacity-30': !vad.loading && !vad.errored && !vad.userSpeaking,
              'opacity-100 scale-110 pulse': vad.userSpeaking,
            },
          )}
        />
      </div>
    </div>
  )
}

export default Demo
