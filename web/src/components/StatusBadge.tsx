import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface StatusBadgeProps {
	status: string;
	className?: string;
}

function getStatusVariant(
	status: string,
): "default" | "secondary" | "destructive" | "outline" {
	const normalized = status.toLowerCase();

	if (
		normalized.includes("отмен") ||
		normalized.includes("cancel")
	) {
		return "destructive";
	}

	if (
		normalized.includes("задерж") ||
		normalized.includes("delay")
	) {
		return "outline";
	}

	if (
		normalized.includes("вылет") ||
		normalized.includes("depart") ||
		normalized.includes("прибыл") ||
		normalized.includes("arriv")
	) {
		return "default";
	}

	return "secondary";
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
	const variant = getStatusVariant(status);

	return (
		<Badge
			variant={variant}
			className={cn(
				variant === "outline" &&
					"border-amber-500/40 bg-amber-500/10 text-amber-700 dark:text-amber-300",
				className,
			)}
		>
			{status || "—"}
		</Badge>
	);
}
