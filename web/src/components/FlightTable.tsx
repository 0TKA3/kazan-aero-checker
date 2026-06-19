import type { FlightSummary } from "@/types";
import { StatusBadge } from "@/components/StatusBadge";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import { Card, CardContent } from "@/components/ui/card";

interface FlightTableProps {
	flights: FlightSummary[];
	flightType: "departure" | "arrival";
	onSelect: (flight: FlightSummary) => void;
}

function FlightCard({
	flight,
	timeLabel,
	getTime,
	onSelect,
}: {
	flight: FlightSummary;
	timeLabel: string;
	getTime: (flight: FlightSummary) => string;
	onSelect: (flight: FlightSummary) => void;
}) {
	return (
		<Card
			className="cursor-pointer transition-colors hover:bg-muted/40"
			onClick={() => onSelect(flight)}
		>
			<CardContent className="flex flex-col gap-3 p-4">
				<div className="flex items-start justify-between gap-3">
					<div>
						<p className="font-medium">{flight.flightNumberIata}</p>
						<p className="text-sm text-muted-foreground">{flight.airline}</p>
					</div>
					<StatusBadge status={flight.status} />
				</div>
				<div className="grid grid-cols-2 gap-2 text-sm">
					<div>
						<p className="text-muted-foreground">Направление</p>
						<p>{flight.destination}</p>
					</div>
					<div>
						<p className="text-muted-foreground">{timeLabel}</p>
						<p>{getTime(flight)}</p>
					</div>
					<div>
						<p className="text-muted-foreground">Терминал</p>
						<p>{flight.terminal || "—"}</p>
					</div>
					<div>
						<p className="text-muted-foreground">Факт</p>
						<p>{flight.factDeparture || "—"}</p>
					</div>
				</div>
			</CardContent>
		</Card>
	);
}

export function FlightTable({
	flights,
	flightType,
	onSelect,
}: FlightTableProps) {
	const timeLabel = flightType === "departure" ? "Вылет" : "Прилёт";
	const getTime = (flight: FlightSummary) =>
		flightType === "departure"
			? flight.planDeparture || "—"
			: flight.planArrival || "—";
	return (
		<>
			<div className="hidden md:block">
				<Table>
					<TableHeader>
						<TableRow>
							<TableHead>Рейс</TableHead>
							<TableHead>Авиакомпания</TableHead>
							<TableHead>Направление</TableHead>
							<TableHead>{timeLabel}</TableHead>
							<TableHead>Терминал</TableHead>
							<TableHead>Статус</TableHead>
						</TableRow>
					</TableHeader>
					<TableBody>
						{flights.map((flight) => (
							<TableRow
								key={`${flight.flightNumberIata}-${flight.planDeparture}`}
								className="cursor-pointer"
								onClick={() => onSelect(flight)}
							>
								<TableCell className="font-medium">
									{flight.flightNumberIata}
								</TableCell>
								<TableCell>{flight.airline}</TableCell>
								<TableCell>{flight.destination}</TableCell>
								<TableCell>{getTime(flight)}</TableCell>
								<TableCell>{flight.terminal || "—"}</TableCell>
								<TableCell>
									<StatusBadge status={flight.status} />
								</TableCell>
							</TableRow>
						))}
					</TableBody>
				</Table>
			</div>

			<div className="flex flex-col gap-3 md:hidden">
				{flights.map((flight) => (
					<FlightCard
						key={`${flight.flightNumberIata}-${flight.planDeparture}-card`}
						flight={flight}
						timeLabel={timeLabel}
						getTime={getTime}
						onSelect={onSelect}
					/>
				))}
			</div>
		</>
	);
}
