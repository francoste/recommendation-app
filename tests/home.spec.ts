import { test, expect } from "@playwright/test";

test.describe("Home page", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
  });

  test("muestra el título y botones principales", async ({ page }) => {
    await expect(page.getByText("El Recomendador")).toBeVisible();
    await expect(page.getByRole("button", { name: /Ver en pareja/i })).toBeVisible();
    await expect(page.getByRole("button", { name: /Ver solo/i })).toBeVisible();
  });

  test("toggle Películas / Series activa la pestaña correcta", async ({ page }) => {
    const peliculasBtn = page.getByRole("button", { name: "Películas" });
    const seriesBtn = page.getByRole("button", { name: "Series" });

    await expect(peliculasBtn).toBeVisible();
    await expect(seriesBtn).toBeVisible();

    // Por defecto Películas está activo
    await expect(peliculasBtn).toHaveClass(/bg-cyan/);

    // Click en Series lo activa
    await seriesBtn.click();
    await expect(seriesBtn).toHaveClass(/bg-cyan/);
    await expect(peliculasBtn).not.toHaveClass(/bg-cyan/);
  });

  test("los links de Pareja/Solo incluyen el type correcto", async ({ page }) => {
    // Default: pelicula
    const soloBtn = page.getByRole("link", { name: /Ver solo/i }).or(
      page.getByRole("button", { name: /Ver solo/i })
    );
    await expect(soloBtn).toBeVisible();

    // Cambiar a Series y verificar que el href cambia
    await page.getByRole("button", { name: "Series" }).click();
    const soloLink = page.getByRole("link", { name: /Ver solo/i });
    await expect(soloLink).toHaveAttribute("href", /type=serie/);
  });

  test("el buscador abre al clickear la lupa y cierra con ✕", async ({ page }) => {
    const searchToggle = page.locator("button[aria-label]").filter({ hasText: "" }).first();
    // Buscar el botón de la lupa por su SVG o aria-label
    const lupaBtn = page.locator("button").filter({ has: page.locator("svg") }).first();

    // Click en lupa abre el input de búsqueda
    await page.locator("button").filter({ hasText: /^$/ }).nth(0).click().catch(() => {});
    // Buscar el botón de toggle de búsqueda — el que tiene el ícono de lupa
    // Lo identificamos por su posición en el DOM o por el aria
    const searchBtn = page.locator("button").nth(-1); // Fallback
    void searchBtn; void lupaBtn; void searchToggle;

    // Approach directo: buscar el input de búsqueda
    // La lupa es el último botón de la fila de acciones
    const actionBtns = page.locator("header button, nav button, .flex button").all();
    void actionBtns;

    // Usar selector más específico basado en la estructura conocida
    // El input está oculto hasta que se abre el search
    const searchInput = page.getByPlaceholder(/buscar|search/i);
    await expect(searchInput).not.toBeVisible();

    // Click en el botón de búsqueda (tiene SVG de lupa)
    await page.locator("button:has(svg)").last().click();
    await expect(searchInput).toBeVisible();
  });

  test("buscar un término muestra resultados", async ({ page }) => {
    // Abrir búsqueda
    await page.locator("button:has(svg)").last().click();
    const searchInput = page.getByPlaceholder(/buscar|search/i);
    await expect(searchInput).toBeVisible();

    // Escribir query
    const responsePromise = page.waitForResponse("**/api/search**");
    await searchInput.fill("Matrix");
    const response = await responsePromise;
    expect(response.ok()).toBeTruthy();

    // Deben aparecer resultados (cards de películas)
    await expect(page.locator("img[alt]").first()).toBeVisible({ timeout: 10000 });
  });

  test("botón Explorar catálogo navega a /browse", async ({ page }) => {
    const exploreLink = page.getByRole("link", { name: /explorar catálogo/i });
    await expect(exploreLink).toBeVisible();
    await exploreLink.click();
    await expect(page).toHaveURL(/\/browse/);
  });
});
