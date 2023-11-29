import { useDispatch, TypedUseSelectorHook, useSelector } from 'react-redux'
import { configureStore } from '@reduxjs/toolkit'
import { reduxBatch } from '@manaflair/redux-batch'
import { createLogger } from 'redux-logger'
import app from '../config/app'
import reducer from "./reducers";

const logger = createLogger({
    predicate: () => app.ENV !== 'production',
})

const store = configureStore({
    reducer,
    middleware: getDefaultMiddleware => getDefaultMiddleware({ serializableCheck: false }).concat(logger),
    devTools: true,
    enhancers: [reduxBatch]
})

export default store

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch

export const useAppDispatch = () => useDispatch<AppDispatch>()
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector
