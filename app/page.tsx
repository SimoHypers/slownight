'use client'

import { useState } from 'react'
import { Input } from "@/components/ui/input"
import { Slider } from "@/components/ui/slider"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { CustomAudioPlayer } from "@/components/CustomAudioPlayer"
import { Upload, Music, Headphones, Settings, Download, Zap, Waves } from 'lucide-react'
import { ModeToggle } from '@/components/mode-switch'
import Link from 'next/link'

export default function Home() {
  const [file, setFile] = useState<File | null>(null)
  const [volume, setVolume] = useState(100)
  const [speed, setSpeed] = useState(1)
  const [reverbDecay, setReverbDecay] = useState(0.01)
  const [bassBoost, setBassBoost] = useState(0)
  const [audioSrc, setAudioSrc] = useState<string | null>(null)
  const [audioName, setAudioName] = useState<string>('')
  type PresetKey = 'slowed+reverb' | 'nightcore'
  type Preset = {
    name: string
    icon: React.ElementType
    speed: number
    reverbDecay: number
    bassBoost: number
    description: string
  }

  const presets: Record<PresetKey, Preset> = {
    'slowed+reverb': {
      name: 'Slowed + Reverb',
      icon: Waves,
      speed: 0.90,
      reverbDecay: 1.5,
      bassBoost: 2,
      description: 'Chill vibes with deep reverb'
    },
    'nightcore': {
      name: 'Nightcore',
      icon: Zap,
      speed: 1.2,
      reverbDecay: 1,
      bassBoost: 1,
      description: 'High-energy fast tempo'
    }
  }

  const [activePreset, setActivePreset] = useState<PresetKey | null>(null)

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const uploadedFile = event.target.files?.[0]
    if (uploadedFile) {
      setFile(uploadedFile)
      setAudioSrc(URL.createObjectURL(uploadedFile))
      setAudioName(uploadedFile.name)
    } else {
      setAudioSrc(null)
      setAudioName('')
    }
  }

  const handleDownload = async (format: 'mp3' | 'wav', blob: Blob) => {
    const fileName = `${audioName.split('.')[0]}_processed.${format}`
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = fileName
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const handleResetAudio = () => {
    setFile(null)
    setAudioSrc(null)
    setAudioName('')
    setActivePreset(null)
  }

  const applyPreset = (presetKey: PresetKey) => {
    const preset = presets[presetKey]
    if (preset) {
      setSpeed(preset.speed)
      setReverbDecay(preset.reverbDecay)
      setBassBoost(preset.bassBoost)
      setActivePreset(presetKey)
    }
  }

  const resetToDefault = () => {
    setSpeed(1)
    setReverbDecay(0.01)
    setBassBoost(0)
    setActivePreset(null)
  }

  const handleVolumeChange = (value: number[]) => {
    setVolume(value[0])
  }

  const handleSpeedChange = (value: number[]) => {
    setSpeed(value[0])
    setActivePreset(null)
  }

  const handleReverbDecayChange = (value: number[]) => {
    setReverbDecay(value[0])
    setActivePreset(null)
  }

  const handleBassBoostChange = (value: number[]) => {
    setBassBoost(value[0])
    setActivePreset(null)
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="text-center mb-12 relative">
          <div className="absolute top-0 right-0">
            <ModeToggle />
          </div>
          <div className="flex items-center justify-center gap-3 mb-4">
            <h1 className="text-5xl font-bold text-primary">SlowNight</h1>
          </div>
        </div>

        {!audioSrc ? (
          <div className="space-y-6">
            <Card className="border-2 border-dashed border-border hover:border-primary/50 transition-colors">
              <CardHeader className="text-center">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <Music className="h-6 w-6 text-primary" />
                  <CardTitle className="text-2xl">Upload Your Audio</CardTitle>
                </div>
                <p className="text-muted-foreground">
                  Transform your music with professional audio effects
                </p>
              </CardHeader>
              <CardContent className="pt-0">
                <label 
                  htmlFor="dropzone-file" 
                  className="flex flex-col items-center justify-center w-full h-64 border-2 border-dashed border-border rounded-lg cursor-pointer bg-card hover:bg-accent/50 transition-colors group"
                >
                  <div className="flex flex-col items-center justify-center pt-5 pb-6">
                    <div className="p-4 bg-primary/10 rounded-full mb-4 group-hover:bg-primary/20 transition-colors">
                      <Upload className="w-12 h-12 text-primary" />
                    </div>
                    <p className="mb-2 text-lg font-medium text-foreground">
                      Click to upload your audio file
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Supports MP3, WAV, OGG formats • Maximum 10MB
                    </p>
                  </div>
                  <Input 
                    id="dropzone-file" 
                    type="file" 
                    accept="audio/*" 
                    className="hidden" 
                    onChange={handleFileUpload} 
                  />
                </label>
              </CardContent>
            </Card>

            {/* Features Preview */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="text-center">
                <CardContent className="pt-6">
                  <div className="p-3 bg-primary/10 rounded-full w-fit mx-auto mb-4">
                    <Settings className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="font-semibold mb-2">Advanced Controls</h3>
                  <p className="text-sm text-muted-foreground">
                    Fine-tune speed, reverb, and bass boost
                  </p>
                </CardContent>
              </Card>
              <Card className="text-center">
                <CardContent className="pt-6">
                  <div className="p-3 bg-primary/10 rounded-full w-fit mx-auto mb-4">
                    <Headphones className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="font-semibold mb-2">Real-time Preview</h3>
                  <p className="text-sm text-muted-foreground">
                    Listen to changes as you adjust settings
                  </p>
                </CardContent>
              </Card>
              <Card className="text-center">
                <CardContent className="pt-6">
                  <div className="p-3 bg-primary/10 rounded-full w-fit mx-auto mb-4">
                    <Download className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="font-semibold mb-2">Export Options</h3>
                  <p className="text-sm text-muted-foreground">
                    Download as MP3 or WAV format
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        ) : (
          /* Audio Processing Section */
          <div className="space-y-6">
            {/* Presets Section */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Music className="h-5 w-5 text-primary" />
                  Quick Presets
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {Object.entries(presets).map(([key, preset]) => {
                    const IconComponent = preset.icon
                    return (
                      <Button
                        key={key}
                        onClick={() => applyPreset(key as PresetKey)}
                        variant={activePreset === key ? "default" : "outline"}
                        className="h-auto p-4 flex flex-col items-center gap-2 text-center"
                      >
                        <IconComponent className="h-6 w-6" />
                        <div>
                          <div className="font-semibold">{preset.name}</div>
                          <div className="text-xs text-muted-foreground mt-1">
                            {preset.description}
                          </div>
                        </div>
                      </Button>
                    )
                  })}
                  <Button
                    onClick={resetToDefault}
                    variant={activePreset === null ? "default" : "outline"}
                    className="h-auto p-4 flex flex-col items-center gap-2 text-center"
                  >
                    <Settings className="h-6 w-6" />
                    <div>
                      <div className="font-semibold">Default</div>
                      <div className="text-xs text-muted-foreground mt-1">
                        Reset to original
                      </div>
                    </div>
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Audio Controls */}
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Settings className="h-5 w-5 text-primary" />
                  <CardTitle>Audio Controls</CardTitle>
                  {activePreset && (
                    <span className="text-sm bg-primary/20 text-primary px-2 py-1 rounded-full">
                      {presets[activePreset].name} Active
                    </span>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-6">
                    <div>
                      <div className="flex justify-between items-center mb-3">
                        <label className="text-sm font-medium text-foreground">Volume</label>
                        <span className="text-sm font-mono bg-secondary px-2 py-1 rounded text-secondary-foreground">
                          {volume}%
                        </span>
                      </div>
                      <Slider
                        min={0}
                        max={100}
                        step={1}
                        value={[volume]}
                        onValueChange={handleVolumeChange}
                        className="w-full"
                      />
                    </div>

                    <div>
                      <div className="flex justify-between items-center mb-3">
                        <label className="text-sm font-medium text-foreground">Playback Speed</label>
                        <span className="text-sm font-mono bg-secondary px-2 py-1 rounded text-secondary-foreground">
                          {speed.toFixed(2)}x
                        </span>
                      </div>
                      <Slider
                        min={0.5}
                        max={2}
                        step={0.01}
                        value={[speed]}
                        onValueChange={handleSpeedChange}
                        className="w-full"
                      />
                    </div>
                  </div>

                  <div className="space-y-6">
                    <div>
                      <div className="flex justify-between items-center mb-3">
                        <label className="text-sm font-medium text-foreground">Reverb Decay</label>
                        <span className="text-sm font-mono bg-secondary px-2 py-1 rounded text-secondary-foreground">
                          {reverbDecay.toFixed(2)}
                        </span>
                      </div>
                      <Slider
                        min={0.01}
                        max={10}
                        step={0.01}
                        value={[reverbDecay]}
                        onValueChange={handleReverbDecayChange}
                        className="w-full"
                      />
                    </div>

                    <div>
                      <div className="flex justify-between items-center mb-3">
                        <label className="text-sm font-medium text-foreground">Bass Boost</label>
                        <span className="text-sm font-mono bg-secondary px-2 py-1 rounded text-secondary-foreground">
                          {bassBoost.toFixed(1)} dB
                        </span>
                      </div>
                      <Slider
                        min={0}
                        max={12}
                        step={0.1}
                        value={[bassBoost]}
                        onValueChange={handleBassBoostChange}
                        className="w-full"
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Audio Player */}
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Headphones className="h-5 w-5 text-primary" />
                  <CardTitle>Audio Player</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <CustomAudioPlayer 
                  key={audioSrc}
                  src={audioSrc} 
                  audioName={audioName} 
                  volume={volume} 
                  speed={speed}
                  reverbDecay={reverbDecay}
                  bassBoost={bassBoost}
                  resetAudio={handleResetAudio}
                  onDownload={handleDownload}
                />
              </CardContent>
            </Card>
          </div>
        )}
        <footer className='text-muted-foreground text-center mt-4'>Made with ❤️ by 
          <Link href="https://github.com/SimoHypers" className='ml-2 underline underline-offset-2' target='_blank'>
            SimoHypers
          </Link>
        </footer>
      </div>
    </div>
  )
}