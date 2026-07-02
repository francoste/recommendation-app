import { test, expect } from "@playwright/test";

async function fillQuestionnaire(page: import("@playwright/test").Page) {
  // Seleccionar género (Comedia)
  await page.getByRole("button", { name: /comedia/i }).click();
  // Seleccionar duración (Corta)
  await page.getByRole("button", { name: /corta/i }).click();
  // Seleccionar origen (Cualquiera)
  await page.getByRole("button", { name: /cualquiera/i }).click();
}

test.describe("Cuestionario — flujo solo", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/questionnaire?mode=solo&person=1&type=pelicula");
  });

  test("muestra el título del cuestionario", async ({ page }) => {
    await expect(page.getByRole("heading", { name: /qué querés ver/i })).toBeVisible();
  });

  test("el botón submit está deshabilitado hasta completar todos los campos", async ({ page }) => {
    const submitBtn = page.getByRole("button", { name: /ver recomendación/i });
    await expect(submitBtn).toBeDisabled();

    // Solo género seleccionado → aún deshabilitado
    await page.getByRole("button", { name: /comedia/i }).click();
    await expect(submitBtn).toBeDisabled();

    // Género + duración → aún deshabilitado
    await page.getByRole("button", { name: /corta/i }).click();
    await expect(submitBtn).toBeDisabled();

    // Completo con origen → habilitado
    await page.getByRole("button", { name: /cualquiera/i }).click();
    await expect(submitBtn).toBeEnabled();
  });

  test("flujo completo solo lleva a /recommendations", async ({ page }) => {
    await fillQuestionnaire(page);
    const responsePromise = page.waitForResponse("**/api/recommendations**");
    await page.getByRole("button", { name: /ver recomendación/i }).click();
    await expect(page).toHaveURL(/\/recommendations/);
    await responsePromise;
    // Esperar que cargue el resultado (título visible)
    await expect(page.getByRole("heading", { name: /tu recomendación/i })).toBeVisible({ timeout: 15000 });
  });

  test("botón Volver regresa al home", async ({ page }) => {
    await page.getByRole("button", { name: /← volver/i }).click();
    await expect(page).toHaveURL("/");
  });

  test("switch a Series muestra opciones de duración de series", async ({ page }) => {
    await page.goto("/questionnaire?mode=solo&person=1&type=serie");
    await expect(page.getByRole("button", { name: /mini-serie/i })).toBeVisible();
    await expect(page.getByRole("button", { name: /largas/i })).toBeVisible();
  });
});

test.describe("Cuestionario — flujo pareja", () => {
  test("ProgressStepper muestra paso 1 de 2 en persona 1", async ({ page }) => {
    await page.goto("/questionnaire?mode=pareja&person=1&type=pelicula");
    await expect(page.getByText(/1.*2|paso 1/i).or(page.locator("[data-step]"))).toBeVisible();
  });

  test("flujo pareja completo: persona 1 → persona 2 → recommendations", async ({ page }) => {
    // Persona 1
    await page.goto("/questionnaire?mode=pareja&person=1&type=pelicula");
    await fillQuestionnaire(page);
    await page.getByRole("button", { name: /siguiente/i }).click();

    // Persona 2
    await expect(page).toHaveURL(/person=2/);
    await expect(page.getByRole("button", { name: /mini-serie|corta/i }).first()).toBeVisible();
    await fillQuestionnaire(page);

    const responsePromise = page.waitForResponse("**/api/recommendations**");
    await page.getByRole("button", { name: /ver recomendación/i }).click();
    await expect(page).toHaveURL(/\/recommendations/);
    await responsePromise;
  });

  test("back en persona 2 vuelve a persona 1", async ({ page }) => {
    await page.goto("/questionnaire?mode=pareja&person=2&type=pelicula");
    await page.getByRole("button", { name: /← volver/i }).click();
    await expect(page).toHaveURL(/person=1/);
  });

  test("llegar a persona 2 sin sessionStorage de persona 1 redirige a persona 1", async ({ page }) => {
    await page.goto("/");
    await page.evaluate(() => sessionStorage.removeItem("person1Answers"));
    await page.goto("/questionnaire?mode=pareja&person=2&type=pelicula");

    // Llenar y submitear persona 2 sin persona 1 → debe redirigir a persona 1
    await fillQuestionnaire(page);
    await page.getByRole("button", { name: /ver recomendación/i }).click();
    await expect(page).toHaveURL(/person=1/);
  });
});
