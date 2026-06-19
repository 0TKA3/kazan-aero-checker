import { findFlight, formatFlightForCli } from "../lib/flights";

const flight_number = Bun.argv[2];
const date = Bun.argv[3];

if (flight_number && date) {
	findFlight(flight_number, date).then((result) => {
		if (result) {
			console.table(formatFlightForCli(result));
		} else {
			console.log("Рейс не найден");
		}
	});
}
