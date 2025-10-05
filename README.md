# DYP Aura - An Intelligent Aura for Your Laundry Space

A revolutionary AI-powered smart living and clean management system, designed to create an intelligent aura around your laundry experience. Powered by Google's Gemini AI for seamless predictions and personalized assistance.

## 🤖 AI Features

### Intelligent Delay Prediction
- **Personalized Predictions**: AI analyzes your laundry collection habits to predict when you'll pick up your clothes
- **Smart Reminders**: Receives personalized reminder messages based on your behavior patterns
- **Adaptive Learning**: System learns from your habits to improve predictions over time

### AI Chatbot Assistant (AuraBot)
- **Real-time Machine Status**: Get instant updates on washer and dryer availability
- **Smart Recommendations**: AI suggests optimal times for doing laundry
- **Intelligent Context**: Understands your living space and lifestyle patterns
- **Natural Language**: Chat naturally about laundry room status and get helpful responses

### Advanced AI Integration
- **Rate Limiting**: Optimized API usage to prevent overuse and reduce costs
- **Response Caching**: Intelligent caching system for faster responses and cost efficiency
- **Error Handling**: Robust fallback mechanisms ensure the app works even when AI is unavailable
- **Loading States**: Smooth user experience with loading indicators during AI processing

## 🚀 Quick Start

**Prerequisites:** Node.js 18+ and a Google AI Studio API key

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Configure your Gemini API key:**
   ```bash
   # Create a .env file in the root directory
   echo "GEMINI_API_KEY=AIzaSyCM6Aghc3fcO2CZ9ufxOC0tyz1_bTUOcio" > .env
   ```
   
   **Your Gemini API Key:** `AIzaSyCM6Aghc3fcO2CZ9ufxOC0tyz1_bTUOcio`

3. **Run the development server:**
   ```bash
   npm run dev
   ```

4. **Open your browser:**
   Navigate to `http://localhost:3000` (or the port shown in terminal)

## 🔧 Git Setup

**Ready to push to GitHub:**

```bash
# Initialize git repository (if not already done)
git init

# Add all files
git add .

# Commit changes
git commit -m "Initial commit: DYP Aura - AI-powered smart laundry management system"

# Add remote repository (replace with your GitHub repo URL)
git remote add origin https://github.com/yourusername/SU-Developer-Hack.git

# Push to main branch
git push -u origin main
```

**Important:** The `.env` file is already in `.gitignore` to protect your API key.

## 🏗️ Architecture

### AI Service Layer (`services/geminiService.ts`)
- **predictDelay()**: Analyzes user habits and predicts collection delays
- **getChatbotResponse()**: Powers the intelligent chatbot assistant
- **Caching System**: 5-minute cache for API responses
- **Rate Limiting**: 1-second minimum interval between requests
- **Error Recovery**: Smart fallback responses when AI is unavailable

### Components
- **AIStatusIndicator**: Real-time AI connection status
- **Chatbot**: Interactive AI assistant with loading states
- **StartCycleModal**: AI-powered cycle prediction with loading indicators

## 🎯 Key Features

### For Users
- **Real-time Machine Tracking**: See which washers and dryers are available
- **AI-Powered Predictions**: Get personalized estimates for when to collect laundry
- **Smart Notifications**: Receive timely reminders based on your habits
- **AuraBot Assistant**: Ask questions about machine availability and get instant answers
- **Profile Tracking**: Monitor your laundry habits and improve efficiency

### For Administrators
- **System Overview**: Monitor all machines across all residences
- **Usage Analytics**: Track machine utilization and user patterns
- **AI Status Monitoring**: Real-time AI service health indicators

## 🔧 Technical Details

### AI Model Configuration
- **Model**: Gemini 2.0 Flash Experimental
- **Temperature**: 0.7-0.8 for balanced creativity and consistency
- **Max Tokens**: 100-150 for concise responses
- **Response Format**: Structured JSON for predictions, natural text for chat

### Performance Optimizations
- **Response Caching**: Reduces API calls and improves response times
- **Rate Limiting**: Prevents API quota exhaustion
- **Error Boundaries**: Graceful degradation when AI services are unavailable
- **Loading States**: Smooth UX during AI processing

### Security
- **Environment Variables**: API keys stored securely in .env files
- **Git Ignore**: .env files excluded from version control
- **Input Validation**: All user inputs validated before AI processing

## 🎨 User Experience

### AI-Powered Features
- **Personalized Messages**: AI generates context-aware reminders
- **Intelligent Communication**: Bot uses appropriate terminology for your space
- **Smart Suggestions**: AI recommends optimal laundry times
- **Habit Learning**: System adapts to individual user patterns

### Visual Indicators
- **AI Status**: Real-time connection status in header
- **Loading Animations**: Smooth transitions during AI processing
- **Smart Notifications**: Context-aware toast messages
- **Progress Indicators**: Visual feedback for long-running operations

## 🔮 Future Enhancements

- **Machine Learning Models**: Local ML for even faster predictions
- **Voice Integration**: Voice commands for hands-free operation
- **Predictive Maintenance**: AI-powered machine health monitoring
- **Social Features**: Laundry room community features
- **Mobile App**: Native mobile application with push notifications

## 📋 Project Status

**Current Version:** 1.0.0 - Production Ready  
**Last Updated:** December 2024  
**Development Server:** Running on `http://localhost:3005/`

## 🚀 Deployment

The application is ready for deployment with all features implemented:

- ✅ **AI Integration**: Gemini API fully integrated with caching and rate limiting
- ✅ **Gamification**: Points, badges, streaks, and leaderboard system
- ✅ **Push Notifications**: Multi-level escalation system (normal, urgent, final)
- ✅ **Residence-Specific Views**: Students see only their residence machines
- ✅ **Real-Time Dashboard**: Live machine status and predictions
- ✅ **User Notifications**: Queue management and forgotten laundry alerts
- ✅ **Laundry Scheduler**: Advanced scheduling system with conflict prevention
- ✅ **Feedback System**: Machine rating and issue reporting
- ✅ **Animated Welcome Page**: Beautiful CSS animations and modern UI

---

**Built with ✨ for intelligent living using Google's Gemini AI**
