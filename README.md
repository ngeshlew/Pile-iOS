# Pile iOS

A native iOS journaling app built with SwiftUI, featuring AI-powered insights and local-first data storage. This is the iOS conversion of the original macOS Pile app.

## 🚀 Features

### Core Functionality
- **Local-First Storage**: All data stored locally using Core Data
- **Multiple Journals**: Create and manage multiple "piles" (journals)
- **Rich Text Entries**: Create, edit, and organize journal entries
- **Tags & Organization**: Tag entries for better organization
- **File Attachments**: Attach photos and documents to entries
- **Search**: Multiple search types including text, semantic, tag, and date-based

### AI Integration
- **OpenAI Support**: Integration with GPT-4, GPT-4o, and other OpenAI models
- **Ollama Support**: Local AI using Ollama for privacy-focused users
- **AI Chat**: Interactive chat with your journal entries
- **AI Responses**: Generate AI responses to your entries
- **Semantic Search**: AI-powered search to find related content

### User Experience
- **Modern SwiftUI Interface**: Native iOS design with smooth animations
- **Multiple Themes**: Choose from different color themes for your journals
- **Intuitive Navigation**: Easy-to-use navigation with tab-based interface
- **Privacy-Focused**: All data stays on your device by default

## 📱 Screenshots

*Screenshots will be added once the app is built and running*

## 🛠 Technical Architecture

### Core Technologies
- **SwiftUI**: Modern declarative UI framework
- **Core Data**: Local data persistence and management
- **Combine**: Reactive programming for state management
- **Keychain Services**: Secure storage of API keys
- **PhotosPicker**: Native photo selection and attachment

### Project Structure
```
PileiOS/
├── Models/                 # Data managers and business logic
│   ├── PileManager.swift   # CRUD operations for piles and entries
│   ├── AIManager.swift     # AI integration (OpenAI + Ollama)
│   ├── SearchManager.swift # Search functionality
│   └── KeychainManager.swift # Secure key storage
├── Views/                  # SwiftUI views
│   ├── HomeView.swift      # Main dashboard
│   ├── PileView.swift      # Individual journal view
│   ├── EntriesView.swift   # List of journal entries
│   ├── NewEntryView.swift  # Create/edit entries
│   ├── SearchView.swift    # Search interface
│   ├── ChatView.swift      # AI chat interface
│   ├── SettingsView.swift  # App settings
│   └── EntryDetailView.swift # Entry detail view
├── PileiOS.xcdatamodeld/   # Core Data model
└── Assets.xcassets/        # App assets and icons
```

### Data Model
- **Pile**: Journal container with theme and AI settings
- **Entry**: Individual journal entries with content and metadata
- **Tag**: Organizational tags for entries
- **Attachment**: File attachments (photos, documents)
- **Highlight**: Text highlights within entries
- **AISettings**: AI configuration and API keys

## 🚀 Getting Started

### Prerequisites
- Xcode 15.0 or later
- iOS 17.0 or later
- Swift 5.9 or later

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/Pile-iOS.git
   cd Pile-iOS
   ```

2. **Open in Xcode**
   ```bash
   open PileiOS/PileiOS.xcodeproj
   ```

3. **Build and Run**
   - Select a target device (iPhone simulator or physical device)
   - Press `Cmd + B` to build
   - Press `Cmd + R` to run

### First Launch

1. **Create Your First Pile**
   - Tap "Create Your First Pile" on the home screen
   - Enter a name and choose a theme
   - Optionally add a custom AI prompt

2. **Configure AI (Optional)**
   - Go to Settings
   - Choose your AI provider (OpenAI or Ollama)
   - Enter your API key (for OpenAI)
   - Select your preferred model

3. **Start Journaling**
   - Tap on your pile to open it
   - Use the "New Entry" button to create your first entry
   - Add tags, attachments, and explore AI features

## 🔧 Configuration

### AI Setup

#### OpenAI
1. Get an API key from [OpenAI](https://platform.openai.com/api-keys)
2. Go to Settings → AI Configuration
3. Select "OpenAI" as provider
4. Enter your API key
5. Choose your preferred model (GPT-4o recommended)

#### Ollama (Local AI)
1. Install [Ollama](https://ollama.ai) on your Mac
2. Pull a model: `ollama pull llama3`
3. Go to Settings → AI Configuration
4. Select "Ollama" as provider
5. Ensure Ollama is running on your local network

### Privacy & Security
- All data is stored locally on your device
- API keys are stored securely in iOS Keychain
- No data is sent to external servers (except AI providers when configured)
- You can use Ollama for completely local AI processing

## 🧪 Testing

The project includes comprehensive unit tests:

```bash
# Run tests in Xcode
Cmd + U

