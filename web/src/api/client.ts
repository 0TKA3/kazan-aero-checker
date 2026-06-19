import type {
	Flight,
	FlightListResponse,
	FlightTypeFilter,
} from "@/types";

const API_BASE = import.meta.env.VITE_API_URL ?? "";

function apiUnavailableMessage(): string {
	return "API-сервер недоступен. Запустите из корня проекта: bun run dev";
}

async function request<T>(path: string): Promise<T> {
	let response: Response;

	try {
		response = await fetch(`${API_BASE}${path}`);
	} catch {
		throw new Error(apiUnavailableMessage());
	}

	const text = await response.text();

	if (!text.trim()) {
		throw new Error(
			response.ok ? "Пустой ответ от сервера" : apiUnavailableMessage(),
		);
	}

	let data: unknown;
	try {
		data = JSON.parse(text);
	} catch {
		throw new Error("Сервер вернул некорректный ответ");
	}

	if (!response.ok) {
		throw new Error(
			typeof (data as { error?: string })?.error === "string"
				? (data as { error: string }).error
				: `Ошибка запроса (${response.status})`,
		);
	}

	return data as T;
}

export function fetchFlights(params: {
	date: string;
	type?: FlightTypeFilter;
	q?: string;
	refresh?: boolean;
}): Promise<FlightListResponse> {
	const search = new URLSearchParams({ date: params.date });
	if (params.type && params.type !== "all") {
		search.set("type", params.type);
	}
	if (params.q) search.set("q", params.q);
	if (params.refresh) search.set("refresh", "true");

	return request<FlightListResponse>(`/api/flights?${search}`);
}

export function fetchFlightDetail(
	flightNumber: string,
	date: string,
	refresh = false,
): Promise<{ flight: Flight }> {
	const search = new URLSearchParams({ date });
	if (refresh) search.set("refresh", "true");

	return request<{ flight: Flight }>(
		`/api/flights/${encodeURIComponent(flightNumber)}?${search}`,
	);
}
