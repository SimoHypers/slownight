'use client';

import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Upload, Download, Zap, Waves, FileAudio, Sparkles } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ModeToggle } from '@/components/mode-switch';

interface AudioStyle {
  id: string;
  name: string;
  settings: {
    speed: number;
    reverb: number;
    pitch: number;
  };
}

const PRESET_STYLES: AudioStyle[] = [
  {
    id: 'slowed_reverb',
    name: 'Slowed + Reverb',
    settings: {
      speed: 0.8,
      reverb: 50.0,
      pitch: -1.0
    }
  },
  {
    id: 'nightcore',
    name: 'Nightcore',
    settings: {
      speed: 1.25,
      reverb: 10.0,
      pitch: 2.0
    }
  }
];

export default function AudioProcessor() {
  const [file, setFile] = useState<File | null>(null);
  const [selectedStyle, setSelectedStyle] = useState<string>('slowed_reverb');
  const [isProcessing, setIsProcessing] = useState(false);
  const [processedAudioUrl, setProcessedAudioUrl] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);
  const originalAudioRef = useRef<HTMLAudioElement>(null);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (selectedFile) {
      if (selectedFile.type.startsWith('audio/')) {
        setFile(selectedFile);
        setError(null);
        setProcessedAudioUrl(null);
        
        // Create URL for original audio preview
        const url = URL.createObjectURL(selectedFile);
        if (originalAudioRef.current) {
          originalAudioRef.current.src = url;
        }
      } else {
        setError('Please select an audio file (MP3, WAV, etc.)');
      }
    }
  };

  const processAudio = async () => {
    if (!file) return;

    setIsProcessing(true);
    setError(null);
    setProgress(0);

    const formData = new FormData();
    formData.append('file', file);
    formData.append('style', selectedStyle);

    try {
      // Simulate progress updates
      const progressInterval = setInterval(() => {
        setProgress(prev => Math.min(prev + 8, 90));
      }, 300);

      const response = await fetch('http://localhost:8000/process-audio', {
        method: 'POST',
        body: formData,
      });

      clearInterval(progressInterval);
      setProgress(100);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Failed to process audio');
      }

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      setProcessedAudioUrl(url);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to process audio. Please try again.');
      console.error('Audio processing error:', err);
    } finally {
      setIsProcessing(false);
      setTimeout(() => setProgress(0), 1000);
    }
  };

  const togglePlayback = (audioRef: React.RefObject<HTMLAudioElement>) => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const downloadProcessedAudio = () => {
    if (processedAudioUrl) {
      const selectedStyleData = PRESET_STYLES.find(s => s.id === selectedStyle);
      const styleName = selectedStyleData?.name.replace(' ', '_').replace('+', '').toLowerCase() || 'processed';
      
      const a = document.createElement('a');
      a.href = processedAudioUrl;
      a.download = `${styleName}_${file?.name || 'audio.mp3'}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    }
  };

  const getStyleIcon = (styleId: string) => {
    return styleId === 'slowed_reverb' ? <Waves className="h-5 w-5" /> : <Zap className="h-5 w-5" />;
  };

  const getStyleDescription = (styleId: string) => {
    return styleId === 'slowed_reverb' 
      ? 'Dreamy, chill vibe with spacious reverb'
      : 'Fast, energetic, high-pitched anime style';
  };

  const selectedStyleData = PRESET_STYLES.find(s => s.id === selectedStyle);

  return (
    <div className="min-h-screen bg-background p-4 md:p-6">
      <nav className="shadow-sm border-b text-foreground h-16">
        <div className="flex justify-center items-center h-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-6">
          <h1 className='text-3xl font-bold italic text-transparent p-2 inline-block bg-clip-text bg-gradient-to-r from-rose-500 from- to-rose-300 to-100%'>
            SlowNight
          </h1>
          <div className='absolute right-0 flex items-center mr-6'>
            <ModeToggle />
          </div>
        </div>
      </nav>
      <div className="max-w-4xl mx-auto space-y-8 my-6">
        {/* File Upload */}
        <Card className="relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1"></div>
          <CardHeader className="pb-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Upload className="h-5 w-5 text-primary" />
              </div>
              <div>
                <CardTitle className="text-xl">Upload Audio File</CardTitle>
                <CardDescription className="text-base">
                  Select your audio file to get started
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div
              className="group relative border-2 border-dashed border-muted-foreground/25 rounded-xl p-8 text-center cursor-pointer hover:border-primary/50 transition-all duration-200 bg-muted/20 hover:bg-muted/30"
              onClick={() => fileInputRef.current?.click()}
            >
              <div className="flex flex-col items-center gap-4">
                <div className="p-4 bg-primary/10 rounded-full group-hover:bg-primary/15 transition-colors">
                  {file ? (
                    <FileAudio className="h-8 w-8 text-primary" />
                  ) : (
                    <Upload className="h-8 w-8 text-primary" />
                  )}
                </div>
                <div className="space-y-2">
                  <p className="text-lg font-medium">
                    {file ? file.name : 'Click to upload or drag & drop'}
                  </p>
                  <p className="text-muted-foreground">
                    MP3, WAV, FLAC, AAC up to 50MB
                  </p>
                </div>
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept="audio/*"
                onChange={handleFileUpload}
                className="hidden"
              />
            </div>
          </CardContent>
        </Card>

        {/* Style Selection */}
        {file && (
          <Card className="relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1"></div>
            <CardHeader className="pb-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <Sparkles className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <CardTitle className="text-xl">Choose Audio Style</CardTitle>
                  <CardDescription className="text-base">
                    Select your preferred audio transformation
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Style Options */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {PRESET_STYLES.map((style) => (
                  <div
                    key={style.id}
                    className={`group relative p-6 rounded-xl border-2 cursor-pointer transition-all duration-200 ${
                      selectedStyle === style.id
                        ? 'border-primary bg-primary/5 shadow-lg shadow-primary/10'
                        : 'border-muted-foreground/20 hover:border-primary/30 hover:bg-muted/30'
                    }`}
                    onClick={() => setSelectedStyle(style.id)}
                  >
                    <div className="flex items-start gap-4">
                      <div className={`p-3 rounded-xl transition-all ${
                        selectedStyle === style.id 
                          ? 'bg-primary text-primary-foreground shadow-sm' 
                          : 'bg-muted group-hover:bg-primary/10'
                      }`}>
                        {getStyleIcon(style.id)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-lg mb-2">{style.name}</h3>
                        <p className="text-muted-foreground text-sm leading-relaxed mb-3">
                          {getStyleDescription(style.id)}
                        </p>
                        <div className="flex flex-wrap gap-2 text-xs">
                          <span className="px-2 py-1 bg-muted rounded-md">
                            Speed: {style.settings.speed}x
                          </span>
                          <span className="px-2 py-1 bg-muted rounded-md">
                            Reverb: {style.settings.reverb}%
                          </span>
                          <span className="px-2 py-1 bg-muted rounded-md">
                            Pitch: {style.settings.pitch > 0 ? '+' : ''}{style.settings.pitch}
                          </span>
                        </div>
                      </div>
                    </div>
                    {selectedStyle === style.id && (
                      <div className="absolute top-3 right-3 w-3 h-3 bg-primary rounded-full shadow-sm"></div>
                    )}
                  </div>
                ))}
              </div>

              {/* Process Button */}
              <Button
                onClick={processAudio}
                disabled={isProcessing}
                className="w-full h-14 text-lg font-semibold relative overflow-hidden cursor-pointer"
                size="lg"
              >
                {isProcessing ? (
                  <>
                    <div className="animate-spin mr-3 h-5 w-5 border-2 border-current border-t-transparent rounded-full"></div>
                    Processing {selectedStyleData?.name}...
                  </>
                ) : (
                  <>
                    {getStyleIcon(selectedStyle)}
                    <span className="ml-2">Apply {selectedStyleData?.name}</span>
                  </>
                )}
              </Button>

              {/* Progress Bar */}
              {isProcessing && (
                <div className="space-y-3">
                  <Progress value={progress} className="h-2" />
                  <p className="text-center text-muted-foreground text-sm">
                    Transforming your audio with {selectedStyleData?.name}... {progress}%
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Error Display */}
        {error && (
          <Alert className="border-destructive/50 bg-destructive/10">
            <AlertDescription className="text-destructive">
              {error}
            </AlertDescription>
          </Alert>
        )}

        {/* Processed Audio */}
        {processedAudioUrl && (
          <Card className="relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1"></div>
            <CardHeader className="pb-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/15 rounded-lg">
                  {getStyleIcon(selectedStyle)}
                </div>
                <div>
                  <CardTitle className="text-lg flex items-center gap-2">
                    {selectedStyleData?.name} Result
                    <span className="text-xs bg-primary/20 text-primary px-2 py-1 rounded-full">
                      Ready
                    </span>
                  </CardTitle>
                  <CardDescription>
                    Your audio transformed with {selectedStyleData?.name} effects
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <audio
                ref={audioRef}
                src={processedAudioUrl}
                controls
                className="w-full h-12 bg-muted rounded-lg"
                onEnded={() => setIsPlaying(false)}
              >
                Your browser does not support the audio element.
              </audio>
              <Button
                onClick={downloadProcessedAudio}
                className="w-full h-12 text-base font-semibold cursor-pointer"
              >
                <Download className="h-5 w-5 mr-2" />
                Download {selectedStyleData?.name} Audio
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}