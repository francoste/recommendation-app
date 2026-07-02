import { test, expect } from "@playwright/test";

// data-ready="true" es seteado en un useEffect de QuestionnaireClient
// → solo aparece en el DOM después de que React hidró y adjuntó los onClick handlers
async function waitForHydration(page: import("@playwright/test").Page) {
  await page.waitForSelector('main[data-ready="true"]', { timeout: 15000 });
}

async function fillQuestionnaire(
  page: import("@playwright/test").Page,
  contentType: "pelicula" | "serie" = "pelicula"
) {
  await waitForHydration(page);

  // Comedia está disponible para ambos tipos de contenido
  await page.getByRole("button", { name: /comedia/i }).click();
  await expect(page.getByRole("button", { name: /comedia/i })).toHaveAttribute("aria-pressed", "true");

  // Duración según tipo: Corta para películas, Mini-serie para series
  const durationLabel = contentType === "serie" ? /mini-serie/i : /corta/i;
  await page.getByRole("button", { name: durationLabel }).click();
  await expect(page.getByRole("button", { name: durationLabel })).toHaveAttribute("aria-pressed", "true");

  // Origen: Cualquiera (igual para ambos tipos)
  await page.getByRole("button", { name: /cualquiera/i }).click();
  await expect(page.getByRole("button", { name: /cualquiera/i })).toHaveAttribute("aria-pressed", "true");
}

test.describe("Cuestionario — flujo solo", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/questionnaire?mode=solo&person=1&type=pelicula");
    await waitForHydration(page);
  });

  test("muestra el título del cuestionario", async ({ page }) => {
    await expect(page.getByRole("heading", { name: /qué querés ver/i })).toBeVisible();
  });

  test("el botón submit está deshabilitado hasta completar todos los campos", async ({ page }) => {
    const submitBtn = page.getByRole("button", { name: /ver recomendación/i });
    await expect(submitBtn).toBeDisabled();

    await page.getByRole("button", { name: /comedia/i }).click();
    await expect(page.getByRole("button", { name: /comedia/i })).toHaveAttribute("aria-pressed", "true");
    await expect(submitBtn).toBeDisabled();

    await page.getByRole("button", { name: /corta/i }).click();
    await expect(page.getByRole("button", { name: /corta/i })).toHaveAttribute("aria-pressed", "true");
    await expect(submitBtn).toBeDisabled();

    await page.getByRole("button", { name: /cualquiera/i }).click();
    await expect(page.getByRole("button", { name: /cualquiera/i })).toHaveAttribute("aria-pressed", "true");
    await expect(submitBtn).toBeEnabled();
  });

  test("flujo completo solo lleva a /recommendations", async ({ page }) => {
    await fillQuestionnaire(page);
    await page.getByRole("button", { name: /ver recomendación/i }).click();
    await expect(page).toHaveURL(/\/recommendations/, { timeout: 10000 });
    await expect(page.getByRole("heading", { name: /tu recomendación/i })).toBeVisible({ timeout: 20000 });
  });

  test("botón Volver regresa al home", async ({ page }) => {
    await page.getByRole("button", { name: /← volver/i }).click();
    await expect(page).toHaveURL("/");
  });

  test("switch a Series muestra opciones de duración de series", async ({ page }) => {
    await page.goto("/questionnaire?mode=solo&person=1&type=serie");
    await page.waitForLoadState("networkidle");
    await expect(page.getByRole("button", { name: /mini-serie/i })).toBeVisible();
    await expect(page.getByRole("button", { name: /largas/i })).toBeVisible();
  });
});

test.describe("Cuestionario — flujo pareja", () => {
  test("ProgressStepper muestra Persona 1 en paso 1", async ({ page }) => {
    await page.goto("/questionnaire?mode=pareja&person=1&type=pelicula");
    await waitForHydration(page);
    await expect(page.getByText("Persona 1")).toBeVisible();
  });

  test("flujo pareja completo: persona 1 → persona 2 → recommendations", async ({ page }) => {
    // Persona 1
    await page.goto("/questionnaire?mode=pareja&person=1&type=pelicula");
    await fillQuestionnaire(page);
    await page.getByRole("button", { name: /siguiente/i }).click();

    // Persona 2: navegación client-side (mismo componente, in-place)
    // Esperar heading de persona 2 y confirmar que useEffect([person]) reinició el estado
    await expect(page).toHaveURL(/person=2/, { timeout: 5000 });
    await expect(page.getByRole("heading", { name: /y la otra persona/i })).toBeVisible();
    await expect(page.getByRole("button", { name: /comedia/i })).toHaveAttribute("aria-pressed", "false");
    await fillQuestionnaire(page);
    await page.getByRole("button", { name: /ver recomendación/i }).click();
    await expect(page).toHaveURL(/\/recommendations/, { timeout: 10000 });
    await expect(page.getByRole("heading", { name: /tu recomendación/i })).toBeVisible({ timeout: 20000 });
  });

  test("back en persona 2 vuelve a persona 1", async ({ page }) => {
    await page.goto("/questionnaire?mode=pareja&person=2&type=pelicula");
    await waitForHydration(page);
    await page.getByRole("button", { name: /← volver/i }).click();
    await expect(page).toHaveURL(/person=1/);
  });

  test("llegar a persona 2 sin sessionStorage de persona 1 redirige a persona 1", async ({ page }) => {
    await page.goto("/");
    await page.evaluate(() => sessionStorage.removeItem("person1Answers"));
    await page.goto("/questionnaire?mode=pareja&person=2&type=pelicula");
    await fillQuestionnaire(page);
    await page.getByRole("button", { name: /ver recomendación/i }).click();
    await expect(page).toHaveURL(/person=1/, { timeout: 5000 });
  });
});
