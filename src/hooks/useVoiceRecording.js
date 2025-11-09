import { useState, useRef } from 'react'
import { voiceAPI } from '../services/api'

export const useVoiceRecording = () => {
  const [isRecording, setIsRecording] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const mediaRecorderRef = useRef(null)
  const chunksRef = useRef([])

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      
      mediaRecorderRef.current = new MediaRecorder(stream, {
        mimeType: 'audio/webm',
      })

      chunksRef.current = []

      mediaRecorderRef.current.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data)
        }
      }

      mediaRecorderRef.current.start()
      setIsRecording(true)
    } catch (error) {
      console.error('Failed to start recording:', error)
      alert('Microphone access denied or not available')
    }
  }

  const stopRecording = () => {
    return new Promise((resolve) => {
      if (!mediaRecorderRef.current || mediaRecorderRef.current.state === 'inactive') {
        resolve(null)
        return
      }

      mediaRecorderRef.current.onstop = async () => {
        const audioBlob = new Blob(chunksRef.current, { type: 'audio/webm' })
        
        // Stop all tracks
        mediaRecorderRef.current.stream.getTracks().forEach((track) => track.stop())
        
        setIsRecording(false)
        resolve(audioBlob)
      }

      mediaRecorderRef.current.stop()
    })
  }

  const transcribeAudio = async (audioBlob) => {
    setIsProcessing(true)
    try {
      const result = await voiceAPI.speechToText(audioBlob)
      setIsProcessing(false)
      return result.text
    } catch (error) {
      console.error('Failed to transcribe audio:', error)
      setIsProcessing(false)
      throw error
    }
  }

  const recordAndTranscribe = async () => {
    await startRecording()
    
    // Return a promise that resolves when recording is stopped
    return {
      stop: async () => {
        const audioBlob = await stopRecording()
        if (audioBlob) {
          return await transcribeAudio(audioBlob)
        }
        return null
      }
    }
  }

  return {
    isRecording,
    isProcessing,
    startRecording,
    stopRecording,
    transcribeAudio,
    recordAndTranscribe,
  }
}

export default useVoiceRecording
