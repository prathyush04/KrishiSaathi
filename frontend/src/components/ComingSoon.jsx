import React from 'react';
import { ArrowLeft, MessageCircle } from 'lucide-react';
import TranslatedText from './TranslatedText';

const ComingSoon = ({ onBack, user }) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center">
      <div className="max-w-2xl mx-auto px-4 text-center">
        <div className="bg-white rounded-3xl shadow-2xl p-12 border border-gray-100">
          <div className="w-24 h-24 bg-gradient-to-r from-green-500 to-blue-500 rounded-full flex items-center justify-center mx-auto mb-8">
            <MessageCircle className="w-12 h-12 text-white" />
          </div>
          
          <h1 className="text-4xl font-bold text-gray-900 mb-6">
            <TranslatedText text="Coming Soon!" language={user?.language} />
          </h1>
          
          <h2 className="text-2xl font-semibold text-green-600 mb-4">
            <TranslatedText text="KrishiSaathi AI Chatbot" language={user?.language} />
          </h2>
          
          <p className="text-xl text-gray-600 mb-8 leading-relaxed">
            <TranslatedText text="We're working hard to bring you an intelligent farming assistant that will answer all your agricultural questions in real-time." language={user?.language} />
          </p>
          
          <div className="bg-green-50 rounded-xl p-6 mb-8">
            <h3 className="text-lg font-semibold text-green-800 mb-3">
              <TranslatedText text="What to expect:" language={user?.language} />
            </h3>
            <ul className="text-green-700 space-y-2">
              <li>• <TranslatedText text="24/7 farming guidance" language={user?.language} /></li>
              <li>• <TranslatedText text="Instant crop and soil advice" language={user?.language} /></li>
              <li>• <TranslatedText text="Weather-based recommendations" language={user?.language} /></li>
              <li>• <TranslatedText text="Voice assistance support" language={user?.language} /></li>
              <li>• <TranslatedText text="Multi-language support" language={user?.language} /></li>
            </ul>
          </div>
          
          <button
            onClick={onBack}
            className="bg-gradient-to-r from-green-500 to-blue-500 text-white px-8 py-4 rounded-xl font-semibold text-lg hover:from-green-600 hover:to-blue-600 transition-all duration-200 shadow-lg hover:shadow-xl flex items-center gap-2 mx-auto"
          >
            <ArrowLeft className="w-5 h-5" />
            <TranslatedText text="Back to Dashboard" language={user?.language} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ComingSoon;