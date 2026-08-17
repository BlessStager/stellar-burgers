import { test, expect } from '@playwright/test';

const HAR_PATH = 'tests/hars/constructor.har';

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

    await expect(
      page.locator('a[href*="/ingredients/"]').first()
    ).toBeVisible();
  });

  test('открытие модалки ингредиента, проверка данных и закрытие по крестику', async ({
    page
  }) => {
    const ingredientLink = page.locator('a[href*="/ingredients/"]').first();

    const href = await ingredientLink.getAttribute('href');
    expect(href).toBeTruthy();

    const ingredientName = (
      await ingredientLink
        .locator('p.text_type_main-default')
        .first()
        .textContent()
    )?.trim();
    expect(ingredientName).toBeTruthy();

    await ingredientLink.click();

    await expect(page).toHaveURL(new RegExp(`${href}$`));

    const modalRoot = page.locator('#modals');
    await expect(modalRoot).toContainText('Детали ингредиента');
    await expect(modalRoot).toContainText(ingredientName as string);

    await modalRoot.locator('button[type="button"]').first().click();
    await expect(page).toHaveURL('/');
    await expect(modalRoot).not.toContainText('Детали ингредиента');
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
    await expect(page.locator('#modals')).not.toContainText(
      'Детали ингредиента'
    );
  });

  test('добавление ингредиента в конструктор', async ({ page }) => {
    const constructorRoot = page
      .locator('section')
      .filter({ has: page.getByRole('button', { name: 'Оформить заказ' }) })
      .first();

    await expect(
      constructorRoot.getByText('Выберите булки').first()
    ).toBeVisible();

    const firstIngredientNameElement = page
      .locator('a[href*="/ingredients/"] p.text_type_main-default')
      .first();
    const ingredientName = (
      await firstIngredientNameElement.textContent()
    )?.trim();
    expect(ingredientName).toBeTruthy();

    await page.locator('button:has-text("Добавить")').first().click();

    await expect(constructorRoot.getByText('Выберите булки')).toHaveCount(0);

    await expect(constructorRoot).toContainText(ingredientName as string);
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

    await page.goto('/');

    await page.waitForResponse(
      (res) => res.url().includes('/api/ingredients') && res.status() === 200
    );
  });

  test('оформление заказа, проверка номера и очистки конструктора', async ({
    page
  }) => {
    const constructorRoot = page
      .locator('section')
      .filter({ has: page.getByRole('button', { name: 'Оформить заказ' }) })
      .first();

    const addButtons = page.locator('button:has-text("Добавить")');

    await addButtons.first().click();
    await addButtons.nth(2).click();

    await expect(constructorRoot.getByText('Выберите булки')).toHaveCount(0);
    await expect(constructorRoot.getByText('Выберите начинку')).toHaveCount(0);

    const orderButton = constructorRoot.getByRole('button', {
      name: 'Оформить заказ'
    });

    const orderResponsePromise = page.waitForResponse(
      (res) =>
        res.url().includes('/api/orders') &&
        res.request().method() === 'POST' &&
        res.status() === 200
    );

    await orderButton.click();

    const orderResponse = await orderResponsePromise;
    const orderData = await orderResponse.json();
    const orderNumber = orderData.order.number;

    const modalRoot = page.locator('#modals');
    await expect(modalRoot).toContainText(String(orderNumber));

    const bunsPlaceholders = constructorRoot.getByText('Выберите булки');
    await expect(bunsPlaceholders).toHaveCount(2);
    await expect(bunsPlaceholders.first()).toBeVisible();
    await expect(bunsPlaceholders.nth(1)).toBeVisible();

    await expect(constructorRoot.getByText('Выберите начинку')).toBeVisible();

    await modalRoot.locator('button[type="button"]').first().click();
    await expect(modalRoot).not.toContainText(String(orderNumber));
  });
});
