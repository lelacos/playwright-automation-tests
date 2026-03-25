export function uniqueSuffix() {
  return Date.now();
}

export function buildAccount(params: {
  role: "PLAYER" | "ORGANIZER";
  prefix: string;
  city: string;
}) {
  const { role, prefix, city } = params;
  const suffix = uniqueSuffix();

  return {
    email: `${prefix}_${suffix}@test.it`,
    password: "secret1",
    displayName: `${prefix.charAt(0).toUpperCase()}${prefix.slice(1)}${suffix}`,
    city,
    role
  };
}
