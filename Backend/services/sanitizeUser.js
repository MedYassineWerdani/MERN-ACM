function sanitizeUser(user) {
  const obj = user.toObject({ getters: true });

  delete obj.password;
  delete obj.__v;

  return obj;
}

module.exports = { sanitizeUser };
