const productModel = require('../models/productsModel');

const addToCart = (req, res) => {
    const { productId } = req.body;
    const user = req.session.user;
    if (!req.session.cart) {
        req.session.cart = {};
    }

    if (!req.session.cart[user.username]) {
        req.session.cart[user.username] = [];
    }

    const cart = req.session.cart[user.username];
    const existingProduct = cart.find(item => item.productId === productId);

    if (existingProduct) {
        existingProduct.quantity += 1;
    } else {
        cart.push({ productId, quantity: 1 });
    }

    res.json({ message: 'Product added to cart successfully!' });
};

const displayCartPage = async (req, res) => {
    const user = req.session.user;
    const cart = (req.session.cart && req.session.cart[user.username]) || [];
    const productIds = cart.map(item => item.productId);
    const products = await productModel.getProductsByIds(productIds);

    const cartItems = cart.map(item => {
        const product = products.find(p => p.id === item.productId);
        return {
            productId: item.productId,
            productName: product.name,
            quantity: item.quantity,
            price: product.price,
            imageUrl: product.imageUrl,
            totalPrice: product.price * item.quantity
        };
    });

    const totalPrice = cartItems.reduce((acc, item) => acc + item.totalPrice, 0);

    res.render('index', {
        content: 'cart_page',
        cart: cartItems,
        totalPrice: totalPrice,
        user: req.session.user
    });
};

const updateCartQuantity = (req, res) => {
    const { productId, action } = req.body;
    const user = req.session.user;
    const cart = req.session.cart[user.username];

    const item = cart.find(i => i.productId === productId);

    if (item) {
        if (action === 'increase') {
            item.quantity += 1;
        } else if (action === 'decrease' && item.quantity > 1) {
            item.quantity -= 1;
        }
        res.json({ success: true });
    } else {
        res.json({ success: false, message: 'Product not found in cart' });
    }
};

const removeFromCart = (req, res) => {
    const { productId } = req.body;
    const user = req.session.user;
    let cart = req.session.cart[user.username];

    cart = cart.filter(item => item.productId !== productId);

    req.session.cart[user.username] = cart;

    res.json({ success: true });
};

module.exports = { addToCart, displayCartPage, updateCartQuantity, removeFromCart };
