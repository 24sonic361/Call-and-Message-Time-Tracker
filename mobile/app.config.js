import 'dotenv/config'; // Ensure dotenv is loaded

export default {
    expo: {
      extra: {
        supabaseUrl: process.env.SUPABASE_URL,
        supabaseAnonKey: process.env.SUPABASE_ANON_KEY,
    },
    newArchEnabled: true,
    scheme: "myapp",  // ✅ Add a unique scheme
    },
  };
  