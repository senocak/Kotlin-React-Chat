export interface IState<T> {
    isLoading: boolean
    response: T | null
    error: any
}

export interface IPagination {
    page: number
    size: number
    sortBy: string
    sort: string
    q?: string | null
}
