import React, {useEffect, useState} from 'react'
import { useParams } from 'react-router-dom'
import App from "./App"
import {useAppDispatch, useAppSelector} from "../store"

function YaziDetay(): React.JSX.Element {
    const dispatch = useAppDispatch()
    const params = useParams()

    return <>YaziDetay
    </>
}
export default YaziDetay