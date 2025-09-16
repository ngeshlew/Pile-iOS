import SwiftUI
import CoreData

struct ChatView: View {
    let pile: Pile

    @EnvironmentObject var aiManager: AIManager
    @EnvironmentObject var pileManager: PileManager

    @State private var messages: [ChatMessage] = []
    @State private var currentMessage = ""
    @State private var isGenerating = false
    @State private var showingSettings = false

    var body: some View {
        NavigationView {
            VStack(spacing: 0) {
                if !aiManager.isConfigured {
                    notConfiguredView
                } else {
                    chatView
                }
            }
            .navigationTitle("AI Chat")
            .navigationBarTitleDisplayMode(.large)
            .toolbar {
                ToolbarItem(placement: .navigationBarTrailing) {
                    Button("Settings") {
                        showingSettings = true
                    }
                }
            }
            .sheet(isPresented: $showingSettings) {
                SettingsView()
                    .environmentObject(aiManager)
                    .environmentObject(pileManager)
            }
        }
        .onAppear {
            setupInitialMessages()
        }
    }

    private var notConfiguredView: some View {
        VStack(spacing: 24) {
            Spacer()

            Image(systemName: "brain.head.profile")
                .font(.system(size: 60))
                .foregroundColor(.gray)

            VStack(spacing: 8) {
                Text("AI Not Configured")
                    .font(.title2)
                    .fontWeight(.semibold)

                Text("Configure your AI settings to start chatting with your journal")
                    .font(.body)
                    .foregroundColor(.secondary)
                    .multilineTextAlignment(.center)
            }

            Button("Configure AI") {
                showingSettings = true
            }
            .buttonStyle(.borderedProminent)

            Spacer()
        }
        .padding()
    }

    private var chatView: some View {
        VStack(spacing: 0) {
            // Messages list
            ScrollViewReader { proxy in
                ScrollView {
                    LazyVStack(spacing: 12) {
                        ForEach(messages.indices, id: \.self) { index in
                            ChatMessageView(message: messages[index])
                                .id(index)
                        }

                        if isGenerating {
                            HStack {
                                ProgressView()
                                    .scaleEffect(0.8)
                                Text("AI is thinking...")
                                    .font(.caption)
                                    .foregroundColor(.secondary)
                            }
                            .padding()
                            .id("generating")
                        }
                    }
                    .padding()
                }
                .onChange(of: messages.count) { _, _ in
                    withAnimation {
                        proxy.scrollTo(messages.count - 1, anchor: .bottom)
                    }
                }
                .onChange(of: isGenerating) { _, generating in
                    if generating {
                        withAnimation {
                            proxy.scrollTo("generating", anchor: .bottom)
                        }
                    }
                }
            }

            Divider()

            // Input area
            HStack(spacing: 12) {
                TextField("Ask about your journal...", text: $currentMessage, axis: .vertical)
                    .textFieldStyle(.roundedBorder)
                    .lineLimit(1...4)

                Button("Send") {
                    sendMessage()
                }
                .buttonStyle(.borderedProminent)
                .disabled(currentMessage.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty || isGenerating)
            }
            .padding()
        }
    }

    private func setupInitialMessages() {
        messages = [
            ChatMessage(
                role: .system,
                content: aiManager.getSystemPrompt(for: pile)
            ),
            ChatMessage(
                role: .assistant,
                content: "Hello! I'm here to help you explore and reflect on your journal entries. What would you like to know about your thoughts and experiences?"
            )
        ]
    }

    private func sendMessage() {
        let trimmedMessage = currentMessage.trimmingCharacters(in: .whitespacesAndNewlines)
        guard !trimmedMessage.isEmpty else { return }

        // Add user message
        let userMessage = ChatMessage(role: .user, content: trimmedMessage)
        messages.append(userMessage)
        currentMessage = ""

        // Generate AI response
        isGenerating = true

        Task {
            let result = await aiManager.generateCompletion(
                messages: messages,
                systemPrompt: aiManager.getSystemPrompt(for: pile)
            )

            await MainActor.run {
                isGenerating = false

                switch result {
                case .success(let response):
                    let aiMessage = ChatMessage(role: .assistant, content: response)
                    messages.append(aiMessage)
                case .failure(let error):
                    let errorMessage = ChatMessage(role: .assistant, content: "I'm sorry, I encountered an error: \(error.localizedDescription)")
                    messages.append(errorMessage)
                }
            }
        }
    }
}

struct ChatMessageView: View {
    let message: ChatMessage

    var body: some View {
        HStack {
            if message.role == .user {
                Spacer()

                VStack(alignment: .trailing, spacing: 4) {
                    Text(message.content)
                        .padding()
                        .background(Color.blue)
                        .foregroundColor(.white)
                        .cornerRadius(16)
                        .cornerRadius(4, corners: [.bottomRight])

                    Text(message.timestamp, style: .time)
                        .font(.caption2)
                        .foregroundColor(.secondary)
                }
                .frame(maxWidth: .infinity * 0.8, alignment: .trailing)
            } else {
                VStack(alignment: .leading, spacing: 4) {
                    Text(message.content)
                        .padding()
                        .background(Color(.systemGray5))
                        .foregroundColor(.primary)
                        .cornerRadius(16)
                        .cornerRadius(4, corners: [.bottomLeft])

                    Text(message.timestamp, style: .time)
                        .font(.caption2)
                        .foregroundColor(.secondary)
                }
                .frame(maxWidth: .infinity * 0.8, alignment: .leading)

                Spacer()
            }
        }
    }
}

extension View {
    func cornerRadius(_ radius: CGFloat, corners: UIRectCorner) -> some View {
        clipShape(RoundedCorner(radius: radius, corners: corners))
    }
}

struct RoundedCorner: Shape {
    var radius: CGFloat = .infinity
    var corners: UIRectCorner = .allCorners

    func path(in rect: CGRect) -> Path {
        let path = UIBezierPath(
            roundedRect: rect,
            byRoundingCorners: corners,
            cornerRadii: CGSize(width: radius, height: radius)
        )
        return Path(path.cgPath)
    }
}

#Preview {
    ChatView(pile: Pile())
        .environmentObject(AIManager())
        .environmentObject(PileManager())
}
