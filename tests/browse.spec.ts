import { test, expect } from "@playwright/test";

test.describe("Browse page", () => {
  test.beforeEach(async ({ page }) => {
    const responsePromise = page.waitForResponse("**/api/browse**");
    await page.goto("/browse?type=pelicula");
    await responsePromise;
  });

  test("muestra título y resultados iniciales", async ({ page }) => {
    await expect(page.getByRole("heading", { name: /explorar/i })).toBeVisible();
    // Debe haber al menos un poster
    await expect(page.locator("img[alt]").first()).toBeVisible({ timeout: 10000 });
  });

  test("seleccionar género dispara nueva búsqueda", async ({ page }) => {
    const responsePromise = page.waitForResponse("**/api/browse**");
    await page.getByRole("button", { name: /género/i }).click();
    // Abrir dropdown y seleccionar Comedia
    await page.getByText("Comedia 😂").click();
    await responsePromise;
    // El botón de Género debería mostrar el género activo
    await expect(page.getByRole("button", { name: /comedia/i })).toBeVisible();
  });

  test("seleccionar plataforma dispara nueva búsqueda", async ({ page }) => {
    const responsePromise = page.waitForResponse("**/api/browse**");
    await page.getByRole("button", { name: /plataforma/i }).click();
    await page.getByText("Netflix").click();
    await responsePromise;
    await expect(page.getByRole("button", { name: /netflix/i })).toBeVisible();
  });

  test("botón Limpiar aparece con filtros activos y los resetea", async ({ page }) => {
    // Sin filtros → no hay botón Limpiar
    await expect(page.getByRole("button", { name: /limpiar/i })).not.toBeVisible();

    // Seleccionar un género
    const responsePromise = page.waitForResponse("**/api/browse**");
    await page.getByRole("button", { name: /género/i }).click();
    await page.getByText("Drama 🎭").click();
    await responsePromise;

    // Aparece Limpiar
    await expect(page.getByRole("button", { name: /limpiar/i })).toBeVisible();

    // Click Limpiar → desaparece
    const resetPromise = page.waitForResponse("**/api/browse**");
    await page.getByRole("button", { name: /limpiar/i }).click();
    await resetPromise;
    await expect(page.getByRole("button", { name: /limpiar/i })).not.toBeVisible();
  });

  test("click en poster abre MovieDetailModal", async ({ page }) => {
    // Esperar que haya resultados
    await expect(page.locator("img[alt]").first()).toBeVisible({ timeout: 10000 });
    // Click en el primer poster
    await page.locator("img[alt]").first().click();
    // El modal debe aparecer (tiene sinopsis y botón de cierre)
    await expect(page.locator("button[aria-label*='errar']").or(page.getByRole("button", { name: "✕" }))).toBeVisible({ timeout: 5000 });
  });

  test("botón ✕ del modal lo cierra", async ({ page }) => {
    await expect(page.locator("img[alt]").first()).toBeVisible({ timeout: 10000 });
    await page.locator("img[alt]").first().click();
    // Cerrar con ✕
    const closeBtn = page.getByRole("button", { name: "✕" }).or(page.locator("button").filter({ hasText: "✕" }));
    await closeBtn.click();
    await expect(closeBtn).not.toBeVisible();
  });

  test("Escape cierra el modal", async ({ page }) => {
    await expect(page.locator("img[alt]").first()).toBeVisible({ timeout: 10000 });
    await page.locator("img[alt]").first().click();
    const closeBtn = page.getByRole("button", { name: "✕" }).or(page.locator("button").filter({ hasText: "✕" }));
    await expect(closeBtn).toBeVisible({ timeout: 5000 });
    await page.keyboard.press("Escape");
    await expect(closeBtn).not.toBeVisible();
  });

  test("tipo Serie muestra géneros de series", async ({ page }) => {
    await page.goto("/browse?type=serie");
    await page.waitForResponse("**/api/browse**");
    await expect(page.getByRole("heading", { name: /series/i })).toBeVisible();
    // Abrir dropdown de géneros y verificar que hay géneros TV-only
    await page.getByRole("button", { name: /género/i }).click();
    await expect(page.getByText(/reality|western|bélico/i).first()).toBeVisible();
  });
});
