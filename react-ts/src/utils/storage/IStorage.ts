import TokenType from "./TokenType";

export default interface IStorage {
    getLocale(): string | null
    setLocale(locale: string): void
    getAccessToken(): TokenType | null
    setAccessToken(value: string): void
    removeAccessToken(): void
    getRefreshToken(): TokenType | null
    setRefreshToken(value: string): void
    removeRefreshToken(): void
    setTokens(accessToken: string, refreshToken?: string): void
    removeTokens(): void
}
