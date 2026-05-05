// services/userService.ts
import { fetchAPI } from "@/lib/api";
import { User } from "@/models/user";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

export async function getUsers(): Promise<User[]> {
  try {
    return await fetchAPI(`${API_URL}/users`, {
      cache: "no-store",
    });
  } catch (error) {
    console.error("Error fetching users:", error);
    return []; // กันหน้าแตก
  }
}