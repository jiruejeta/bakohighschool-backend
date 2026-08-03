const crypto = require('crypto');

const slugifyFirstName = (fullName) => {
  const firstName = fullName.trim().split(/\s+/)[0] || 'student';
  return firstName
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '')
    .slice(0, 15) || 'student';
};

const randomDigits = (length = 3) => {
  let digits = '';
  for (let i = 0; i < length; i++) {
    digits += crypto.randomInt(0, 10);
  }
  return digits;
};

const randomPassword = (length = 8) => {
  const chars = 'ABCDEFGHJKMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789';
  let password = '';
  for (let i = 0; i < length; i++) {
    password += chars[crypto.randomInt(0, chars.length)];
  }
  return password;
};

// Returns { username, password } — username like "abebe482"
const generateStudentCredentials = (fullName) => {
  const base = slugifyFirstName(fullName);
  const username = `${base}${randomDigits(3)}`;
  const password = randomPassword(8);
  return { username, password };
};

module.exports = { generateStudentCredentials };