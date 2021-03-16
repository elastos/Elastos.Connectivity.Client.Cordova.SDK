export const enum HiveCreationStatus {
    VAULT_NOT_CREATED = 0, // Vault was not created yet
    VAULT_CREATED_AND_VERIFIED = 1, // Vault was created and an API call was made to try to contact it
}