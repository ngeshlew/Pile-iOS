import SwiftUI
import PhotosUI

struct NewEntryView: View {
    let pileName: String

    @Environment(\.dismiss) private var dismiss
    @EnvironmentObject var pileManager: PileManager
    @EnvironmentObject var aiManager: AIManager

    @State private var title = ""
    @State private var content = ""
    @State private var isAI = false
    @State private var isSaving = false
    @State private var errorMessage: String?
    @State private var showingAIResponse = false
    @State private var selectedTags: [Tag] = []
    @State private var showingTagPicker = false
    @State private var selectedPhotos: [PhotosPickerItem] = []
    @State private var attachments: [Attachment] = []

    private var pile: Pile? {
        pileManager.piles.first { $0.name == pileName }
    }

    var body: some View {
        NavigationView {
            VStack(spacing: 0) {
                // Title input
                VStack(alignment: .leading, spacing: 8) {
                    Text("Title (Optional)")
                        .font(.caption)
                        .foregroundColor(.secondary)

                    TextField("Entry title", text: $title)
                        .textFieldStyle(.roundedBorder)
                }
                .padding()

                Divider()

                // Content input
                VStack(alignment: .leading, spacing: 8) {
                    HStack {
                        Text("Content")
                            .font(.caption)
                            .foregroundColor(.secondary)

                        Spacer()

                        Toggle("AI Response", isOn: $isAI)
                            .font(.caption)
                    }

                    TextEditor(text: $content)
                        .frame(minHeight: 200)
                        .overlay(
                            RoundedRectangle(cornerRadius: 8)
                                .stroke(Color(.systemGray4), lineWidth: 1)
                        )
                }
                .padding()

                // Tags section
                if !selectedTags.isEmpty {
                    VStack(alignment: .leading, spacing: 8) {
                        Text("Tags")
                            .font(.caption)
                            .foregroundColor(.secondary)

                        ScrollView(.horizontal, showsIndicators: false) {
                            HStack(spacing: 8) {
                                ForEach(selectedTags, id: \.id) { tag in
                                    HStack(spacing: 4) {
                                        Text(tag.name ?? "")
                                            .font(.caption)
                                        Button("×") {
                                            selectedTags.removeAll { $0.id == tag.id }
                                        }
                                        .font(.caption)
                                    }
                                    .padding(.horizontal, 8)
                                    .padding(.vertical, 4)
                                    .background(Color.blue.opacity(0.2))
                                    .foregroundColor(.blue)
                                    .cornerRadius(12)
                                }

                                Button("+ Add Tag") {
                                    showingTagPicker = true
                                }
                                .font(.caption)
                                .padding(.horizontal, 8)
                                .padding(.vertical, 4)
                                .background(Color.gray.opacity(0.2))
                                .foregroundColor(.gray)
                                .cornerRadius(12)
                            }
                            .padding(.horizontal)
                        }
                    }
                    .padding(.horizontal)
                } else {
                    Button("Add Tags") {
                        showingTagPicker = true
                    }
                    .font(.caption)
                    .padding(.horizontal)
                }

                // Attachments section
                VStack(alignment: .leading, spacing: 8) {
                    Text("Attachments")
                        .font(.caption)
                        .foregroundColor(.secondary)

                    PhotosPicker(
                        selection: $selectedPhotos,
                        maxSelectionCount: 5,
                        matching: .images
                    ) {
                        HStack {
                            Image(systemName: "photo")
                            Text("Add Photos")
                        }
                        .padding()
                        .background(Color(.systemGray6))
                        .cornerRadius(8)
                    }

                    if !attachments.isEmpty {
                        ScrollView(.horizontal, showsIndicators: false) {
                            HStack(spacing: 8) {
                                ForEach(attachments, id: \.id) { attachment in
                                    AttachmentPreviewView(attachment: attachment)
                                }
                            }
                            .padding(.horizontal)
                        }
                    }
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
            .navigationTitle("New Entry")
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
                    .disabled(content.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty || isSaving)
                }
            }
        }
        .onChange(of: isAI) { _, newValue in
            if newValue && !content.isEmpty {
                generateAIResponse()
            }
        }
        .onChange(of: selectedPhotos) { _, newValue in
            handlePhotoSelection()
        }
        .sheet(isPresented: $showingTagPicker) {
            TagPickerView(selectedTags: $selectedTags)
                .environmentObject(pileManager)
        }
    }

