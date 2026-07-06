export const enum AuthMessage {
  // Success messages
  SUCCESS = 'Success.',
  S2='User created and logged in successfully.',
  S3='Login successfully.',
  S4='Logout successfully.',
  S5='User deleted successfully.',
  S6='User verified successfully.',

  // Error messages
  E1='user not found.',
  E2='Invalid email or password.',
  E3='User already exists.',
  E4='User is not verified.',
  E5='User is blocked.',
}

export const enum TokenMessage {
  INVALID = 'Invalid or expired token.',
  VALID = 'Token is valid.',
  TP= 'Token parsed successfully.',
  TR= 'Token refreshed successfully.',
  IRT= 'Invalid refresh token.',
}