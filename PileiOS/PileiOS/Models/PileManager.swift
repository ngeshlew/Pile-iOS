import Foundation
import CoreData
import SwiftUI
import Combine

/// Manages CRUD operations for Pile and Entry entities using Core Data
@MainActor
class PileManager: ObservableObject {

    // MARK: - Published Properties

    @Published var piles: [Pile] = []
    @Published var currentPile: Pile?
    @Published var isLoading = false
    @Published var errorMessage: String?

    // MARK: - Private Properties

    private let persistenceController = PersistenceController.shared
    var context: NSManagedObjectContext {
        persistenceController.container.viewContext
    }

    // MARK: - Pile Management

    func loadPiles() {
        isLoading = true
        errorMessage = nil

        let request: NSFetchRequest<Pile> = Pile.fetchRequest()
        request.sortDescriptors = [NSSortDescriptor(keyPath: \Pile.createdAt, ascending: false)]

        do {
            piles = try context.fetch(request)
        } catch {
            errorMessage = "Failed to load piles: \(error.localizedDescription)"
        }

        isLoading = false
    }

    func createPile(name: String, theme: String = "light", aiPrompt: String? = nil) -> Result<Pile, Error> {
        let pile = Pile(context: context)
        pile.id = UUID()
        pile.name = name
        pile.theme = theme
        pile.aiPrompt = aiPrompt
        pile.createdAt = Date()

        do {
            try context.save()
            piles.insert(pile, at: 0)
            return .success(pile)
        } catch {
            context.rollback()
            return .failure(error)
        }
    }

    func updatePile(_ pile: Pile, name: String? = nil, theme: String? = nil, aiPrompt: String? = nil) -> Result<Void, Error> {
        if let name = name {
            pile.name = name
        }
        if let theme = theme {
            pile.theme = theme
        }
        if let aiPrompt = aiPrompt {
            pile.aiPrompt = aiPrompt
        }

        do {
            try context.save()
            return .success(())
        } catch {
            context.rollback()
            return .failure(error)
        }
    }

    func deletePile(_ pile: Pile) -> Result<Void, Error> {
        context.delete(pile)

        do {
            try context.save()
            piles.removeAll { $0.id == pile.id }
            if currentPile?.id == pile.id {
                currentPile = nil
            }
            return .success(())
        } catch {
            context.rollback()
            return .failure(error)
        }
    }

    func setCurrentPile(_ pile: Pile) {
        currentPile = pile
    }

    // MARK: - Entry Management

    func getEntries(for pile: Pile, parentEntry: Entry? = nil) -> [Entry] {
        let request: NSFetchRequest<Entry> = Entry.fetchRequest()
        request.predicate = NSPredicate(format: "pile == %@ AND parentEntry == %@", pile, parentEntry ?? NSNull())
        request.sortDescriptors = [NSSortDescriptor(keyPath: \Entry.createdAt, ascending: false)]

        do {
            return try context.fetch(request)
        } catch {
            return []
        }
    }

    func createEntry(
        in pile: Pile,
        title: String? = nil,
        content: String,
        isAI: Bool = false,
        isReply: Bool = false,
        parentEntry: Entry? = nil,
        tags: [Tag] = []
    ) -> Result<Entry, Error> {
        let entry = Entry(context: context)
        entry.id = UUID()
        entry.title = title
        entry.content = content
        entry.isAI = isAI
        entry.isReply = isReply
        entry.createdAt = Date()
        entry.updatedAt = Date()
        entry.pile = pile
        entry.parentEntry = parentEntry

        // Add tags
        for tag in tags {
            entry.addToTags(tag)
        }

        do {
            try context.save()
            return .success(entry)
        } catch {
            context.rollback()
            return .failure(error)
        }
    }

    func updateEntry(_ entry: Entry, title: String? = nil, content: String? = nil) -> Result<Void, Error> {
        if let title = title {
            entry.title = title
        }
        if let content = content {
            entry.content = content
        }
        entry.updatedAt = Date()

        do {
            try context.save()
            return .success(())
        } catch {
            context.rollback()
            return .failure(error)
        }
    }

