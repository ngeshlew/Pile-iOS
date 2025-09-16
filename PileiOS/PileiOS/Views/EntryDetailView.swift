import SwiftUI

struct EntryDetailView: View {
    let entryId: UUID

    @EnvironmentObject var pileManager: PileManager
    @EnvironmentObject var aiManager: AIManager

    @State private var entry: Entry?
    @State private var isEditing = false
    @State private var editedTitle = ""
    @State private var editedContent = ""
    @State private var showingDeleteAlert = false
    @State private var showingAIResponse = false

    var body: some View {
        Group {
            if let entry = entry {
                NavigationView {
                    ScrollView {
                        VStack(alignment: .leading, spacing: 16) {
                            // Header
                            headerView(entry: entry)

                            // Content
                            contentView(entry: entry)

                            // Tags
                            if let tags = entry.tags, tags.count > 0 {
                                tagsView(tags: Array(tags as? Set<Tag> ?? Set<Tag>()))
                            }

                            // Attachments
                            if let attachments = entry.attachments, attachments.count > 0 {
                                attachmentsView(attachments: Array(attachments as? Set<Attachment> ?? Set<Attachment>()))
                            }

                            // AI Response button
                            if !entry.isAI && aiManager.isConfigured {
                                aiResponseButton
                            }

                            Spacer(minLength: 100)
                        }
                        .padding()
                    }
                    .navigationTitle(entry.title?.isEmpty == false ? entry.title! : "Entry")
                    .navigationBarTitleDisplayMode(.large)
                    .toolbar {
                        ToolbarItem(placement: .navigationBarTrailing) {
                            Menu {
                                Button("Edit") {
                                    startEditing()
                                }

                                Button("Generate AI Response") {
                                    generateAIResponse()
                                }
                                .disabled(!aiManager.isConfigured)

                                Button("Delete", role: .destructive) {
                                    showingDeleteAlert = true
                                }
                            } label: {
                                Image(systemName: "ellipsis.circle")
                            }
                        }
                    }
                }
                .sheet(isPresented: $isEditing) {
                    EditEntryView(entry: entry) {
                        loadEntry()
                    }
                    .environmentObject(pileManager)
                }
                .sheet(isPresented: $showingAIResponse) {
                    AIResponseView(entry: entry)
                        .environmentObject(aiManager)
                        .environmentObject(pileManager)
                }
                .alert("Delete Entry", isPresented: $showingDeleteAlert) {
                    Button("Cancel", role: .cancel) { }
                    Button("Delete", role: .destructive) {
                        deleteEntry()
                    }
                } message: {
                    Text("Are you sure you want to delete this entry? This action cannot be undone.")
                }
            } else {
                VStack {
                    ProgressView("Loading entry...")
                }
            }
        }
        .onAppear {
            loadEntry()
        }
    }

    private func headerView(entry: Entry) -> some View {
        VStack(alignment: .leading, spacing: 8) {
            HStack {
                VStack(alignment: .leading, spacing: 4) {
                    if let title = entry.title, !title.isEmpty {
                        Text(title)
                            .font(.title2)
                            .fontWeight(.bold)
                    }

                    HStack {
                        if let createdAt = entry.createdAt {
                            Text(createdAt, style: .date)
                                .font(.caption)
                                .foregroundColor(.secondary)
                        }

                        if let updatedAt = entry.updatedAt, updatedAt != entry.createdAt {
                            Text("• Updated \(updatedAt, style: .relative)")
                                .font(.caption)
                                .foregroundColor(.secondary)
                        }
                    }
                }

                Spacer()

                HStack(spacing: 8) {
                    if entry.isAI {
                        Image(systemName: "brain.head.profile")
                            .foregroundColor(.blue)
                    }

                    if entry.isReply {
                        Image(systemName: "arrowshape.turn.up.left")
                            .foregroundColor(.orange)
                    }
                }
            }
        }
    }

    private func contentView(entry: Entry) -> some View {
        VStack(alignment: .leading, spacing: 12) {
            if let content = entry.content {
                Text(content)
                    .font(.body)
                    .lineSpacing(4)
            }
        }
    }

    private func tagsView(tags: [Tag]) -> some View {
        VStack(alignment: .leading, spacing: 8) {
            Text("Tags")
                .font(.headline)

            LazyVGrid(columns: [GridItem(.adaptive(minimum: 100))], spacing: 8) {
                ForEach(tags, id: \.id) { tag in
                    HStack(spacing: 4) {
                        Circle()
                            .fill(Color(hex: tag.color ?? "#007AFF") ?? .blue)
                            .frame(width: 8, height: 8)

                        Text(tag.name ?? "")
                            .font(.caption)
                    }
                    .padding(.horizontal, 8)
                    .padding(.vertical, 4)
                    .background(Color(.systemGray6))
                    .cornerRadius(12)
                }
            }
        }
    }

    private func attachmentsView(attachments: [Attachment]) -> some View {
        VStack(alignment: .leading, spacing: 8) {
            Text("Attachments")
                .font(.headline)

            LazyVGrid(columns: [GridItem(.adaptive(minimum: 100))], spacing: 8) {
                ForEach(attachments, id: \.id) { attachment in
                    AttachmentDetailView(attachment: attachment)
                }
            }
        }
    }

    private var aiResponseButton: some View {
        Button("Generate AI Response") {
            generateAIResponse()
        }
        .buttonStyle(.borderedProminent)
        .disabled(!aiManager.isConfigured)
    }

    private func loadEntry() {
        // This would fetch the entry by ID from Core Data
        // For now, we'll use a placeholder
    }

    private func startEditing() {
        if let entry = entry {
            editedTitle = entry.title ?? ""
            editedContent = entry.content ?? ""
            isEditing = true
        }
    }

