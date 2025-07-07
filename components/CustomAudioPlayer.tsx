'use client'

import { useState, useEffect, useRef } from 'react'
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import { Play, Pause, Loader2 } from 'lucide-react'
import * as Tone from 'tone'
import lamejs from '@breezystack/lamejs'
import { saveAs } from 'file-saver'
import { motion } from 'framer-motion'

interface CustomAudioPlayerProps {
  src: string | null
  audioName?: string
  volume: number
  speed: number
  reverbDecay: number
  bassBoost: number
  onDownload: (format: 'mp3' | 'wav', blob: Blob) => void
  resetAudio: () => void
}

export function CustomAudioPlayer({ src, audioName = "Unknown Audio", volume, speed, reverbDecay, bassBoost, onDownload, resetAudio }: CustomAudioPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const playerRef = useRef<Tone.Player | null>(null)
  const reverbRef = useRef<Tone.Reverb | null>(null)
  const dryWetRef = useRef<Tone.CrossFade | null>(null)
  const bassBoostRef = useRef<Tone.EQ3 | null>(null)
  const startTimeRef = useRef<number | null>(null)
  const [isProcessingMp3, setIsProcessingMp3] = useState(false)
  const [isProcessingWav, setIsProcessingWav] = useState(false)
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    if (src) {
      const player = new Tone.Player(src)
      const reverb = new Tone.Reverb()
      const dryWet = new Tone.CrossFade(0)
      const bassBoost = new Tone.EQ3()

      player.chain(bassBoost, dryWet.a)
      player.connect(reverb)
      reverb.connect(dryWet.b)
      dryWet.toDestination()
      
      playerRef.current = player
      reverbRef.current = reverb
      dryWetRef.current = dryWet
      bassBoostRef.current = bassBoost

      player.load(src).then(() => {
        setDuration(player.buffer.duration)
      })

      return () => {
        player.dispose()
        reverb.dispose()
        dryWet.dispose()
        bassBoost.dispose()
      }
    }
  }, [src])

  useEffect(() => {
    if (playerRef.current) {
      playerRef.current.volume.value = Tone.gainToDb(volume / 100)
    }
  }, [volume])

  useEffect(() => {
    if (playerRef.current) {
      playerRef.current.playbackRate = speed
    }
  }, [speed])

  useEffect(() => {
    if (reverbRef.current && dryWetRef.current) {
      reverbRef.current.decay = reverbDecay
      const wetness = Math.min(reverbDecay / 10, 1)
      dryWetRef.current.fade.value = wetness
    }
  }, [reverbDecay])

  useEffect(() => {
    if (bassBoostRef.current) {
      bassBoostRef.current.low.value = bassBoost
    }
  }, [bassBoost])

  useEffect(() => {
    let animationFrame: number

    const updateTime = () => {
      if (playerRef.current && isPlaying && startTimeRef.current !== null) {
        const elapsed = (Tone.now() - startTimeRef.current) * speed
        setCurrentTime(Math.min(elapsed, duration))
        animationFrame = requestAnimationFrame(updateTime)
      }
    }

    if (isPlaying) {
      animationFrame = requestAnimationFrame(updateTime)
    }

    return () => {
      cancelAnimationFrame(animationFrame)
    }
  }, [isPlaying, duration, speed])

  const togglePlayPause = async () => {
    if (!playerRef.current) return

    await Tone.start()
    if (isPlaying) {
      playerRef.current.stop()
      startTimeRef.current = null
    } else {
      startTimeRef.current = Tone.now() - (currentTime / speed)
      playerRef.current.start(0, currentTime)
    }
    setIsPlaying(!isPlaying)
  }

  const handleSliderChange = (value: number[]) => {
    if (!playerRef.current) return

    const [newTime] = value
    setCurrentTime(newTime)
    
    if (isPlaying) {
      playerRef.current.stop()
      startTimeRef.current = Tone.now() - (newTime / speed)
      playerRef.current.start(0, newTime)
    } else {
      playerRef.current.seek(newTime)
    }
  }

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60)
    const seconds = Math.floor(time % 60)
    return `${minutes}:${seconds.toString().padStart(2, '0')}`
  }

  if (!src) {
    return <div>No audio file selected</div>
  }

  // Optimized impulse response generation
  function createImpulseResponse(
    context: AudioContext | OfflineAudioContext,
    decay: number,
    duration = 1.5, // Reduced duration for better performance
    reverse = false
  ): AudioBuffer {
    const sampleRate = context.sampleRate;
    const length = sampleRate * duration;
    const impulse = context.createBuffer(2, length, sampleRate);
  
    for (let channel = 0; channel < 2; channel++) {
      const channelData = impulse.getChannelData(channel);
      for (let i = 0; i < length; i++) {
        const n = reverse ? length - i : i;
        channelData[i] = (Math.random() * 2 - 1) * Math.pow(1 - n / length, decay);
      }
    }
  
    return impulse;
  }

  // Optimized audio processing with chunked processing
  async function getProcessedAudioBuffer(reverbDecay: number): Promise<AudioBuffer> {
    if (!playerRef.current || !playerRef.current.buffer) {
      throw new Error('Audio buffer not loaded');
    }
  
    const originalBuffer = playerRef.current.buffer;
    const newLength = Math.floor(originalBuffer.length / speed);
  
    // Use lower sample rate for processing if possible
    const targetSampleRate = Math.min(originalBuffer.sampleRate, 44100);
    
    const offlineContext = new OfflineAudioContext(
      originalBuffer.numberOfChannels,
      newLength,
      targetSampleRate
    );
  
    const source = offlineContext.createBufferSource();
    source.buffer = originalBuffer.get() as unknown as AudioBuffer;
  
    // Optimize reverb processing
    const convolver = offlineContext.createConvolver();
    const impulseBuffer = createImpulseResponse(offlineContext, reverbDecay);
    convolver.buffer = impulseBuffer;
  
    const dryGain = offlineContext.createGain();
    const wetGain = offlineContext.createGain();
    
    // Optimize wet/dry mix based on reverb decay
    const wetAmount = Math.min(reverbDecay / 10, 0.5); // Cap at 50% wet
    dryGain.gain.value = 1 - wetAmount;
    wetGain.gain.value = wetAmount;
  
    const gainNode = offlineContext.createGain();
    gainNode.gain.value = volume / 100;
  
    source.connect(dryGain);
    source.connect(convolver);
    convolver.connect(wetGain);
  
    dryGain.connect(gainNode);
    wetGain.connect(gainNode);
    gainNode.connect(offlineContext.destination);
  
    source.playbackRate.value = speed;
    source.start();
  
    return offlineContext.startRendering();
  }
  
  // Optimized WAV conversion with chunked processing
  async function audioBufferToWav(audioBuffer: AudioBuffer): Promise<Blob> {
    const numberOfChannels = audioBuffer.numberOfChannels;
    const sampleRate = audioBuffer.sampleRate;
    const format = 1; // PCM
    const bitDepth = 16;
    
    const bytesPerSample = bitDepth / 8;
    const blockAlign = numberOfChannels * bytesPerSample;
    const byteRate = sampleRate * blockAlign;
    const dataSize = audioBuffer.length * blockAlign;
    
    const buffer = new ArrayBuffer(44 + dataSize);
    const view = new DataView(buffer);
    
    // WAV header
    const writeString = (offset: number, string: string) => {
      for (let i = 0; i < string.length; i++) {
        view.setUint8(offset + i, string.charCodeAt(i));
      }
    };
    
    writeString(0, 'RIFF');
    view.setUint32(4, 36 + dataSize, true);
    writeString(8, 'WAVE');
    writeString(12, 'fmt ');
    view.setUint32(16, 16, true);
    view.setUint16(20, format, true);
    view.setUint16(22, numberOfChannels, true);
    view.setUint32(24, sampleRate, true);
    view.setUint32(28, byteRate, true);
    view.setUint16(32, blockAlign, true);
    view.setUint16(34, bitDepth, true);
    writeString(36, 'data');
    view.setUint32(40, dataSize, true);
    
    // Convert audio data in chunks to prevent browser freezing
    const chunkSize = 4096; // Process 4096 samples at a time
    const totalSamples = audioBuffer.length;
    let offset = 44;
    
    for (let start = 0; start < totalSamples; start += chunkSize) {
      const end = Math.min(start + chunkSize, totalSamples);
      
      // Process chunk
      for (let i = start; i < end; i++) {
        for (let channel = 0; channel < numberOfChannels; channel++) {
          const sample = Math.max(-1, Math.min(1, audioBuffer.getChannelData(channel)[i]));
          view.setInt16(offset, Math.round(sample * 0x7FFF), true);
          offset += 2;
        }
      }
      
      // Update progress
      const progress = Math.round((start / totalSamples) * 50) + 50; // 50-100%
      setProgress(progress);
      
      // Yield control every chunk to prevent blocking
      await new Promise(resolve => setTimeout(resolve, 0));
    }
    
    return new Blob([buffer], { type: 'audio/wav' });
  }

  // Optimized MP3 conversion with chunked processing
  async function audioBufferToMp3(audioBuffer: AudioBuffer): Promise<Blob> {
    const channels = audioBuffer.numberOfChannels;
    const sampleRate = audioBuffer.sampleRate;
    const bitRate = 128; // Lower bit rate for faster processing
    const mp3encoder = new lamejs.Mp3Encoder(channels, sampleRate, bitRate);
    const mp3Data: Int8Array[] = [];

    const left = audioBuffer.getChannelData(0);
    const right = channels > 1 ? audioBuffer.getChannelData(1) : left;

    const sampleBlockSize = 1152;
    const totalBlocks = Math.ceil(left.length / sampleBlockSize);

    for (let i = 0; i < left.length; i += sampleBlockSize) {
      const leftChunk = left.subarray(i, i + sampleBlockSize);
      const rightChunk = right.subarray(i, i + sampleBlockSize);

      // Optimized conversion to Int16Array
      const leftChunkInt16 = new Int16Array(leftChunk.length);
      const rightChunkInt16 = new Int16Array(rightChunk.length);

      for (let j = 0; j < leftChunk.length; j++) {
        leftChunkInt16[j] = Math.round(Math.max(-32768, Math.min(32767, leftChunk[j] * 32767)));
        rightChunkInt16[j] = Math.round(Math.max(-32768, Math.min(32767, rightChunk[j] * 32767)));
      }

      const mp3buf = mp3encoder.encodeBuffer(leftChunkInt16, rightChunkInt16);
      if (mp3buf.length > 0) {
        mp3Data.push(new Int8Array(mp3buf));
      }

      // Update progress
      const currentBlock = Math.floor(i / sampleBlockSize);
      setProgress(Math.round((currentBlock / totalBlocks) * 100));
      
      // Yield control to prevent blocking
      if (currentBlock % 10 === 0) {
        await new Promise(resolve => setTimeout(resolve, 0));
      }
    }

    const end = mp3encoder.flush();
    if (end.length > 0) {
      mp3Data.push(new Int8Array(end));
    }

    return new Blob(mp3Data, { type: 'audio/mp3' });
  }

  const handleDownload = async (format: 'mp3' | 'wav') => {
    if (format === 'mp3') {
      setIsProcessingMp3(true)
    } else {
      setIsProcessingWav(true)
    }

    setProgress(0)

    try {
      // First process the audio buffer (0-50% progress)
      const processedBuffer = await getProcessedAudioBuffer(reverbDecay);
      setProgress(50)
      
      let blob: Blob
      if (format === 'wav') {
        // WAV conversion handles progress internally (50-100%)
        blob = await audioBufferToWav(processedBuffer)
      } else {
        // MP3 conversion handles progress internally (50-100%)
        blob = await audioBufferToMp3(processedBuffer)
      }

      const fileName = `${audioName.split('.')[0]}_processed.${format}`
      saveAs(blob, fileName)
      setProgress(100)
    } catch (error) {
      console.error('Error processing audio for download:', error)
      // Reset progress on error
      setProgress(0)
    } finally {
      setTimeout(() => {
        setProgress(0)
        if (format === 'mp3') {
          setIsProcessingMp3(false)
        } else {
          setIsProcessingWav(false)
        }
      }, 1000) // Increased timeout to show completion
    }
  }

  return (
    <motion.div 
      className="flex flex-col gap-2"
      initial={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 50 }}
      transition={{ duration: 0.5 }}
    >
      <div className="text-lg font-semibold mb-2 text-center sm:text-left truncate px-2 sm:px-0">{audioName}</div>
      <div className="flex flex-col sm:flex-row items-center gap-3 sm:gap-4">
        <Button onClick={togglePlayPause} variant="outline" size="icon" className="shrink-0">
          {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
        </Button>
        <div className="flex-grow w-full sm:w-auto">
          <Slider
            min={0}
            max={duration}
            step={0.1}
            value={[currentTime]}
            onValueChange={handleSliderChange}
            className="mb-1"
          />
          <div className="flex justify-between text-sm text-gray-500">
            <span>{formatTime(currentTime)}</span>
            <span>{formatTime(duration)}</span>
          </div>
        </div>
      </div>
      <div className="flex flex-col sm:flex-row justify-center gap-3 mt-4">
        <Button 
          onClick={() => handleDownload('mp3')} 
          disabled={isProcessingMp3 || isProcessingWav}
          size="sm"
          className="w-full sm:w-auto"
        >
          {isProcessingMp3 ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Processing... {progress}%
            </>
          ) : (
            'Download MP3'
          )}
        </Button>
        <Button 
          onClick={() => handleDownload('wav')} 
          disabled={isProcessingMp3 || isProcessingWav}
          size="sm"
          className="w-full sm:w-auto"
        >
          {isProcessingWav ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Processing... {progress}%
            </>
          ) : (
            'Download WAV'
          )}
        </Button>
        <Button 
          onClick={resetAudio} 
          disabled={isProcessingMp3 || isProcessingWav}
          size="sm"
          className="w-full sm:w-auto"
        >
          Convert Another Song
        </Button>
      </div>
    </motion.div>
  )
}