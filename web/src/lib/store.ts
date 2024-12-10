import { persistentMap } from "@nanostores/persistent";

const defaultUser = {
  _id: "",
  username: "",
  email: "",
  passwordHash: "",
};
export const $user = persistentMap("user:", defaultUser);

export const setUser = (user: any) => {
  $user.set(user);
};

export const clearUser = () => {
  $user.set(defaultUser);
};
