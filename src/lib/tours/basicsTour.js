import { driver } from "driver.js";
import { createSupabaseBrowserClient } from "@/lib/supabase/browser";

export function createBasicsTour() {
    return driver({
        showProgress: true,
        animate: true,
        allowClose: false,
        overlayClickBehavior: "close",
        showButtons: ["next", "close"],
        nextBtnText: "Next",
        prevBtnText: "Previous",
        doneBtnText: "Done",
        steps: [
            {
                element: "#portal-switcher",
                popover: {
                    title: "Switch Portals",
                    description: "Change between workspaces and portals here.",
                    side: "bottom",
                    align: "start"
                }
            },

            {
                element: "#actions-sidebar",
                popover: {
                    title: "Actions",
                    description: "Create and manage emulator actions here."
                }
            },

            {
                element: "#create-action-button",
                popover: {
                    title: "Create Your First Action",
                    description:
                        "When you're ready, create your first action here."
                }
            },

            {
                element: "#settings-button",
                popover: {
                    title: "Settings & Secrets",
                    description:
                        "Manage secrets and runtime settings here."
                },
                onHighlightStarted: () => {
                    const el = document.querySelector("#settings-button");
                    if (!el) return false;
                }
            },

            {
                element: "#templates-button",
                popover: {
                    title: "Templates",
                    description:
                        "Templates help you build faster. Explore anytime."
                }
            }
        ],

        onDestroyed: async () => {
            try {
                localStorage.setItem("basics_tour_seen", "true");

                const supabase = createSupabaseBrowserClient();

                const { data } = await supabase.auth.getUser();

                if (data?.user?.id) {
                    await supabase
                        .from("profiles")
                        .update({ completed_basic_tour: true })
                        .eq("id", data.user.id);
                }

            } catch (e) {
                console.warn("Failed to persist basics tour completion", e);
            }

            window.__activeTour = null;
        }

    });
}
