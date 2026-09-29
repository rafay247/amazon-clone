// End-to-end walk through the buying loop in a real browser.
// Usage: BASE_URL=http://localhost:3100 SHOTS=/tmp/shots node scripts/e2e.mjs
// Uses the system Chrome via playwright-core. Signs in with the demo account.
import { chromium } from "playwright-core";
import { mkdirSync } from "node:fs";

const BASE = process.env.BASE_URL ?? "http://localhost:3000";
const SHOTS = process.env.SHOTS ?? "e2e-shots";
const DEMO = { email: "demo@amazonclone.dev", password: "demo-shopper-2026" };
mkdirSync(SHOTS, { recursive: true });

const browser = await chromium.launch({ executablePath: process.env.CHROME ?? "/usr/bin/google-chrome" });
const page = await browser.newPage({ viewport: { width: 1366, height: 900 } });
const errors = [];
page.on("pageerror", (e) => errors.push(e.message));
page.on("console", (m) => m.type() === "error" && errors.push(m.text()));

let n = 0;
const shot = (name) => page.screenshot({ path: `${SHOTS}/${String(++n).padStart(2, "0")}-${name}.png` });
const step = (s) => console.log("•", s);

try {
  step("home");
  await page.goto(BASE);
  await page.getByRole("heading", { name: "Today's Deals" }).waitFor();

  step("autocomplete");
  await page.getByRole("combobox", { name: "Search", exact: true }).fill("lap");
  await page.getByRole("listbox").waitFor();
  await shot("autocomplete");
  await page.keyboard.press("Enter");
  await page.waitForURL(/\/s\?k=lap/);

  step("filter by brand + sort");
  await page.getByRole("link", { name: "Apple" }).first().click();
  await page.waitForURL(/brand=Apple/);
  await shot("results");

  step("product page");
  await page.locator("a[href^='/dp/']").first().click();
  await page.waitForURL((u) => u.pathname.startsWith("/dp/"));
  await page.getByRole("button", { name: "Add to cart" }).first().click();
  await page.getByText("Added to cart").waitFor();
  await shot("drawer");

  step("cart");
  await page.goto(`${BASE}/cart`);
  await page.getByRole("heading", { name: "Shopping Cart" }).waitFor();
  await page.getByRole("button", { name: "Increase quantity" }).first().click();
  await shot("cart");
  await page.getByRole("link", { name: "Proceed to checkout" }).click();

  step("sign in (redirected from checkout)");
  await page.waitForURL((u) => u.pathname === "/signin");
  await page.getByLabel("Email").fill(DEMO.email);
  await page.getByLabel("Password").fill(DEMO.password);
  await page.getByRole("button", { name: "Sign in" }).click();
  await page.waitForURL((u) => u.pathname === "/checkout");
  await page.getByRole("heading", { name: "Order Summary" }).waitFor();

  step("address");
  if (await page.getByText("+ Add a new delivery address").isVisible()) {
    const hasSaved = await page.getByRole("radio", { name: /./ }).first().isVisible().catch(() => false);
    if (!hasSaved) {
      await page.getByText("+ Add a new delivery address").click();
      const d = page.getByRole("dialog");
      await d.getByLabel("Phone number").fill("+1 615 555 0100");
      await d.getByPlaceholder("Street address or P.O. Box").fill("2400 Demo Street");
      await d.getByLabel("City", { exact: true }).fill("Nashville");
      await d.locator("select[name=state]").selectOption("TN");
      await d.getByLabel("ZIP Code", { exact: true }).fill("37217");
      await d.getByRole("button", { name: "Use this address" }).click();
    } else {
      await page.getByRole("button", { name: "Deliver to this address" }).first().click();
    }
  }

  step("payment");
  await page.getByPlaceholder("4242 4242 4242 4242").fill("4242 4242 4242 4242");
  await page.getByPlaceholder("MM/YY").fill("1229");
  await page.getByLabel("Security code (CVV)").fill("123");
  await page.getByRole("button", { name: "Use this payment method" }).first().click();
  await page.getByText("Visa ending in 4242").waitFor();
  await shot("checkout");

  step("place order");
  await page.getByRole("button", { name: "Place your order" }).click();
  await page.waitForURL(/\/orders\/.+\?placed=1/);
  await page.getByText("Order placed, thanks!").waitFor();
  await shot("confirmation");

  step("orders list");
  await page.goto(`${BASE}/orders`);
  await page.getByText(/order(s)? placed/).waitFor();
  await shot("orders");

  step("write review");
  await page.getByRole("link", { name: "Write a product review" }).first().click();
  await page.getByRole("button", { name: "4 stars" }).click();
  await page.getByLabel("Add a headline").fill("Does exactly what I needed");
  await page.getByLabel("Add a written review").fill("Arrived quickly and works well. Would buy again. (e2e test review)");
  await page.getByRole("button", { name: "Submit" }).click();
  await page.getByText("Review submitted").waitFor();
  await page.getByRole("link", { name: "See your review" }).click();
  await page.getByText("Does exactly what I needed").first().waitFor();
  await shot("review");

  console.log("\nPASS");
} catch (e) {
  await shot("failure");
  console.error("\nFAIL:", e.message);
  process.exitCode = 1;
} finally {
  if (errors.length) console.log("browser errors:\n  " + [...new Set(errors)].join("\n  "));
  await browser.close();
}
