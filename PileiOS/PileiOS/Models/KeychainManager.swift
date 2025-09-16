import Foundation
import Security

/// Manages secure storage of sensitive data like API keys using iOS Keychain
class KeychainManager {

    // MARK: - Public Methods

    /// Store a value securely in the keychain
    /// - Parameters:
    ///   - value: The string value to store
    ///   - key: The key to associate with the value
    func store(_ value: String, for key: String) {
        let data = value.data(using: .utf8)!
        let query: [String: Any] = [
            kSecClass as String: kSecClassGenericPassword,
            kSecAttrAccount as String: key,
            kSecValueData as String: data,
            kSecAttrAccessible as String: kSecAttrAccessibleWhenUnlockedThisDeviceOnly
        ]

        // Delete any existing item first
        SecItemDelete(query as CFDictionary)

        // Add the new item
        let status = SecItemAdd(query as CFDictionary, nil)

        if status != errSecSuccess {
            print("Keychain store error: \(status)")
        }
    }

    /// Retrieve a value from the keychain
    /// - Parameter key: The key to retrieve
    /// - Returns: The stored value, or nil if not found
    func retrieve(for key: String) -> String? {
        let query: [String: Any] = [
            kSecClass as String: kSecClassGenericPassword,
            kSecAttrAccount as String: key,
            kSecReturnData as String: true,
            kSecMatchLimit as String: kSecMatchLimitOne
        ]

        var result: AnyObject?
        let status = SecItemCopyMatching(query as CFDictionary, &result)

        guard status == errSecSuccess,
              let data = result as? Data,
              let string = String(data: data, encoding: .utf8) else {
            return nil
        }

        return string
    }

    /// Delete a value from the keychain
    /// - Parameter key: The key to delete
    func delete(for key: String) {
        let query: [String: Any] = [
            kSecClass as String: kSecClassGenericPassword,
            kSecAttrAccount as String: key
        ]

        SecItemDelete(query as CFDictionary)
    }

    /// Check if a key exists in the keychain
    /// - Parameter key: The key to check
    /// - Returns: True if the key exists, false otherwise
    func exists(for key: String) -> Bool {
        return retrieve(for: key) != nil
    }
}