    func deleteEntry(_ entry: Entry) -> Result<Void, Error> {
        context.delete(entry)

        do {
            try context.save()
            return .success(())
        } catch {
            context.rollback()
            return .failure(error)
        }
    }

    // MARK: - Tag Management

    func getAllTags() -> [Tag] {
        let request: NSFetchRequest<Tag> = Tag.fetchRequest()
        request.sortDescriptors = [NSSortDescriptor(keyPath: \Tag.name, ascending: true)]

        do {
            return try context.fetch(request)
        } catch {
            return []
        }
    }

    func createTag(name: String, color: String = "#007AFF") -> Result<Tag, Error> {
        // Check if tag already exists
        let request: NSFetchRequest<Tag> = Tag.fetchRequest()
        request.predicate = NSPredicate(format: "name == %@", name)

        do {
            let existingTags = try context.fetch(request)
            if let existingTag = existingTags.first {
                return .success(existingTag)
            }
        } catch {
            return .failure(error)
        }

        let tag = Tag(context: context)
        tag.id = UUID()
        tag.name = name
        tag.color = color

        do {
            try context.save()
            return .success(tag)
        } catch {
            context.rollback()
            return .failure(error)
        }
    }

    func deleteTag(_ tag: Tag) -> Result<Void, Error> {
        context.delete(tag)

        do {
            try context.save()
            return .success(())
        } catch {
            context.rollback()
            return .failure(error)
        }
    }

    // MARK: - Attachment Management

    func addAttachment(to entry: Entry, fileName: String, filePath: String, mimeType: String, fileSize: Int64) -> Result<Attachment, Error> {
        let attachment = Attachment(context: context)
        attachment.id = UUID()
        attachment.fileName = fileName
        attachment.filePath = filePath
        attachment.mimeType = mimeType
        attachment.fileSize = fileSize
        attachment.createdAt = Date()
        attachment.entry = entry

        do {
            try context.save()
            return .success(attachment)
        } catch {
            context.rollback()
            return .failure(error)
        }
    }

    func deleteAttachment(_ attachment: Attachment) -> Result<Void, Error> {
        // Delete the actual file
        if let filePath = attachment.filePath {
            try? FileManager.default.removeItem(atPath: filePath)
        }

        context.delete(attachment)

        do {
            try context.save()
            return .success(())
        } catch {
            context.rollback()
            return .failure(error)
        }
    }

    // MARK: - Highlight Management

    func addHighlight(to entry: Entry, text: String, color: String = "#FFD700") -> Result<Highlight, Error> {
        let highlight = Highlight(context: context)
        highlight.id = UUID()
        highlight.text = text
        highlight.color = color
        highlight.createdAt = Date()
        highlight.entry = entry

        do {
            try context.save()
            return .success(highlight)
        } catch {
            context.rollback()
            return .failure(error)
        }
    }

    func deleteHighlight(_ highlight: Highlight) -> Result<Void, Error> {
        context.delete(highlight)

        do {
            try context.save()
            return .success(())
        } catch {
            context.rollback()
            return .failure(error)
        }
    }

    // MARK: - Utility Methods

    func save() {
        persistenceController.save()
    }

    func getEntryCount(for pile: Pile) -> Int {
        let request: NSFetchRequest<Entry> = Entry.fetchRequest()
        request.predicate = NSPredicate(format: "pile == %@", pile)

        do {
            return try context.count(for: request)
        } catch {
            return 0
        }
    }

    func getRecentEntries(limit: Int = 10) -> [Entry] {
        let request: NSFetchRequest<Entry> = Entry.fetchRequest()
        request.sortDescriptors = [NSSortDescriptor(keyPath: \Entry.createdAt, ascending: false)]
        request.fetchLimit = limit

        do {
            return try context.fetch(request)
        } catch {
            return []
        }
    }
}
