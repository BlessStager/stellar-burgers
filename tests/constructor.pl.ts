import { test, expect } from '@playwright/test';

const HAR_PATH = 'tests/hars/constructor.har';
const ORDER_NUMBER = 123456;

const MOCK_USER_RESPONSE = {
  success: true,
  user: {
    email: 'test@test.ru',
    name: 'User'
  }
};

const MOCK_CREATE_ORDER_RESPONSE = {
  success: true,
  name: 'Тестовый бургер',
  order: {
    _id: 'order-id-1',
    status: 'done',
    name: 'Тестовый заказ',
    owner: {
      name: 'Test User',
      email: 'test@test.ru',
      createdAt: '2026-01-01',
      updatedAt: '2026-01-01'
    },
    createdAt: '2026-01-01',
    updatedAt: '2026-01-01',
    number: ORDER_NUMBER,
    price: 1000
  }
};

test.describe('Конструктор бургера', () => {
  test.beforeEach(async ({ page }) => {
    await page.routeFromHAR(HAR_PATH, {
      url: '**/api/**',
      update: process.env.PW_UPDATE_HAR === '1'
    });

    await page.goto('/');

    await page.waitForResponse(
      (res) => res.url().includes('/api/ingredients') && res.status() === 200
    );

    await expect(page.locator('a[href*="/ingredients/"]').first()).toBeVisible();
  });

  test('открытие модалки ингредиента, проверка данных и закрытие по крестику', async ({
    page
  }) => {
    const ingredientLink = page.locator('a[href*="/ingredients/"]').first();

    const href = await ingredientLink.getAttribute('href');
    expect(href).toBeTruthy();

    const ingredientName = (
      await ingredientLink.locator('p.text_type_main-default').first().textContent()
    )?.trim();
    expect(ingredientName).toBeTruthy();

    await ingredientLink.click();

    await expect(page).toHaveURL(new RegExp(`${href}$`));

    const modalRoot = page.locator('#modals');
    await expect(modalRoot).toContainText('Детали ингредиента');
    await expect(modalRoot).toContainText(ingredientName as string);

    await modalRoot.locator('button[type="button"]').first().click();
    await expect(page).toHaveURL('/');
  });

  test('закрытие модалки ингредиента по клику на оверлей', async ({ page }) => {
    const ingredientLink = page.locator('a[href*="/ingredients/"]').first();
    const href = await ingredientLink.getAttribute('href');
    expect(href).toBeTruthy();

    await ingredientLink.click();
    await expect(page).toHaveURL(new RegExp(`${href}$`));

    await expect(page.locator('#modals')).toContainText('Детали ингредиента');

    const viewport = page.viewportSize();
    if (!viewport) throw new Error('Viewport is not available');

    await page.mouse.click(10, viewport.height - 10);

    await expect(page).toHaveURL('/');
  });

  test('добавление ингредиента в конструктор', async ({ page }) => {
    await expect(page.getByText('Выберите булки').first()).toBeVisible();

    await page.locator('button:has-text("Добавить")').first().click();

    await expect(page.getByText('Выберите булки')).toHaveCount(0);
  });
});

test.describe('Создание заказа', () => {
  test.beforeEach(async ({ page, context }) => {
    await page.addInitScript(() => {
      localStorage.setItem('refreshToken', 'test-refresh-token');
    });

    await context.addCookies([
      {
        name: 'accessToken',
        value: 'Bearer test-access-token',
        domain: 'localhost',
        path: '/'
      }
    ]);

    await page.routeFromHAR(HAR_PATH, {
      url: '**/api/**',
      update: process.env.PW_UPDATE_HAR === '1'
    });

    await page.route('**/api/auth/user', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(MOCK_USER_RESPONSE)
      });
    });

    await page.route('**/api/orders', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(MOCK_CREATE_ORDER_RESPONSE)
      });
    });

    await page.goto('/');

    await page.waitForResponse(
      (res) => res.url().includes('/api/ingredients') && res.status() === 200
    );
  });

  test('оформление заказа, проверка номера и очистки конструктора', async ({ page }) => {
    await page.locator('button:has-text("Добавить")').first().click();

    const orderButton = page.getByRole('button', { name: 'Оформить заказ' });
    await expect(orderButton).toBeEnabled();
    await orderButton.click();

    const modalRoot = page.locator('#modals');
    await expect(modalRoot).toContainText(String(ORDER_NUMBER));

    const bunsPlaceholders = page.getByText('Выберите булки');
    await expect(bunsPlaceholders).toHaveCount(2);
    await expect(bunsPlaceholders.first()).toBeVisible();
    await expect(bunsPlaceholders.nth(1)).toBeVisible();

    await expect(page.getByText('Выберите начинку')).toBeVisible();

    await modalRoot.locator('button[type="button"]').first().click();
    await expect(modalRoot).not.toContainText(String(ORDER_NUMBER));
  });
});
