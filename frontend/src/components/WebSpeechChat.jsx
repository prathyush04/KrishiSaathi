import React, { useState, useEffect, useRef } from 'react';
import { Mic, MicOff, Volume2, VolumeX, Languages, Send } from 'lucide-react';

const WebSpeechChat = () => {
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState('hindi');
  const [messages, setMessages] = useState([]);
  const [textInput, setTextInput] = useState('');
  const [recognition, setRecognition] = useState(null);
  const [speechSynthesis, setSpeechSynthesis] = useState(null);

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
    }
  }, []);

  const handleSpeechResult = async (event) => {
    const transcript = event.results[0][0].transcript;
    await processSpeechText(transcript);
  };

  const handleSpeechError = (event) => {
    console.error('Speech recognition error:', event.error);
    setIsListening(false);
  };

  const startListening = () => {
    if (recognition) {
      const langCode = languages[selectedLanguage]?.code || 'hi-IN';
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

  const processSpeechText = async (text) => {
    try {
      const response = await fetch('/api/speech/process', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          text: text, 
          language: selectedLanguage 
        })
      });
      
      const result = await response.json();
      
      const userMessage = {
        id: Date.now(),
        type: 'user',
        original: result.user_speech,
        english: result.user_english,
        language: selectedLanguage
      };
      
      const botMessage = {
        id: Date.now() + 1,
        type: 'bot',
        text: result.response,
        translated: result.translated_response,
        language: selectedLanguage
      };
      
      setMessages(prev => [...prev, userMessage, botMessage]);
      
      // Speak the response
      speakText(result.translated_response);
      
    } catch (error) {
      console.error('Speech processing error:', error);
    }
  };

  const sendTextMessage = async () => {
    if (!textInput.trim()) return;
    
    try {
      const response = await fetch('/api/speech/translate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          text: textInput, 
          language: selectedLanguage 
        })
      });
      
      const result = await response.json();
      
      const userMessage = {
        id: Date.now(),
        type: 'user',
        original: result.original_question,
        english: result.english_question,
        language: selectedLanguage
      };
      
      const botMessage = {
        id: Date.now() + 1,
        type: 'bot',
        text: result.english_response,
        translated: result.translated_response,
        language: selectedLanguage
      };
      
      setMessages(prev => [...prev, userMessage, botMessage]);
      setTextInput('');
      
      // Speak the response
      speakText(result.translated_response);
      
    } catch (error) {
      console.error('Translation error:', error);
    }
  };

  const speakText = (text) => {
    if (speechSynthesis && text) {
      speechSynthesis.cancel(); // Stop any ongoing speech
      
      const utterance = new SpeechSynthesisUtterance(text);
      const langCode = languages[selectedLanguage]?.code || 'hi-IN';
      utterance.lang = langCode.split('-')[0]; // Use language code without region
      utterance.rate = 0.8;
      utterance.pitch = 1;
      
      utterance.onstart = () => setIsSpeaking(true);
      utterance.onend = () => setIsSpeaking(false);
      utterance.onerror = () => setIsSpeaking(false);
      
      speechSynthesis.speak(utterance);
    }
  };

  const stopSpeaking = () => {
    if (speechSynthesis) {
      speechSynthesis.cancel();
      setIsSpeaking(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-green-800 mb-4">
          🎤 KrishiSaathi Voice Assistant
        </h2>
        
        {/* Language Selector */}
        <div className="flex items-center gap-4 mb-4">
          <Languages className="text-green-600" size={20} />
          <select 
            value={selectedLanguage}
            onChange={(e) => setSelectedLanguage(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
          >
            {Object.entries(languages).map(([code, lang]) => (
              <option key={code} value={code}>{lang.name}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Messages */}
      <div className="h-96 overflow-y-auto mb-4 p-4 border border-gray-200 rounded-lg bg-gray-50">
        {messages.length === 0 && (
          <div className="text-center text-gray-500 mt-20">
            <p>Start a conversation by speaking or typing!</p>
            <p className="text-sm mt-2">Ask about farming, crops, soil, fertilizers, diseases...</p>
          </div>
        )}
        
        {messages.map((message) => (
          <div key={message.id} className={`mb-4 ${message.type === 'user' ? 'text-right' : 'text-left'}`}>
            <div className={`inline-block p-3 rounded-lg max-w-xs ${
              message.type === 'user' 
                ? 'bg-green-500 text-white' 
                : 'bg-white border border-gray-200'
            }`}>
              {message.type === 'user' ? (
                <div>
                  <div className="font-medium">{message.original}</div>
                  {message.english !== message.original && (
                    <div className="text-sm opacity-75 mt-1">({message.english})</div>
                  )}
                </div>
              ) : (
                <div>
                  <div>{message.translated || message.text}</div>
                  {message.translated && message.translated !== message.text && (
                    <div className="text-sm text-gray-500 mt-1">English: {message.text}</div>
                  )}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Controls */}
      <div className="flex gap-4 items-center">
        {/* Voice Input */}
        <button
          onClick={isListening ? stopListening : startListening}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium ${
            isListening 
              ? 'bg-red-500 text-white animate-pulse' 
              : 'bg-green-500 text-white hover:bg-green-600'
          }`}
        >
          {isListening ? <MicOff size={20} /> : <Mic size={20} />}
          {isListening ? 'Stop' : 'Speak'}
        </button>

        {/* Text Input */}
        <input
          type="text"
          value={textInput}
          onChange={(e) => setTextInput(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && sendTextMessage()}
          placeholder={`Type in ${languages[selectedLanguage]?.name}...`}
          className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
        />
        
        <button
          onClick={sendTextMessage}
          className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
        >
          <Send size={16} />
          Send
        </button>

        {/* Speaking Control */}
        <button
          onClick={isSpeaking ? stopSpeaking : null}
          className={`flex items-center gap-2 px-3 py-2 rounded-lg ${
            isSpeaking 
              ? 'bg-orange-500 text-white animate-pulse' 
              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
          }`}
          disabled={!isSpeaking}
        >
          {isSpeaking ? <VolumeX size={20} /> : <Volume2 size={20} />}
          {isSpeaking ? 'Stop' : 'Audio'}
        </button>
      </div>

      {/* Instructions */}
      <div className="mt-4 p-3 bg-blue-50 rounded-lg text-sm text-blue-800">
        <strong>How to use:</strong>
        <ul className="mt-2 space-y-1">
          <li>• Click "Speak" and ask farming questions in your language</li>
          <li>• Type questions in any Indian language</li>
          <li>• Responses will be spoken and displayed in your language</li>
          <li>• Ask about crops, soil, fertilizers, diseases, weather, etc.</li>
        </ul>
      </div>
    </div>
  );
};

export default WebSpeechChat;