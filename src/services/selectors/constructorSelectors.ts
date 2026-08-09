import { RootState } from '../store';

export const selectConstructorItems = (state: RootState) =>
  state.burgerConstructor.constructorItems;

export const selectOrderRequest = (state: RootState) =>
  state.burgerConstructor.orderRequest;

export const selectOrderModalData = (state: RootState) =>
  state.burgerConstructor.orderModalData;
