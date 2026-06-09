export function messageFactory(message: string, msgParams?: string[]): string {
	let newMsg = '';
	if (msgParams && msgParams.length > 0) {
		msgParams.forEach((val, key) => {
			newMsg = message.split(`ARG${key}`).join(val?.toString());
		});
	}
	return newMsg;
}

export const enum messages {
	//ARG0,ARG1 ... ARGn should be in sequence.

	//Success messages : Start with Sn
	S1 = 'BNW service is listening on ARG0',
	S2 = 'BNW service is up and running',
	S3 = 'Connected to SQL server!',
	S4 = 'Success',
	S5 = 'User details updated successfully.',
	S6 = 'User details added successfully.',

	//Warning messages : Start with Wn
	W1 = 'Please provide a valid ARG0!',
	W2 = 'ARG0 should not be empty!',
	W3 = 'ARG0 should be a positive integer greater than zero.',
	W4 = 'ARG0 should be a integer value.',
	W5 = 'ARG0 should not exceed more than ARG1 characters.',
	W6 = "Sorry,you can't update you own details!",
	W7 = "You are restricted to adding users with the 'Customer' role only.",
	W8 = 'Please provide at one field to update!',
	W9 = 'You do not have permission to update user details.',
	W10 = 'Please provide atlest one ARG0',
	W11 = 'User already exist!',
	W12 = 'ARG0 not found',

	//Error messages : Start with En
	E1 = 'BNW start failed! :: ARG0',
	E2 = 'Oops! An error occurred while processing your request',
	E3 = 'Unauthorized request!',
	E4 = 'An error occurred while establishing connection to SQL server! (ERROR :: ARG0)',
	E5 = 'SQL database connection disconnected through app termination!',
	E6 = 'Error closing SQL database connection! (ERROR :: ARG0)!',
	E7 = 'We are sorry, but you do not have access to this resource [ARG0]!',
	E8 = 'Unauthorized request .Please provide valid tokens!'
}
