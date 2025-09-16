import SwiftUI

struct PileView: View {
    let pileName: String

    @EnvironmentObject var navigationManager: NavigationManager
    @EnvironmentObject var pileManager: PileManager
    @EnvironmentObject var aiManager: AIManager
    @EnvironmentObject var searchManager: SearchManager

    @State private var selectedTab = 0
    @State private var showingNewEntry = false
    @State private var showingSearch = false
    @State private var showingSettings = false

    private var pile: Pile? {
        pileManager.piles.first { $0.name == pileName }
    }

    var body: some View {
        Group {
            if let pile = pile {
                TabView(selection: $selectedTab) {
                    // Entries Tab
                    EntriesView(pile: pile)
                        .tabItem {
                            Image(systemName: "book")
                            Text("Entries")
                        }
                        .tag(0)

                    // Search Tab
                    SearchView(pile: pile)
                        .tabItem {
                            Image(systemName: "magnifyingglass")
                            Text("Search")
                        }
                        .tag(1)

                    // Chat Tab
                    ChatView(pile: pile)
                        .tabItem {
                            Image(systemName: "message")
                            Text("Chat")
                        }
                        .tag(2)
                }
                .navigationTitle(pile.name ?? "Untitled Pile")
                .navigationBarTitleDisplayMode(.large)
                .toolbar {
                    ToolbarItem(placement: .navigationBarTrailing) {
                        Menu {
                            Button("New Entry") {
                                showingNewEntry = true
                            }

                            Button("Search") {
                                showingSearch = true
                            }

                            Button("Settings") {
                                showingSettings = true
                            }
                        } label: {
                            Image(systemName: "ellipsis.circle")
                        }
                    }
                }
                .sheet(isPresented: $showingNewEntry) {
                    NewEntryView(pileName: pileName)
                        .environmentObject(pileManager)
                        .environmentObject(aiManager)
                }
                .sheet(isPresented: $showingSearch) {
                    SearchView(pile: pile)
                        .environmentObject(searchManager)
                }
                .sheet(isPresented: $showingSettings) {
                    SettingsView()
                        .environmentObject(aiManager)
                        .environmentObject(pileManager)
                }
                .onAppear {
                    pileManager.setCurrentPile(pile)
                }
            } else {
                VStack {
                    Image(systemName: "exclamationmark.triangle")
                        .font(.system(size: 50))
                        .foregroundColor(.orange)

                    Text("Pile Not Found")
                        .font(.title2)
                        .fontWeight(.semibold)

                    Text("The pile '\(pileName)' could not be found.")
                        .foregroundColor(.secondary)
                        .multilineTextAlignment(.center)

                    Button("Go Back") {
                        navigationManager.navigateBack()
                    }
                    .buttonStyle(.borderedProminent)
                    .padding(.top)
                }
                .padding()
            }
        }
    }
}

#Preview {
    NavigationView {
        PileView(pileName: "Sample Pile")
            .environmentObject(NavigationManager())
            .environmentObject(PileManager())
            .environmentObject(AIManager())
            .environmentObject(SearchManager())
    }
}