# Or run specific tests
# Navigate to PileiOSTests.swift and run individual test methods
```

### Test Coverage
- Core Data model validation
- Manager class functionality
- Keychain security operations
- Search functionality
- AI integration components

## 📚 Usage Guide

### Creating Entries
1. Open a pile
2. Tap "New Entry" or use the + button
3. Add a title (optional)
4. Write your content
5. Add tags for organization
6. Attach photos if desired
7. Save your entry

### Using AI Features
1. **AI Chat**: Ask questions about your journal entries
2. **AI Responses**: Generate AI responses to your entries
3. **Semantic Search**: Find entries by meaning, not just keywords

### Search Options
- **Text Search**: Find entries containing specific words
- **Semantic Search**: AI-powered search by meaning
- **Tag Search**: Find entries with specific tags
- **Date Range**: Search entries within a date range
- **Combined Search**: Use multiple search criteria

### Organizing Your Journal
- **Tags**: Create and assign tags to entries
- **Themes**: Choose different color themes for your piles
- **Attachments**: Add photos and documents to entries
- **Highlights**: Highlight important text within entries

## 🔄 Data Migration

### From macOS Pile
If you have data from the original macOS Pile app, you can:
1. Export your data from the macOS app
2. Import it into the iOS app (feature coming soon)
3. Or manually recreate your piles and entries

### Backup & Restore
- Data is automatically backed up with iCloud (if enabled)
- You can export individual entries as text files
- Full data export feature coming in future updates

## 🐛 Troubleshooting

### Common Issues

**App won't build**
- Ensure you're using Xcode 15.0 or later
- Check that iOS deployment target is set to 17.0
- Clean build folder: `Cmd + Shift + K`

**AI features not working**
- Verify your API key is correct
- Check your internet connection
- For Ollama, ensure it's running and accessible

**Search not finding entries**
- Try different search types
- Check that entries have content
- Ensure tags are properly assigned

**Core Data errors**
- Delete and reinstall the app (data will be lost)
- Check device storage space
- Restart the app

### Getting Help
- Check the [Issues](https://github.com/yourusername/Pile-iOS/issues) page
- Create a new issue with detailed information
- Include device model, iOS version, and error messages

## 🛣 Roadmap

### Version 1.1
- [ ] Data import from macOS Pile
- [ ] Rich text formatting in entries
- [ ] Voice notes and audio attachments
- [ ] Widget support for quick entry

### Version 1.2
- [ ] iCloud sync (optional)
- [ ] Export to PDF
- [ ] Advanced AI features
- [ ] Custom themes

### Version 2.0
- [ ] iPad optimization
- [ ] Apple Watch companion app
- [ ] Advanced analytics and insights
- [ ] Plugin system for extensions

## 🤝 Contributing

We welcome contributions! Please see [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

### Development Setup
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Submit a pull request

### Code Style
- Follow Swift API Design Guidelines
- Use SwiftUI best practices
- Include documentation for public APIs
- Write unit tests for new features

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Original macOS Pile app by [UdaraJay](https://github.com/UdaraJay/Pile)
- SwiftUI community for inspiration and best practices
- OpenAI and Ollama for AI capabilities
- Apple for the excellent development tools and frameworks

## 📞 Support

- **Email**: support@pileapp.com
- **Twitter**: [@PileApp](https://twitter.com/PileApp)
- **Website**: [pileapp.com](https://pileapp.com)

---

**Pile iOS** - Your thoughts, organized and enhanced with AI. 📱✨
