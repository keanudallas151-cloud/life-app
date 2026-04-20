export const INVENTORS_INVESTORS_FEATURE_TAG =
  "#Inventors_InvestorsWhenTheyClickOnTheSidebarInventorsAndInvestors";

export const ROLE_OPTIONS = [
  {
    value: "investor",
    title: "Investor",
    description:
      "Back founders, inventions, and early businesses with capital and experience.",
  },
  {
    value: "inventor",
    title: "Inventor",
    description:
      "Showcase your invention or business, then discover aligned investors.",
  },
];

export const INVESTOR_STAGE_OPTIONS = [
  "idea",
  "startup",
  "growing business",
  "established business",
];

export const ACCEPTED_IMAGE_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
];

export const MAX_SINGLE_IMAGE_BYTES = 5 * 1024 * 1024;
export const MAX_MULTI_IMAGE_BYTES = 7 * 1024 * 1024;

export const investorProfileDefaults = {
  fullName: "",
  avatarFile: null,
  avatarPreviewUrl: "",
  location: "",
  contactEmail: "",
  phoneNumber: "",
  shortBio: "",
  investmentBudget: "",
  investmentRangeMin: "",
  investmentRangeMax: "",
  lookingToInvestIn: "",
  preferredIndustries: "",
  stagePreference: "idea",
  emailPublic: false,
  phonePublic: false,
};

export const inventorProfileDefaults = {
  fullName: "",
  avatarFile: null,
  avatarPreviewUrl: "",
  location: "",
  contactEmail: "",
  phoneNumber: "",
  inventionName: "",
  inventionType: "",
  description: "",
  revenue: "",
  equityAvailable: "",
  fundingSought: "",
  galleryFiles: [],
  galleryPreviewUrls: [],
  category: "",
  websiteUrl: "",
  socialLinks: "",
  shortPitch: "",
  emailPublic: false,
  phonePublic: false,
};

export function getDraftStorageKey(userId, role) {
  return `life_ii_draft_${userId}_${role}`;
}

export function getFeatureViewStorageKey(userId) {
  return `life_ii_view_${userId}`;
}

export function getRoleChoiceStorageKey(userId) {
  return `life_ii_role_${userId}`;
}

export function getLocalNetworkingStateKey(userId) {
  return `life_ii_state_${userId}`;
}

export function loadDraft(userId, role, defaults) {
  if (typeof window === "undefined") return defaults;

  try {
    const raw = window.localStorage.getItem(getDraftStorageKey(userId, role));
    if (!raw) return defaults;
    const parsed = JSON.parse(raw);
    return { ...defaults, ...parsed };
  } catch {
    return defaults;
  }
}

export function saveDraft(userId, role, values) {
  if (typeof window === "undefined") return;

  const serializable = {
    ...values,
    avatarFile: null,
    galleryFiles: [],
  };

  window.localStorage.setItem(
    getDraftStorageKey(userId, role),
    JSON.stringify(serializable),
  );
}

export function clearDraft(userId, role) {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(getDraftStorageKey(userId, role));
}

export function saveFeatureView(userId, view) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(getFeatureViewStorageKey(userId), view);
}

export function loadFeatureView(userId) {
  if (typeof window === "undefined") return "landing";
  return window.localStorage.getItem(getFeatureViewStorageKey(userId)) || "landing";
}

export function saveRoleChoice(userId, role) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(getRoleChoiceStorageKey(userId), role);
}

export function loadRoleChoice(userId) {
  if (typeof window === "undefined") return "";
  return window.localStorage.getItem(getRoleChoiceStorageKey(userId)) || "";
}

export function saveLocalNetworkingState(userId, state) {
  if (typeof window === "undefined") return;
  const serializable = {
    ...state,
    profile: state?.profile || null,
    investorProfile: state?.investorProfile || null,
    inventorProfile: state?.inventorProfile || null,
    selectedRole: state?.selectedRole || "",
  };
  window.localStorage.setItem(
    getLocalNetworkingStateKey(userId),
    JSON.stringify(serializable),
  );
}

