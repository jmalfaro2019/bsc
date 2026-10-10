import api from "./api";
import type { CreateUser, UpdateUser, User } from "bsc-shared";

const USERS_KEY = "/users";

export async function fetchUsers(): Promise<User[]> {
  const { data } = await api.get<User[]>(USERS_KEY);
  return data;
}

export async function createUser(user: CreateUser): Promise<User> {
  const { data } = await api.post<User>(USERS_KEY, user);
  return data;
}

export async function updateUser(id: string, user: UpdateUser): Promise<User> {
  const { data } = await api.patch<User>(`${USERS_KEY}/${id}`, user);
  return data;
}

export async function deleteUser(id: string): Promise<void> {
  await api.delete(`${USERS_KEY}/${id}`);
}
