'use client';

import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { Upload, Play, Pause, Download, Volume2, Music, Zap, Waves } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

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
      ? 'Dreamy, chill vibe with spacious reverb (0.8x speed, 50% reverb, -1 pitch)'
      : 'Fast, energetic, high-pitched anime style (1.25x speed, 10% reverb, +2 pitch)';
  };

  const selectedStyleData = PRESET_STYLES.find(s => s.id === selectedStyle);

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 p-4">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-4xl font-bold text-white flex items-center justify-center gap-3">
            <Music className="h-10 w-10" />
            Audio Effects Studio
          </h1>
          <p className="text-blue-200">Transform your audio with Slowed + Reverb or Nightcore styles</p>
        </div>

        {/* File Upload */}
        <Card className="bg-white/10 backdrop-blur-lg border-white/20">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Upload className="h-5 w-5" />
              Upload Audio File
            </CardTitle>
            <CardDescription className="text-blue-200">
              Select an audio file to get started
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div
                className="border-2 border-dashed border-white/30 rounded-lg p-8 text-center cursor-pointer hover:border-white/50 transition-colors"
                onClick={() => fileInputRef.current?.click()}
              >
                <Upload className="h-12 w-12 text-white/60 mx-auto mb-4" />
                <p className="text-white/80">
                  {file ? file.name : 'Click to upload or drag and drop'}
                </p>
                <p className="text-white/60 text-sm">MP3, WAV, FLAC, AAC up to 50MB</p>
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
          <Card className="bg-white/10 backdrop-blur-lg border-white/20">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Volume2 className="h-5 w-5" />
                Choose Audio Style
              </CardTitle>
              <CardDescription className="text-blue-200">
                Select your preferred audio transformation
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Style Options */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {PRESET_STYLES.map((style) => (
                  <div
                    key={style.id}
                    className={`relative p-4 rounded-lg border-2 cursor-pointer transition-all ${
                      selectedStyle === style.id
                        ? 'border-purple-400 bg-purple-500/20'
                        : 'border-white/30 bg-white/5 hover:border-white/50'
                    }`}
                    onClick={() => setSelectedStyle(style.id)}
                  >
                    <div className="flex items-start gap-3">
                      <div className={`p-2 rounded-full ${
                        selectedStyle === style.id 
                          ? 'bg-purple-500 text-white' 
                          : 'bg-white/20 text-white/80'
                      }`}>
                        {getStyleIcon(style.id)}
                      </div>
                      <div className="flex-1">
                        <h3 className="text-white font-semibold text-lg">{style.name}</h3>
                        <p className="text-white/70 text-sm mt-1">
                          {getStyleDescription(style.id)}
                        </p>
                        <div className="mt-2 text-xs text-white/60">
                          Speed: {style.settings.speed}x • Reverb: {style.settings.reverb}% • Pitch: {style.settings.pitch > 0 ? '+' : ''}{style.settings.pitch}
                        </div>
                      </div>
                    </div>
                    {selectedStyle === style.id && (
                      <div className="absolute top-2 right-2 w-3 h-3 bg-purple-400 rounded-full"></div>
                    )}
                  </div>
                ))}
              </div>

              {/* Process Button */}
              <Button
                onClick={processAudio}
                disabled={isProcessing}
                className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white text-lg py-6"
              >
                {isProcessing ? (
                  <>
                    <div className="animate-spin mr-2 h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
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
                <div className="space-y-2">
                  <Progress value={progress} className="w-full" />
                  <p className="text-center text-white/80 text-sm">
                    Transforming your audio with {selectedStyleData?.name}... {progress}%
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Error Display */}
        {error && (
          <Alert className="bg-red-500/20 border-red-500/50">
            <AlertDescription className="text-red-200">
              {error}
            </AlertDescription>
          </Alert>
        )}

        {/* Original Audio Preview */}
        {file && (
          <Card className="bg-white/10 backdrop-blur-lg border-white/20">
            <CardHeader>
              <CardTitle className="text-white">Original Audio</CardTitle>
              <CardDescription className="text-blue-200">
                Preview your uploaded file
              </CardDescription>
            </CardHeader>
            <CardContent>
              <audio
                ref={originalAudioRef}
                controls
                className="w-full bg-white/10 rounded-lg"
              >
                Your browser does not support the audio element.
              </audio>
            </CardContent>
          </Card>
        )}

        {/* Processed Audio */}
        {processedAudioUrl && (
          <Card className="bg-white/10 backdrop-blur-lg border-white/20">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                {getStyleIcon(selectedStyle)}
                {selectedStyleData?.name} Result
              </CardTitle>
              <CardDescription className="text-blue-200">
                Your audio transformed with {selectedStyleData?.name} effects
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <audio
                ref={audioRef}
                src={processedAudioUrl}
                controls
                className="w-full bg-white/10 rounded-lg"
                onEnded={() => setIsPlaying(false)}
              >
                Your browser does not support the audio element.
              </audio>
              <Button
                onClick={downloadProcessedAudio}
                className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white flex items-center gap-2"
              >
                <Download className="h-4 w-4" />
                Download {selectedStyleData?.name} Audio
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}