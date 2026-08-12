import { TIngredient } from '../../utils/types';
import { fetchIngredients, ingredientsReducer } from './ingredientsSlice';

describe('ingredients reducer', () => {
  const mockIngredients: TIngredient[] = [
    {
      _id: '1',
      name: 'Булка',
      type: 'bun',
      proteins: 10,
      fat: 20,
      carbohydrates: 30,
      calories: 40,
      price: 100,
      image: 'img',
      image_mobile: 'img_m',
      image_large: 'img_l'
    }
  ];

  it('должен вернуть initial state для UNKNOWN action', () => {
    const state = ingredientsReducer(undefined, { type: 'UNKNOWN' });
    expect(state).toEqual({
      items: [],
      isLoading: false,
      error: null
    });
  });

  it('должен обработать fetchIngredients.pending', () => {
    const prevState = {
      items: [],
      isLoading: false,
      error: 'old error'
    };

    const state = ingredientsReducer(prevState, {
      type: fetchIngredients.pending.type
    });

    expect(state).toEqual({
      items: [],
      isLoading: true,
      error: null
    });
  });

  it('должен обработать fetchIngredients.fulfilled', () => {
    const prevState = {
      items: [],
      isLoading: true,
      error: null
    };

    const state = ingredientsReducer(prevState, {
      type: fetchIngredients.fulfilled.type,
      payload: mockIngredients
    });

    expect(state).toEqual({
      items: mockIngredients,
      isLoading: false,
      error: null
    });
  });

  it('должен обработать fetchIngredients.rejected', () => {
    const prevState = {
      items: [],
      isLoading: true,
      error: null
    };

    const state = ingredientsReducer(prevState, {
      type: fetchIngredients.rejected.type,
      payload: 'Ошибка загрузки ингредиентов'
    });

    expect(state).toEqual({
      items: [],
      isLoading: false,
      error: 'Ошибка загрузки ингредиентов'
    });
  });
});
