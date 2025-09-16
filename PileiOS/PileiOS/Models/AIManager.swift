import Foundation
import SwiftUI
import Combine

/// Manages AI interactions including OpenAI and Ollama integration
@MainActor
class AIManager: ObservableObject {

    // MARK: - Published Properties

    @Published var isConfigured = false
    @Published var isLoading = false
    @Published var errorMessage: String?
    @Published var currentProvider: AIProvider = .openai
    @Published var currentModel = "gpt-4o"
    @Published var embeddingModel = "text-embedding-3-small"
    @Published var baseURL = "https://api.openai.com/v1"
    @Published var conversationHistory: [ChatMessage] = []

    // MARK: - Private Properties

    private let keychain = KeychainManager()
    private let session = URLSession.shared

    // MARK: - AI Provider Enum

    enum AIProvider: String, CaseIterable {
        case openai = "openai"
        case ollama = "ollama"

        var displayName: String {
            switch self {
            case .openai: return "OpenAI"
            case .ollama: return "Ollama (Local)"
            }
        }

        var defaultBaseURL: String {
            switch self {
            case .openai: return "https://api.openai.com/v1"
            case .ollama: return "http://localhost:11434"
            }
        }

        var availableModels: [String] {
            switch self {
            case .openai:
                return ["gpt-4o", "gpt-4o-mini", "gpt-4-turbo", "gpt-3.5-turbo"]
            case .ollama:
                return ["llama3", "mistral", "codellama", "phi3", "gemma"]
            }
        }

        var availableEmbeddingModels: [String] {
            switch self {
            case .openai:
                return ["text-embedding-3-small", "text-embedding-3-large", "text-embedding-ada-002"]
            case .ollama:
                return ["nomic-embed-text", "mxbai-embed-large"]
            }
        }
    }

    // MARK: - Configuration

    func configure(provider: AIProvider, apiKey: String? = nil, model: String, embeddingModel: String, baseURL: String) {
        self.currentProvider = provider
        self.currentModel = model
        self.embeddingModel = embeddingModel
        self.baseURL = baseURL

        if let apiKey = apiKey {
            keychain.store(apiKey, for: "ai_api_key")
        }

        isConfigured = true
        errorMessage = nil
    }

    func getAPIKey() -> String? {
        return keychain.retrieve(for: "ai_api_key")
    }

    func clearAPIKey() {
        keychain.delete(for: "ai_api_key")
        isConfigured = false
        conversationHistory.removeAll()
    }

    // MARK: - AI Chat

    func generateCompletion(messages: [ChatMessage], systemPrompt: String? = nil) async -> Result<String, Error> {
        guard isConfigured else {
            return .failure(AIError.notConfigured)
        }

        isLoading = true
        errorMessage = nil

        defer { isLoading = false }

        do {
            let response = try await performCompletionRequest(messages: messages, systemPrompt: systemPrompt)
            return .success(response)
        } catch {
            errorMessage = error.localizedDescription
            return .failure(error)
        }
    }

    private func performCompletionRequest(messages: [ChatMessage], systemPrompt: String?) async throws -> String {
        let url = URL(string: "\(baseURL)/chat/completions")!

        var requestMessages: [[String: Any]] = []

        if let systemPrompt = systemPrompt {
            requestMessages.append([
                "role": "system",
                "content": systemPrompt
            ])
        }

        for message in messages {
            requestMessages.append([
                "role": message.role.rawValue,
                "content": message.content
            ])
        }

        let requestBody: [String: Any] = [
            "model": currentModel,
            "messages": requestMessages,
            "temperature": 0.7,
            "max_tokens": 2000
        ]

        var request = URLRequest(url: url)
        request.httpMethod = "POST"
        request.setValue("application/json", forHTTPHeaderField: "Content-Type")

        if currentProvider == .openai, let apiKey = getAPIKey() {
            request.setValue("Bearer \(apiKey)", forHTTPHeaderField: "Authorization")
        }

        request.httpBody = try JSONSerialization.data(withJSONObject: requestBody)

        let (data, response) = try await session.data(for: request)

        guard let httpResponse = response as? HTTPURLResponse else {
            throw AIError.invalidResponse
        }

        guard httpResponse.statusCode == 200 else {
            let errorMessage = String(data: data, encoding: .utf8) ?? "Unknown error"
            throw AIError.apiError(httpResponse.statusCode, errorMessage)
        }

        let json = try JSONSerialization.jsonObject(with: data) as? [String: Any]
        let choices = json?["choices"] as? [[String: Any]]
        let firstChoice = choices?.first
        let message = firstChoice?["message"] as? [String: Any]
        let content = message?["content"] as? String

        guard let content = content else {
            throw AIError.invalidResponse
        }

        return content
    }

