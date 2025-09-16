import SwiftUI

struct SettingsView: View {
    @Environment(\.dismiss) private var dismiss
    @EnvironmentObject var aiManager: AIManager
    @EnvironmentObject var pileManager: PileManager

    @State private var apiKey = ""
    @State private var selectedProvider: AIManager.AIProvider = .openai
    @State private var model = "gpt-4o"
    @State private var embeddingModel = "text-embedding-3-small"
    @State private var baseURL = "https://api.openai.com/v1"
    @State private var showingAPIKey = false
    @State private var isSaving = false
    @State private var errorMessage: String?
    @State private var successMessage: String?

    var body: some View {
        NavigationView {
            Form {
                Section("AI Configuration") {
                    Picker("Provider", selection: $selectedProvider) {
                        ForEach(AIManager.AIProvider.allCases, id: \.self) { provider in
                            Text(provider.displayName).tag(provider)
                        }
                    }
                    .pickerStyle(.menu)
                    .onChange(of: selectedProvider) { _, newProvider in
                        updateProviderSettings(newProvider)
                    }

                    if selectedProvider == .openai {
                        VStack(alignment: .leading, spacing: 8) {
                            HStack {
                                Text("API Key")
                                Spacer()
                                Button(showingAPIKey ? "Hide" : "Show") {
                                    showingAPIKey.toggle()
                                }
                                .font(.caption)
                            }

                            if showingAPIKey {
                                TextField("Enter your API key", text: $apiKey)
                                    .textFieldStyle(.roundedBorder)
                            } else {
                                SecureField("Enter your API key", text: $apiKey)
                                    .textFieldStyle(.roundedBorder)
                            }
                        }

                        TextField("Base URL", text: $baseURL)
                            .textFieldStyle(.roundedBorder)
                    }

                    Picker("Model", selection: $model) {
                        ForEach(availableModels, id: \.self) { model in
                            Text(model).tag(model)
                        }
                    }
                    .pickerStyle(.menu)

                    if selectedProvider == .openai {
                        Picker("Embedding Model", selection: $embeddingModel) {
                            ForEach(embeddingModels, id: \.self) { model in
                                Text(model).tag(model)
                            }
                        }
                        .pickerStyle(.menu)
                    }
                }

                Section("Data & Storage") {
                    HStack {
                        Text("Total Piles")
                        Spacer()
                        Text("\(pileManager.piles.count)")
                            .foregroundColor(.secondary)
                    }

                    HStack {
                        Text("Total Entries")
                        Spacer()
                        Text("\(pileManager.getRecentEntries().count)")
                            .foregroundColor(.secondary)
                    }

                    Button("Clear All Data") {
                        // Show confirmation alert
                    }
                    .foregroundColor(.red)
                }

                Section("About") {
                    HStack {
                        Text("Version")
                        Spacer()
                        Text("1.0.0")
                            .foregroundColor(.secondary)
                    }

                    HStack {
                        Text("Build")
                        Spacer()
                        Text("1")
                            .foregroundColor(.secondary)
                    }

                    Link("Privacy Policy", destination: URL(string: "https://example.com/privacy")!)
                    Link("Terms of Service", destination: URL(string: "https://example.com/terms")!)
                }

                if let errorMessage = errorMessage {
                    Section {
                        Text(errorMessage)
                            .foregroundColor(.red)
                            .font(.caption)
                    }
                }

                if let successMessage = successMessage {
                    Section {
                        Text(successMessage)
                            .foregroundColor(.green)
                            .font(.caption)
                    }
                }
            }
            .navigationTitle("Settings")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .navigationBarLeading) {
                    Button("Cancel") {
                        dismiss()
                    }
                }

                ToolbarItem(placement: .navigationBarTrailing) {
                    Button("Save") {
                        saveSettings()
                    }
                    .disabled(isSaving)
                }
            }
        }
        .onAppear {
            loadCurrentSettings()
        }
    }

    private var availableModels: [String] {
        selectedProvider.availableModels
    }

    private var embeddingModels: [String] {
        selectedProvider.availableEmbeddingModels
    }

    private func loadCurrentSettings() {
        selectedProvider = aiManager.currentProvider
        model = aiManager.currentModel
        embeddingModel = aiManager.embeddingModel
        baseURL = aiManager.baseURL

        if let existingKey = aiManager.getAPIKey() {
            apiKey = existingKey
        }
    }

    private func updateProviderSettings(_ provider: AIManager.AIProvider) {
        baseURL = provider.defaultBaseURL
        model = provider.availableModels.first ?? ""
        embeddingModel = provider.availableEmbeddingModels.first ?? ""
    }

    private func saveSettings() {
        isSaving = true
        errorMessage = nil
        successMessage = nil

        // Validate settings
        if selectedProvider == .openai && apiKey.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty {
            errorMessage = "API key is required for OpenAI"
            isSaving = false
            return
        }

        // Save settings
        aiManager.configure(
            provider: selectedProvider,
            apiKey: selectedProvider == .openai ? apiKey : nil,
            model: model,
            embeddingModel: embeddingModel,
            baseURL: baseURL
        )

        successMessage = "Settings saved successfully!"
        isSaving = false

        // Auto-dismiss after a delay
        DispatchQueue.main.asyncAfter(deadline: .now() + 1.5) {
            dismiss()
        }
    }
}

#Preview {
    SettingsView()
        .environmentObject(AIManager())
        .environmentObject(PileManager())
}
