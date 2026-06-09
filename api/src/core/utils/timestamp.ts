/*Return current unix timestamp */
const unix_ts_now_notime = () => {
	return Math.floor(+new Date(new Date().toLocaleString('fr-CA', { dateStyle: 'short' })) / 1000);
};

const unix_ts_now = () => {
	return Math.floor(+new Date() / 1000);
};

const unix_ts_end = () => {
	return Math.floor(+new Date('2200-01-01 00:00:00') / 1000);
};

const convert_date_unix_ts = (date: Date) => {
	return Math.floor(+new Date(date) / 1000);
};
const convert_unix_ts_date = (timestamp: number): string => {
	const date = new Date(timestamp * 1000);
	const options: Intl.DateTimeFormatOptions = {
		year: 'numeric',
		month: 'long',
		day: 'numeric',
		hour: 'numeric',
		minute: 'numeric',
		hour12: true,
		timeZone: 'Asia/Kolkata'
	};
	const formattedDate = date.toLocaleString('en-US', options);
	return formattedDate;
};

export { convert_date_unix_ts, unix_ts_end, unix_ts_now, unix_ts_now_notime, convert_unix_ts_date };
