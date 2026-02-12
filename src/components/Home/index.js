import {useState, useEffect, useContext} from 'react'

import Header from '../Header'
import DishItem from '../DishItem'

import CartContext from '../../context/CartContext'

import './index.css'

const apiStatusConstants = {
  initial: 'INITIAL',
  success: 'SUCCESS',
  failure: 'FAILURE',
  inProgress: 'IN_PROGRESS',
}

const Home = () => {
  // const [isLoading, setIsLoading] = useState(true)
  const [apiStatus, setApiStatus] = useState(apiStatusConstants.initial)
  const [response, setResponse] = useState([])
  const [activeCategoryId, setActiveCategoryId] = useState('')

  const [cartItems, setCartItems] = useState([])
  const [error, setErrorMsg] = useState('')

  const {cartList, setRestaurantName} = useContext(CartContext)

  const getUpdatedData = tableMenuList =>
    tableMenuList.map(eachMenu => ({
      menuCategory: eachMenu.menu_category,
      menuCategoryId: eachMenu.menu_category_id,
      menuCategoryImage: eachMenu.menu_category_image,
      categoryDishes: eachMenu.category_dishes.map(eachDish => ({
        dishId: eachDish.dish_id,
        dishName: eachDish.dish_name,
        dishPrice: eachDish.dish_price,
        dishImage: eachDish.dish_image,
        dishCurrency: eachDish.dish_currency,
        dishCalories: eachDish.dish_calories,
        dishDescription: eachDish.dish_description,
        dishAvailability: eachDish.dish_Availability,
        dishType: eachDish.dish_Type,
        addonCat: eachDish.addonCat,
      })),
    }))

  const fetchRestaurantApi = async () => {
    setApiStatus(apiStatusConstants.inProgress)
    try {
      const api =
        'https://apis2.ccbp.in/restaurant-app/restaurant-menu-list-details'
      const apiResponse = await fetch(api)
      const data = await apiResponse.json()
      const updatedData = getUpdatedData(data[0].table_menu_list)
      setResponse(updatedData)
      setRestaurantName(data[0].restaurant_name)
      setActiveCategoryId(updatedData[0].menuCategoryId)
      setApiStatus(apiStatusConstants.success)
    } catch (err) {
      setApiStatus(apiStatusConstants.failure)
      setErrorMsg(err.message)
    }
  }

  useEffect(() => {
    fetchRestaurantApi()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const onUpdateActiveCategoryIdx = menuCategoryId =>
    setActiveCategoryId(menuCategoryId)

  const addItemToCart = dish => {
    const isAlreadyExists = cartItems.find(item => item.dishId === dish.dishId)
    if (!isAlreadyExists) {
      const newDish = {...dish, quantity: 1}
      setCartItems(prev => [...prev, newDish])
    } else {
      setCartItems(prev =>
        prev.map(item =>
          item.dishId === dish.dishId
            ? {...item, quantity: item.quantity + 1}
            : item,
        ),
      )
    }
  }

  const removeItemFromCart = dish => {
    const isAlreadyExists = cartItems.find(item => item.dishId === dish.dishId)
    if (isAlreadyExists) {
      setCartItems(prev =>
        prev
          .map(item =>
            item.dishId === dish.dishId
              ? {...item, quantity: item.quantity - 1}
              : item,
          )
          .filter(item => item.quantity > 0),
      )
    }
  }

  const renderTabMenuList = () =>
    response.map(eachCategory => (
      <li
        className={`each-tab-item ${
          eachCategory.menuCategoryId === activeCategoryId
            ? 'active-tab-item'
            : ''
        }`}
        key={eachCategory.menuCategoryId}
      >
        <button
          type="button"
          className="mt-0 mb-0 ms-2 me-2 tab-category-button"
          onClick={() => onUpdateActiveCategoryIdx(eachCategory.menuCategoryId)}
        >
          {eachCategory.menuCategory}
        </button>
      </li>
    ))

  const renderDishes = () => {
    const {categoryDishes} = response.find(
      eachCategory => eachCategory.menuCategoryId === activeCategoryId,
    )

    return (
      <ul className="m-0 d-flex flex-column dishes-list-container">
        {categoryDishes.map(eachDish => (
          <DishItem
            key={eachDish.dishId}
            dishDetails={eachDish}
            cartItems={cartItems}
            addItemToCart={addItemToCart}
            removeItemFromCart={removeItemFromCart}
          />
        ))}
      </ul>
    )
  }

  const renderSpinner = () => (
    <div className="spinner-container">
      <div className="spinner-border" role="status" />
    </div>
  )

  return (
    <div>
      {apiStatus === apiStatusConstants.inProgress && renderSpinner()}
      {apiStatus === apiStatusConstants.success && (
        <div className="home-background">
          <Header cartItems={cartList} />
          <ul className="m-0 ps-0 d-flex tab-container">
            {renderTabMenuList()}
          </ul>
          {renderDishes()}
        </div>
      )}
      {apiStatus === apiStatusConstants.failure && (
        <p className="text-warning text-center">{error}</p>
      )}
    </div>
  )
}

export default Home
