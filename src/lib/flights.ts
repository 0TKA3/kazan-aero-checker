import { clearCache, getCached, getCacheUpdatedAt, setCached } from "./cache";
import { fetchFlights } from "./fetcher";
import type {
	Flight,
	FlightListResponse,
	FlightSearchFilters,
	FlightSummary,
	FlightTypeFilter,
} from "./types";

function normalizeFlightType(flight: Flight): "departure" | "arrival" {
	const status = flight.status.toLowerCase();
	if (status.includes("приб") || status.includes("landed")) {
		return "arrival";
	}
	return "departure";
}

function matchesTypeFilter(flight: Flight, type: FlightTypeFilter): boolean {
	if (type === "all") return true;
	return normalizeFlightType(flight) === type;
}

function matchesQuery(flight: Flight, query: string): boolean {
	const q = query.trim().toLowerCase();
	if (!q) return true;

	const haystack = [
		flight.flight_number_iata,
		flight.flight_number,
		flight.flight_number_icao,
		flight.aviacompany_ru,
		flight.aviacompany_en,
		flight.air_arr_ru,
		flight.air_arr_en,
		flight.status,
	].join(" ");

	return haystack.toLowerCase().includes(q);
}

export function toFlightSummary(flight: Flight): FlightSummary {
	return {
		flightNumberIata: flight.flight_number_iata,
		airline: flight.aviacompany_ru,
		destination: flight.air_arr_ru,
		planDeparture: flight.plan_departure,
		planArrival: flight.plan_arrival,
		factDeparture: flight.fact_departure,
		status: flight.status,
		terminal: flight.terminal,
		type: normalizeFlightType(flight),
		date: flight.date,
	};
}

export async function getAllFlights(force = false): Promise<Flight[]> {
	if (!force) {
		const cached = getCached<Flight[]>("flights");
		if (cached) return cached;
	}

	const flights = await fetchFlights();
	setCached("flights", flights);
	return flights;
}

export async function getFlightsByDate(
	date: string,
	force = false,
): Promise<Flight[]> {
	const flights = await getAllFlights(force);
	return flights.filter((flight) => flight.date === date);
}

export async function findFlight(
	flightNumber: string,
	date: string,
	force = false,
): Promise<Flight | null> {
	const flights = await getAllFlights(force);
	return (
		flights.find(
			(f) => f.flight_number_iata === flightNumber && f.date === date,
		) ?? null
	);
}

export async function searchFlights(
	filters: FlightSearchFilters,
	force = false,
): Promise<Flight[]> {
	const { date, type = "all", query = "" } = filters;
	const flights = await getFlightsByDate(date, force);

	return flights.filter(
		(flight) => matchesTypeFilter(flight, type) && matchesQuery(flight, query),
	);
}

export async function getFlightListResponse(
	filters: FlightSearchFilters,
	force = false,
): Promise<FlightListResponse> {
	const flights = await searchFlights(filters, force);

	return {
		date: filters.date,
		updatedAt: getCacheUpdatedAt() ?? new Date().toISOString(),
		flights: flights.map(toFlightSummary),
	};
}

export function invalidateFlightCache(): void {
	clearCache("flights");
}

export function formatFlightForCli(data: Flight): Record<string, string> {
	return {
		"Дата полета": data.date,
		"Начало регистрации": data.reg_begin_time_plan,
		"Конец регистрации": data.reg_end_time_plan,
		"Стойки регистрации": data.desks,
		"Выходы на посадку": data.gates,
		"Начало посадки": data.pos_begin_time_plan,
		"Конец посадки": data.pos_end_time_plan,
		"Факт. время вылета": data.fact_departure,
		"Время прибытия (местное)": data.plan_arrival,
		"Статус рейса": data.status,
	};
}
