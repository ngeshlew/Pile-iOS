import SwiftUI
import CoreData

struct EntriesView: View {
    let pile: Pile

    @EnvironmentObject var pileManager: PileManager
    @State private var entries: [Entry] = []
    @State private var isLoading = false

    var body: some View {
        NavigationView {
            Group {
                if isLoading {
                    ProgressView("Loading entries...")
                        .frame(maxWidth: .infinity, maxHeight: .infinity)
                } else if entries.isEmpty {
                    emptyStateView
                } else {
                    entriesListView
                }
            }
            .navigationTitle("Entries")
            .navigationBarTitleDisplayMode(.large)
            .refreshable {
                await loadEntries()
            }
        }
        .onAppear {
            loadEntries()
        }
    }

    private var emptyStateView: some View {
        VStack(spacing: 24) {
            Spacer()

            Image(systemName: "book.closed")
                .font(.system(size: 60))
                .foregroundColor(.gray)

            VStack(spacing: 8) {
                Text("No Entries Yet")
                    .font(.title2)
                    .fontWeight(.semibold)

                Text("Start writing your first entry to begin your reflective journey")
                    .font(.body)
                    .foregroundColor(.secondary)
                    .multilineTextAlignment(.center)
            }

            Spacer()
        }
        .padding()
    }

    private var entriesListView: some View {
        List {
            ForEach(entries, id: \.id) { entry in
                EntryRowView(entry: entry) {
                    // Handle entry tap - navigate to entry detail
                }
            }
            .onDelete(perform: deleteEntries)
        }
        .listStyle(.plain)
    }

    private func loadEntries() {
        isLoading = true
        entries = pileManager.getEntries(for: pile)
        isLoading = false
    }

    private func deleteEntries(offsets: IndexSet) {
        for index in offsets {
            let entry = entries[index]
            _ = pileManager.deleteEntry(entry)
        }
        loadEntries()
    }
}

struct EntryRowView: View {
    let entry: Entry
    let onTap: () -> Void

    @State private var showingDeleteAlert = false

    var body: some View {
        Button(action: onTap) {
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
                        .lineLimit(3)
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
        .buttonStyle(PlainButtonStyle())
        .contextMenu {
            Button("Delete", role: .destructive) {
                showingDeleteAlert = true
            }
        }
        .alert("Delete Entry", isPresented: $showingDeleteAlert) {
            Button("Cancel", role: .cancel) { }
            Button("Delete", role: .destructive) {
                // Handle deletion
            }
        } message: {
            Text("Are you sure you want to delete this entry? This action cannot be undone.")
        }
    }
}

#Preview {
    EntriesView(pile: Pile())
        .environmentObject(PileManager())
}
