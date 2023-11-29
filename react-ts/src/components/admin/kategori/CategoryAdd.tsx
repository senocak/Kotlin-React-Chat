import React, {useEffect, useState} from 'react'
import { NavigateFunction, useNavigate } from 'react-router-dom'
import { useAppDispatch, useAppSelector } from '../../../store'
import { fetchCreateCategory } from '../../../store/features/category/createCategorySlice'
import { CategoryCreateRequestDto, CategoryWrapperDto } from '../../../store/types/category'
import {ErrorResponse, IState } from '../../../store/types/global'
import { isImage } from '../../../utils'
import App from '../../App'
import {addCategoryInCache} from "../../../store/features/category/getAllCategoriesSlice";
import Notification from "../../Notification"

function KategoriEkle(): React.JSX.Element {
    const dispatch = useAppDispatch()
    const navigate: NavigateFunction = useNavigate()
    const createCategory: IState<CategoryWrapperDto> = useAppSelector(state => state.createCategory)
    const [name, setName] = useState<string>("")
    const [image, setImage] = useState<null | File>()
    const [photo, setPhoto] = useState<string>('')
    const [base64Image, setBase64Image] = useState<string>('')
    const [notification, setNotification] = useState({show: false, color: "green", msg: ""})
    const [isRedirecting, setIsRedirecting] = useState<boolean>(false)
    const handleSubmit = (e: any): void => {
        e.preventDefault()
        if (!name || !image || !base64Image) {
            alert("Kategori İsmi veya resim boş olamaz")
            return
        }
        dispatch(fetchCreateCategory({name: name, image: base64Image.split("base64,")[1]} as CategoryCreateRequestDto))
        setIsRedirecting(true)
    }
    useEffect((): void => {
        let msg : string = ""
        let color : string = ""
        if (!createCategory.isLoading && createCategory.response !== null && isRedirecting) {
            msg = "Kategori Eklendi."
            color = 'green'
            dispatch(addCategoryInCache({category: createCategory.response.category}))
            navigate('/admin/kategoriler')
            setIsRedirecting(true)
        } else if (!createCategory.isLoading && createCategory.error !== null && isRedirecting) {
            const error: ErrorResponse = createCategory.error.response.data as ErrorResponse
            msg = error.exception.variables.map((variable: string): string => `${error.exception.error.text}<br/> ${variable}`).join('\n')
            color = 'red'
            setIsRedirecting(false)
        }
        if (msg !== "") {
            setNotification({show: true, color: color, msg: msg});
            setTimeout((): void => {
                setNotification({show: false, color: color, msg: ""})
            }, 3000)
        }
    }, [createCategory, navigate, dispatch, isRedirecting])
    useEffect((): void => {
        if (image) {
            const reader: FileReader = new FileReader()
            reader.onload = (): void => {
                setBase64Image(reader.result as string)
            }
            reader.readAsDataURL(image)
        }
    }, [image])
    const fileChange = (e: any): void => {
        if (!e.target.files || e.target.files.length === 0) {
            e.target.value = null
            setImage(null)
            setPhoto('')
            return
        }
        const file = e.target.files[0]
        if (!isImage(file)) {
            e.target.value = null
            alert("Resim olmak zorunda")
            setImage(null)
            setPhoto('')
            return
        }
        setPhoto(URL.createObjectURL(file))
        setImage(file)
    }
    
    return <>
        <App/>
        <form onSubmit={handleSubmit} style={{maxWidth: '75%', textAlign: 'center', paddingLeft: '25%'}} >
            <input type="text" placeholder="Username" className="input" autoFocus required
                disabled={isRedirecting || createCategory.isLoading}
                value={name} onChange={(e) => setName(e.target.value)}/>
            <input type="file" className="input" required onChange={fileChange} disabled={isRedirecting || createCategory.isLoading}/>
            <img src={photo} style={{width: '250px', visibility: photo === '' ? 'hidden' : 'visible'}} alt={photo}/>
            <button className="input">
                Ekle
                <i className="fas fa-spinner fa-pulse" style={{visibility: isRedirecting || createCategory.isLoading ? 'visible': 'hidden'}}></i>
            </button>
        </form>
        {notification.show && <Notification color={notification.color} message={notification.msg}/>}
    </>
}
export default KategoriEkle