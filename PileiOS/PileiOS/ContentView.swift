//
//  ContentView.swift
//  PileiOS
//
//  Created by LewiNimu on 16/09/2025.
//

import SwiftUI
import CoreData
import Combine

struct ContentView: View {
    @StateObject private var navigationManager = NavigationManager()
    @StateObject private var pileManager = PileManager()
    @StateObject private var aiManager = AIManager()
    @StateObject private var searchManager = SearchManager()

    var body: some View {
        NavigationStack(path: $navigationManager.path) {
            HomeView()
                .environmentObject(navigationManager)
                .environmentObject(pileManager)
                .environmentObject(aiManager)
                .environmentObject(searchManager)
                .navigationDestination(for: NavigationDestination.self) { destination in
                    switch destination {
                    case .pile(let pileName):
                        PileView(pileName: pileName)
                            .environmentObject(navigationManager)
                            .environmentObject(pileManager)
                            .environmentObject(aiManager)
                            .environmentObject(searchManager)
                    case .createPile:
                        CreatePileView()
                            .environmentObject(navigationManager)
                            .environmentObject(pileManager)
                    case .settings:
                        SettingsView()
                            .environmentObject(aiManager)
                            .environmentObject(pileManager)
                    case .newEntry(let pileName):
                        NewEntryView(pileName: pileName)
                            .environmentObject(pileManager)
                            .environmentObject(aiManager)
                    case .entryDetail(let entryId):
                        EntryDetailView(entryId: entryId)
                            .environmentObject(pileManager)
                            .environmentObject(aiManager)
                    }
                }
        }
        .onAppear {
            pileManager.loadPiles()
        }
    }
}

// MARK: - Navigation Manager
class NavigationManager: ObservableObject {
    @Published var path = NavigationPath()

    func navigate(to destination: NavigationDestination) {
        path.append(destination)
    }

    func navigateBack() {
        if !path.isEmpty {
            path.removeLast()
        }
    }

    func navigateToRoot() {
        path.removeLast(path.count)
    }

    func navigateToPile(_ pileName: String) {
        navigateToRoot()
        navigate(to: .pile(pileName))
    }
}

enum NavigationDestination: Hashable {
    case pile(String)
    case createPile
    case settings
    case newEntry(String)
    case entryDetail(UUID)
}

#Preview {
    ContentView()
        .environment(\.managedObjectContext, PersistenceController.shared.container.viewContext)
}
