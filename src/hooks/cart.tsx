import React, {
  createContext,
  useState,
  useCallback,
  useContext,
  useEffect,
} from 'react';

import AsyncStorage from '@react-native-community/async-storage';

interface Product {
  id: string;
  title: string;
  image_url: string;
  price: number;
  quantity: number;
}

interface CartContext {
  products: Product[];
  addToCart(item: Omit<Product, 'quantity'>): void;
  increment(id: string): void;
  decrement(id: string): void;
}

const CartContext = createContext<CartContext | null>(null);

const CartProvider: React.FC = ({ children }) => {
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    async function loadProducts(): Promise<void> {
      // TODO LOAD ITEMS FROM ASYNC STORAGE
      const productsStored = await AsyncStorage.getItem(
        '@GoMarketplace:products',
      );
      if (productsStored) {
        setProducts([...JSON.parse(productsStored)]);
      }
    }

    loadProducts();
  }, []);

  const addToCart = useCallback(
    async product => {
      // const products  = await AsyncStorage.setItem('@GoMarketplace:key','@GoMarketplace:products')
      // TODO ADD A NEW ITEM TO THE CART
      // VERIFICAR SE O PRODUTO EXISTE,AI ADD +1 NO QUANTITY ,SE NAO ADD O PRODUTO(OBJETO) TODO
      // find = RETORNA VALOR ACHADO
      const productExist = products.find(p => product.id === p.id);

      if (productExist) {
        // set´products com spread operator pra pegar todo resto e so atualizar o quantity
        // tem q mapear todo carrinho carai
        setProducts(
          products.map(p =>
            p.id === product.id ? { ...p, quantity: p.quantity + 1 } : p,
          ),
        );
      } else {
        setProducts([...products, { ...product, quantity: 1 }]);
      }

      await AsyncStorage.setItem(
        '@GoMarketplace:products',
        JSON.stringify(products),
      );
    },
    [products],
  );

  const increment = useCallback(
    async id => {
      // TODO INCREMENTS A PRODUCT QUANTITY IN THE CART
      const novosProdutos = products.map(p =>
        p.id === id ? { ...p, quantity: p.quantity + 1 } : p,
      );
      setProducts(novosProdutos);

      await AsyncStorage.setItem(
        '@GoMarketplace:products',
        JSON.stringify(novosProdutos),
      );
    },
    [products],
  );

  const decrement = useCallback(
    async id => {
      // TODO DECREMENTS A PRODUCT QUANTITY IN THE CART
      // FALTA FAZER A PARTE QUE REDUZIR PRA 0 RETIRA ELE DO CARRINHO
      const novosProdutos = products.map(p =>
        p.id === id && p.quantity > 0 ? { ...p, quantity: p.quantity - 1 } : p,
      );
      const nProducts = novosProdutos.filter(p => {
        return p.quantity > 0;
      });
      setProducts(nProducts);

      await AsyncStorage.setItem(
        '@GoMarketplace:products',
        JSON.stringify(nProducts),
      );
    },
    [products],
  );

  const value = React.useMemo(
    () => ({ addToCart, increment, decrement, products }),
    [products, addToCart, increment, decrement],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

function useCart(): CartContext {
  const context = useContext(CartContext);

  if (!context) {
    throw new Error(`useCart must be used within a CartProvider`);
  }

  return context;
}

export { CartProvider, useCart };
