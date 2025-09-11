import React, { useState, useEffect } from 'react';
import { Upload, Leaf, Droplets, Bug, ChevronRight, TrendingUp, Shield, LogOut, Menu, X } from 'lucide-react';
import Login from './components/Login';
import TranslatedText from './components/TranslatedText';
import ComingSoon from './components/ComingSoon';



const App = () => {
  const [user, setUser] = useState(null);
  const [languages, setLanguages] = useState({});
  const [translations, setTranslations] = useState({});
  const [activeTab, setActiveTab] = useState('crop');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [showComingSoon, setShowComingSoon] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);

  // Form states
  const [cropForm, setCropForm] = useState({
    N: '', P: '', K: '', temperature: '', humidity: '', ph: '', rainfall: ''
  });
  
  const [fertForm, setFertForm] = useState({
    temperature: '', humidity: '', moisture: '', soil_type: '', crop_type: '', N: '', P: '', K: ''
  });
  
  const [diseaseImage, setDiseaseImage] = useState(null);

  const API_BASE = 'http://127.0.0.1:8000';

  useEffect(() => {
    fetchLanguages();
    fetchTranslations('en');
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
  }, []);

  useEffect(() => {
    if (user?.language) {
      fetchTranslations(user.language);
    }
  }, [user]);



  const fetchLanguages = async () => {
    try {
      const response = await fetch(`${API_BASE}/languages`);
      const data = await response.json();
      setLanguages(data);
    } catch (error) {
      console.error('Failed to fetch languages:', error);
    }
  };

  const fetchTranslations = async (language) => {
    try {
      const response = await fetch(`${API_BASE}/translations/${language}`);
      const data = await response.json();
      setTranslations(data);
    } catch (error) {
      console.error('Failed to fetch translations:', error);
    }
  };

  const handleLogin = (userData) => {
    setUser(userData);
    localStorage.setItem('user', JSON.stringify(userData));
  };

  const handleLogout = () => {
    setUser(null);
    setResult(null);
    localStorage.removeItem('user');
  };

  const changeLanguage = async (newLanguage) => {
    try {
      const response = await fetch(`${API_BASE}/auth/language`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: user.username, language: newLanguage })
      });
      if (response.ok) {
        const updatedUser = {...user, language: newLanguage};
        setUser(updatedUser);
        localStorage.setItem('user', JSON.stringify(updatedUser));
        fetchTranslations(newLanguage);
      }
    } catch (error) {
      console.error('Failed to update language:', error);
    }
  };

  if (!user) {
    return <Login onLogin={handleLogin} languages={languages} translations={translations} />;
  }

  if (showComingSoon) {
    return <ComingSoon onBack={() => setShowComingSoon(false)} user={user} />;
  }

  const handleCropSubmit = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE}/predict/crop`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          N: parseFloat(cropForm.N),
          P: parseFloat(cropForm.P),
          K: parseFloat(cropForm.K),
          temperature: parseFloat(cropForm.temperature),
          humidity: parseFloat(cropForm.humidity),
          ph: parseFloat(cropForm.ph),
          rainfall: parseFloat(cropForm.rainfall)
        })
      });
      const data = await response.json();
      if (data.success) {
        setResult(data.data);
      } else {
        setResult({ error: data.error });
      }
      console.log('API Response for Crop:', data);
    } catch (error) {
      setResult({ error: 'Failed to get prediction' });
      console.error('API Error:', error);
    }
    setLoading(false);
  };

  const handleFertSubmit = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE}/predict/fertilizer`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          temperature: parseFloat(fertForm.temperature),
          humidity: parseFloat(fertForm.humidity),
          moisture: parseFloat(fertForm.moisture),
          soil_type: fertForm.soil_type,
          crop_type: fertForm.crop_type,
          N: parseFloat(fertForm.N),
          P: parseFloat(fertForm.P),
          K: parseFloat(fertForm.K)
        })
      });
      const data = await response.json();
      if (data.success) {
        setResult(data.data);
      } else {
        setResult({ error: data.error });
      }
      console.log('API Response for Fertilizer:', data);
    } catch (error) {
      setResult({ error: 'Failed to get prediction' });
      console.error('API Error:', error);
    }
    setLoading(false);
  };

  const handleDiseaseSubmit = async () => {
    if (!diseaseImage) return;
    
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('file', diseaseImage);
      
      const response = await fetch(`${API_BASE}/predict/disease`, {
        method: 'POST',
        body: formData
      });
      const data = await response.json();
      if (data.success) {
        setResult(data.data);
      } else {
        setResult({ error: data.error });
      }
      console.log('API Response for Disease:', data);
    } catch (error) {
      setResult({ error: 'Failed to get prediction' });
      console.error('API Error:', error);
    }
    setLoading(false);
  };

  const inputClass = "w-full px-4 py-3 border border-green-200 rounded-lg focus:ring-2 focus:ring-green-400 focus:border-transparent outline-none transition-all";
  const buttonClass = "w-full bg-gradient-to-r from-green-500 to-green-600 text-white py-3 px-6 rounded-lg hover:from-green-600 hover:to-green-700 transition-all duration-200 flex items-center justify-center gap-2 font-medium cursor-pointer";

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 font-[Open Sans] antialiased">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-green-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-green-600 rounded-xl flex items-center justify-center">
                  <Leaf className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">
                    <TranslatedText text="KrishiSaathi" language={user?.language} />
                  </h1>
                  <p className="text-sm text-gray-600">
                    <TranslatedText text="Intelligent Farming Solutions" language={user?.language} />
                  </p>
                </div>
              </div>
              <p className="text-sm text-gray-600 ml-13">
                Welcome, {user.username}
              </p>
            </div>
            <div className="flex items-center gap-4">
              {/* Desktop - Language selector and logout */}
              <div className="hidden sm:flex sm:items-center sm:gap-4">
                <select
                  value={user.language}
                  onChange={(e) => changeLanguage(e.target.value)}
                  className="px-3 py-1 border border-gray-200 rounded-lg text-sm"
                >
                  {Object.entries(languages).map(([code, name]) => (
                    <option key={code} value={code}>{name}</option>
                  ))}
                </select>
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-1 text-gray-600 hover:text-gray-800"
                >
                  <LogOut className="w-4 h-4" />
                  Logout
                </button>
              </div>
              
              {/* Mobile - Menu button */}
              <div className="sm:hidden relative">
                <button
                  onClick={() => setShowMobileMenu(!showMobileMenu)}
                  className="p-2 text-gray-600 hover:text-gray-800"
                >
                  {showMobileMenu ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                </button>
                
                {/* Mobile dropdown */}
                {showMobileMenu && (
                  <div className="absolute right-0 top-full mt-2 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
                    <div className="p-3 border-b border-gray-100">
                      <select
                        value={user.language}
                        onChange={(e) => changeLanguage(e.target.value)}
                        className="w-full px-2 py-1 border border-gray-200 rounded text-sm"
                      >
                        {Object.entries(languages).map(([code, name]) => (
                          <option key={code} value={code}>{name}</option>
                        ))}
                      </select>
                    </div>
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-2 px-3 py-2 text-left text-gray-600 hover:bg-gray-50"
                    >
                      <LogOut className="w-4 h-4" />
                      Logout
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative py-16 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-green-400/10 to-blue-400/10"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            <TranslatedText text="AI-Powered Agricultural Intelligence" language={user?.language} />
          </h2>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            <TranslatedText text="Get personalized crop recommendations, fertilizer guidance, and disease detection using advanced machine learning algorithms trained on agricultural data." language={user?.language} />
          </p>
          <div className="flex flex-wrap justify-center gap-8 mb-8">
            <div className="flex items-center gap-2 text-green-700">
              <TrendingUp className="w-5 h-5" />
              <span className="font-medium">
                <TranslatedText text="95% Accuracy" language={user?.language} />
              </span>
            </div>
            <div className="flex items-center gap-2 text-green-700">
              <Shield className="w-5 h-5" />
              <span className="font-medium">
                <TranslatedText text="Scientifically Validated" language={user?.language} />
              </span>
            </div>
            <div className="flex items-center gap-2 text-green-700">
              <Leaf className="w-5 h-5" />
              <span className="font-medium">
                <TranslatedText text="Sustainable Practices" language={user?.language} />
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        {/* Navigation Tabs */}
        <div className="flex flex-wrap justify-center gap-4 mb-8">
          <button
            onClick={() => { setActiveTab('crop'); setResult(null); }}
            className={`px-6 py-3 rounded-xl font-medium transition-all duration-200 flex items-center gap-2 ${
              activeTab === 'crop' 
                ? 'bg-green-500 text-white shadow-lg' 
                : 'bg-white text-gray-700 hover:bg-green-50 border border-green-200'
            }`}
          >
            <Leaf className="w-5 h-5" />
            <TranslatedText text="Crop Recommendation" language={user?.language} />
          </button>
          <button
            onClick={() => { setActiveTab('fertilizer'); setResult(null); }}
            className={`px-6 py-3 rounded-xl font-medium transition-all duration-200 flex items-center gap-2 ${
              activeTab === 'fertilizer' 
                ? 'bg-blue-500 text-white shadow-lg' 
                : 'bg-white text-gray-700 hover:bg-blue-50 border border-blue-200'
            }`}
          >
            <Droplets className="w-5 h-5" />
            <TranslatedText text="Fertilizer Recommendation" language={user?.language} />
          </button>
          <button
            onClick={() => { setActiveTab('disease'); setResult(null); }}
            className={`px-6 py-3 rounded-xl font-medium transition-all duration-200 flex items-center gap-2 ${
              activeTab === 'disease' 
                ? 'bg-orange-500 text-white shadow-lg' 
                : 'bg-white text-gray-700 hover:bg-orange-50 border border-orange-200'
            }`}
          >
            <Bug className="w-5 h-5" />
            <TranslatedText text="Disease Detection" language={user?.language} />
          </button>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Form Section */}
          <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
            {activeTab === 'crop' && (
              <div>
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                    <Leaf className="w-6 h-6 text-green-600" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-gray-900">
                      <TranslatedText text="Crop Recommendation" language={user?.language} />
                    </h3>
                    <p className="text-gray-600">
                      <TranslatedText text="Find the best crop for your soil conditions" language={user?.language} />
                    </p>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div className="grid md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        <TranslatedText text="Nitrogen (N)" language={user?.language} />
                      </label>
                      <input
                        type="number"
                        className={inputClass}
                        value={cropForm.N}
                        onChange={(e) => setCropForm({...cropForm, N: e.target.value})}
                        placeholder="0-140"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        <TranslatedText text="Phosphorus (P)" language={user?.language} />
                      </label>
                      <input
                        type="number"
                        className={inputClass}
                        value={cropForm.P}
                        onChange={(e) => setCropForm({...cropForm, P: e.target.value})}
                        placeholder="0-140"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        <TranslatedText text="Potassium (K)" language={user?.language} />
                      </label>
                      <input
                        type="number"
                        className={inputClass}
                        value={cropForm.K}
                        onChange={(e) => setCropForm({...cropForm, K: e.target.value})}
                        placeholder="0-200"
                      />
                    </div>
                  </div>
                  
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Temperature (°C)</label>
                      <input
                        type="number"
                        step="0.1"
                        className={inputClass}
                        value={cropForm.temperature}
                        onChange={(e) => setCropForm({...cropForm, temperature: e.target.value})}
                        placeholder="20-35"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Humidity (%)</label>
                      <input
                        type="number"
                        step="0.1"
                        className={inputClass}
                        value={cropForm.humidity}
                        onChange={(e) => setCropForm({...cropForm, humidity: e.target.value})}
                        placeholder="20-95"
                      />
                    </div>
                  </div>
                  
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">pH Level</label>
                      <input
                        type="number"
                        step="0.1"
                        className={inputClass}
                        value={cropForm.ph}
                        onChange={(e) => setCropForm({...cropForm, ph: e.target.value})}
                        placeholder="4.0-8.5"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Rainfall (mm)</label>
                      <input
                        type="number"
                        step="0.1"
                        className={inputClass}
                        value={cropForm.rainfall}
                        onChange={(e) => setCropForm({...cropForm, rainfall: e.target.value})}
                        placeholder="10-300"
                      />
                    </div>
                  </div>
                  
                  <button onClick={handleCropSubmit} disabled={loading} className={buttonClass}>
                    <TranslatedText text={loading ? 'Analyzing...' : 'Get Recommendation'} language={user?.language} />
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </div>
              </div>
            )}

            {activeTab === 'fertilizer' && (
              <div>
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                    <Droplets className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-gray-900">Fertilizer Recommendation</h3>
                    <p className="text-gray-600">Get optimal fertilizer suggestions</p>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div className="grid md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Temperature (°C)</label>
                      <input
                        type="number"
                        step="0.1"
                        className={inputClass}
                        value={fertForm.temperature}
                        onChange={(e) => setFertForm({...fertForm, temperature: e.target.value})}
                        placeholder="20-35"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Humidity (%)</label>
                      <input
                        type="number"
                        step="0.1"
                        className={inputClass}
                        value={fertForm.humidity}
                        onChange={(e) => setFertForm({...fertForm, humidity: e.target.value})}
                        placeholder="20-95"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Moisture (%)</label>
                      <input
                        type="number"
                        step="0.1"
                        className={inputClass}
                        value={fertForm.moisture}
                        onChange={(e) => setFertForm({...fertForm, moisture: e.target.value})}
                        placeholder="10-50"
                      />
                    </div>
                  </div>
                  
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Soil Type</label>
                      <select
                        className={inputClass}
                        value={fertForm.soil_type}
                        onChange={(e) => setFertForm({...fertForm, soil_type: e.target.value})}
                      >
                        <option value="">Select soil type</option>
                        <option value="Sandy">Sandy</option>
                        <option value="Loamy">Loamy</option>
                        <option value="Clayey">Clayey</option>
                        <option value="Black">Black</option>
                        <option value="Red">Red</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Crop Type</label>
                      <select
                        className={inputClass}
                        value={fertForm.crop_type}
                        onChange={(e) => setFertForm({...fertForm, crop_type: e.target.value})}
                      >
                        <option value="">Select crop</option>
                        <option value="Rice">Rice</option>
                        <option value="Wheat">Wheat</option>
                        <option value="Maize">Maize</option>
                        <option value="Sugarcane">Sugarcane</option>
                        <option value="Cotton">Cotton</option>
                      </select>
                    </div>
                  </div>
                  
                  <div className="grid md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Current N</label>
                      <input
                        type="number"
                        className={inputClass}
                        value={fertForm.N}
                        onChange={(e) => setFertForm({...fertForm, N: e.target.value})}
                        placeholder="0-140"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Current P</label>
                      <input
                        type="number"
                        className={inputClass}
                        value={fertForm.P}
                        onChange={(e) => setFertForm({...fertForm, P: e.target.value})}
                        placeholder="0-140"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Current K</label>
                      <input
                        type="number"
                        className={inputClass}
                        value={fertForm.K}
                        onChange={(e) => setFertForm({...fertForm, K: e.target.value})}
                        placeholder="0-200"
                      />
                    </div>
                  </div>
                  
                  <button onClick={handleFertSubmit} disabled={loading} className="w-full bg-gradient-to-r from-blue-500 to-blue-600 text-white py-3 px-6 rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all duration-200 flex items-center justify-center gap-2 font-medium cursor-pointer">
                    {loading ? 'Analyzing...' : 'Get Fertilizer Recommendation'}
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </div>
              </div>
            )}

            {activeTab === 'disease' && (
              <div>
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center">
                    <Bug className="w-6 h-6 text-orange-600" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-gray-900">Plant Disease Detection</h3>
                    <p className="text-gray-600">Upload a plant image for disease analysis</p>
                  </div>
                </div>
                
                <div className="space-y-6">
                  <div className="border-2 border-dashed border-orange-200 rounded-xl p-8 text-center hover:border-orange-300 transition-colors">
                    <Upload className="w-12 h-12 text-orange-400 mx-auto mb-4" />
                    <h4 className="text-lg font-medium text-gray-900 mb-2">Upload Plant Image</h4>
                    <p className="text-gray-600 mb-4">Choose a clear image of the plant leaf or affected area</p>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => setDiseaseImage(e.target.files[0])}
                      className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-medium file:bg-orange-50 file:text-orange-700 hover:file:bg-orange-100"
                    />
                    {diseaseImage && (
                      <p className="mt-2 text-sm text-orange-600">Selected: {diseaseImage.name}</p>
                    )}
                  </div>
                  
                  <button onClick={handleDiseaseSubmit} disabled={loading || !diseaseImage} className="w-full bg-gradient-to-r from-orange-500 to-orange-600 text-white py-3 px-6 rounded-lg hover:from-orange-600 hover:to-orange-700 transition-all duration-200 flex items-center justify-center gap-2 font-medium cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed">
                    {loading ? 'Analyzing Image...' : 'Detect Disease'}
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Results Section */}
          <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
            <h3 className="text-2xl font-bold text-gray-900 mb-6">
              <TranslatedText text="Results & Insights" language={user?.language} />
            </h3>
            
            {!result && (
              <div className="text-center py-12">
                <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  {activeTab === 'crop' && <Leaf className="w-10 h-10 text-gray-400" />}
                  {activeTab === 'fertilizer' && <Droplets className="w-10 h-10 text-gray-400" />}
                  {activeTab === 'disease' && <Bug className="w-10 h-10 text-gray-400" />}
                </div>
                <p className="text-gray-500">
                  <TranslatedText text="Submit your data to get AI-powered recommendations" language={user?.language} />
                </p>
              </div>
            )}

            {result && (
              <div className="space-y-6">
                {result.error ? (
                  <div className="bg-red-50 border border-red-200 rounded-xl p-6">
                    <h4 className="text-lg font-semibold text-red-800 mb-2">
                      <TranslatedText text="Error" language={user?.language} />
                    </h4>
                    <p className="text-red-600">{result.error}</p>
                  </div>
                ) : (
                  <div>
                    {result.crop && (
                      <div className="bg-green-50 border border-green-200 rounded-xl p-6">
                        <h4 className="text-lg font-semibold text-green-800 mb-3">
                          <TranslatedText text="Recommended Crop" language={user?.language} />
                        </h4>
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 bg-green-500 rounded-xl flex items-center justify-center">
                            <Leaf className="w-6 h-6 text-white" />
                          </div>
                          <div>
                            <p className="text-xl font-bold text-green-800 capitalize">{result.crop}</p>
                            {result.confidence && (
                              <p className="text-green-600">
                              <TranslatedText text={`Confidence: ${(result.confidence * 100).toFixed(1)}%`} language={user?.language} />
                            </p>
                            )}
                          </div>
                        </div>
                      </div>
                    )}

                    {result.fertilizer && (
                      <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
                        <h4 className="text-lg font-semibold text-blue-800 mb-3">Recommended Fertilizer</h4>
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 bg-blue-500 rounded-xl flex items-center justify-center">
                            <Droplets className="w-6 h-6 text-white" />
                          </div>
                          <div>
                            <p className="text-xl font-bold text-blue-800">{result.fertilizer}</p>
                          </div>
                        </div>
                      </div>
                    )}

                    {result.disease && (
                      <div className="bg-orange-50 border border-orange-200 rounded-xl p-6">
                        <h4 className="text-lg font-semibold text-orange-800 mb-3">Disease Detection Result</h4>
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 bg-orange-500 rounded-xl flex items-center justify-center">
                            <Bug className="w-6 h-6 text-white" />
                          </div>
                          <div>
                            <p className="text-xl font-bold text-orange-800">{result.disease}</p>
                            {result.confidence && (
                              <p className="text-orange-600">Confidence: {(result.confidence * 100).toFixed(1)}%</p>
                            )}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Chatbot Section */}
        <section className="mt-16 bg-gradient-to-r from-green-50 to-blue-50 rounded-2xl shadow-xl p-8 border border-green-100">
          <div className="text-center">
            <div className="w-20 h-20 bg-gradient-to-r from-green-500 to-blue-500 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
            </div>
            <h3 className="text-3xl font-bold text-gray-900 mb-4">
              <TranslatedText text="Want to speak to our KrishiSaathi?" language={user?.language} />
            </h3>
            <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
              <TranslatedText text="Get instant answers to your farming questions with our AI-powered chatbot assistant." language={user?.language} />
            </p>
            <button 
              onClick={() => setShowComingSoon(true)}
              className="bg-gradient-to-r from-green-500 to-blue-500 text-white px-8 py-4 rounded-xl font-semibold text-lg hover:from-green-600 hover:to-blue-600 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
            >
              <TranslatedText text="Chat with KrishiSaathi" language={user?.language} />
            </button>
            <p className="text-sm text-gray-500 mt-4">
              <TranslatedText text="Coming Soon - AI-powered farming assistant" language={user?.language} />
            </p>
          </div>
        </section>

        {/* Features Section */}
        <section className="mt-16 bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
          <div className="text-center mb-12">
            <h3 className="text-3xl font-bold text-gray-900 mb-4">
              <TranslatedText text="Why Choose KrishiSaathi?" language={user?.language} />
            </h3>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Our AI models are trained on extensive agricultural datasets to provide accurate, 
              actionable insights for modern farming.
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center p-6 rounded-xl bg-green-50 border border-green-100">
              <div className="w-16 h-16 bg-green-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Leaf className="w-8 h-8 text-white" />
              </div>
              <h4 className="text-xl font-bold text-gray-900 mb-3">
                <TranslatedText text="Smart Crop Selection" language={user?.language} />
              </h4>
              <p className="text-gray-600">
                <TranslatedText text="Advanced algorithms analyze soil nutrients, climate, and environmental factors to recommend the most suitable crops for maximum yield." language={user?.language} />
              </p>
            </div>
            
            <div className="text-center p-6 rounded-xl bg-blue-50 border border-blue-100">
              <div className="w-16 h-16 bg-blue-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Droplets className="w-8 h-8 text-white" />
              </div>
              <h4 className="text-xl font-bold text-gray-900 mb-3">Precision Fertilization</h4>
              <p className="text-gray-600">
                Get personalized fertilizer recommendations based on soil composition, 
                crop requirements, and current nutrient levels for optimal growth.
              </p>
            </div>
            
            <div className="text-center p-6 rounded-xl bg-orange-50 border border-orange-100">
              <div className="w-16 h-16 bg-orange-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Bug className="w-8 h-8 text-white" />
              </div>
              <h4 className="text-xl font-bold text-gray-900 mb-3">Early Disease Detection</h4>
              <p className="text-gray-600">
                Upload plant images for instant disease identification using deep learning 
                models trained on thousands of plant pathology images.
              </p>
            </div>
          </div>
        </section>
      </div>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-gray-600">
            <TranslatedText text="© 2025 KrishiSaathi. Empowering farmers with intelligent technology for sustainable agriculture." language={user?.language} />
          </p>
        </div>
      </footer>
    </div>
  );
};

export default App;
