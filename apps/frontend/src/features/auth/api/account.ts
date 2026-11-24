import { axiosClient } from "@/lib/api/axios-client";

interface DeleteAccountResponse {
  deleted: true;
}

export const deleteAccount = async (email: string): Promise<DeleteAccountResponse> => {
  const response = await axiosClient.delete<unknown, unknown>(
    `/dev/users?email=${encodeURIComponent(email)}`,
  );

  if (
    typeof response !== "object" ||
    response === null ||
    !("deleted" in response) ||
    response.deleted !== true
  ) {
    throw new Error("The account could not be deleted.");
  }

  return response as DeleteAccountResponse;
};
