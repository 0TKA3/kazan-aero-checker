import { existsSync } from "node:fs";
import { join, normalize } from "node:path";
import {
	findFlight,
	getAllFlights,
	getFlightListResponse,
	invalidateFlightCache,
} from "../lib/flights";
import { getCacheUpdatedAt } from "../lib/cache";
import type { FlightTypeFilter, HealthResponse } from "../lib/types";

const PORT = Number(process.env.PORT ?? 3000);
const WEB_ORIGIN = process.env.WEB_ORIGIN ?? "http://localhost:5173";
const STATIC_DIR =
	process.env.STATIC_DIR ?? join(import.meta.dir, "../../web/dist");
const STATIC_ENABLED =
	process.env.SERVE_STATIC === "true" || existsSync(STATIC_DIR);

function corsHeaders(): HeadersInit {
	return {
		"Access-Control-Allow-Origin": WEB_ORIGIN,
		"Access-Control-Allow-Methods": "GET, OPTIONS",
		"Access-Control-Allow-Headers": "Content-Type",
	};
}

function json(data: unknown, status = 200): Response {
	return Response.json(data, {
		status,
		headers: corsHeaders(),
	});
}

function error(message: string, status = 400): Response {
	return json({ error: message }, status);
}

function parseDateParam(url: URL): string | null {
	return url.searchParams.get("date");
}

function parseTypeParam(url: URL): FlightTypeFilter {
	const type = url.searchParams.get("type");
	if (type === "departure" || type === "arrival") return type;
	return "all";
}

function parseForceParam(url: URL): boolean {
	return url.searchParams.get("refresh") === "true";
}

function isValidDate(date: string): boolean {
	return /^\d{2}\.\d{2}\.\d{4}$/.test(date);
}

async function handleHealth(force = false): Promise<Response> {
	try {
		const flights = await getAllFlights(force);
		const response: HealthResponse = {
			status: "ok",
			source: "kazan.aero",
			flightCount: flights.length,
			updatedAt: getCacheUpdatedAt(),
		};
		return json(response);
	} catch (e) {
		const response: HealthResponse = {
			status: "error",
			source: "kazan.aero",
			flightCount: 0,
			updatedAt: getCacheUpdatedAt(),
			error: e instanceof Error ? e.message : "Unknown error",
		};
		return json(response, 503);
	}
}

async function handleFlightsList(url: URL): Promise<Response> {
	const date = parseDateParam(url);
	if (!date) return error("Параметр date обязателен (формат DD.MM.YYYY)");
	if (!isValidDate(date)) return error("Неверный формат date, ожидается DD.MM.YYYY");

	const force = parseForceParam(url);
	if (force) invalidateFlightCache();

	const type = parseTypeParam(url);
	const query = url.searchParams.get("q") ?? "";

	try {
		const result = await getFlightListResponse({ date, type, query }, force);
		return json(result);
	} catch (e) {
		return error(
			e instanceof Error ? e.message : "Ошибка при получении рейсов",
			503,
		);
	}
}

async function handleFlightDetail(
	flightNumber: string,
	url: URL,
): Promise<Response> {
	const date = parseDateParam(url);
	if (!date) return error("Параметр date обязателен (формат DD.MM.YYYY)");
	if (!isValidDate(date)) return error("Неверный формат date, ожидается DD.MM.YYYY");

	const force = parseForceParam(url);
	if (force) invalidateFlightCache();

	try {
		const flight = await findFlight(decodeURIComponent(flightNumber), date, force);
		if (!flight) return error("Рейс не найден", 404);
		return json({ flight });
	} catch (e) {
		return error(
			e instanceof Error ? e.message : "Ошибка при получении рейса",
			503,
		);
	}
}

function resolveStaticPath(pathname: string): string | null {
	const relativePath = pathname === "/" ? "index.html" : pathname.slice(1);
	const absolutePath = normalize(join(STATIC_DIR, relativePath));

	if (!absolutePath.startsWith(normalize(STATIC_DIR))) {
		return null;
	}

	return absolutePath;
}

async function serveStatic(pathname: string): Promise<Response | null> {
	if (!STATIC_ENABLED) return null;

	const filePath = resolveStaticPath(pathname);
	if (!filePath) return null;

	const file = Bun.file(filePath);
	if (await file.exists()) {
		return new Response(file);
	}

	if (!pathname.includes(".")) {
		const index = Bun.file(join(STATIC_DIR, "index.html"));
		if (await index.exists()) {
			return new Response(index, {
				headers: { "Content-Type": "text/html; charset=utf-8" },
			});
		}
	}

	return null;
}

async function handleRequest(req: Request): Promise<Response> {
	const url = new URL(req.url);

	if (req.method === "OPTIONS") {
		return new Response(null, { status: 204, headers: corsHeaders() });
	}

	if (req.method !== "GET") {
		return error("Метод не поддерживается", 405);
	}

	if (url.pathname === "/api/health") {
		return handleHealth(parseForceParam(url));
	}

	if (url.pathname === "/api/flights") {
		return handleFlightsList(url);
	}

	const detailMatch = url.pathname.match(/^\/api\/flights\/(.+)$/);
	if (detailMatch) {
		return handleFlightDetail(detailMatch[1], url);
	}

	const staticResponse = await serveStatic(url.pathname);
	if (staticResponse) return staticResponse;

	return error("Not found", 404);
}

console.log(`Aero server running on http://0.0.0.0:${PORT}`);
if (STATIC_ENABLED) {
	console.log(`Serving static files from ${STATIC_DIR}`);
}

Bun.serve({
	hostname: "0.0.0.0",
	port: PORT,
	fetch: handleRequest,
});
