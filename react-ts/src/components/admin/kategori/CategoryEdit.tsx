import React, {useEffect, useState} from 'react'
import {NavigateFunction, useNavigate, useParams} from 'react-router-dom'
import {useAppDispatch, useAppSelector} from '../../../store'
import {
    Categories,
    Category,
    CategoryUpdateRequestDto,
    CategoryWrapperDto
} from '../../../store/types/category'
import {ErrorResponse, IState} from '../../../store/types/global'
import {isImage} from '../../../utils'
import App from '../../App'
import {fetchAllCategories, updateCategoryInCache} from "../../../store/features/category/getAllCategoriesSlice"
import app from '../../../config/app'
import {fetchUpdateCategory} from '../../../store/features/category/patchCategorySlice'
import Notification from "../../Notification"

function CategoryEdit(): React.JSX.Element {
    const params = useParams()
    const {slug} = params as unknown as { slug: string }
    const dispatch = useAppDispatch()
    const getAllCategories: IState<Categories> = useAppSelector(state => state.getAllCategories)
    const [selectedCategory, setSelectedCategory] = useState<Category | null>(null)

    const [notification, setNotification] = useState({show: false, color: "green", msg: ""})
    const navigate: NavigateFunction = useNavigate()
    const patchCategory: IState<CategoryWrapperDto> = useAppSelector(state => state.patchCategory)
    const [name, setName] = useState<string>("")
    const [image, setImage] = useState<null | File>()
    const [photo, setPhoto] = useState<string>('')
    const [base64Image, setBase64Image] = useState<string>('')
    useEffect((): void => {
        if (getAllCategories.response === null && !getAllCategories.isLoading) {
            dispatch(fetchAllCategories())
        }
    }, [getAllCategories, dispatch])
    useEffect((): void => {
        if (getAllCategories.response !== null && !getAllCategories.isLoading) {
            const category: Category = getAllCategories.response.category.filter((item: Category): boolean => item.slug === slug)[0]
            setSelectedCategory(category)
            setName(category.name)
        }
    }, [getAllCategories, slug])

    const handleSubmit = (e: any): void => {
        e.preventDefault()
        const body: CategoryUpdateRequestDto = {}
        if (name) body.name = name
        if (image) body.image = base64Image.split("base64,")[1]
        dispatch(fetchUpdateCategory({slug: slug, dto: body}))
    }
    useEffect((): void => {
        let msg : string = ""
        let color : string = ""
        if (!patchCategory.isLoading && patchCategory.response !== null) {
            dispatch(updateCategoryInCache({category: patchCategory.response.category}))
            msg = "Kategori Güncellendi."
            color = 'green'
            setPhoto('')
        } else if (!patchCategory.isLoading && patchCategory.error !== null) {
            const error: ErrorResponse = patchCategory.error.response.data as ErrorResponse
            msg = error.exception.variables.map((variable: string): string => `${error.exception.error.text}<br/> ${variable}`).join('\n')
            color = 'red'
        }
        if (msg !== "") {
            setNotification({show: true, color: color, msg: msg})
            setTimeout((): void => {
                setNotification({show: false, color: color, msg: ""})
            }, 3000)
        }
    }, [patchCategory, navigate, dispatch])
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
        {selectedCategory !== null &&
            <form onSubmit={handleSubmit} style={{maxWidth: '75%', textAlign: 'center', paddingLeft: '25%'}}>
                <input type="text" placeholder="Username" className="input" autoFocus
                        disabled={patchCategory.isLoading}
                        value={name}
                        onChange={(e): void => {
                            setName(e.target.value)
                        }}/>
                <input type="file" className="input" onChange={fileChange} disabled={patchCategory.isLoading}/>
                <img
                    src={`${app.API_BASE}${selectedCategory.image}?date=${photo}`}
                    alt={selectedCategory.name}
                    style={{width: '250px', visibility: !selectedCategory ? 'hidden' : 'visible'}}/>
                <img
                    src={photo}
                    alt={photo}
                    style={{width: '250px', visibility: photo === '' ? 'hidden' : 'visible'}}/>
                <button className="input">
                    Güncelle
                    <i className="fas fa-spinner fa-pulse"
                       style={{visibility: patchCategory.isLoading ? 'visible' : 'hidden'}}></i>
                </button>
            </form>
        }
        {notification.show && <Notification color={notification.color} message={notification.msg}/>}
    </>
}
export default CategoryEdit