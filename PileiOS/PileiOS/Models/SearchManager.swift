import Foundation
import CoreData
import SwiftUI
import Combine

/// Manages search functionality including text, semantic, tag, and date-based search
@MainActor
class SearchManager: ObservableObject {

    // MARK: - Published Properties

    @Published var searchText = ""
    @Published var searchResults: [Entry] = []
    @Published var isSearching = false
    @Published var searchError: String?
    @Published var selectedSearchType: SearchType = .text
    @Published var selectedTags: [Tag] = []
    @Published var dateRange: ClosedRange<Date>?

    // MARK: - Private Properties

    private let pileManager: PileManager
    private let aiManager: AIManager

    // MARK: - Search Types

    enum SearchType: String, CaseIterable {
        case text = "Text"
        case semantic = "Semantic"
        case tag = "Tag"
        case date = "Date Range"
        case combined = "Combined"

        var icon: String {
            switch self {
            case .text: return "text.magnifyingglass"
            case .semantic: return "brain.head.profile"
            case .tag: return "tag"
            case .date: return "calendar"
            case .combined: return "magnifyingglass.circle"
            }
        }

        var description: String {
            switch self {
            case .text: return "Search entry content and titles"
            case .semantic: return "AI-powered semantic search"
            case .tag: return "Search by tags"
            case .date: return "Search by date range"
            case .combined: return "Combine multiple search types"
            }
        }
    }

    // MARK: - Initialization

    init(pileManager: PileManager? = nil, aiManager: AIManager? = nil) {
        self.pileManager = pileManager ?? PileManager()
        self.aiManager = aiManager ?? AIManager()
    }

    // MARK: - Text Search

    func searchEntries(in pile: Pile, query: String) {
        guard !query.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty else {
            searchResults = []
            return
        }

        isSearching = true
        searchError = nil

        let request: NSFetchRequest<Entry> = Entry.fetchRequest()
        request.predicate = NSPredicate(
            format: "pile == %@ AND (content CONTAINS[cd] %@ OR title CONTAINS[cd] %@)",
            pile, query, query
        )
        request.sortDescriptors = [
            NSSortDescriptor(keyPath: \Entry.createdAt, ascending: false)
        ]

        do {
            searchResults = try pileManager.context.fetch(request)
        } catch {
            searchError = "Search failed: \(error.localizedDescription)"
            searchResults = []
        }

        isSearching = false
    }

    // MARK: - Semantic Search

    func semanticSearch(in pile: Pile, query: String) async {
        guard !query.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty else {
            searchResults = []
            return
        }

        isSearching = true
        searchError = nil

        do {
            // Generate embedding for the search query
            let queryEmbeddingResult = await aiManager.generateEmbedding(for: query)
            
            guard case .success(let queryEmbedding) = queryEmbeddingResult else {
                searchError = "Failed to generate embedding for search query"
                isSearching = false
                return
            }
            
            // Get all entries with embeddings
            let request: NSFetchRequest<Entry> = Entry.fetchRequest()
            request.predicate = NSPredicate(format: "pile == %@ AND embedding != nil", pile)

            let allEntries = try pileManager.context.fetch(request)

            // Calculate similarity scores
            var scoredEntries: [(Entry, Float)] = []

            for entry in allEntries {
                if let embedding = entry.embedding {
                    let similarity = cosineSimilarity(queryEmbedding, embedding)
                    scoredEntries.append((entry, similarity))
                }
            }

            // Sort by similarity score (highest first)
            scoredEntries.sort { $0.1 > $1.1 }

            // Filter results with similarity above threshold
            let threshold: Float = 0.7
            searchResults = scoredEntries
                .filter { $0.1 >= threshold }
                .map { $0.0 }

        } catch {
            searchError = "Semantic search failed: \(error.localizedDescription)"
            searchResults = []
        }

        isSearching = false
    }

    // MARK: - Tag Search

    func searchByTags(in pile: Pile, tags: [Tag]) {
        guard !tags.isEmpty else {
            searchResults = []
            return
        }

        isSearching = true
        searchError = nil

        let request: NSFetchRequest<Entry> = Entry.fetchRequest()
        request.predicate = NSPredicate(format: "pile == %@ AND ANY tags IN %@", pile, tags)
        request.sortDescriptors = [
            NSSortDescriptor(keyPath: \Entry.createdAt, ascending: false)
        ]

        do {
            searchResults = try pileManager.context.fetch(request)
        } catch {
            searchError = "Tag search failed: \(error.localizedDescription)"
            searchResults = []
        }

        isSearching = false
    }

    // MARK: - Date Range Search

