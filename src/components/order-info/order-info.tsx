import { FC, useEffect, useMemo, useRef } from 'react';
import { Preloader } from '../ui/preloader';
import { OrderInfoUI } from '../ui/order-info';
import { TIngredient } from '@utils-types';
import { useParams } from 'react-router-dom';
import { useDispatch, useSelector } from '../../services/store';
import { fetchOrderByNumber } from '../../services/slices/feedSlice';

import { selectIngredients } from '../../services/selectors/ingredientsSelectors';
import {
  selectFeedOrders,
  selectOrderLoading,
  selectSelectedOrder
} from '../../services/selectors/feedSelectors';
import { selectProfileOrders } from '../../services/selectors/profileOrdersSelectors';

export const OrderInfo: FC = () => {
  const { number } = useParams<{ number: string }>();
  const orderNumber = Number(number);

  const dispatch = useDispatch();

  const feedOrders = useSelector(selectFeedOrders);
  const profileOrders = useSelector(selectProfileOrders);
  const selectedOrder = useSelector(selectSelectedOrder);
  const isOrderLoading = useSelector(selectOrderLoading);
  const ingredients = useSelector(selectIngredients);

  const orderData =
    feedOrders.find((order) => order.number === orderNumber) ||
    profileOrders.find((order) => order.number === orderNumber) ||
    (selectedOrder && selectedOrder.number === orderNumber
      ? selectedOrder
      : null);

  const requestedOrderRef = useRef<number | null>(null);

  useEffect(() => {
    if (!Number.isFinite(orderNumber)) return;
    if (orderData) return;
    if (isOrderLoading) return;
    if (requestedOrderRef.current === orderNumber) return;

    requestedOrderRef.current = orderNumber;
    dispatch(fetchOrderByNumber(orderNumber));
  }, [dispatch, orderData, isOrderLoading, orderNumber]);

  /* Готовим данные для отображения */
  const orderInfo = useMemo(() => {
    if (!orderData || !ingredients.length) return null;

    const date = new Date(orderData.createdAt);

    type TIngredientsWithCount = {
      [key: string]: TIngredient & { count: number };
    };

    const ingredientsInfo = orderData.ingredients.reduce(
      (acc: TIngredientsWithCount, item) => {
        if (!acc[item]) {
          const ingredient = ingredients.find((ing) => ing._id === item);
          if (ingredient) {
            acc[item] = {
              ...ingredient,
              count: 1
            };
          }
        } else {
          acc[item].count++;
        }

        return acc;
      },
      {}
    );

    const total = Object.values(ingredientsInfo).reduce(
      (acc, item) => acc + item.price * item.count,
      0
    );

    return {
      ...orderData,
      ingredientsInfo,
      date,
      total
    };
  }, [orderData, ingredients]);

  if (!ingredients.length || (!orderData && isOrderLoading)) {
    return <Preloader />;
  }

  if (!orderData && !isOrderLoading) {
    return <div>Заказ не найден</div>;
  }

  if (!orderInfo) {
    return <Preloader />;
  }

  return <OrderInfoUI orderInfo={orderInfo} />;
};
