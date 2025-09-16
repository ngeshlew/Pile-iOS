import SwiftUI
import CoreData

struct SearchView: View {
    let pile: Pile

    @Environment(\.dismiss) private var dismiss
    @EnvironmentObject var searchManager: SearchManager
    @EnvironmentObject var pileManager: PileManager

    @State private var searchText = ""
    @State private var selectedSearchType: SearchManager.SearchType = .text
    @State private var showingDatePicker = false
    @State private var startDate = Date().addingTimeInterval(-30 * 24 * 60 * 60) // 30 days ago
    @State private var endDate = Date()
    @State private var availableTags: [Tag] = []

    var body: some View {
        NavigationView {
            VStack(spacing: 0) {
                // Search controls
                VStack(spacing: 16) {
                    // Search type picker
                    Picker("Search Type", selection: $selectedSearchType) {
                        ForEach(SearchManager.SearchType.allCases, id: \.self) { type in
                            HStack {
                                Image(systemName: type.icon)
                                Text(type.rawValue)
                            }
                            .tag(type)
                        }
                    }
                    .pickerStyle(.segmented)

                    // Search input
                    if selectedSearchType != .date {
                        HStack {
                            Image(systemName: "magnifyingglass")
                                .foregroundColor(.secondary)

                            TextField("Search...", text: $searchText)
                                .textFieldStyle(.plain)
                                .onSubmit {
                                    performSearch()
                                }

                            if !searchText.isEmpty {
                                Button("Clear") {
                                    searchText = ""
                                    searchManager.clearSearch()
                                }
                                .font(.caption)
                            }
                        }
                        .padding()
                        .background(Color(.systemGray6))
                        .cornerRadius(10)
                    } else {
                        // Date range picker
                        VStack(spacing: 12) {
                            HStack {
                                VStack(alignment: .leading) {
                                    Text("From")
                                        .font(.caption)
                                        .foregroundColor(.secondary)
                                    DatePicker("", selection: $startDate, displayedComponents: .date)
                                        .labelsHidden()
                                }

                                Spacer()

                                VStack(alignment: .trailing) {
                                    Text("To")
                                        .font(.caption)
                                        .foregroundColor(.secondary)
                                    DatePicker("", selection: $endDate, displayedComponents: .date)
                                        .labelsHidden()
                                }
                            }

                            Button("Search Date Range") {
                                searchManager.setDateRange(startDate...endDate)
                                performSearch()
                            }
                            .buttonStyle(.borderedProminent)
                        }
                        .padding()
                        .background(Color(.systemGray6))
                        .cornerRadius(10)
                    }

                    // Tag selection for tag search
                    if selectedSearchType == .tag || selectedSearchType == .combined {
                        VStack(alignment: .leading, spacing: 8) {
                            Text("Select Tags")
                                .font(.caption)
                                .foregroundColor(.secondary)

                            ScrollView(.horizontal, showsIndicators: false) {
                                HStack(spacing: 8) {
                                    ForEach(availableTags, id: \.id) { tag in
                                        TagChipView(
                                            tag: tag,
                                            isSelected: searchManager.selectedTags.contains(where: { $0.id == tag.id })
                                        ) {
                                            toggleTag(tag)
                                        }
                                    }
                                }
                                .padding(.horizontal)
                            }
                        }
                    }
                }
                .padding()

                Divider()

                // Search results
                if searchManager.isSearching {
                    ProgressView("Searching...")
                        .frame(maxWidth: .infinity, maxHeight: .infinity)
                } else if searchManager.searchResults.isEmpty && !searchText.isEmpty {
                    emptyResultsView
                } else if searchManager.searchResults.isEmpty {
                    emptyStateView
                } else {
                    searchResultsView
                }
            }
            .navigationTitle("Search")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .navigationBarTrailing) {
                    Button("Done") {
                        dismiss()
                    }
                }
            }
        }
        .onAppear {
            searchManager.clearSearch()
            loadAvailableTags()
        }
        .onChange(of: selectedSearchType) { _, _ in
            searchManager.clearSearch()
        }
    }

    private var emptyStateView: some View {
        VStack(spacing: 24) {
            Spacer()

            Image(systemName: "magnifyingglass")
                .font(.system(size: 60))
                .foregroundColor(.gray)

            VStack(spacing: 8) {
                Text("Search Your Entries")
                    .font(.title2)
                    .fontWeight(.semibold)

                Text("Use different search types to find your entries")
                    .font(.body)
                    .foregroundColor(.secondary)
                    .multilineTextAlignment(.center)
            }

            Spacer()
        }
        .padding()
    }

    private var emptyResultsView: some View {
        VStack(spacing: 24) {
            Spacer()

            Image(systemName: "magnifyingglass")
                .font(.system(size: 50))
                .foregroundColor(.gray)

            VStack(spacing: 8) {
                Text("No Results Found")
                    .font(.title2)
                    .fontWeight(.semibold)

                Text("Try adjusting your search terms or using a different search type")
                    .font(.body)
                    .foregroundColor(.secondary)
                    .multilineTextAlignment(.center)
            }

            Spacer()
        }
        .padding()
    }

    private var searchResultsView: some View {
        List {
            ForEach(searchManager.searchResults, id: \.id) { entry in
                SearchResultRowView(entry: entry)
            }
        }
        .listStyle(.plain)
    }

    private func performSearch() {
        searchManager.selectedSearchType = selectedSearchType
        searchManager.searchText = searchText
        searchManager.performSearch(in: pile)
    }

    private func loadAvailableTags() {
        availableTags = pileManager.getAllTags()
    }

    private func toggleTag(_ tag: Tag) {
        if searchManager.selectedTags.contains(where: { $0.id == tag.id }) {
            searchManager.removeTag(tag)
        } else {
            searchManager.addTag(tag)
        }
    }
}