    private func saveEntry() {
        guard let pile = pile else { return }

        let trimmedContent = content.trimmingCharacters(in: .whitespacesAndNewlines)
        let trimmedTitle = title.trimmingCharacters(in: .whitespacesAndNewlines)

        guard !trimmedContent.isEmpty else { return }

        isSaving = true
        errorMessage = nil

        let result = pileManager.createEntry(
            in: pile,
            title: trimmedTitle.isEmpty ? nil : trimmedTitle,
            content: trimmedContent,
            isAI: isAI,
            tags: selectedTags
        )

        switch result {
        case .success:
            dismiss()
        case .failure(let error):
            errorMessage = error.localizedDescription
        }

        isSaving = false
    }

    private func generateAIResponse() {
        // This would integrate with the AI manager to generate a response
        // For now, we'll just show a placeholder
        showingAIResponse = true
    }

    private func handlePhotoSelection() {
        // Handle photo selection and create attachments
        // This would process the selected photos and create Attachment entities
    }
}

struct AttachmentPreviewView: View {
    let attachment: Attachment

    var body: some View {
        VStack {
            Image(systemName: "photo")
                .font(.title2)
                .foregroundColor(.blue)

            Text(attachment.fileName ?? "Unknown")
                .font(.caption)
                .lineLimit(1)
        }
        .frame(width: 60, height: 60)
        .background(Color(.systemGray6))
        .cornerRadius(8)
    }
}

struct TagPickerView: View {
    @Binding var selectedTags: [Tag]
    @Environment(\.dismiss) private var dismiss
    @EnvironmentObject var pileManager: PileManager

    @State private var newTagName = ""
    @State private var newTagColor = "#007AFF"

    private var availableTags: [Tag] {
        pileManager.getAllTags()
    }

    var body: some View {
        NavigationView {
            List {
                Section("Available Tags") {
                    ForEach(availableTags, id: \.id) { tag in
                        HStack {
                            Circle()
                                .fill(Color(hex: tag.color ?? "#007AFF") ?? .blue)
                                .frame(width: 12, height: 12)

                            Text(tag.name ?? "")

                            Spacer()

                            if selectedTags.contains(where: { $0.id == tag.id }) {
                                Image(systemName: "checkmark")
                                    .foregroundColor(.blue)
                            }
                        }
                        .contentShape(Rectangle())
                        .onTapGesture {
                            toggleTag(tag)
                        }
                    }
                }

                Section("Create New Tag") {
                    HStack {
                        Circle()
                            .fill(Color(hex: newTagColor) ?? .blue)
                            .frame(width: 20, height: 20)

                        TextField("Tag name", text: $newTagName)

                        Button("Create") {
                            createNewTag()
                        }
                        .disabled(newTagName.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty)
                    }
                }
            }
            .navigationTitle("Select Tags")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .navigationBarTrailing) {
                    Button("Done") {
                        dismiss()
                    }
                }
            }
        }
    }

    private func toggleTag(_ tag: Tag) {
        if let index = selectedTags.firstIndex(where: { $0.id == tag.id }) {
            selectedTags.remove(at: index)
        } else {
            selectedTags.append(tag)
        }
    }

    private func createNewTag() {
        let trimmedName = newTagName.trimmingCharacters(in: .whitespacesAndNewlines)
        guard !trimmedName.isEmpty else { return }

        let result = pileManager.createTag(name: trimmedName, color: newTagColor)
        switch result {
        case .success(let tag):
            selectedTags.append(tag)
            newTagName = ""
        case .failure:
            break
        }
    }
}

extension Color {
    init?(hex: String) {
        let hex = hex.trimmingCharacters(in: CharacterSet.alphanumerics.inverted)
        var int: UInt64 = 0
        Scanner(string: hex).scanHexInt64(&int)
        let a, r, g, b: UInt64
        switch hex.count {
        case 3: // RGB (12-bit)
            (a, r, g, b) = (255, (int >> 8) * 17, (int >> 4 & 0xF) * 17, (int & 0xF) * 17)
        case 6: // RGB (24-bit)
            (a, r, g, b) = (255, int >> 16, int >> 8 & 0xFF, int & 0xFF)
        case 8: // ARGB (32-bit)
            (a, r, g, b) = (int >> 24, int >> 16 & 0xFF, int >> 8 & 0xFF, int & 0xFF)
        default:
            return nil
        }

        self.init(
            .sRGB,
            red: Double(r) / 255,
            green: Double(g) / 255,
            blue:  Double(b) / 255,
            opacity: Double(a) / 255
        )
    }
}

#Preview {
    NewEntryView(pileName: "Sample Pile")
        .environmentObject(PileManager())
        .environmentObject(AIManager())
}
