"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { revalidatePath } from "next/cache";
import bcrypt from "bcryptjs";

export async function createUser(formData: FormData): Promise<void> {
  const session = await auth();
  if (!session || session.user.role !== "ADMIN") return;

  const name = (formData.get("name") as string)?.trim();
  const email = (formData.get("email") as string)?.trim().toLowerCase();
  const password = formData.get("password") as string;
  const role = formData.get("role") as string;

  if (!name || !email || !password || role == null) return;
  if (password.length < 8) return;

  const hashed = await bcrypt.hash(password, 10);
  await prisma.user.create({ data: { name, email, password: hashed, role } }).catch(() => null);

  revalidatePath("/settings");
}

export async function updateUserRole(formData: FormData): Promise<void> {
  const session = await auth();
  if (!session || session.user.role !== "ADMIN") return;

  const id = formData.get("id") as string;
  const role = formData.get("role") as string;

  await prisma.user.update({ where: { id }, data: { role } }).catch(() => null);
  revalidatePath("/settings");
}

export async function deleteUser(formData: FormData): Promise<void> {
  const session = await auth();
  if (!session || session.user.role !== "ADMIN") return;

  const id = formData.get("id") as string;
  if (id === session.user.id) return;

  await prisma.movement.deleteMany({ where: { userId: id } }).catch(() => null);
  await prisma.stockTake.deleteMany({ where: { userId: id } }).catch(() => null);
  await prisma.alert.deleteMany({ where: { userId: id } }).catch(() => null);
  await prisma.user.delete({ where: { id } }).catch(() => null);

  revalidatePath("/settings");
}
