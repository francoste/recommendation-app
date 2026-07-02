import { test, expect } from "@playwright/test";

test.describe("Home page", () => {
  test.beforeEach(async ({ page }) => {
    // Mockear /api/posters evita: 1) timeout por TMDB lento, 2) 20 requests CDN de imágenes
    await page.route("**/api/posters**", (route) =>
      route.fulfill({ status: 200, contentType: "application/json", body: "[]" })
    );
    await page.goto("/");
    // data-ready="true" es seteado en un useEffect → garantiza que React hidró
    await page.waitForSelector('main[data-ready="true"]');
  });

  test("muestra el título y links principales", async ({ page }) => {
    await expect(page.getByText("EL RECOMENDADOR")).toBeVisible();
    await expect(page.getByRole("link", { name: /Ver en pareja/i })).toBeVisible();
    await expect(page.getByRole("link", { name: /Ver solo/i })).toBeVisible();
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
    await expect(page.getByRole("link", { name: /Ver solo/i })).toHaveAttribute("href", /type=pelicula/);

    // Cambiar a Series
    await page.getByRole("button", { name: "Series" }).click();
    await expect(page.getByRole("link", { name: /Ver solo/i })).toHaveAttribute("href", /type=serie/);
  });

  test("el buscador abre al clickear la lupa y cierra de nuevo", async ({ page }) => {
    const searchBtn = page.getByRole("button", { name: "Búsqueda" });
    const searchInput = page.getByPlaceholder(/buscar/i);

    await expect(searchInput).not.toBeVisible();
    await expect(searchBtn).toHaveAttribute("aria-expanded", "false");

    await searchBtn.click();
    await expect(searchInput).toBeVisible();
    await expect(searchBtn).toHaveAttribute("aria-expanded", "true");

    await searchBtn.click();
    await expect(searchInput).not.toBeVisible();
    await expect(searchBtn).toHaveAttribute("aria-expanded", "false");
  });

  test("buscar un término muestra resultados", async ({ page }) => {
    await page.getByRole("button", { name: "Búsqueda" }).click();
    const searchInput = page.getByPlaceholder(/buscar/i);
    await expect(searchInput).toBeVisible();

    const responsePromise = page.waitForResponse("**/api/search**");
    await searchInput.fill("Matrix");
    const response = await responsePromise;
    expect(response.ok()).toBeTruthy();

    // "Resultados de búsqueda para" es único para los resultados, no aparece en el carrusel
    await expect(page.getByText(/resultados de búsqueda para/i)).toBeVisible({ timeout: 10000 });
  });

  test("botón Explorar catálogo navega a /browse", async ({ page }) => {
    const exploreLink = page.getByRole("link", { name: /explorar catálogo/i });
    await expect(exploreLink).toBeVisible();
    await exploreLink.click();
    await expect(page).toHaveURL(/\/browse/);
  });
});
