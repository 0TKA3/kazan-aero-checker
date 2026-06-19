import type { Flight } from "@/types";
import { StatusBadge } from "@/components/StatusBadge";
import {
	Sheet,
	SheetContent,
	SheetDescription,
	SheetHeader,
	SheetTitle,
} from "@/components/ui/sheet";
import { Skeleton } from "@/components/ui/skeleton";

interface FlightDetailSheetProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	flight: Flight | null;
	loading: boolean;
}

function DetailRow({ label, value }: { label: string; value: string }) {
	return (
		<div className="flex flex-col gap-1 border-b border-border py-3 last:border-b-0">
			<span className="text-xs text-muted-foreground">{label}</span>
			<span className="text-sm">{value || "—"}</span>
		</div>
	);
}

export function FlightDetailSheet({
	open,
	onOpenChange,
	flight,
	loading,
}: FlightDetailSheetProps) {
	return (
		<Sheet open={open} onOpenChange={onOpenChange}>
			<SheetContent className="overflow-y-auto sm:max-w-md">
				<SheetHeader>
					<SheetTitle>
						{flight?.flight_number_iata ?? "Детали рейса"}
					</SheetTitle>
					<SheetDescription>
						{flight
							? `${flight.aviacompany_ru} · ${flight.date}`
							: "Загрузка информации о рейсе"}
					</SheetDescription>
				</SheetHeader>

				{loading && (
					<div className="flex flex-col gap-3 px-4 pb-4">
						<Skeleton className="h-6 w-32" />
						<Skeleton className="h-20 w-full" />
						<Skeleton className="h-20 w-full" />
					</div>
				)}

				{!loading && flight && (
					<div className="px-4 pb-4">
						<div className="mb-4 flex items-center gap-2">
							<StatusBadge status={flight.status} />
							{flight.delay && (
								<span className="text-sm text-muted-foreground">
									Задержка: {flight.delay}
								</span>
							)}
						</div>

						<DetailRow label="Направление" value={flight.air_arr_ru} />
						<DetailRow label="Терминал" value={flight.terminal} />
						<DetailRow label="Борт" value={flight.bort_number} />
						<DetailRow
							label="Начало регистрации"
							value={flight.reg_begin_time_plan}
						/>
						<DetailRow
							label="Конец регистрации"
							value={flight.reg_end_time_plan}
						/>
						<DetailRow label="Стойки регистрации" value={flight.desks} />
						<DetailRow label="Выходы на посадку" value={flight.gates} />
						<DetailRow
							label="Начало посадки"
							value={flight.pos_begin_time_plan}
						/>
						<DetailRow label="Конец посадки" value={flight.pos_end_time_plan} />
						<DetailRow label="Плановый вылет" value={flight.plan_departure} />
						<DetailRow label="Факт. время вылета" value={flight.fact_departure} />
						<DetailRow
							label="Время прибытия (местное)"
							value={flight.plan_arrival}
						/>
						{flight.remark && (
							<DetailRow label="Примечание" value={flight.remark} />
						)}
					</div>
				)}
			</SheetContent>
		</Sheet>
	);
}
