import SwiftUI

struct HomeView: View {
    @EnvironmentObject var navigationManager: NavigationManager
    @EnvironmentObject var pileManager: PileManager

    @State private var showingCreatePile = false
    @State private var showingSettings = false

    private let quotes = [
        "One moment at a time",
        "Scribe your soul",
        "Reflections reimagined",
        "Look back, leap forward!",
        "Tales of you - for every human is an epic in progress",
        "Your thoughtopia awaits",
        "The quintessence of quiet contemplation",
        "Journal jamboree"
    ]

    @State private var currentQuote = ""

    var body: some View {
        VStack(spacing: 0) {
            // Header
            headerView

            // Content
            if pileManager.piles.isEmpty {
                emptyStateView
            } else {
                pilesListView
            }

            Spacer()
        }
        .navigationTitle("Pile")
        .navigationBarTitleDisplayMode(.large)
        .toolbar {
            ToolbarItem(placement: .navigationBarTrailing) {
                Button("Settings") {
                    showingSettings = true
                }
            }
        }
        .sheet(isPresented: $showingCreatePile) {
            CreatePileView()
                .environmentObject(navigationManager)
                .environmentObject(pileManager)
        }
        .sheet(isPresented: $showingSettings) {
            SettingsView()
                .environmentObject(pileManager)
        }
        .onAppear {
            if currentQuote.isEmpty {
                currentQuote = quotes.randomElement() ?? quotes[0]
            }
        }
    }

    private var headerView: some View {
        VStack(spacing: 16) {
            // Logo/Icon
            PileLogoView(size: 60, color: .blue)

            // Quote
            Text(currentQuote)
                .font(.title2)
                .fontWeight(.medium)
                .multilineTextAlignment(.center)
                .foregroundColor(.secondary)
                .padding(.horizontal)
        }
        .padding(.vertical, 32)
    }

    private var emptyStateView: some View {
        VStack(spacing: 24) {
            Spacer()

            PileLogoView(size: 80, color: .gray)

            VStack(spacing: 8) {
                Text("No Piles Yet")
                    .font(.title2)
                    .fontWeight(.semibold)

                Text("Start your reflective journey by creating your first pile")
                    .font(.body)
                    .foregroundColor(.secondary)
                    .multilineTextAlignment(.center)
            }

            Button("Create Your First Pile") {
                showingCreatePile = true
            }
            .buttonStyle(.borderedProminent)
            .controlSize(.large)

            Spacer()
        }
        .padding()
    }

    private var pilesListView: some View {
        ScrollView {
            LazyVStack(spacing: 16) {
                ForEach(pileManager.piles, id: \.id) { pile in
                    PileCardView(pile: pile) {
                        navigationManager.navigate(to: .pile(pile.name ?? "Untitled"))
                    }
                }
            }
            .padding()
        }
    }
}

struct PileCardView: View {
    let pile: Pile
    let onTap: () -> Void

    @EnvironmentObject var pileManager: PileManager
    @State private var showingDeleteAlert = false

    var body: some View {
        Button(action: onTap) {
            HStack {
                VStack(alignment: .leading, spacing: 8) {
                    HStack {
                        Text(pile.name ?? "Untitled Pile")
                            .font(.headline)
                            .foregroundColor(.primary)

                        Spacer()

                        // Theme indicator
                        Circle()
                            .fill(themeColor)
                            .frame(width: 12, height: 12)
                    }

                    HStack {
                        Text("\(entryCount) entries")
                            .font(.caption)
                            .foregroundColor(.secondary)

                        Spacer()

                        if let createdAt = pile.createdAt {
                            Text(createdAt, style: .relative)
                                .font(.caption)
                                .foregroundColor(.secondary)
                        }
                    }
                }

                Image(systemName: "chevron.right")
                    .font(.caption)
                    .foregroundColor(.secondary)
            }
            .padding()
            .background(Color(.systemBackground))
            .cornerRadius(12)
            .shadow(color: .black.opacity(0.1), radius: 2, x: 0, y: 1)
        }
        .buttonStyle(PlainButtonStyle())
        .contextMenu {
            Button("Delete", role: .destructive) {
                showingDeleteAlert = true
            }
        }
        .alert("Delete Pile", isPresented: $showingDeleteAlert) {
            Button("Cancel", role: .cancel) { }
            Button("Delete", role: .destructive) {
                _ = pileManager.deletePile(pile)
            }
        } message: {
            Text("Are you sure you want to delete '\(pile.name ?? "Untitled Pile")'? This action cannot be undone.")
        }
    }

    private var themeColor: Color {
        switch pile.theme {
        case "blue": return .blue
        case "purple": return .purple
        case "yellow": return .yellow
        case "green": return .green
        default: return .gray
        }
    }

    private var entryCount: Int {
        pile.entries?.count ?? 0
    }
}

#Preview {
    NavigationView {
        HomeView()
            .environmentObject(NavigationManager())
            .environmentObject(PileManager())
    }
}
