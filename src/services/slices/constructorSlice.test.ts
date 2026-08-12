import { TConstructorIngredient, TOrder } from '../../utils/types';
import {
  addIngredient,
  clearOrderModal,
  constructorReducer,
  createOrder,
  moveIngredientDown,
  moveIngredientUp,
  removeIngredient
} from './constructorSlice';

const makeIngredient = (
  id: string,
  type: 'bun' | 'main' | 'sauce' = 'main'
): TConstructorIngredient => ({
  _id: `api-${id}`,
  name: `ingredient-${id}`,
  type,
  proteins: 1,
  fat: 1,
  carbohydrates: 1,
  calories: 1,
  price: 100,
  image: 'img',
  image_mobile: 'img_m',
  image_large: 'img_l',
  id: `uuid-${id}`
});

describe('burgerConstructor reducer', () => {
  it('должен вернуть initial state для UNKNOWN action', () => {
    const state = constructorReducer(undefined, { type: 'UNKNOWN' });

    expect(state).toEqual({
      constructorItems: {
        bun: null,
        ingredients: []
      },
      orderRequest: false,
      orderModalData: null
    });
  });

  it('должен добавлять/заменять булку через addIngredient', () => {
    const bun1 = makeIngredient('bun1', 'bun');
    const bun2 = makeIngredient('bun2', 'bun');

    let state = constructorReducer(undefined, addIngredient(bun1));
    state = constructorReducer(state, addIngredient(bun2));

    expect(state.constructorItems.bun?._id).toBe(bun2._id);
    expect(state.constructorItems.ingredients).toHaveLength(0);
  });

  it('должен добавлять начинку/соус через addIngredient', () => {
    const main = makeIngredient('main1', 'main');
    const sauce = makeIngredient('sauce1', 'sauce');

    let state = constructorReducer(undefined, addIngredient(main));
    state = constructorReducer(state, addIngredient(sauce));

    expect(state.constructorItems.ingredients).toHaveLength(2);
    expect(state.constructorItems.ingredients[0]._id).toBe(main._id);
    expect(state.constructorItems.ingredients[1]._id).toBe(sauce._id);
  });

  it('должен удалять ингредиент через removeIngredient', () => {
    const first = makeIngredient('1');
    const second = makeIngredient('2');

    let state = constructorReducer(undefined, addIngredient(first));
    state = constructorReducer(state, addIngredient(second));
    state = constructorReducer(state, removeIngredient(first.id));

    expect(state.constructorItems.ingredients).toHaveLength(1);
    expect(state.constructorItems.ingredients[0].id).toBe(second.id);
  });

  it('должен перемещать ингредиент вверх через moveIngredientUp', () => {
    const a = makeIngredient('a');
    const b = makeIngredient('b');
    const c = makeIngredient('c');

    let state = constructorReducer(undefined, addIngredient(a));
    state = constructorReducer(state, addIngredient(b));
    state = constructorReducer(state, addIngredient(c));

    state = constructorReducer(state, moveIngredientUp(2));

    expect(state.constructorItems.ingredients.map((i) => i.id)).toEqual([
      a.id,
      c.id,
      b.id
    ]);
  });

  it('должен перемещать ингредиент вниз через moveIngredientDown', () => {
    const a = makeIngredient('a');
    const b = makeIngredient('b');
    const c = makeIngredient('c');

    let state = constructorReducer(undefined, addIngredient(a));
    state = constructorReducer(state, addIngredient(b));
    state = constructorReducer(state, addIngredient(c));

    state = constructorReducer(state, moveIngredientDown(0));

    expect(state.constructorItems.ingredients.map((i) => i.id)).toEqual([
      b.id,
      a.id,
      c.id
    ]);
  });

  it('должен очищать модалку заказа через clearOrderModal', () => {
    const order: TOrder = {
      _id: 'ord-1',
      status: 'done',
      name: 'Test order',
      createdAt: '2024-01-01',
      updatedAt: '2024-01-01',
      number: 123,
      ingredients: ['1', '2']
    };

    let state = constructorReducer(undefined, {
      type: createOrder.fulfilled.type,
      payload: order
    });
    state = constructorReducer(state, clearOrderModal());

    expect(state.orderModalData).toBeNull();
  });

  it('должен обработать createOrder.pending', () => {
    const state = constructorReducer(undefined, {
      type: createOrder.pending.type
    });

    expect(state.orderRequest).toBe(true);
  });

  it('должен обработать createOrder.fulfilled', () => {
    const bun = makeIngredient('bun', 'bun');
    const main = makeIngredient('main');

    let state = constructorReducer(undefined, addIngredient(bun));
    state = constructorReducer(state, addIngredient(main));

    const payload: TOrder = {
      _id: 'ord-1',
      status: 'done',
      name: 'Test order',
      createdAt: '2024-01-01',
      updatedAt: '2024-01-01',
      number: 777,
      ingredients: [bun._id, main._id, bun._id]
    };

    state = constructorReducer(state, {
      type: createOrder.fulfilled.type,
      payload
    });

    expect(state.orderRequest).toBe(false);
    expect(state.orderModalData).toEqual(payload);
    expect(state.constructorItems.bun).toBeNull();
    expect(state.constructorItems.ingredients).toHaveLength(0);
  });

  it('должен обработать createOrder.rejected', () => {
    let state = constructorReducer(undefined, {
      type: createOrder.pending.type
    });

    state = constructorReducer(state, {
      type: createOrder.rejected.type
    });

    expect(state.orderRequest).toBe(false);
  });
});