    // MARK: - Embeddings

    func generateEmbedding(for text: String) async -> Result<[Float], Error> {
        guard isConfigured else {
            return .failure(AIError.notConfigured)
        }

        do {
            let embedding = try await performEmbeddingRequest(text: text)
            return .success(embedding)
        } catch {
            return .failure(error)
        }
    }

    private func performEmbeddingRequest(text: String) async throws -> [Float] {
        let url = URL(string: "\(baseURL)/embeddings")!

        let requestBody: [String: Any] = [
            "model": embeddingModel,
            "input": text
        ]

        var request = URLRequest(url: url)
        request.httpMethod = "POST"
        request.setValue("application/json", forHTTPHeaderField: "Content-Type")

        if currentProvider == .openai, let apiKey = getAPIKey() {
            request.setValue("Bearer \(apiKey)", forHTTPHeaderField: "Authorization")
        }

        request.httpBody = try JSONSerialization.data(withJSONObject: requestBody)

        let (data, response) = try await session.data(for: request)

        guard let httpResponse = response as? HTTPURLResponse else {
            throw AIError.invalidResponse
        }

        guard httpResponse.statusCode == 200 else {
            let errorMessage = String(data: data, encoding: .utf8) ?? "Unknown error"
            throw AIError.apiError(httpResponse.statusCode, errorMessage)
        }

        let json = try JSONSerialization.jsonObject(with: data) as? [String: Any]
        let dataArray = json?["data"] as? [[String: Any]]
        let firstItem = dataArray?.first
        let embedding = firstItem?["embedding"] as? [Float]

        guard let embedding = embedding else {
            throw AIError.invalidResponse
        }

        return embedding
    }

    // MARK: - Conversation Management

    func addMessage(_ message: ChatMessage) {
        conversationHistory.append(message)
    }

    func clearConversation() {
        conversationHistory.removeAll()
    }

    func getSystemPrompt(for pile: Pile) -> String {
        let basePrompt = """
        You are a helpful AI assistant within a digital journaling app called Pile. You help users reflect on their thoughts and provide insights about their journal entries.

        Your role is to:
        - Help users understand patterns in their writing
        - Provide thoughtful reflections on their entries
        - Ask meaningful questions to encourage deeper thinking
        - Offer insights without being judgmental
        - Maintain a supportive and encouraging tone

        You can see the user's journal entries and help them understand patterns, reflect on their thoughts, or answer questions about their writing.
        """

        if let customPrompt = pile.aiPrompt, !customPrompt.isEmpty {
            return "\(basePrompt)\n\nAdditional context for this journal: \(customPrompt)"
        }

        return basePrompt
    }
}

// MARK: - Supporting Types

struct ChatMessage {
    let role: MessageRole
    let content: String
    let timestamp: Date

    init(role: MessageRole, content: String, timestamp: Date = Date()) {
        self.role = role
        self.content = content
        self.timestamp = timestamp
    }
}

enum MessageRole: String {
    case system = "system"
    case user = "user"
    case assistant = "assistant"
}

enum AIError: LocalizedError {
    case notConfigured
    case invalidResponse
    case apiError(Int, String)
    case networkError(Error)

    var errorDescription: String? {
        switch self {
        case .notConfigured:
            return "AI is not configured. Please set up your API key and model in settings."
        case .invalidResponse:
            return "Received an invalid response from the AI service."
        case .apiError(let code, let message):
            return "API Error \(code): \(message)"
        case .networkError(let error):
            return "Network error: \(error.localizedDescription)"
        }
    }
}
