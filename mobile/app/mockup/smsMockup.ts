// mockup/smsMockup.ts

export interface SmsMockItem {
    address: string;
    body: string;
    date: number; // timestamp in milliseconds
  }
  
  const smsMockData: SmsMockItem[] = [
    {
      address: "AIS",
      body: "Your internet package has been renewed successfully.",
      date: Date.now() - 1000 * 60 * 10, // 10 minutes ago
    },
    {
      address: "KBank",
      body: "500.00 THB credited at 08:21 AM.",
      date: Date.now() - 1000 * 60 * 60, // 1 hour ago
    },
    {
      address: "SCB",
      body: "Alert: You spent 200.00 THB at Shopee.",
      date: Date.now() - 1000 * 60 * 60 * 3, // 3 hours ago
    },
    {
      address: "OTP Service",
      body: "Your OTP is 123456. It expires in 5 minutes.",
      date: Date.now() - 1000 * 60 * 60 * 5, // 5 hours ago
    },
    {
      address: "Mom",
      body: "Are you coming for dinner tonight?",
      date: Date.now() - 1000 * 60 * 60 * 24, // yesterday
    },
  ];
  
  export default smsMockData;
  