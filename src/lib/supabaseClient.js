import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseKey);

// test nhỏ để xem URL có hợp lệ không
if (!supabaseUrl || !supabaseKey) {
  console.error("❌ Thiếu thông tin Supabase trong .env.local");
} else {
  console.log("✅ Supabase client đã khởi tạo:", supabaseUrl);
}