struct TagChipView: View {
    let tag: Tag
    let isSelected: Bool
    let onTap: () -> Void

    var body: some View {
        Button(action: onTap) {
            HStack(spacing: 4) {
                Circle()
                    .fill(Color(hex: tag.color ?? "#007AFF") ?? .blue)
                    .frame(width: 8, height: 8)

                Text(tag.name ?? "")
                    .font(.caption)
            }
            .padding(.horizontal, 12)
            .padding(.vertical, 6)
            .background(isSelected ? Color.blue.opacity(0.2) : Color(.systemGray6))
            .foregroundColor(isSelected ? .blue : .primary)
            .cornerRadius(16)
        }
        .buttonStyle(PlainButtonStyle())
    }
}

struct SearchResultRowView: View {
    let entry: Entry

    var body: some View {
        VStack(alignment: .leading, spacing: 8) {
            HStack {
                if let title = entry.title, !title.isEmpty {
                    Text(title)
                        .font(.headline)
                        .foregroundColor(.primary)
                } else {
                    Text("Untitled Entry")
                        .font(.headline)
                        .foregroundColor(.secondary)
                }

                Spacer()

                HStack(spacing: 4) {
                    if entry.isAI {
                        Image(systemName: "brain.head.profile")
                            .font(.caption)
                            .foregroundColor(.blue)
                    }

                    if entry.isReply {
                        Image(systemName: "arrowshape.turn.up.left")
                            .font(.caption)
                            .foregroundColor(.orange)
                    }
                }
            }

            if let content = entry.content {
                Text(content)
                    .font(.body)
                    .foregroundColor(.secondary)
                    .lineLimit(2)
                    .multilineTextAlignment(.leading)
            }

            HStack {
                if let createdAt = entry.createdAt {
                    Text(createdAt, style: .relative)
                        .font(.caption)
                        .foregroundColor(.secondary)
                }

                Spacer()

                if let tags = entry.tags, tags.count > 0 {
                    HStack(spacing: 4) {
                        ForEach(Array(tags as? Set<Tag> ?? Set<Tag>()).prefix(3), id: \.id) { tag in
                            Text(tag.name ?? "")
                                .font(.caption2)
                                .padding(.horizontal, 6)
                                .padding(.vertical, 2)
                                .background(Color.blue.opacity(0.2))
                                .foregroundColor(.blue)
                                .cornerRadius(4)
                        }

                        if tags.count > 3 {
                            Text("+\(tags.count - 3)")
                                .font(.caption2)
                                .foregroundColor(.secondary)
                        }
                    }
                }
            }
        }
        .padding(.vertical, 4)
    }
}

#Preview {
    SearchView(pile: Pile())
        .environmentObject(SearchManager())
        .environmentObject(PileManager())
}
