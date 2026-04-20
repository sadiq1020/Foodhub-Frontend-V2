import { toast } from "sonner";
import { ApiRequestError } from "./api";

/**
 * Central error handler for all API calls in components.
 *
 * Usage:
 *   } catch (error) {
 *     handleApiError(error, toastId);
 *   }
 *
 * What it does:
 * - If the error is an ApiRequestError (from our api.ts), shows the
 *   backend's message. If there are field-level errorDetails, it appends
 *   them to the toast so the user knows exactly which field failed.
 * - For 403 errors specifically, shows a clear "access denied" message.
 * - For 409 conflicts, shows the duplicate message from the backend.
 * - For any other error type, shows a generic fallback.
 */
export const handleApiError = (
  error: unknown,
  toastId?: string | number,
): void => {
  if (error instanceof ApiRequestError) {
    // Build a helpful message that includes field errors if present
    let message = error.message;

    if (error.errorDetails && error.errorDetails.length > 0) {
      const fieldMessages = error.errorDetails
        .map((d) => `${d.field}: ${d.message}`)
        .join(", ");
      message = `${message} (${fieldMessages})`;
    }

    if (toastId !== undefined) {
      toast.error(message, { id: toastId });
    } else {
      toast.error(message);
    }
    return;
  }

  // Fallback for unexpected errors
  const message =
    error instanceof Error ? error.message : "Something went wrong";

  if (toastId !== undefined) {
    toast.error(message, { id: toastId });
  } else {
    toast.error(message);
  }
};
