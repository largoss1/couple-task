import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { supabase } from "./supabaseClient";

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";

export async function hashPassword(password) {
  return await bcrypt.hash(password, 10);
}

export async function comparePassword(password, hash) {
  return await bcrypt.compare(password, hash);
}

export function generateToken(userId) {
  return jwt.sign({ userId }, JWT_SECRET, { expiresIn: "7d" });
}

export function verifyToken(token) {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    return null;
  }
}

export function generateVerificationCode() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export async function createSession(userId) {
  const token = generateToken(userId);
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

  const { data, error } = await supabase
    .from("sessions")
    .insert([{ user_id: userId, token, expires_at: expiresAt.toISOString() }])
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function getUserFromToken(token) {
  const decoded = verifyToken(token);
  if (!decoded) return null;

  const { data: session } = await supabase
    .from("sessions")
    .select("*, users(*)")
    .eq("token", token)
    .gt("expires_at", new Date().toISOString())
    .single();

  return session?.users || null;
}

export async function deleteSession(token) {
  await supabase.from("sessions").delete().eq("token", token);
}
