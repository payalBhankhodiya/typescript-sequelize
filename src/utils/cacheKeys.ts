export const CACHE_KEYS = {
  USERS_ALL: "users:all",
  USER_BY_ID: (id: string | number) => `users:${id}`,
};
