import IStorage from './IStorage'
import TokenType from "./TokenType";

export default class LocalStorage implements IStorage {
    private LOCALE_KEY: string = 'locale'
    private ACCESS_TOKEN_KEY: string = 'token'
    private REFRESH_TOKEN_KEY: string = 'refresh_token'

    private static classInstance?: LocalStorage

    public static getInstance(): LocalStorage {
        if (!this.classInstance) {
            this.classInstance = new this()
        }
        return this.classInstance
    }

    /**
     * Get localStorage item.
     * @param key
     */
    private _getItem = (key: string): string | null => localStorage.getItem(key)

    /**
     * Set localStorage item.
     * @param key
     * @param value
     * @private
     */
    private _setItem = (key: string, value: any): void => localStorage.setItem(key, value)

    /**
     * Remove localStorage item.
     * @param key
     * @private
     */
    private _removeItem = (key: string): void => localStorage.removeItem(key)

    /**
     * Get locale.
     * @returns string
     */
    public getLocale = (): string | null => this._getItem(this.LOCALE_KEY)

    /**
     * Set locale.
     * @param locale
     */
    public setLocale = (locale: string): void => this._setItem(this.LOCALE_KEY, locale)

    /**
     * Remove locale.
     */
    public removeLocale = (): void => this._removeItem(this.LOCALE_KEY)

    /**
     * Set access token.
     */
    public getAccessToken = (): TokenType => this._getItem(this.ACCESS_TOKEN_KEY)

    /**
     * Get access token.
     * @param value
     */
    public setAccessToken = (value: string): void => this._setItem(this.ACCESS_TOKEN_KEY, value)

    /**
     * Remove access token.
     */
    public removeAccessToken = (): void => this._removeItem(this.ACCESS_TOKEN_KEY)

    /**
     * Set refresh token.
     */
    public getRefreshToken = (): TokenType => this._getItem(this.REFRESH_TOKEN_KEY)

    /**
     * Get refresh token.
     * @param value
     */
    public setRefreshToken = (value: string): void => this._setItem(this.REFRESH_TOKEN_KEY, value)

    /**
     * Remove refresh token.
     */
    public removeRefreshToken = (): void => this._removeItem(this.REFRESH_TOKEN_KEY)

    /**
     * Set tokens.
     * @param accessToken
     * @param refreshToken
     */
    public setTokens = (accessToken: string, refreshToken?: string): void => {
        this.setAccessToken(accessToken)
        if (refreshToken) {
            this.setRefreshToken(refreshToken)
        }
    }

    /**
     * Remove tokens.
     */
    public removeTokens = (): void => {
        this.removeAccessToken()
        this.removeRefreshToken()
    }
}