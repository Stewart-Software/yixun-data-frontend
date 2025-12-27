export function getStartUrl() {
  if (process.env.NODE_ENV === "production") {
    const START_URL = process.env.NEXT_PUBLIC_API_URL as string;
    return START_URL;
  } else if (process.env.NODE_ENV === "development") {
    const PORT = "4000";
    const IP_ADDRESS = process.env.NEXT_PUBLIC_IP_ADDRESS;
    const START_URL = `http://${IP_ADDRESS}:${PORT}`;
    return START_URL;
  } else {
    return "";
  }
}
