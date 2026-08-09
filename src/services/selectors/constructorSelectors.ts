import { RootState } from '../store';
import { TConstructorIngredient } from '../../utils/types';

const emptyConstructor = {
  bun: null as TConstructorIngredient | null,
  ingredients: [] as TConstructorIngredient[]
};

export const selectConstructorItems = (state: RootState) =>
  state.burgerConstructor?.constructorItems ?? emptyConstructor;

export const selectOrderRequest = (state: RootState) =>
  state.burgerConstructor?.orderRequest ?? false;

export const selectOrderModalData = (state: RootState) =>
  state.burgerConstructor?.orderModalData ?? null;
