import React, {useEffect, useState} from 'react'
import { Link } from 'react-router-dom'
import app from '../../../config/app'
import { useAppDispatch, useAppSelector } from '../../../store'
import {deleteCategoryInCache, fetchAllCategories } from '../../../store/features/category/getAllCategoriesSlice'
import {Categories, Category } from '../../../store/types/category'
import {ErrorResponse, IState } from '../../../store/types/global'
import App from '../../App'
import Notification from "../../Notification"
import {fetchDeleteCategory} from "../../../store/features/category/deleteCategorySlice"

function AllCategories(): React.JSX.Element {
    const dispatch = useAppDispatch()
    const getAllCategories: IState<Categories> = useAppSelector(state => state.getAllCategories)
    const deleteCategory: IState<null> = useAppSelector(state => state.deleteCategory)
    const [selectedCategory, setSelectedCategory] = useState<Category | null>(null)
    const [notification, setNotification] = useState({show: false, color: "green", msg: ""})
    useEffect((): void => {
        if (getAllCategories.response === null && !getAllCategories.isLoading) {
            dispatch(fetchAllCategories())
        }
    }, [getAllCategories, dispatch])
    useEffect((): void => {
        let msg : string = ""
        let color : string = ""
        if (deleteCategory.response !== null && !deleteCategory.isLoading && selectedCategory) {
            dispatch(deleteCategoryInCache({resourceId: selectedCategory.resourceId}))
            setSelectedCategory(null)
            msg = `Kategori Silindi.<br/>${selectedCategory.name}`
            color = 'green'
        } else if (!deleteCategory.isLoading && deleteCategory.error !== null) {
            const error: ErrorResponse = deleteCategory.error.response.data as ErrorResponse
            msg = error.exception.variables.map((variable: string): string => `${error.exception.error.text}<br/> ${variable}`).join('\n')
            color = 'red'
        }
        if (msg !== "") {
            setNotification({show: true, color: color, msg: msg});
            setTimeout((): void => {
                setNotification({show: false, color: color, msg: ""})
            }, 3000)
        }
    }, [deleteCategory, selectedCategory, dispatch])
    const delCat = (category: Category): void => {
        setSelectedCategory(category)
        if (window.confirm("Emin misin?")) {
            dispatch(fetchDeleteCategory(category.slug))
        }
    }
    return <>
        <App/>
        <main style={{maxWidth: '70rem'}}>
            <Link to={`/admin/kategoriler/ekle`} className="input" style={{textAlign: 'center'}}>Ekle</Link>
            <table className="fixed_headers">
                <thead>
                    <tr>
                        <th>Resim</th>
                        <th>İsim</th>
                        <th></th>
                    </tr>
                </thead>
                <tbody>
                {
                    (getAllCategories.response !== null && getAllCategories.response.category.length > 0) &&
                    getAllCategories.response.category.map((category: Category) =>
                        <tr key={category.slug}>
                            <td>
                                <img
                                    src={`${app.API_BASE}${category.image}`}
                                    alt={category.name}
                                    style={{width: '200px'}}
                                />
                            </td>
                            <td>{category.name}</td>
                            <td>
                                <Link
                                    to={`/admin/kategoriler/${category.slug}`}
                                    className="fa-solid fa-pen-to-square"
                                    style={{color: 'white'}}
                                />
                                <i className="fa-solid fa-trash-can"
                                    style={{float: 'right', color: 'red'}}
                                    onClick={(): void => delCat(category)}
                                ></i>
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>
        </main>
        {notification.show && <Notification color={notification.color} message={notification.msg}/>}
    </>
}
export default AllCategories