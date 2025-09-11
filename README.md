# 🌱 KrishiSaathi - AI-Powered Smart Farmer Companion

An intelligent agricultural platform that provides AI-driven crop recommendations, fertilizer suggestions, and plant disease detection to empower farmers with data-driven decisions.

## ✨ Features

- **🌾 Smart Crop Recommendation** - Get optimal crop suggestions based on soil nutrients and climate conditions
- **💧 Fertilizer Recommendation** - Receive precise fertilizer suggestions for maximum yield
- **🔍 Disease Detection** - Upload plant images for instant disease identification
- **🌍 Multi-language Support** - Available in multiple Indian languages
- **👤 User Authentication** - Secure login and personalized experience
- **📱 Responsive Design** - Works seamlessly on desktop and mobile devices

## 🚀 Tech Stack

### Backend
- **FastAPI** - Modern Python web framework
- **TensorFlow/Keras** - Deep learning for disease detection
- **Scikit-learn** - Machine learning for crop and fertilizer recommendations
- **PostgreSQL** - User data and authentication
- **Python 3.8+** - Core backend language

### Frontend
- **React.js** - Modern JavaScript framework
- **Tailwind CSS** - Utility-first CSS framework
- **Lucide React** - Beautiful icons
- **Responsive Design** - Mobile-first approach

### AI Models
- **Crop Model** - RandomForest classifier (99% accuracy)
- **Fertilizer Model** - RandomForest with feature engineering
- **Disease Model** - MobileNetV2 CNN for image classification

## 📦 Installation

### Prerequisites
- Node.js 16+ and npm
- Python 3.8+
- PostgreSQL database

### Backend Setup

1. **Clone the repository**
```bash
git clone https://github.com/prathyush04/KrishiSaathi.git
cd KrishiSaathi
```

2. **Install Python dependencies**
```bash
pip install -r requirements.txt
```

3. **Configure environment variables**
```bash
# Update .env file with your database credentials
DB_NAME=KrishiSaathi
DB_USER=your_username
DB_PASSWORD=your_password
DB_HOST=localhost
DB_PORT=5432
```

4. **Start the API server**
```bash
uvicorn src.api.main:app --reload
```

The API will be available at `http://127.0.0.1:8000`

### Frontend Setup

1. **Navigate to frontend directory**
```bash
cd frontend
```

2. **Install dependencies**
```bash
npm install
```

3. **Start development server**
```bash
npm run dev
```

The application will be available at `http://localhost:3000`

## 🎯 Usage

1. **Register/Login** - Create an account or login with existing credentials
2. **Select Language** - Choose your preferred language from the dropdown
3. **Choose Service**:
   - **Crop Recommendation**: Enter soil nutrients (N, P, K), temperature, humidity, pH, and rainfall
   - **Fertilizer Suggestion**: Provide soil type, crop type, and current nutrient levels
   - **Disease Detection**: Upload a clear image of the plant leaf or affected area
4. **Get Results** - Receive AI-powered recommendations with confidence scores

## 🤖 AI Models

### Crop Recommendation Model
- **Algorithm**: RandomForest Classifier
- **Features**: N, P, K, temperature, humidity, pH, rainfall
- **Classes**: 22 different crops
- **Accuracy**: 99.32%

### Fertilizer Recommendation Model
- **Algorithm**: RandomForest Classifier
- **Features**: Temperature, humidity, moisture, soil type, crop type, N, P, K
- **Classes**: 7 fertilizer types (Urea, DAP, 10-26-26, etc.)
- **Accuracy**: 100%

### Disease Detection Model
- **Algorithm**: MobileNetV2 CNN
- **Input**: 224x224 RGB plant images
- **Classes**: Healthy, Powdery Mildew, Rust Disease
- **Framework**: TensorFlow/Keras

## 📁 Project Structure

```
KrishiSaathi/
├── src/
│   ├── api/main.py              # FastAPI application
│   ├── inference/predict.py     # ML model predictions
│   ├── training/               # Model training scripts
│   └── pipelines/              # ML pipelines
├── frontend/
│   ├── src/
│   │   ├── components/         # React components
│   │   ├── App.jsx            # Main application
│   │   └── index.js           # Entry point
│   └── public/                # Static assets
├── new model/                 # Optimized AI models
├── .env                      # Environment variables
├── config.yaml              # Model configuration
├── database.py              # Database operations
├── requirements.txt         # Python dependencies
└── README.md               # Project documentation
```

## 🌐 API Endpoints

- `POST /predict/crop` - Crop recommendation
- `POST /predict/fertilizer` - Fertilizer suggestion
- `POST /predict/disease` - Disease detection (image upload)
- `POST /auth/register` - User registration
- `POST /auth/login` - User login
- `GET /languages` - Available languages
- `GET /translations/{language}` - Language translations

## 🔮 Coming Soon

- **🤖 AI Chatbot** - Interactive farming assistant
- **🎤 Voice Support** - Voice-based queries and responses
- **📊 Analytics Dashboard** - Farming insights and trends
- **🌤️ Weather Integration** - Real-time weather-based recommendations

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👨‍💻 Author

**Prathyush** - [GitHub](https://github.com/prathyush04)

## 🙏 Acknowledgments

- Agricultural datasets from various research institutions
- TensorFlow and Scikit-learn communities
- React and FastAPI documentation
- Open source contributors

---

**🌱 Empowering farmers with intelligent technology for sustainable agriculture**