    func searchByDateRange(in pile: Pile, startDate: Date, endDate: Date) {
        isSearching = true
        searchError = nil

        let request: NSFetchRequest<Entry> = Entry.fetchRequest()
        request.predicate = NSPredicate(
            format: "pile == %@ AND createdAt >= %@ AND createdAt <= %@",
            pile, startDate as NSDate, endDate as NSDate
        )
        request.sortDescriptors = [
            NSSortDescriptor(keyPath: \Entry.createdAt, ascending: false)
        ]

        do {
            searchResults = try pileManager.context.fetch(request)
        } catch {
            searchError = "Date search failed: \(error.localizedDescription)"
            searchResults = []
        }

        isSearching = false
    }

    // MARK: - Combined Search

    func combinedSearch(in pile: Pile, query: String? = nil, tags: [Tag] = [], dateRange: ClosedRange<Date>? = nil) {
        isSearching = true
        searchError = nil

        var predicates: [NSPredicate] = []

        // Base predicate for pile
        predicates.append(NSPredicate(format: "pile == %@", pile))

        // Text search predicate
        if let query = query, !query.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty {
            predicates.append(NSPredicate(
                format: "content CONTAINS[cd] %@ OR title CONTAINS[cd] %@",
                query, query
            ))
        }

        // Tag search predicate
        if !tags.isEmpty {
            predicates.append(NSPredicate(format: "ANY tags IN %@", tags))
        }

        // Date range predicate
        if let dateRange = dateRange {
            predicates.append(NSPredicate(
                format: "createdAt >= %@ AND createdAt <= %@",
                dateRange.lowerBound as NSDate, dateRange.upperBound as NSDate
            ))
        }

        let request: NSFetchRequest<Entry> = Entry.fetchRequest()
        request.predicate = NSCompoundPredicate(andPredicateWithSubpredicates: predicates)
        request.sortDescriptors = [
            NSSortDescriptor(keyPath: \Entry.createdAt, ascending: false)
        ]

        do {
            searchResults = try pileManager.context.fetch(request)
        } catch {
            searchError = "Combined search failed: \(error.localizedDescription)"
            searchResults = []
        }

        isSearching = false
    }

    // MARK: - Search Execution

    func performSearch(in pile: Pile) {
        switch selectedSearchType {
        case .text:
            searchEntries(in: pile, query: searchText)
        case .semantic:
            Task {
                await semanticSearch(in: pile, query: searchText)
            }
        case .tag:
            searchByTags(in: pile, tags: selectedTags)
        case .date:
            if let dateRange = dateRange {
                searchByDateRange(in: pile, startDate: dateRange.lowerBound, endDate: dateRange.upperBound)
            }
        case .combined:
            combinedSearch(in: pile, query: searchText, tags: selectedTags, dateRange: dateRange)
        }
    }

    // MARK: - Utility Methods

    func clearSearch() {
        searchText = ""
        searchResults = []
        searchError = nil
        selectedTags = []
        dateRange = nil
    }

    func setDateRange(_ range: ClosedRange<Date>) {
        dateRange = range
    }

    func addTag(_ tag: Tag) {
        if !selectedTags.contains(where: { $0.id == tag.id }) {
            selectedTags.append(tag)
        }
    }

    func removeTag(_ tag: Tag) {
        selectedTags.removeAll { $0.id == tag.id }
    }

    // MARK: - Helper Methods

    private func cosineSimilarity(_ a: [Float], _ b: [Float]) -> Float {
        guard a.count == b.count else { return 0.0 }

        let dotProduct = zip(a, b).map(*).reduce(0, +)
        let magnitudeA = sqrt(a.map { $0 * $0 }.reduce(0, +))
        let magnitudeB = sqrt(b.map { $0 * $0 }.reduce(0, +))

        guard magnitudeA > 0 && magnitudeB > 0 else { return 0.0 }

        return dotProduct / (magnitudeA * magnitudeB)
    }

    // MARK: - Search Suggestions

    func getSearchSuggestions(for pile: Pile) -> [String] {
        let request: NSFetchRequest<Entry> = Entry.fetchRequest()
        request.predicate = NSPredicate(format: "pile == %@", pile)
        request.propertiesToFetch = ["title"]
        request.returnsDistinctResults = true

        do {
            let entries = try pileManager.context.fetch(request)
            return entries.compactMap { $0.title }
                .filter { !$0.isEmpty }
                .prefix(10)
                .map { $0 }
        } catch {
            return []
        }
    }

    func getPopularTags(for pile: Pile) -> [Tag] {
        let request: NSFetchRequest<Tag> = Tag.fetchRequest()
        request.predicate = NSPredicate(format: "ANY entries.pile == %@", pile)

        do {
            let tags = try pileManager.context.fetch(request)
            // Sort by number of entries (most used first)
            return tags.sorted { tag1, tag2 in
                let count1 = tag1.entries?.count ?? 0
                let count2 = tag2.entries?.count ?? 0
                return count1 > count2
            }
        } catch {
            return []
        }
    }
}
