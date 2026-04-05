import { createContext, useContext, useState, useEffect } from 'react';
import { api } from "../utils/apiConfig";

const CartContext = createContext();

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

export const CartProvider = ({ children, userId }) => {
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const loadCart = async () => {
    if (!userId) {
      console.log('⚠️ userId не предоставлен, пропускаем загрузку корзины');
      const localCart = localStorage.getItem('localCart');
      if (localCart) {
        setCartItems(JSON.parse(localCart));
      }
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      console.log(`🔄 Загрузка корзины для пользователя ${userId}...`);
      const response = await api.get(`/cart/user/${userId}`);
      
      if (!response.status > 300) {
        throw new Error(`Ошибка сервера: ${response.status}`);
      }
      
      const result = await response.data;
      
      if (result.success) {
        setCartItems(result.data || []);
        console.log(`✅ Загружено ${result.data?.length || 0} позиций в корзине`);
      } else {
        throw new Error(result.message || 'Ошибка при загрузке корзины');
      }
    } catch (error) {
      console.error('❌ Ошибка загрузки корзины:', error);
      setError(error.message);
      setCartItems([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCart();
  }, [userId]);

  useEffect(() => {
    if (!userId) {
      localStorage.setItem('localCart', JSON.stringify(cartItems));
    }
  }, [cartItems, userId]);

  const addToCart = async (product, quantity = 1) => {
    if (product.isCustom) {
      setCartItems(prev => {
        const existingItemIndex = prev.findIndex(item => item.isCustom && item.id === product.id);
        
        if (existingItemIndex >= 0) {
          const updatedItems = [...prev];
          updatedItems[existingItemIndex] = {
            ...updatedItems[existingItemIndex],
            quantity: updatedItems[existingItemIndex].quantity + quantity
          };
          return updatedItems;
        } else {
          return [...prev, {
            ...product,
            quantity: quantity
          }];
        }
      });
      
      console.log(`✅ Кастомный букет "${product.name}" добавлен в корзину`);
      return true;
    }

    if (!userId) {
      setCartItems(prev => {
        const existingItemIndex = prev.findIndex(item => item.id === product.id);
        
        if (existingItemIndex >= 0) {
          const updatedItems = [...prev];
          updatedItems[existingItemIndex] = {
            ...updatedItems[existingItemIndex],
            quantity: updatedItems[existingItemIndex].quantity + quantity
          };
          return updatedItems;
        } else {
          return [...prev, {
            id: product.id,
            name: product.name,
            price: product.price,
            quantity: quantity,
            description: product.description,
            image: product.image || product.images?.[0],
            images: product.images,
            category: product.category,
            in_stock: product.in_stock,
            isCustom: false
          }];
        }
      });
      
      console.log(`✅ Товар "${product.name}" добавлен в локальную корзину`);
      return true;
    }

    try {
      setLoading(true);
      setError(null);
      
      console.log(`➕ Добавление товара ${product.id} в корзину...`);
      const response = await api.post(`/cart/add`, JSON.stringify({
          userId: userId,
          productId: product.id,
          quantity: quantity
        }), {
        headers: {
          'Content-Type': 'application/json',
        }
      });

      const result = await response.data;
      
      if (result.success) {
        await loadCart();
        console.log(`✅ Товар "${product.name}" добавлен в корзину`);
        return true;
      } else {
        throw new Error(result.message || 'Ошибка при добавлении в корзину');
      }
    } catch (error) {
      console.error('❌ Ошибка добавления в корзину:', error);
      setError(error.message);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const updateQuantity = async (productId, quantity) => {
    const isCustomProduct = typeof productId === 'string' && productId.startsWith('custom-');
    
    if (isCustomProduct) {
      setCartItems(prev => {
        if (quantity <= 0) {
          return prev.filter(item => item.id !== productId);
        }
        return prev.map(item => 
          item.id === productId ? { ...item, quantity: quantity } : item
        );
      });
      return true;
    }

    if (!userId) {
      setCartItems(prev => {
        if (quantity <= 0) {
          return prev.filter(item => item.id !== productId);
        }
        return prev.map(item => 
          item.id === productId ? { ...item, quantity: quantity } : item
        );
      });
      return true;
    }

    try {
      setLoading(true);
      setError(null);
      
      console.log(`📊 Обновление количества товара ${productId} до ${quantity}...`);
      const response = await api.post(`/cart/update`, JSON.stringify({
          userId: userId,
          productId: productId,
          quantity: quantity
        }),
      {
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const result = await response.data;
      
      if (result.success) {
        await loadCart();
        return true;
      } else {
        throw new Error(result.message || 'Ошибка при обновлении количества');
      }
    } catch (error) {
      console.error('❌ Ошибка обновления количества:', error);
      setError(error.message);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const removeFromCart = async (productId) => {
    const isCustomProduct = typeof productId === 'string' && productId.startsWith('custom-');
    
    if (isCustomProduct) {
      setCartItems(prev => prev.filter(item => item.id !== productId));
      return true;
    }

    if (!userId) {
      setCartItems(prev => prev.filter(item => item.id !== productId));
      return true;
    }

    try {
      setLoading(true);
      setError(null);
      
      console.log(`➖ Удаление товара ${productId} из корзины...`);
      const response = await api.post(`/cart/remove`, JSON.stringify({
          userId: userId,
          productId: productId
        }),
      {
        headers: {
          'Content-Type': 'application/json',
        }
      });

      const result = await response.data;
      
      if (result.success) {
        await loadCart();
        return true;
      } else {
        throw new Error(result.message || 'Ошибка при удалении из корзины');
      }
    } catch (error) {
      console.error('❌ Ошибка удаления из корзины:', error);
      setError(error.message);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const clearCart = async () => {
    if (!userId) {
      setCartItems([]);
      localStorage.removeItem('localCart');
      return true;
    }

    try {
      setLoading(true);
      setError(null);
      
      console.log(`🗑️ Очистка корзины...`);
      const response = await api.post(`/cart/clear`, JSON.stringify({
          userId: userId
        }),
      {
        headers: {
          'Content-Type': 'application/json',
        }
      });

      const result = await response.data;
      
      if (result.success) {
        setCartItems([]);
        console.log(`✅ Корзина очищена`);
        return true;
      } else {
        throw new Error(result.message || 'Ошибка при очистке корзины');
      }
    } catch (error) {
      console.error('❌ Ошибка очистки корзины:', error);
      setError(error.message);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const buyCart = async (cartId, typeDelivery, price) => {
      const params = new URLSearchParams({ type_delivery: typeDelivery, price: price });
      const req = await api.post(`/cart/buy/${cartId}?${params.toString()}`, {
      });
      console.log(await req.data);
  }

  const calculateSubtotal = () => {
    return cartItems.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  const getCartItemsCount = () => {
    return cartItems.length; 
  };

  const getTotalQuantity = () => {
    return cartItems.reduce((total, item) => total + item.quantity, 0);
  };

  const isInCart = (productId) => {
    return cartItems.some(item => item.id === productId);
  };

  const getItemQuantity = (productId) => {
    const item = cartItems.find(item => item.id === productId);
    return item ? item.quantity : 0;
  };

  const refreshCart = () => {
    loadCart();
  };

  const clearError = () => {
    setError(null);
  };

  const value = {
    cartItems,
    loading,
    error,
    
    addToCart,
    updateQuantity,
    removeFromCart,
    clearCart,
    
    calculateSubtotal,
    getCartItemsCount, 
    getTotalQuantity,  
    isInCart,
    getItemQuantity,
    refreshCart,
    clearError,
    buyCart,
    
    userId
  };

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
};