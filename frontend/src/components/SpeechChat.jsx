import React, { useState, useRef, useEffect } from 'react';
import { Mic, MicOff, Volume2, VolumeX, Languages } from 'lucide-react';

const SpeechChat = () => {
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState('hindi');
  const [messages, setMessages] = useState([]);
  const [textInput, setTextInput] = useState('');
  const [availableLanguages, setAvailableLanguages] = useState([]);

  const languages = {
    'hindi': 'हिंदी',
    'bengali': 'বাংলা', 
    'telugu': 'తెలుగు',
    'marathi': 'मराठी',
    'tamil': 'தமிழ்',
    'gujarati': 'ગુજરાતી',
    'kannada': 'ಕನ್ನಡ',
    'malayalam': 'മലയാളം',
    'punjabi': 'ਪੰਜਾਬੀ',
    'odia': 'ଓଡ଼ିଆ',
    'english': 'English'
  };

  useEffect(() => {
    fetchLanguages();
  }, []);

  const fetchLanguages = async () => {
    try {
      const response = await fetch('/api/speech/languages');
      const data = await response.json();
      setAvailableLanguages(data.languages);
    } catch (error) {
      console.error('Error fetching languages:', error);
    }
  };

  const startListening = async () => {
    setIsListening(true);
    try {
      const response = await fetch('/api/speech/listen', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ language: selectedLanguage })
      });
      
      const result = await response.json();
      
      if (result.user_speech) {
        const newMessage = {
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
          spoken: result.spoken_response,
          language: selectedLanguage
        };
        
        setMessages(prev => [...prev, newMessage, botMessage]);
        
        // Auto-speak response
        if (result.spoken_response) {
          setIsSpeaking(true);
          setTimeout(() => setIsSpeaking(false), 3000);
        }
      }
    } catch (error) {
      console.error('Speech error:', error);
    } finally {
      setIsListening(false);
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
    } catch (error) {
      console.error('Translation error:', error);
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
            {Object.entries(languages).map(([code, name]) => (
              <option key={code} value={code}>{name}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Messages */}
      <div className="h-96 overflow-y-auto mb-4 p-4 border border-gray-200 rounded-lg bg-gray-50">
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
          onClick={startListening}
          disabled={isListening}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium ${
            isListening 
              ? 'bg-red-500 text-white animate-pulse' 
              : 'bg-green-500 text-white hover:bg-green-600'
          }`}
        >
          {isListening ? <MicOff size={20} /> : <Mic size={20} />}
          {isListening ? 'Listening...' : 'Speak'}
        </button>

        {/* Text Input */}
        <input
          type="text"
          value={textInput}
          onChange={(e) => setTextInput(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && sendTextMessage()}
          placeholder={`Type in ${languages[selectedLanguage]}...`}
          className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
        />
        
        <button
          onClick={sendTextMessage}
          className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
        >
          Send
        </button>

        {/* Speaking Indicator */}
        {isSpeaking && (
          <div className="flex items-center gap-2 text-green-600">
            <Volume2 size={20} className="animate-pulse" />
            <span>Speaking...</span>
          </div>
        )}
      </div>

      {/* Instructions */}
      <div className="mt-4 p-3 bg-blue-50 rounded-lg text-sm text-blue-800">
        <strong>Instructions:</strong>
        <ul className="mt-2 space-y-1">
          <li>• Click "Speak" and ask farming questions in your language</li>
          <li>• Type questions in any Indian language</li>
          <li>• Responses will be in your selected language</li>
          <li>• Ask about crops, soil, fertilizers, diseases, etc.</li>
        </ul>
      </div>
    </div>
  );
};

export default SpeechChat;