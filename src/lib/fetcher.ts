import { Browser, Builder } from "selenium-webdriver";
import type { Flight } from "./types";

const API_URL = "https://www.kazan.aero/json/dld.json";

function extractAuthCookie(html: string): string | null {
	const match = html.match(/document\.cookie\s*=\s*['"]realauth=([^'"]+)['"]/);
	return match?.[1] ?? null;
}

async function fetchWithCookie(): Promise<Flight[]> {
	const initial = await fetch(API_URL, {
		headers: {
			"User-Agent":
				"Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36",
		},
	});

	const html = await initial.text();
	const authToken = extractAuthCookie(html);

	if (!authToken) {
		throw new Error("Не удалось извлечь cookie realauth из ответа API");
	}

	const response = await fetch(API_URL, {
		headers: {
			Cookie: `realauth=${authToken}`,
			"User-Agent":
				"Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36",
		},
	});

	const text = await response.text();

	try {
		const data = JSON.parse(text) as Flight[];
		if (!Array.isArray(data)) {
			throw new Error("Ответ API не является массивом");
		}
		return data;
	} catch {
		throw new Error("Ответ API не является валидным JSON");
	}
}

async function fetchWithSelenium(): Promise<Flight[]> {
	const driver = await new Builder().forBrowser(Browser.FIREFOX).build();

	try {
		await driver.get("https://www.kazan.aero/on-line-schedule/");

		const flights = (await driver.executeAsyncScript(`
			const callback = arguments[arguments.length - 1];
			fetch("${API_URL}")
				.then(res => res.json())
				.then(data => callback(data))
				.catch(() => callback(null));
		`)) as Flight[] | null;

		if (!flights || !Array.isArray(flights)) {
			throw new Error("Selenium не смог получить данные рейсов");
		}

		return flights;
	} finally {
		await driver.quit();
	}
}

export async function fetchFlights(): Promise<Flight[]> {
	try {
		return await fetchWithCookie();
	} catch (cookieError) {
		console.warn(
			"Cookie-based fetch не удался, используем Selenium:",
			cookieError,
		);
		return await fetchWithSelenium();
	}
}
