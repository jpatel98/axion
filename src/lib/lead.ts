export type LeadFormValues = {
  name: string;
  business: string;
  email: string;
  helpNeeded: string;
};

export type LeadFormErrors = Partial<Record<keyof LeadFormValues, string>>;

export const initialLeadFormValues: LeadFormValues = {
  name: "",
  business: "",
  email: "",
  helpNeeded: "",
};

export function validateLeadForm(values: LeadFormValues): LeadFormErrors {
  const errors: LeadFormErrors = {};

  if (!values.name.trim()) {
    errors.name = "Please add your name.";
  }

  if (!values.business.trim()) {
    errors.business = "Please add your business name.";
  }

  if (!values.email.trim()) {
    errors.email = "Please add an email address.";
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email)) {
    errors.email = "Please enter a valid email address.";
  }

  if (values.helpNeeded.trim().length < 20) {
    errors.helpNeeded =
      "A short overview helps. Please add at least a sentence or two.";
  }

  return errors;
}

export async function submitLead(values: LeadFormValues) {
  void values;

  // Wire this to your email provider, CRM, or server action when live lead
  // capture is ready. The form stays production-grade in UI until then.
  return {
    status: "placeholder" as const,
    message:
      "This form is almost live. For now, please use the booking link or email and we will continue from there.",
  };
}