    private func generateAIResponse() {
        showingAIResponse = true
    }

    private func deleteEntry() {
        if let entry = entry {
            _ = pileManager.deleteEntry(entry)
            // Navigate back
        }
    }
}

struct EditEntryView: View {
    let entry: Entry
    let onSave: () -> Void

    @Environment(\.dismiss) private var dismiss
    @EnvironmentObject var pileManager: PileManager

    @State private var title: String
    @State private var content: String
    @State private var isSaving = false
    @State private var errorMessage: String?

    init(entry: Entry, onSave: @escaping () -> Void) {
        self.entry = entry
        self.onSave = onSave
        self._title = State(initialValue: entry.title ?? "")
        self._content = State(initialValue: entry.content ?? "")
    }

    var body: some View {
        NavigationView {
            VStack(spacing: 0) {
                // Title input
                VStack(alignment: .leading, spacing: 8) {
                    Text("Title")
                        .font(.caption)
                        .foregroundColor(.secondary)

                    TextField("Entry title", text: $title)
                        .textFieldStyle(.roundedBorder)
                }
                .padding()

                Divider()

                // Content input
                VStack(alignment: .leading, spacing: 8) {
                    Text("Content")
                        .font(.caption)
                        .foregroundColor(.secondary)

                    TextEditor(text: $content)
                        .frame(minHeight: 200)
                        .overlay(
                            RoundedRectangle(cornerRadius: 8)
                                .stroke(Color(.systemGray4), lineWidth: 1)
                        )
                }
                .padding()

                if let errorMessage = errorMessage {
                    Text(errorMessage)
                        .foregroundColor(.red)
                        .font(.caption)
                        .padding(.horizontal)
                }

                Spacer()
            }
            .navigationTitle("Edit Entry")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .navigationBarLeading) {
                    Button("Cancel") {
                        dismiss()
                    }
                }

                ToolbarItem(placement: .navigationBarTrailing) {
                    Button("Save") {
                        saveEntry()
                    }
                    .disabled(isSaving)
                }
            }
        }
    }

    private func saveEntry() {
        isSaving = true
        errorMessage = nil

        let result = pileManager.updateEntry(
            entry,
            title: title.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty ? nil : title,
            content: content
        )

        switch result {
        case .success:
            onSave()
            dismiss()
        case .failure(let error):
            errorMessage = error.localizedDescription
        }

        isSaving = false
    }
}

struct AttachmentDetailView: View {
    let attachment: Attachment

    var body: some View {
        VStack {
            Image(systemName: "photo")
                .font(.title2)
                .foregroundColor(.blue)

            Text(attachment.fileName ?? "Unknown")
                .font(.caption)
                .lineLimit(2)
                .multilineTextAlignment(.center)
        }
        .frame(width: 100, height: 100)
        .background(Color(.systemGray6))
        .cornerRadius(8)
    }
}

struct AIResponseView: View {
    let entry: Entry

    @Environment(\.dismiss) private var dismiss
    @EnvironmentObject var aiManager: AIManager
    @EnvironmentObject var pileManager: PileManager

    @State private var response = ""
    @State private var isGenerating = false
    @State private var errorMessage: String?

    var body: some View {
        NavigationView {
            VStack(spacing: 16) {
                if isGenerating {
                    VStack(spacing: 16) {
                        ProgressView()
                            .scaleEffect(1.5)
                        Text("Generating AI response...")
                            .font(.headline)
                    }
                    .frame(maxWidth: .infinity, maxHeight: .infinity)
                } else if !response.isEmpty {
                    ScrollView {
                        Text(response)
                            .font(.body)
                            .lineSpacing(4)
                            .padding()
                    }
                } else if let errorMessage = errorMessage {
                    VStack(spacing: 16) {
                        Image(systemName: "exclamationmark.triangle")
                            .font(.system(size: 50))
                            .foregroundColor(.orange)

                        Text("Error")
                            .font(.title2)
                            .fontWeight(.semibold)

                        Text(errorMessage)
                            .font(.body)
                            .foregroundColor(.secondary)
                            .multilineTextAlignment(.center)
                    }
                    .padding()
                }
            }
            .navigationTitle("AI Response")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .navigationBarLeading) {
                    Button("Cancel") {
                        dismiss()
                    }
                }

                ToolbarItem(placement: .navigationBarTrailing) {
                    if !response.isEmpty {
                        Button("Save as Entry") {
                            saveAsEntry()
                        }
                    }
                }
            }
        }
        .onAppear {
            generateResponse()
        }
    }

    private func generateResponse() {
        guard let pile = entry.pile else { return }

        isGenerating = true
        errorMessage = nil

        let messages = [
            ChatMessage(role: .user, content: entry.content ?? "")
        ]

        Task {
            let result = await aiManager.generateCompletion(
                messages: messages,
                systemPrompt: aiManager.getSystemPrompt(for: pile)
            )

            await MainActor.run {
                isGenerating = false

                switch result {
                case .success(let response):
                    self.response = response
                case .failure(let error):
                    self.errorMessage = error.localizedDescription
                }
            }
        }
    }

    private func saveAsEntry() {
        guard let pile = entry.pile else { return }

        let result = pileManager.createEntry(
            in: pile,
            title: "AI Response to: \(entry.title ?? "Untitled Entry")",
            content: response,
            isAI: true,
            isReply: true,
            parentEntry: entry
        )

        switch result {
        case .success:
            dismiss()
        case .failure(let error):
            errorMessage = error.localizedDescription
        }
    }
}

#Preview {
    EntryDetailView(entryId: UUID())
        .environmentObject(PileManager())
        .environmentObject(AIManager())
}
