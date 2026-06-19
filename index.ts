import { Browser, Builder } from "selenium-webdriver";

const flight_number = Bun.argv[2];
const date = Bun.argv[3];

interface IData {
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
	extra_information?: any;
}

async function getFlightData({
	date,
	flight_number,
}: Pick<IData, "flight_number" | "date">): Promise<IData | null> {
	const driver = await new Builder().forBrowser(Browser.FIREFOX).build();

	try {
		await driver.get("https://www.kazan.aero/on-line-schedule/");

		const flights: IData[] = (await driver.executeAsyncScript(`
			const callback = arguments[arguments.length - 1];
			const LINK = "https://www.kazan.aero/json/dld.json";
			fetch(LINK)
				.then(res => res.json())
				.then(data => callback(data))
				.catch(err => callback(null));
		`)) as IData[];

		const flight = flights?.find(
			(f) => f.flight_number_iata === flight_number && f.date === date,
		);

		return flight || null;
	} catch (e) {
		console.error("Ошибка при получении данных:", e);
		return null;
	} finally {
		await driver.quit();
	}
}

function formatFlightData(data: IData) {
	console.table({
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
	});
}

if (flight_number && date) {
	getFlightData({ flight_number, date }).then((result) => {
		if (result) {
			formatFlightData(result);
		} else {
			console.log("Рейс не найден");
		}
	});
}
