"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { revalidatePath } from "next/cache";

export async function resolveAlert(formData: FormData): Promise<void> {
  const session = await auth();
  if (!session) return;

  const id = formData.get("id") as string;
  await prisma.alert.update({ where: { id }, data: { resolved: true } }).catch(() => null);

  revalidatePath("/alerts");
  revalidatePath("/dashboard");
}
