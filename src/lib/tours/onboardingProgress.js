const KEY = "onboarding_step";

export function getOnboardingStep() {
    return Number(localStorage.getItem(KEY) || 0);
}

export function setOnboardingStep(step) {
    localStorage.setItem(KEY, String(step));
}

export function resetOnboarding() {
    localStorage.removeItem(KEY);
    localStorage.removeItem("onboarding_completed");
}
