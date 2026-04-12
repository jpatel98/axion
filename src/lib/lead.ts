export type LeadFormValues = {
  name: string;
  business: string;
  email: string;
  helpNeeded: string;
};

export type LeadFormErrors = Partial<Record<keyof LeadFormValues, string>>;

export type LeadSubmitResult =
  | {
      status: "success";
      message: string;
    }
  | {
      status: "error";
      message: string;
      fieldErrors?: LeadFormErrors;
    };

export const initialLeadFormValues: LeadFormValues = {
  name: "",
  business: "",
  email: "",
  helpNeeded: "",
};

export function normalizeLeadForm(values: unknown): LeadFormValues {
  if (!values || typeof values !== "object") {
    return initialLeadFormValues;
  }

  const payload = values as Partial<Record<keyof LeadFormValues, unknown>>;

  return {
    name: typeof payload.name === "string" ? payload.name.trim() : "",
    business: typeof payload.business === "string" ? payload.business.trim() : "",
    email: typeof payload.email === "string" ? payload.email.trim() : "",
    helpNeeded:
      typeof payload.helpNeeded === "string" ? payload.helpNeeded.trim() : "",
  };
}

export function validateLeadForm(values: LeadFormValues): LeadFormErrors {
  const errors: LeadFormErrors = {};

  if (!values.name) {
    errors.name = "Please add your name.";
  }

  if (!values.business) {
    errors.business = "Please add your business name.";
  }

  if (!values.email) {
    errors.email = "Please add an email address.";
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email)) {
    errors.email = "Please enter a valid email address.";
  }

  if (values.helpNeeded.length < 20) {
    errors.helpNeeded =
      "A short overview helps. Please add at least a sentence or two.";
  }

  return errors;
}

export async function submitLead(
  values: LeadFormValues,
): Promise<LeadSubmitResult> {
  try {
    const response = await fetch("/api/leads", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(values),
    });

    const payload = (await response.json()) as LeadSubmitResult;

    if (!response.ok) {
      return {
        status: "error",
        message:
          payload.message ??
          "Something went sideways. Try the email link below or reload and try again.",
        fieldErrors:
          payload.status === "error" ? payload.fieldErrors : undefined,
      };
    }

    return payload;
  } catch {
    return {
      status: "error",
      message:
        "Something went sideways. Try the email link below or reload and try again.",
    };
  }
}