export function loadLocalNetworkingState(userId) {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(getLocalNetworkingStateKey(userId));
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function clearLocalNetworkingState(userId) {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(getLocalNetworkingStateKey(userId));
}

export function normalizeListInput(value) {
  return value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

export function validateEmail(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(value || "").trim());
}

export function validateUrl(value) {
  if (!value) return true;
  try {
    const url = new URL(value);
    return ["http:", "https:"].includes(url.protocol);
  } catch {
    return false;
  }
}

export function validateImageFile(file, maxBytes = MAX_SINGLE_IMAGE_BYTES) {
  if (!file) return "Please choose an image.";
  if (!ACCEPTED_IMAGE_TYPES.includes(file.type)) {
    return "Only JPG, PNG, and WEBP images are supported.";
  }
  if (file.size > maxBytes) {
    return `Image must be smaller than ${Math.round(maxBytes / (1024 * 1024))}MB.`;
  }
  return "";
}

export function validateImageFiles(files, maxBytes = MAX_MULTI_IMAGE_BYTES) {
  const list = Array.from(files || []);
  if (!list.length) return "Please upload at least one image.";

  for (const file of list) {
    const message = validateImageFile(file, maxBytes);
    if (message) return message;
  }

  return "";
}

export function formatCurrency(value) {
  const amount = Number(value);
  if (!Number.isFinite(amount)) return "";

  try {
    return new Intl.NumberFormat("en-AU", {
      style: "currency",
      currency: "AUD",
      maximumFractionDigits: 0,
    }).format(amount);
  } catch {
    return `$${amount.toLocaleString()}`;
  }
}

export function formatPercent(value) {
  const amount = Number(value);
  if (!Number.isFinite(amount)) return "";
  return `${amount}%`;
}

export function formatRelativeJoined(createdAt) {
  if (!createdAt) return "Joined recently";

  const created = new Date(createdAt).getTime();
  const now = Date.now();
  const diffDays = Math.max(0, Math.floor((now - created) / (1000 * 60 * 60 * 24)));

  if (diffDays < 7) return "Joined recently";
  if (diffDays < 30) return "Joined this month";
  if (diffDays < 90) return "Joined in the last few months";
  return "Established member";
}

export function calculateCompleteness(values, requiredFields) {
  const completed = requiredFields.filter((field) => {
    const value = values[field];
    if (Array.isArray(value)) return value.length > 0;
    return value !== null && value !== undefined && String(value).trim() !== "";
  }).length;

  return Math.round((completed / requiredFields.length) * 100);
}

export function validateInvestorProfile(values) {
  const errors = {};

  if (!values.fullName.trim()) errors.fullName = "Full name is required.";
  if (!values.location.trim()) errors.location = "Location is required.";
  if (!validateEmail(values.contactEmail)) errors.contactEmail = "Enter a valid email.";
  if (!values.phoneNumber.trim()) errors.phoneNumber = "Phone number is required.";
  if (!values.shortBio.trim()) errors.shortBio = "Short bio is required.";
  if (!values.investmentBudget.trim()) errors.investmentBudget = "Investment budget is required.";
  if (!values.investmentRangeMin.trim()) errors.investmentRangeMin = "Minimum range is required.";
  if (!values.investmentRangeMax.trim()) errors.investmentRangeMax = "Maximum range is required.";
  if (!values.lookingToInvestIn.trim()) errors.lookingToInvestIn = "This field is required.";
  if (!values.preferredIndustries.trim()) errors.preferredIndustries = "Preferred industries are required.";
  if (!values.stagePreference.trim()) errors.stagePreference = "Stage preference is required.";

  const min = Number(values.investmentRangeMin);
  const max = Number(values.investmentRangeMax);
  if (Number.isFinite(min) && Number.isFinite(max) && min > max) {
    errors.investmentRangeMax = "Maximum range must be greater than the minimum range.";
  }

  if (!values.avatarPreviewUrl && !values.avatarFile) {
    errors.avatarFile = "Profile photo is required.";
  }

  return errors;
}

export function validateInventorProfile(values) {
  const errors = {};

  if (!values.fullName.trim()) errors.fullName = "Full name is required.";
  if (!values.location.trim()) errors.location = "Location is required.";
  if (!validateEmail(values.contactEmail)) errors.contactEmail = "Enter a valid email.";
  if (!values.phoneNumber.trim()) errors.phoneNumber = "Phone number is required.";
  if (!values.inventionName.trim()) errors.inventionName = "Business or invention name is required.";
  if (!values.inventionType.trim()) errors.inventionType = "Type is required.";
  if (!values.description.trim()) errors.description = "Full description is required.";
  if (!values.revenue.trim()) errors.revenue = "Current revenue is required.";
  if (!values.equityAvailable.trim()) errors.equityAvailable = "Equity available is required.";
  if (!values.fundingSought.trim()) errors.fundingSought = "Funding sought is required.";
  if (!values.category.trim()) errors.category = "Category is required.";
  if (!values.shortPitch.trim()) errors.shortPitch = "Short pitch is required.";
  if (!validateUrl(values.websiteUrl)) errors.websiteUrl = "Use a full URL including https://";

  if (!values.avatarPreviewUrl && !values.avatarFile) {
    errors.avatarFile = "Profile photo is required.";
  }

  if (!values.galleryPreviewUrls.length && !values.galleryFiles.length) {
    errors.galleryFiles = "At least one invention or business image is required.";
  }

  return errors;
}

export function buildSearchIndex(profile) {
  return [
    profile.full_name,
    profile.location,
    profile.category,
    profile.invention_type,
    profile.preferred_industries,
    profile.looking_to_invest_in,
    profile.short_pitch,
    profile.bio,
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
}

export function matchesSearch(profile, term) {
  if (!term) return true;
  return buildSearchIndex(profile).includes(term.trim().toLowerCase());
}

export function getSwipeDirectionLabel(action) {
  if (action === "interested") return "Interested";
  return "Pass";
}
