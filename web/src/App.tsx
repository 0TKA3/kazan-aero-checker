import { useCallback, useEffect, useState } from "react";
import { MoonIcon, PlaneIcon, RefreshCwIcon, SearchIcon, SunIcon } from "lucide-react";

import { fetchFlightDetail, fetchFlights } from "@/api/client";
import { DatePicker, formatApiDate } from "@/components/DatePicker";
import { FlightDetailSheet } from "@/components/FlightDetailSheet";
import { FlightListSkeleton } from "@/components/FlightListSkeleton";
import { FlightTable } from "@/components/FlightTable";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useDebouncedValue } from "@/hooks/useDebouncedValue";
import { todayApiDate } from "@/lib/dates";
import type { Flight, FlightSummary } from "@/types";

function getInitialTheme(): "light" | "dark" {
	return window.matchMedia("(prefers-color-scheme: dark)").matches
		? "dark"
		: "light";
}

export default function App() {
	const [selectedDate, setSelectedDate] = useState(() => new Date());
	const [flightType, setFlightType] = useState<"departure" | "arrival">("departure");
	const [searchQuery, setSearchQuery] = useState("");
	const [flights, setFlights] = useState<FlightSummary[]>([]);
	const [updatedAt, setUpdatedAt] = useState<string | null>(null);
	const [loading, setLoading] = useState(true);
	const [refreshing, setRefreshing] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [theme, setTheme] = useState<"light" | "dark">(getInitialTheme);

	const [sheetOpen, setSheetOpen] = useState(false);
	const [selectedFlight, setSelectedFlight] = useState<Flight | null>(null);
	const [detailLoading, setDetailLoading] = useState(false);

	const debouncedQuery = useDebouncedValue(searchQuery);
	const apiDate = formatApiDate(selectedDate);

	useEffect(() => {
		document.documentElement.classList.toggle("dark", theme === "dark");
	}, [theme]);

	const loadFlights = useCallback(
		async (refresh = false) => {
			if (refresh) setRefreshing(true);
			else setLoading(true);

			setError(null);

			try {
				const response = await fetchFlights({
					date: apiDate,
					type: flightType,
					q: debouncedQuery,
					refresh,
				});
				setFlights(response.flights);
				setUpdatedAt(response.updatedAt);
			} catch (e) {
				setError(e instanceof Error ? e.message : "Не удалось загрузить рейсы");
				setFlights([]);
				setUpdatedAt(null);
			} finally {
				setLoading(false);
				setRefreshing(false);
			}
		},
		[apiDate, flightType, debouncedQuery],
	);

	useEffect(() => {
		void loadFlights();
	}, [loadFlights]);

	const handleSelectFlight = async (summary: FlightSummary) => {
		setSheetOpen(true);
		setSelectedFlight(null);
		setDetailLoading(true);

		try {
			const response = await fetchFlightDetail(
				summary.flightNumberIata,
				summary.date,
			);
			setSelectedFlight(response.flight);
		} catch (e) {
			setError(
				e instanceof Error ? e.message : "Не удалось загрузить детали рейса",
			);
			setSheetOpen(false);
		} finally {
			setDetailLoading(false);
		}
	};

	return (
		<div className="min-h-screen bg-background">
			<header className="border-b bg-card/60 backdrop-blur-sm">
				<div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-4 sm:px-6">
					<div className="flex items-center gap-3">
						<div className="flex size-10 items-center justify-center rounded-xl bg-primary text-primary-foreground">
							<PlaneIcon className="size-5" />
						</div>
						<div>
							<h1 className="text-lg font-semibold sm:text-xl">Aero KZN</h1>
							<p className="text-sm text-muted-foreground">
								Онлайн-расписание аэропорта Казани
							</p>
						</div>
					</div>
					<div className="flex items-center gap-2">
						<Button
							variant="outline"
							size="icon-sm"
							onClick={() =>
								setTheme((current) => (current === "dark" ? "light" : "dark"))
							}
							aria-label="Переключить тему"
						>
							{theme === "dark" ? <SunIcon /> : <MoonIcon />}
						</Button>
						<Button
							variant="outline"
							size="sm"
							onClick={() => void loadFlights(true)}
							disabled={refreshing}
						>
							<RefreshCwIcon
								data-icon="inline-start"
								className={refreshing ? "animate-spin" : undefined}
							/>
							Обновить
						</Button>
					</div>
				</div>
			</header>

			<main className="mx-auto grid max-w-7xl gap-6 px-4 py-6 lg:grid-cols-[280px_1fr] sm:px-6">
				<aside>
					<Card>
						<CardHeader>
							<CardTitle>Дата</CardTitle>
						</CardHeader>
						<CardContent>
							<DatePicker date={selectedDate} onDateChange={setSelectedDate} />
						</CardContent>
					</Card>
				</aside>

				<section className="flex flex-col gap-4">
					<div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
						<Tabs
							value={flightType}
							onValueChange={(value) =>
								setFlightType(value as "departure" | "arrival")
							}
						>
							<TabsList>
								<TabsTrigger value="departure">Вылет</TabsTrigger>
								<TabsTrigger value="arrival">Прилёт</TabsTrigger>
							</TabsList>
							<TabsContent value={flightType} />
						</Tabs>

						<div className="relative w-full sm:max-w-sm">
							<SearchIcon className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
							<Input
								value={searchQuery}
								onChange={(event) => setSearchQuery(event.target.value)}
								placeholder="Поиск по номеру, авиакомпании, направлению..."
								className="pl-9"
							/>
						</div>
					</div>

					<Card>
						<CardHeader className="flex flex-row items-center justify-between gap-4">
							<div>
								<CardTitle>
									{flightType === "departure" ? "Вылетающие" : "Прилетающие"} рейсы
								</CardTitle>
								<p className="text-sm text-muted-foreground">
									{apiDate}
									{!error &&
										updatedAt &&
										` · обновлено ${new Date(updatedAt).toLocaleTimeString("ru-RU", { hour: "2-digit", minute: "2-digit" })}`}
								</p>
							</div>
							{!loading && !error && (
								<span className="text-sm text-muted-foreground">
									{flights.length} рейсов
								</span>
							)}
						</CardHeader>
						<CardContent>
							{loading && <FlightListSkeleton />}

							{!loading && error && (
								<div className="flex flex-col items-center gap-3 py-12 text-center">
									<p className="text-sm text-destructive">{error}</p>
									<Button variant="outline" onClick={() => void loadFlights()}>
										Повторить
									</Button>
								</div>
							)}

							{!loading && !error && flights.length === 0 && (
								<div className="py-12 text-center text-sm text-muted-foreground">
									Рейсы не найдены для {apiDate === todayApiDate() ? "сегодня" : apiDate}
								</div>
							)}

							{!loading && !error && flights.length > 0 && (
								<FlightTable
									flights={flights}
									flightType={flightType}
									onSelect={handleSelectFlight}
								/>
							)}
						</CardContent>
					</Card>
				</section>
			</main>

			<FlightDetailSheet
				open={sheetOpen}
				onOpenChange={setSheetOpen}
				flight={selectedFlight}
				loading={detailLoading}
			/>
		</div>
	);
}
