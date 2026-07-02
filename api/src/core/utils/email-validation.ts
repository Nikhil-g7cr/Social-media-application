const ALLOWED_EMAIL_TLDS = new Set([
  'com',
  'org',
  'net',
  'edu',
  'gov',
  'mil',
  'int',
  'info',
  'biz',
  'name',
  'pro',
  'app',
  'dev',
  'io',
  'co',
  'ai',
  'me',
  'us',
  'uk',
  'ca',
  'au',
  'de',
  'fr',
  'es',
  'it',
  'nl',
  'br',
  'mx',
  'jp',
  'kr',
  'cn',
  'in',
  'pk',
  'bd',
  'lk',
  'np',
  'za',
  'ng',
  'ke',
  'ae',
  'sa',
  'id',
  'sg',
  'my',
  'ph',
  'vn',
  'th',
  'ru',
  'ch',
  'se',
  'no',
  'fi',
  'dk',
  'pl',
  'xyz',
]);

const EMAIL_FORMAT_PATTERN =
  /^[a-z0-9][a-z0-9._%+-]*@[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?(?:\.[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?)+$/;

export const EMAIL_VALIDATION_MESSAGE =
  'Please enter a valid email address';

export const normalizeEmail = (email: string) => email.trim().toLowerCase();

export const isValidAppEmail = (email: string) => {
  const normalizedEmail = normalizeEmail(email);
  if (!EMAIL_FORMAT_PATTERN.test(normalizedEmail)) return false;

  const domain = normalizedEmail.split('@')[1];
  const tld = domain?.split('.').pop();

  return !!tld && ALLOWED_EMAIL_TLDS.has(tld);
};
