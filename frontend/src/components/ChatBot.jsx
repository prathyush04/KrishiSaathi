import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, ArrowLeft, Mic, MicOff, Volume2, VolumeX, Languages } from 'lucide-react';
import TranslatedText from './TranslatedText';

const ChatBot = ({ onBack, user }) => {
  // Load messages from localStorage or use default
  const loadMessages = () => {
    const saved = localStorage.getItem('krishisaathi_chat_messages');
    if (saved) {
      try {
        return JSON.parse(saved).map(msg => ({
          ...msg,
          timestamp: new Date(msg.timestamp)
        }));
      } catch (e) {
        console.error('Error loading messages:', e);
      }
    }
    return [
      {
        id: 1,
        text: "Hello! I'm KrishiSaathi, your AI farming assistant. Ask me about soil management, crop recommendations, fertilizers, organic farming, or any agricultural questions!",
        sender: 'bot',
        timestamp: new Date()
      }
    ];
  };

  const [messages, setMessages] = useState(loadMessages);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState('english');
  const [recognition, setRecognition] = useState(null);
  const [speechSynthesis, setSpeechSynthesis] = useState(null);
  const messagesEndRef = useRef(null);
  const API_BASE = 'http://127.0.0.1:8000';

  const languages = {
    'hindi': { name: 'हिंदी', code: 'hi-IN' },
    'bengali': { name: 'বাংলা', code: 'bn-IN' },
    'telugu': { name: 'తెలుగు', code: 'te-IN' },
    'marathi': { name: 'मराठी', code: 'mr-IN' },
    'tamil': { name: 'தமிழ்', code: 'ta-IN' },
    'gujarati': { name: 'ગુજરાતી', code: 'gu-IN' },
    'kannada': { name: 'ಕನ್ನಡ', code: 'kn-IN' },
    'malayalam': { name: 'മലയാളം', code: 'ml-IN' },
    'punjabi': { name: 'ਪੰਜਾਬੀ', code: 'pa-IN' },
    'english': { name: 'English', code: 'en-IN' }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // Save messages to localStorage whenever messages change
  useEffect(() => {
    localStorage.setItem('krishisaathi_chat_messages', JSON.stringify(messages));
    scrollToBottom();
  }, [messages]);

  const clearChat = () => {
    const defaultMessage = {
      id: 1,
      text: "Hello! I'm KrishiSaathi, your AI farming assistant. Ask me about soil management, crop recommendations, fertilizers, organic farming, or any agricultural questions!",
      sender: 'bot',
      timestamp: new Date()
    };
    setMessages([defaultMessage]);
    localStorage.setItem('krishisaathi_chat_messages', JSON.stringify([defaultMessage]));
  };

  useEffect(() => {
    // Initialize Web Speech API
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      const recognitionInstance = new SpeechRecognition();
      
      recognitionInstance.continuous = false;
      recognitionInstance.interimResults = false;
      recognitionInstance.maxAlternatives = 1;
      
      recognitionInstance.onresult = handleSpeechResult;
      recognitionInstance.onerror = handleSpeechError;
      recognitionInstance.onend = () => setIsListening(false);
      
      setRecognition(recognitionInstance);
    }

    // Initialize Speech Synthesis
    if ('speechSynthesis' in window) {
      setSpeechSynthesis(window.speechSynthesis);
      
      // Load voices
      const loadVoices = () => {
        const voices = window.speechSynthesis.getVoices();
        console.log('Available voices:', voices.map(v => `${v.name} (${v.lang})`));
        
        // Check which Indian languages have voices
        const indianLangs = ['hi', 'bn', 'te', 'ta', 'mr', 'gu', 'kn', 'ml', 'pa'];
        const availableIndianVoices = {};
        
        indianLangs.forEach(lang => {
          const voice = voices.find(v => v.lang.startsWith(lang));
          if (voice) {
            availableIndianVoices[lang] = voice.name;
          }
        });
        
        console.log('Available Indian language voices:', availableIndianVoices);
      };
      
      if (window.speechSynthesis.getVoices().length > 0) {
        loadVoices();
      } else {
        window.speechSynthesis.onvoiceschanged = loadVoices;
      }
    }
  }, []);

  const handleSpeechResult = async (event) => {
    const transcript = event.results[0][0].transcript;
    setInputMessage(transcript);
    await sendSpeechMessage(transcript);
  };

  const handleSpeechError = (event) => {
    console.error('Speech recognition error:', event.error);
    setIsListening(false);
  };

  const startListening = () => {
    if (recognition) {
      const langCode = languages[selectedLanguage]?.code || 'en-IN';
      recognition.lang = langCode;
      recognition.start();
      setIsListening(true);
    }
  };

  const stopListening = () => {
    if (recognition) {
      recognition.stop();
      setIsListening(false);
    }
  };

  const speakText = (text, language = selectedLanguage) => {
    if (speechSynthesis && text) {
      speechSynthesis.cancel();
      
      const utterance = new SpeechSynthesisUtterance(text);
      const langCode = languages[language]?.code || 'en-IN';
      const baseLang = langCode.split('-')[0];
      
      // Voice priority mapping for Indian languages
      const voiceMappings = {
        'hi': ['hi-IN', 'hi', 'en-IN', 'en-US'],
        'bn': ['bn-IN', 'bn', 'hi-IN', 'en-IN'],
        'te': ['te-IN', 'te', 'hi-IN', 'en-IN'],
        'ta': ['ta-IN', 'ta', 'hi-IN', 'en-IN'],
        'mr': ['mr-IN', 'mr', 'hi-IN', 'en-IN'],
        'gu': ['gu-IN', 'gu', 'hi-IN', 'en-IN'],
        'kn': ['kn-IN', 'kn', 'hi-IN', 'en-IN'],
        'ml': ['ml-IN', 'ml', 'hi-IN', 'en-IN'],
        'pa': ['pa-IN', 'pa', 'hi-IN', 'en-IN'],
        'en': ['en-IN', 'en-US', 'en-GB']
      };
      
      const voices = speechSynthesis.getVoices();
      const priorities = voiceMappings[baseLang] || ['en-IN', 'en-US'];
      
      let selectedVoice = null;
      for (const priority of priorities) {
        selectedVoice = voices.find(v => v.lang === priority);
        if (selectedVoice) break;
      }
      
      // Final fallback to any available voice
      if (!selectedVoice) {
        selectedVoice = voices.find(v => v.lang.startsWith(baseLang)) ||
                       voices.find(v => v.lang.startsWith('en')) ||
                       voices[0];
      }
      
      if (selectedVoice) {
        utterance.voice = selectedVoice;
        utterance.lang = selectedVoice.lang;
        console.log(`Using voice: ${selectedVoice.name} (${selectedVoice.lang}) for text: ${text.substring(0, 50)}...`);
      } else {
        utterance.lang = langCode;
        console.log(`No specific voice found, using default for: ${langCode}`);
      }
      
      utterance.rate = 0.8;
      utterance.pitch = 1;
      
      utterance.onstart = () => setIsSpeaking(true);
      utterance.onend = () => setIsSpeaking(false);
      utterance.onerror = (e) => {
        console.error('Speech synthesis error:', e);
        setIsSpeaking(false);
      };
      
      speechSynthesis.speak(utterance);
    }
  };

  const stopSpeaking = () => {
    if (speechSynthesis) {
      speechSynthesis.cancel();
      setIsSpeaking(false);
    }
  };

  const sendMessage = async (messageText = inputMessage) => {
    if (!messageText.trim() || isLoading) return;

    const userMessage = {
      id: Date.now(),
      text: messageText,
      sender: 'user',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);

    try {
      const endpoint = selectedLanguage === 'english' ? '/chat' : '/api/speech/translate';
      const requestBody = selectedLanguage === 'english' 
        ? { message: messageText, user_id: user?.username || 'anonymous' }
        : { text: messageText, language: selectedLanguage };

      const response = await fetch(`${API_BASE}${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody)
      });

      const data = await response.json();
      
      let botResponseText;
      if (selectedLanguage === 'english') {
        botResponseText = data.success ? data.response : "Sorry, I'm having trouble right now. Please try again.";
      } else {
        botResponseText = data.translated_response || data.english_response || "Sorry, I'm having trouble right now. Please try again.";
      }
      
      const botMessage = {
        id: Date.now() + 1,
        text: botResponseText,
        sender: 'bot',
        timestamp: new Date()
      };

      setMessages(prev => [...prev, botMessage]);
      
      // Speak the response in the selected language
      const textToSpeak = selectedLanguage !== 'english' ? 
        (data.translated_response || botResponseText) : botResponseText;
      
      console.log('Speaking text:', textToSpeak, 'in language:', selectedLanguage);
      speakText(textToSpeak, selectedLanguage);
      
    } catch (error) {
      const errorMessage = {
        id: Date.now() + 1,
        text: "Sorry, I couldn't connect to the server. Please check your connection and try again.",
        sender: 'bot',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const sendSpeechMessage = async (transcript) => {
    await sendMessage(transcript);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-green-100 p-3 sm:p-4">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2 sm:gap-4">
            <button
              onClick={onBack}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-r from-green-500 to-blue-500 rounded-full flex items-center justify-center">
                <Bot className="w-4 h-4 sm:w-6 sm:h-6 text-white" />
              </div>
              <div>
                <h1 className="text-lg sm:text-xl font-bold text-gray-900">
                  <TranslatedText text="KrishiSaathi AI" language={user?.language} />
                </h1>
                <p className="text-xs sm:text-sm text-gray-600 hidden sm:block">
                  <TranslatedText text="Your intelligent farming companion" language={user?.language} />
                </p>
              </div>
            </div>
          </div>
          <button
            onClick={clearChat}
            className="text-xs sm:text-sm px-2 sm:px-3 py-1 sm:py-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-colors"
          >
            Clear Chat
          </button>
        </div>
      </div>

      {/* Chat Container */}
      <div className="max-w-4xl mx-auto p-2 sm:p-4 h-[calc(100vh-140px)] flex flex-col">
        {/* Messages */}
        <div className="flex-1 overflow-y-auto mb-3 sm:mb-4 space-y-3 sm:space-y-4 px-1">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div className={`flex items-start gap-2 sm:gap-3 max-w-[85%] sm:max-w-[80%] ${message.sender === 'user' ? 'flex-row-reverse' : ''}`}>
                <div className={`w-6 h-6 sm:w-8 sm:h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                  message.sender === 'user' 
                    ? 'bg-blue-500' 
                    : 'bg-gradient-to-r from-green-500 to-blue-500'
                }`}>
                  {message.sender === 'user' ? (
                    <User className="w-3 h-3 sm:w-4 sm:h-4 text-white" />
                  ) : (
                    <Bot className="w-3 h-3 sm:w-4 sm:h-4 text-white" />
                  )}
                </div>
                <div className={`rounded-2xl p-3 sm:p-4 ${
                  message.sender === 'user'
                    ? 'bg-blue-500 text-white'
                    : 'bg-white border border-gray-200 text-gray-800 shadow-sm'
                }`}>
                  <p className="whitespace-pre-wrap text-sm sm:text-base">{message.text}</p>
                  <p className={`text-xs mt-2 ${
                    message.sender === 'user' ? 'text-blue-100' : 'text-gray-500'
                  }`}>
                    {message.timestamp.toLocaleTimeString()}
                  </p>
                </div>
              </div>
            </div>
          ))}
          
          {isLoading && (
            <div className="flex justify-start">
              <div className="flex items-start gap-2 sm:gap-3">
                <div className="w-6 h-6 sm:w-8 sm:h-8 bg-gradient-to-r from-green-500 to-blue-500 rounded-full flex items-center justify-center">
                  <Bot className="w-3 h-3 sm:w-4 sm:h-4 text-white" />
                </div>
                <div className="bg-white border border-gray-200 rounded-2xl p-3 sm:p-4 shadow-sm">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                  </div>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Language & Speech Controls */}
        <div className="bg-white rounded-xl sm:rounded-2xl border border-gray-200 p-2 sm:p-3 shadow-lg mb-2 sm:mb-3">
          <div className="flex flex-wrap items-center gap-2 sm:gap-3">
            <div className="flex items-center gap-2">
              <Languages className="text-green-600" size={16} />
              <select 
                value={selectedLanguage}
                onChange={(e) => setSelectedLanguage(e.target.value)}
                className="px-2 py-1 sm:px-3 sm:py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 text-xs sm:text-sm"
              >
                {Object.entries(languages).map(([code, lang]) => (
                  <option key={code} value={code}>{lang.name}</option>
                ))}
              </select>
            </div>
            
            <button
              onClick={isListening ? stopListening : startListening}
              className={`flex items-center gap-1 sm:gap-2 px-2 sm:px-3 py-1 sm:py-2 rounded-lg font-medium text-xs sm:text-sm ${
                isListening 
                  ? 'bg-red-500 text-white animate-pulse' 
                  : 'bg-green-500 text-white hover:bg-green-600'
              }`}
            >
              {isListening ? <MicOff size={14} /> : <Mic size={14} />}
              <span className="hidden sm:inline">{isListening ? 'Stop' : 'Speak'}</span>
            </button>
            
            <button
              onClick={isSpeaking ? stopSpeaking : null}
              className={`flex items-center gap-1 sm:gap-2 px-2 sm:px-3 py-1 sm:py-2 rounded-lg text-xs sm:text-sm ${
                isSpeaking 
                  ? 'bg-orange-500 text-white animate-pulse' 
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
              disabled={!isSpeaking}
            >
              {isSpeaking ? <VolumeX size={14} /> : <Volume2 size={14} />}
              <span className="hidden sm:inline">{isSpeaking ? 'Stop Audio' : 'Audio'}</span>
            </button>
            
            <button
              onClick={() => {
                const testText = selectedLanguage === 'hindi' ? 'नमस्ते किसान' :
                                selectedLanguage === 'telugu' ? 'హలో రైతు' :
                                selectedLanguage === 'tamil' ? 'வணக்கம் விவசாயி' :
                                'Hello farmer';
                speakText(testText, selectedLanguage);
              }}
              className="px-2 sm:px-3 py-1 sm:py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 text-xs sm:text-sm"
            >
              Test
            </button>
          </div>
          <div className="text-xs text-gray-500 mt-2 hidden sm:block">
            Voice support varies by browser. Test button checks if your language works.
          </div>
        </div>

        {/* Input */}
        <div className="bg-white rounded-xl sm:rounded-2xl border border-gray-200 p-3 sm:p-4 shadow-lg">
          <div className="flex gap-2 sm:gap-3">
            <textarea
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder={`Ask me about farming in ${languages[selectedLanguage]?.name}...`}
              className="flex-1 resize-none border-0 outline-none bg-transparent placeholder-gray-500 text-sm sm:text-base"
              rows="1"
              disabled={isLoading}
            />
            <button
              onClick={() => sendMessage()}
              disabled={!inputMessage.trim() || isLoading}
              className="bg-gradient-to-r from-green-500 to-blue-500 text-white p-2 sm:p-3 rounded-xl hover:from-green-600 hover:to-blue-600 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex-shrink-0"
            >
              <Send className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatBot;