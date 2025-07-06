# 🎵 SlowNight

**Transform your music with professional audio effects**

SlowNight is a modern web-based audio processing application that allows you to customize your music with real-time effects like reverb, speed adjustment, and bass boost. Perfect for creating slowed + reverb versions or nightcore remixes of your favorite tracks.

## ✨ Features

### 🎛️ Audio Effects
- **Speed Control**: Adjust playback speed from 0.5x to 2x
- **Reverb**: Add atmospheric reverb with customizable decay
- **Bass Boost**: Enhance low frequencies up to 12dB
- **Volume Control**: Precise volume adjustment

### 🎯 Quick Presets
- **Slowed + Reverb**: Deep, atmospheric sound with reduced speed
- **Nightcore**: High-energy fast tempo with enhanced clarity
- **Default**: Reset to original audio settings

### 🎧 Real-time Processing
- Live audio preview with Web Audio API
- Instant effect application without re-encoding
- Smooth playback controls with seek functionality

### 💾 Export Options
- **MP3 Export**: High-quality 128kbps MP3 files
- **WAV Export**: Lossless audio format
- Automatic file naming with processing indicators

### 🎨 Modern UI/UX
- Clean, intuitive interface with Tailwind CSS
- Dark/Light theme support
- Responsive design for all devices
- Smooth animations and transitions

## 🛠️ Tech Stack

- **Framework**: Next.js 14 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: shadcn/ui
- **Audio Processing**: Tone.js, Web Audio API
- **Audio Encoding**: lamejs (MP3), wavefile (WAV)
- **Icons**: Lucide React
- **Animations**: Framer Motion

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn

### Installation

1. Clone the repository
```bash
git clone https://github.com/SimoHypers/slownight.git
cd slownight
```

2. Install dependencies
```bash
npm install
# or
yarn install
```

3. Run the development server
```bash
npm run dev
# or
yarn dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser

## 📖 Usage

### Basic Usage
1. **Upload Audio**: Click the upload area or drag & drop your audio file (MP3, WAV, OGG)
2. **Choose Preset**: Select from Slowed + Reverb, Nightcore, or Default
3. **Fine-tune**: Adjust individual controls for custom sound
4. **Preview**: Listen to changes in real-time
5. **Export**: Download your processed audio as MP3 or WAV

### Supported Formats
- **Input**: MP3, WAV, OGG (up to 10MB)
- **Output**: MP3 (128kbps), WAV (32-bit float)

### Audio Controls
- **Volume**: 0-100% 
- **Speed**: 0.5x - 2.0x (0.01x precision)
- **Reverb Decay**: 0.01 - 10.0 (controls reverb length)
- **Bass Boost**: 0 - 12dB (enhances low frequencies)

## 🎵 Presets Explained

### Slowed + Reverb
- **Speed**: 0.90x (10% slower)
- **Reverb**: 1.5 decay for atmospheric depth
- **Bass**: +2dB boost for fuller sound
- **Perfect for**: Chill, ambient, dreamy vibes

### Nightcore
- **Speed**: 1.2x (20% faster)
- **Reverb**: 1.0 decay for clarity
- **Bass**: +1dB subtle enhancement
- **Perfect for**: High-energy, dance, electronic music

## 🔧 Technical Details

### Audio Processing Pipeline
1. **File Upload**: Creates object URL for audio source
2. **Web Audio Setup**: Initializes Tone.js player with effect chain
3. **Real-time Effects**: Player → EQ3 → CrossFade (dry/wet) → Reverb → Destination
4. **Export Processing**: Offline audio context renders final output

### Effect Implementation
- **Speed**: Utilizes `playbackRate` property for pitch-preserved time stretching
- **Reverb**: Custom impulse response convolution with configurable decay
- **Bass Boost**: 3-band EQ with low-frequency enhancement
- **Volume**: Logarithmic gain control for natural sound

### Performance Optimizations
- Efficient audio buffer management
- Chunked MP3 encoding for large files
- Fade-in/fade-out to prevent audio clicks
- Memory cleanup on component unmount

## 🎨 UI Components

The application uses a component-based architecture with:
- **Reusable UI Components**: Built on shadcn/ui
- **Theme System**: Automatic dark/light mode switching
- **Responsive Grid**: Adapts to mobile and desktop
- **Loading States**: Visual feedback during processing

## 📱 Browser Compatibility

- **Chrome**: Full support (recommended)
- **Firefox**: Full support
- **Safari**: Full support
- **Edge**: Full support

*Note: Web Audio API required for audio processing*

## 🚀 Deployment

The application is optimized for deployment on:
- **Vercel** (recommended for Next.js)
- **Netlify**
- **GitHub Pages** (with static export)

### Environment Variables
No environment variables required for basic functionality.

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [Tone.js](https://tonejs.github.io/) - Web Audio framework
- [shadcn/ui](https://ui.shadcn.com/) - UI component library
- [Lucide React](https://lucide.dev/) - Icon library
- [lamejs](https://github.com/zhuker/lamejs) - MP3 encoding

---

**Made with ❤️ by [SimoHypers](https://github.com/SimoHypers)**

*Transform your music, one beat at a time* 🎶