export function messageFactory(message: string, msgParams?: string[]): string {
    let newMsg = message; // It's better to assign the original message here as the default
    if (msgParams && msgParams.length > 0) {
        msgParams.forEach((val, key) => {
            newMsg = newMsg.split(`ARG${key}`).join(val?.toString());
        });
    }
    return newMsg;
}

export const enum messages {
    // ARG0, ARG1 ... ARGn should be in sequence.

    // Success messages : Start with Sn
    S1 = 'TOMO core service is listening on ARG0',
    S2 = 'TOMO service is live and running!',
    S3 = 'Successfully connected to the TOMO database!',
    S4 = 'Success!',
    S5 = 'Your TOMO profile has been updated successfully.',
    S6 = 'New TOMO account created successfully.',

    // Warning messages : Start with Wn
    W1 = 'Please provide a valid ARG0!',
    W2 = 'ARG0 cannot be left empty!',
    W3 = 'ARG0 must be a positive integer greater than zero.',
    W4 = 'ARG0 must be a valid integer.',
    W5 = 'ARG0 should not exceed ARG1 characters.',
    W6 = "Sorry, you can't update your own account permissions!",
    W7 = "You are restricted to creating accounts with the 'Member' role only.", // Changed from 'Customer' to 'Member' for social media context
    W8 = 'Please provide at least one field to update on the profile!',
    W9 = 'You do not have the required permissions to edit this profile.',
    W10 = 'Please provide at least one ARG0.',
    W11 = 'A TOMO account for this user already exists!',
    W12 = 'ARG0 could not be found on TOMO.',

    // Error messages : Start with En
    E1 = 'TOMO server initialization failed! :: ARG0',
    E2 = 'Oops! An error occurred while processing your request on TOMO.',
    E3 = 'Unauthorized request!',
    E4 = 'A critical error occurred while connecting to the TOMO database! (ERROR :: ARG0)',
    E5 = 'Database connection disconnected due to TOMO app termination!',
    E6 = 'Failed to close the database connection gracefully! (ERROR :: ARG0)',
    E7 = 'We are sorry, but you do not have permission to view or access this resource [ARG0]!',
    E8 = 'Unauthorized request. Please provide valid authentication tokens to access TOMO!'
}