export interface IState<T> {
    isLoading: boolean
    response: T | null
    error: any
}

export interface ErrorResponse {
    exception: {
        statusCode: number
        error: {
            id: string
            text: string
        };
        variables: string[]
    }
}
