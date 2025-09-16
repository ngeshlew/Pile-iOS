//
//  PileiOSTests.swift
//  PileiOSTests
//
//  Created by LewiNimu on 16/09/2025.
//

import Testing
import CoreData
@testable import PileiOS

@MainActor
struct PileiOSTests {

    @Test func testPileCreation() async throws {
        let pileManager = PileManager()
        let result = pileManager.createPile(name: "Test Pile", theme: "blue")

        switch result {
        case .success(let pile):
            #expect(pile.name == "Test Pile")
            #expect(pile.theme == "blue")
            #expect(pile.id != nil)
            #expect(pile.createdAt != nil)
        case .failure(let error):
            Issue.record("Failed to create pile: \(error)")
        }
    }

    @Test func testAIManagerConfiguration() async throws {
        let aiManager = AIManager()

        aiManager.configure(
            provider: .openai,
            apiKey: "test-key",
            model: "gpt-4o",
            embeddingModel: "text-embedding-3-small",
            baseURL: "https://api.openai.com/v1"
        )

        #expect(aiManager.isConfigured == true)
        #expect(aiManager.currentProvider == .openai)
        #expect(aiManager.currentModel == "gpt-4o")
        #expect(aiManager.embeddingModel == "text-embedding-3-small")
        #expect(aiManager.baseURL == "https://api.openai.com/v1")
    }

    @Test func testKeychainManager() async throws {
        let keychain = KeychainManager()
        let testKey = "test_key"
        let testValue = "test_value"

        // Store value
        keychain.store(testValue, for: testKey)

        // Retrieve value
        let retrievedValue = keychain.retrieve(for: testKey)
        #expect(retrievedValue == testValue)

        // Delete value
        keychain.delete(for: testKey)
        let deletedValue = keychain.retrieve(for: testKey)
        #expect(deletedValue == nil)
    }

    @Test func testSearchManager() async throws {
        let searchManager = SearchManager()

        // Test search type enum
        #expect(SearchManager.SearchType.allCases.count == 5)
        #expect(SearchManager.SearchType.text.icon == "text.magnifyingglass")
        #expect(SearchManager.SearchType.semantic.icon == "brain.head.profile")

        // Test initial state
        #expect(searchManager.searchText.isEmpty)
        #expect(searchManager.searchResults.isEmpty)
        #expect(searchManager.isSearching == false)
    }

    @Test func testCoreDataModel() async throws {
        let persistenceController = PersistenceController(inMemory: true)
        let context = persistenceController.container.viewContext

        // Test Pile entity
        let pile = Pile(context: context)
        pile.id = UUID()
        pile.name = "Test Pile"
        pile.theme = "blue"
        pile.createdAt = Date()

        #expect(pile.name == "Test Pile")
        #expect(pile.theme == "blue")
        #expect(pile.id != nil)

        // Test Entry entity
        let entry = Entry(context: context)
        entry.id = UUID()
        entry.title = "Test Entry"
        entry.content = "This is a test entry"
        entry.createdAt = Date()
        entry.pile = pile

        #expect(entry.title == "Test Entry")
        #expect(entry.content == "This is a test entry")
        #expect(entry.pile == pile)

        // Test Tag entity
        let tag = Tag(context: context)
        tag.id = UUID()
        tag.name = "Test Tag"
        tag.color = "#FF0000"

        #expect(tag.name == "Test Tag")
        #expect(tag.color == "#FF0000")
    }

}
