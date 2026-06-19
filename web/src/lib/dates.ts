import { format, parse } from "date-fns";
import { ru } from "date-fns/locale";

const API_DATE_FORMAT = "dd.MM.yyyy";

export function formatApiDate(date: Date): string {
	return format(date, API_DATE_FORMAT);
}

export function parseApiDate(value: string): Date {
	return parse(value, API_DATE_FORMAT, new Date());
}

export function formatDisplayDate(date: Date): string {
	return format(date, "d MMMM yyyy", { locale: ru });
}

export function todayApiDate(): string {
	return formatApiDate(new Date());
}
