import { CalendarIcon } from "lucide-react";
import { ru } from "date-fns/locale";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "@/components/ui/popover";
import { formatApiDate, formatDisplayDate, todayApiDate } from "@/lib/dates";

interface DatePickerProps {
	date: Date;
	onDateChange: (date: Date) => void;
}

export function DatePicker({ date, onDateChange }: DatePickerProps) {
	return (
		<div className="flex flex-col gap-3">
			<Popover>
				<PopoverTrigger
					render={
						<Button
							variant="outline"
							className="w-full justify-start font-normal"
						/>
					}
				>
					<CalendarIcon data-icon="inline-start" />
					{formatDisplayDate(date)}
				</PopoverTrigger>
				<PopoverContent className="w-auto p-0" align="start">
					<Calendar
						mode="single"
						selected={date}
						onSelect={(next) => next && onDateChange(next)}
						locale={ru}
					/>
				</PopoverContent>
			</Popover>
			<Button
				variant="secondary"
				size="sm"
				onClick={() => onDateChange(new Date())}
			>
				Сегодня ({todayApiDate()})
			</Button>
		</div>
	);
}

export { formatApiDate };
