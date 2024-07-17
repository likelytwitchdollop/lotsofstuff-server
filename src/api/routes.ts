import express from 'express'
import productsRoutes from './products/products.routes'
import usersRoutes from './users/users.routes'
import ordersRoutes from './orders/orders.routes'
import cartRoutes from './cart/cart.routes'

const router = express.Router()

router.use('/products', productsRoutes)
router.use('/users', usersRoutes)
router.use('/orders', ordersRoutes)
router.use('/cart', cartRoutes)

export default router
