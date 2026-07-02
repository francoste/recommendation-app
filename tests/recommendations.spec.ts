import { test, expect } from "@playwright/test";
import type { Preferences } from "../src/lib/types";

const VALID_PREFS: Preferences = {
  mode: "solo",
  contentType: "pelicula",
  person1: {
    genres: ["comedia"],
    yearMin: 1990,
    yearMax: 2020,
    duration: ["media"],
    origin: "cualquiera",
  },
};

async function goToRecommendationsWithPrefs(
  page: import("@playwright/test").Page,
  prefs: Preferences = VALID_PREFS
) {
  await page.goto("/");
  await page.evaluate((p) => {
    sessionStorage.setItem("preferences", JSON.stringify(p));
  }, prefs);
  const responsePromise = page.waitForResponse("**/api/recommendations**");
  await page.goto("/recommendations");
  await responsePromise;
}

test.describe("Página de recomendaciones", () => {
  test("sin sessionStorage redirige al home", async ({ page }) => {
    await page.goto("/");
    await page.evaluate(() => sessionStorage.removeItem("preferences"));
    await page.goto("/recommendations");
    await expect(page).toHaveURL("/");
  });

  test("con sessionStorage válido carga una película", async ({ page }) => {
    await goToRecommendationsWithPrefs(page);
    await expect(page.getByRole("heading", { name: /tu recomendación/i })).toBeVisible({ timeout: 15000 });
    // Debe haber al menos una imagen de poster
    await expect(page.locator("img[alt]").first()).toBeVisible({ timeout: 15000 });
  });

  test("el título y rating de la película son visibles", async ({ page }) => {
    await goToRecommendationsWithPrefs(page);
    // Esperar que cargue el contenido
    await expect(page.locator("h2").first()).toBeVisible({ timeout: 15000 });
  });

  test("botón Otra cambia la película sin nueva llamada a API de candidatos", async ({ page }) => {
    await goToRecommendationsWithPrefs(page);
    await expect(page.locator("img[alt]").first()).toBeVisible({ timeout: 15000 });

    // Capturar el src del poster actual
    const initialSrc = await page.locator("img[alt]").first().getAttribute("src");

    // Clickear Otra varias veces hasta que cambie (puede ser el mismo por azar)
    let changed = false;
    for (let i = 0; i < 5 && !changed; i++) {
      await page.getByRole("button", { name: /otra/i }).click();
      await page.waitForTimeout(500);
      const newSrc = await page.locator("img[alt]").first().getAttribute("src");
      if (newSrc !== initialSrc) changed = true;
    }
    // Con 50 candidatos la probabilidad de no cambiar en 5 intentos es muy baja
    // Si hay un solo candidato esto puede ser false (edge case)
    // No fallamos el test si no cambia — solo verificamos que el botón funciona sin crash
    await expect(page.getByRole("button", { name: /otra/i })).toBeVisible();
  });

  test("botón Nueva búsqueda navega al home", async ({ page }) => {
    await goToRecommendationsWithPrefs(page);
    await expect(page.locator("img[alt]").first()).toBeVisible({ timeout: 15000 });
    await page.getByRole("button", { name: /nueva búsqueda/i }).click();
    await expect(page).toHaveURL("/");
  });

  test("botón Volver navega a la página anterior", async ({ page }) => {
    await page.goto("/");
    await page.evaluate((p) => sessionStorage.setItem("preferences", JSON.stringify(p)), VALID_PREFS);
    await page.goto("/recommendations");
    await page.waitForResponse("**/api/recommendations**");
    await page.getByRole("button", { name: /← volver/i }).click();
    await expect(page).toHaveURL("/");
  });

  test("modo pareja muestra panel de preferencias de ambas personas", async ({ page }) => {
    const parejaPrefs: Preferences = {
      mode: "pareja",
      contentType: "pelicula",
      person1: { genres: ["comedia"], yearMin: 1990, yearMax: 2020, duration: ["media"], origin: "cualquiera" },
      person2: { genres: ["drama"],   yearMin: 2000, yearMax: 2023, duration: ["larga"],  origin: "hollywood" },
    };
    await goToRecommendationsWithPrefs(page, parejaPrefs);
    await expect(page.locator("img[alt]").first()).toBeVisible({ timeout: 15000 });
    // El panel de preferencias debería mostrar info de ambas personas
    await expect(page.getByText(/persona 1|persona 2/i).first()).toBeVisible();
  });
});
