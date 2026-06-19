export interface Flight {
	flight_id: string;
	date: string;
	aviacompany_id: string;
	aviacompany_ru: string;
	aviacompany_en: string;
	air_arr_id: string;
	air_arr_ru: string;
	air_arr_en: string;
	flight_number: string;
	flight_number_iata: string;
	flight_number_icao: string;
	flight_type: string;
	plan_departure: string;
	fact_departure: string;
	plan_arrival: string;
	fact_arrival: string;
	terminal: string;
	status: string;
	status_tt: string;
	status_en: string;
	aircraft_icao: string;
	reg_begin_time_plan: string;
	reg_begin_time: string;
	reg_end_time_plan: string;
	reg_end_time: string;
	desks: string;
	pos_begin_time_plan: string;
	pos_begin_time: string;
	pos_end_time_plan: string;
	pos_end_time: string;
	gates: string;
	bort_number: string;
	remark: string;
	sharing_av_id: string[];
	sharing_av_ru: string[];
	sharing_av_en: string[];
	sharing_flight_number: string[];
	delay: string;
	extra_information?: unknown;
}

export interface FlightSummary {
	flightNumberIata: string;
	airline: string;
	destination: string;
	planDeparture: string;
	planArrival: string;
	factDeparture: string;
	status: string;
	terminal: string;
	type: string;
	date: string;
}

export interface FlightListResponse {
	date: string;
	updatedAt: string;
	flights: FlightSummary[];
}

export type FlightTypeFilter = "departure" | "arrival" | "all";
