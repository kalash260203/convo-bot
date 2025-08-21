# 🤖 ConvoBOT - AI Chat Assistant

A modern, beautiful AI chat interface built with **Next.js 14** and powered by **Google Gemini AI**.

![ConvoBOT Preview](https://img.shields.io/badge/Next.js-14.0.0-black?style=for-the-badge&logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?style=for-the-badge&logo=typescript)
![Google Gemini](https://img.shields.io/badge/Google-Gemini%20AI-4285F4?style=for-the-badge&logo=google)

## ✨ Features

### 🎨 **Modern UI/UX**
- **Glassmorphism Design** - Beautiful frosted glass effects with backdrop blur
- **Dynamic Gradient Background** - Animated color-shifting gradients
- **Floating Animations** - Subtle container movements and transitions
- **Dark Theme** - Eye-friendly dark interface with premium aesthetics
- **Responsive Design** - Perfect on desktop, tablet, and mobile devices

### 🤖 **AI-Powered Chat**
- **Google Gemini Integration** - Advanced AI responses using Gemini 1.5 Flash
- **Real-time Conversations** - Instant AI responses with typing indicators
- **Message Formatting** - Support for headings, lists, code blocks, and more
- **Chat History** - Persistent conversation storage in localStorage
- **Error Handling** - Graceful fallbacks and retry mechanisms

### 🔧 **Technical Features**
- **Next.js 14** - Latest App Router with server-side API routes
- **TypeScript** - Full type safety and development experience
- **Component Architecture** - Modular, reusable React components
- **API Integration** - Secure backend API handling with environment variables
- **Performance Optimized** - Fast loading and smooth interactions

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- npm or yarn
- Google Gemini API key

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/kalash260203/convo-bot.git
   cd convo-bot
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env.local
   ```
   
   Add your Google Gemini API key to `.env.local`:
   ```env
   GEMINI_API_KEY=your_gemini_api_key_here
   ```

4. **Run the development server**
   ```bash
   npm run dev
   ```

5. **Open your browser**
   ```
   http://localhost:5001
   ```

## 🛠️ Built With

- **[Next.js 14](https://nextjs.org/)** - React framework with App Router
- **[TypeScript](https://www.typescriptlang.org/)** - Type-safe JavaScript
- **[Google Gemini AI](https://ai.google.dev/)** - Advanced language model
- **[CSS3](https://developer.mozilla.org/en-US/docs/Web/CSS)** - Modern styling with glassmorphism
- **[Font Awesome](https://fontawesome.com/)** - Beautiful icons
- **[Google Fonts](https://fonts.google.com/)** - Inter & JetBrains Mono typography

## 📁 Project Structure

```
convo-bot/
├── app/
│   ├── api/
│   │   └── chat/
│   │       └── route.ts          # API endpoint for chat
│   ├── components/
│   │   ├── ChatContainer.tsx     # Main chat logic
│   │   ├── ChatHeader.tsx        # Header with title and controls
│   │   ├── ChatMessages.tsx      # Message display and formatting
│   │   ├── ChatInput.tsx         # Input field and send button
│   │   ├── TypingIndicator.tsx   # Loading animation
│   │   ├── types.ts              # TypeScript interfaces
│   │   └── index.ts              # Component exports
│   ├── globals.css               # Global styles and animations
│   ├── layout.tsx                # Root layout component
│   └── page.tsx                  # Home page
├── public/                       # Static assets
├── .env.local                    # Environment variables
├── package.json                  # Dependencies and scripts
└── tsconfig.json                 # TypeScript configuration
```

## 🎨 UI Components

### Chat Interface
- **Glassmorphism containers** with blur effects
- **Gradient backgrounds** that shift colors dynamically
- **Message bubbles** with proper alignment (user right, bot left)
- **Typing indicators** with animated dots
- **Smooth transitions** for all interactions

### Message Features
- **Markdown rendering** for rich text formatting
- **Code syntax highlighting** with copy functionality
- **Link detection** and styling
- **Time stamps** for each message
- **Avatar icons** for user and bot identification

## 🔑 Environment Variables

Create a `.env.local` file with:

```env
# Google Gemini API Key
GEMINI_API_KEY=your_gemini_api_key_here
```

## 🚀 Deployment

### Vercel (Recommended)
1. Push your code to GitHub
2. Connect your repository to [Vercel](https://vercel.com)
3. Add your environment variables in Vercel dashboard
4. Deploy automatically on every push

### Other Platforms
- **Netlify**: `npm run build && npm run export`
- **Railway**: Direct deployment from GitHub
- **Docker**: Use the included Dockerfile

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Google Gemini** for providing the AI capabilities
- **Vercel** for the excellent hosting platform
- **Next.js team** for the amazing framework
- **Open source community** for the inspiration and tools

---

<div align="center">
  <p>Made with ❤️ by <a href="https://github.com/kalash260203">Kalash</a></p>
  <p>⭐ Star this repo if you found it helpful!</p>
</div>
