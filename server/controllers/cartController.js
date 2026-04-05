const pool = require('../config/db');
const { translateCardStatuses, cardStatuses } = require('../utils/cardStatuses');
const { deliveryType, translateDeliveryType } = require("../utils/deliveryEnum");
const { localeSeason, localeSize, localeStyle } = require('../utils/index');

// Добавить товар в корзину
const addToCart = async (req, res) => {
  try {
    const { userId, productId, quantity = 1 } = req.body;

    console.log('🛒 Добавление в корзину:', { userId, productId, quantity });
    console.log(userId, productId);

    if (!userId || !productId) {
      return res.status(400).json({
        success: false,
        message: 'Необходимы userId и productId'
      });
    }

    // Проверяем существование товара
    const [product] = await pool.query(
      'SELECT id, name, price, images FROM products WHERE id = ?',
      [productId]
    );

    if (product.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Товар не найден'
      });
    }

    // Добавляем или обновляем количество в корзине
    const [result] = await pool.query(
      `INSERT INTO cart_items (user_id, product_id, quantity) 
       VALUES (?, ?, ?) 
       ON DUPLICATE KEY UPDATE quantity = quantity + ?`,
      [userId, productId, quantity, quantity]
    );

    res.json({
      success: true,
      message: 'Товар добавлен в корзину',
      cartItem: {
        id: result.insertId || productId,
        productId: productId,
        quantity: quantity,
        product: product[0]
      }
    });

  } catch (error) {
    console.error('❌ Ошибка добавления в корзину:', error);
    res.status(500).json({
      success: false,
      message: 'Ошибка сервера: ' + error.message
    });
  }
};

// Обновить количество товара
const updateQuantity = async (req, res) => {
  try {
    const { userId, productId, quantity } = req.body;

    console.log('📊 Обновление количества:', { userId, productId, quantity });

    if (!userId || !productId || quantity === undefined) {
      return res.status(400).json({
        success: false,
        message: 'Необходимы userId, productId и quantity'
      });
    }

    if (quantity <= 0) {
      // Если количество 0 или меньше, удаляем товар
      return removeFromCart(req, res);
    }

    const [result] = await pool.query(
      'UPDATE cart_items SET quantity = ? WHERE user_id = ? AND product_id = ?',
      [quantity, userId, productId]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: 'Товар не найден в корзине'
      });
    }

    res.json({
      success: true,
      message: 'Количество обновлено',
      productId: productId,
      quantity: quantity
    });

  } catch (error) {
    console.error('❌ Ошибка обновления количества:', error);
    res.status(500).json({
      success: false,
      message: 'Ошибка сервера: ' + error.message
    });
  }
};

// Удалить товар из корзины
const removeFromCart = async (req, res) => {
  try {
    const { userId, productId } = req.body;

    console.log('🗑️ Удаление из корзины:', { userId, productId });

    if (!userId || !productId) {
      return res.status(400).json({
        success: false,
        message: 'Необходимы userId и productId'
      });
    }

    const [result] = await pool.query(
      'DELETE FROM cart_items WHERE user_id = ? AND product_id = ?',
      [userId, productId]
    );

    res.json({
      success: true,
      message: result.affectedRows > 0 ? 'Товар удален из корзины' : 'Товар не был в корзине',
      removed: result.affectedRows > 0,
      productId: productId
    });

  } catch (error) {
    console.error('❌ Ошибка удаления из корзины:', error);
    res.status(500).json({
      success: false,
      message: 'Ошибка сервера: ' + error.message
    });
  }
};

// Получить корзину пользователя
const getCart = async (req, res) => {
  try {
    const { userId } = req.params;

    console.log('📋 Получение корзины для пользователя:', userId);

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: 'Необходим userId'
      });
    }

    const [cartItems] = await pool.query(`
      SELECT 
        ci.product_id as id,
        ci.quantity,
        ci.id as cart_id,
        p.name,
        p.price,
        p.description,
        p.images,
        p.category_id,
        p.in_stock,
        c.name as category_name
      FROM cart_items ci
      JOIN products p ON ci.product_id = p.id
      LEFT JOIN categories c ON p.category_id = c.id
      WHERE ci.user_id = ?
      ORDER BY ci.created_at DESC
    `, [userId]);

    // Форматируем данные
    const formattedCart = cartItems.map(item => {
      let images = ['/images/placeholder-flower.jpg'];
      try {
        if (item.images) {
          const parsed = JSON.parse(item.images);
          images = Array.isArray(parsed) ? parsed : [parsed];
        }
      } catch (e) {
        console.log('Ошибка парсинга images:', e.message);
      }

      return {
        id: item.id,
        cart_id: item.cart_id,
        name: item.name,
        price: parseFloat(item.price) || 0,
        quantity: item.quantity,
        description: item.description || 'Красивый букет для особого момента',
        image: images[0],
        images: images,
        category: { name: item.category_name || "Букеты" },
        in_stock: Boolean(item.in_stock)
      };
    });

    // Рассчитываем итоги
    const subtotal = formattedCart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const totalItems = formattedCart.reduce((sum, item) => sum + item.quantity, 0);

    res.json({
      success: true,
      data: formattedCart,
      subtotal: subtotal,
      totalItems: totalItems,
      count: formattedCart.length
    });

  } catch (error) {
    console.error('❌ Ошибка получения корзины:', error);
    res.status(500).json({
      success: false,
      message: 'Ошибка сервера: ' + error.message
    });
  }
};

