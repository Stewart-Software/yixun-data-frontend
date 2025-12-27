export function getAxiosErrorMessage(
  error: any,
  fallback: string = "An unknown error occurred"
) {
  if (error?.response?.data?.error) {
    throw new Error(error.response.data.error);
  }
  if (error?.message) {
    throw new Error(error.message);
  }
  throw new Error(fallback);
}
