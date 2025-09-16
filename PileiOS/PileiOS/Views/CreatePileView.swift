import SwiftUI

struct CreatePileView: View {
    @Environment(\.dismiss) private var dismiss
    @EnvironmentObject var navigationManager: NavigationManager
    @EnvironmentObject var pileManager: PileManager

    @State private var pileName = ""
    @State private var selectedTheme = "light"
    @State private var aiPrompt = ""
    @State private var isCreating = false
    @State private var errorMessage: String?

    private let themes = [
        ("light", "Light", Color.gray),
        ("blue", "Blue", Color.blue),
        ("purple", "Purple", Color.purple),
        ("yellow", "Yellow", Color.yellow),
        ("green", "Green", Color.green)
    ]

    var body: some View {
        NavigationView {
            Form {
                Section("Pile Details") {
                    TextField("Pile Name", text: $pileName)
                        .textInputAutocapitalization(.words)

                    Picker("Theme", selection: $selectedTheme) {
                        ForEach(themes, id: \.0) { theme in
                            HStack {
                                Circle()
                                    .fill(theme.2)
                                    .frame(width: 16, height: 16)
                                Text(theme.1)
                            }
                            .tag(theme.0)
                        }
                    }
                    .pickerStyle(.menu)
                }

                Section {
                    TextField("Custom AI prompt for this pile", text: $aiPrompt, axis: .vertical)
                        .lineLimit(3...6)
                } footer: {
                    Text("Provide context about this pile to help the AI give more relevant responses.")
                }

                if let errorMessage = errorMessage {
                    Section {
                        Text(errorMessage)
                            .foregroundColor(.red)
                            .font(.caption)
                    }
                }
            }
            .navigationTitle("New Pile")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .navigationBarLeading) {
                    Button("Cancel") {
                        dismiss()
                    }
                }

                ToolbarItem(placement: .navigationBarTrailing) {
                    Button("Create") {
                        createPile()
                    }
                    .disabled(pileName.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty || isCreating)
                }
            }
        }
    }

    private func createPile() {
        let trimmedName = pileName.trimmingCharacters(in: .whitespacesAndNewlines)
        let trimmedPrompt = aiPrompt.trimmingCharacters(in: .whitespacesAndNewlines)
        guard !trimmedName.isEmpty else { return }

        isCreating = true
        errorMessage = nil

        let result = pileManager.createPile(
            name: trimmedName,
            theme: selectedTheme,
            aiPrompt: trimmedPrompt.isEmpty ? nil : trimmedPrompt
        )

        switch result {
        case .success(let pile):
            dismiss()
            navigationManager.navigate(to: .pile(pile.name ?? "Untitled"))
        case .failure(let error):
            errorMessage = error.localizedDescription
        }

        isCreating = false
    }
}

#Preview {
    CreatePileView()
        .environmentObject(NavigationManager())
        .environmentObject(PileManager())
}