const allCartsToAdmin = async (req, res) => {
  try {
    const responseCarts = [];
    const { page = 1, limit = 5 } = req.query;

    const [allCountCarts] = await pool.query('SELECT COUNT(id) as count FROM orders');

    const [carts] = await pool.query(`
      SELECT
        o.id AS id,
        o.quantity,
        o.created_at,
        o.updated_at,
        o.is_buy,
        o.status,
        o.type_delivery,
        o.price,
        CONCAT(u.first_name, ' ', u.last_name) as user_name,
        u.phone,
        p.id as product_id,
        p.name AS product_name,
        p.description AS product_description,
        p.season,
        p.style,
        p.size,
        p.type,
        p.tags
      FROM orders AS o
      LEFT JOIN users AS u ON u.id_user = o.user_id
      LEFT JOIN products AS p ON p.id = o.product_id 
      LIMIT ? OFFSET ?
    `, [Number(limit), Number((+page - 1) * +limit)]);

    // Связка записей
    carts.forEach(cart => {
      const includedCart = responseCarts.findIndex(inCart => inCart.id == cart.id);
      if (includedCart === -1) {
        responseCarts.push(
          {
            id: cart.id,
            quantity: cart.quantity,
            created_at: cart.created_at,
            updated_at: cart.updated_at,
            is_buy: cart.is_buy,
            status: translateCardStatuses[cart.status],
            status_base: cart.status,
            type_delivery: translateDeliveryType[cart.type_delivery],
            price: cart.price,
            username: cart.user_name,
            product: 
              {
                id: cart.product_id,
                name: cart.product_name,
                description: cart.product_description,
                season: localeSeason(cart.season),
                style: localeStyle(cart.style),
                size: localeSize(cart.size),
                type: cart.type,
                tags: cart.tags ?? []
              }
          }
        )
      }
    })

    return res.status(200).json({ data: responseCarts, page, limit, total: allCountCarts[0].count });
  } catch (e) {
    console.log(e)
    return res.status(400).json({ data: [] });
  }
}

const updateCartsFromAdmin = async (req, res) => {
  try {
    const data = req.body;
    if (!Array.isArray(data)) {
      return res.status(400).json({ updated: false });
    }

    for (const cart of data) {
      if (cart.id == null) continue;

      const sets = [];
      const paramsValues = [];

      if (cart.status != null && cart.status !== '') {
        sets.push('status = ?');
        paramsValues.push(cart.status);
      }
      if (cart.type_delivery != null && cart.type_delivery !== '') {
        sets.push('type_delivery = ?');
        paramsValues.push(cart.type_delivery);
      }
      if (cart.is_buy !== undefined && cart.is_buy !== null && cart.is_buy !== '') {
        sets.push('is_buy = ?');
        paramsValues.push(cart.is_buy === '0' || cart.is_buy === 0 ? 0 : 1);
      }

      const date = new Date();
      const mysqlDatetime = date.toISOString().replace('T', ' ').replace(/\.\d+Z$/, '');

      sets.push('updated_at = ?')
      paramsValues.push(mysqlDatetime);

      if (sets.length === 0) continue;

      paramsValues.push(cart.id);
      await pool.query(`UPDATE orders SET ${sets.join(', ')} WHERE id = ?`, paramsValues);
    }

    return res.status(200).json({ updated: true });
  } catch (e) {
    console.error(e);
    return res.status(400).json({ updated: false });
  }
};

const buyProductFromCart = async (req, res) => {
  const { cartId } = req.params;
  const { type_delivery, price } = req.query;
  const userId = req.user?.userId;

  if (!userId) {
    return res.status(401).json({ message: 'error', success: false });
  }

  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    const [rows] = await connection.query(
      'SELECT id, user_id, product_id, quantity FROM cart_items WHERE id = ? AND user_id = ?',
      [cartId, userId]
    );

    if (rows.length === 0) {
      await connection.rollback();
      return res.status(404).json({ message: 'not found', success: false });
    }

    const row = rows[0];
    const date = new Date();
    const mysqlDatetime = date.toISOString().replace('T', ' ').replace(/\.\d+Z$/, '');

    await connection.query(
      `INSERT INTO orders (user_id, product_id, quantity, price, type_delivery, status, is_buy, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        row.user_id,
        row.product_id,
        row.quantity,
        price,
        type_delivery,
        cardStatuses.delivery,
        1,
        mysqlDatetime,
        mysqlDatetime
      ]
    );

    await connection.query('DELETE FROM cart_items WHERE id = ?', [cartId]);
    await connection.commit();
    return res.json({ message: 'success' });
  } catch (e) {
    await connection.rollback();
    console.error('buyProductFromCart:', e);
    return res.status(500).json({ message: 'error' });
  } finally {
    connection.release();
  }
};

// Очистить корзину
const clearCart = async (req, res) => {
  try {
    const { userId } = req.body;

    console.log('🧹 Очистка корзины для пользователя:', userId);

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: 'Необходим userId'
      });
    }

    const [result] = await pool.query(
      'DELETE FROM cart_items WHERE user_id = ?',
      [userId]
    );

    res.json({
      success: true,
      message: `Корзина очищена, удалено ${result.affectedRows} товаров`,
      clearedCount: result.affectedRows
    });

  } catch (error) {
    console.error('❌ Ошибка очистки корзины:', error);
    res.status(500).json({
      success: false,
      message: 'Ошибка сервера: ' + error.message
    });
  }
};

module.exports = {
  addToCart,
  updateQuantity,
  removeFromCart,
  getCart,
  clearCart,
  allCartsToAdmin,
  buyProductFromCart,
  updateCartsFromAdmin
};