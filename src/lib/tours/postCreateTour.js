import { driver } from "driver.js";
import { createSupabaseBrowserClient } from "@/lib/supabase/browser";

const supabase = createSupabaseBrowserClient();

export function createPostCreateTour() {
    return driver({
        showProgress: true,
        animate: true,

        nextBtnText: "Next",
        prevBtnText: "Previous",
        doneBtnText: "Done",
        showButtons: ["next", "close"],
        allowClose: false,
        allowKeyboardClose: false,
        overlayClickBehavior: "none",

        steps: [
            {
                element: "#editor-panel",
                popover: {
                    title: "Editor",
                    description:
                        "This is where you write and test your runtime code."
                }
            },

            {
                element: "#run-button",
                popover: {
                    title: "Run Code",
                    description:
                        "Run your action using the test payload."
                }
            },

            {
                element: "#execution-list",
                popover: {
                    title: "Executions",
                    description:
                        "Execution results will appear here."
                }
            }
        ],

        onDestroyed: () => {
            try {
                localStorage.setItem("post_create_tour_seen", "true");

                // Fire-and-forget Supabase persistence
                supabase.auth.getUser().then(({ data }) => {
                    if (!data?.user?.id) return;

                    supabase
                        .from("profiles")
                        .update({ completed_post_create_tour: true })
                        .eq("id", data.user.id);
                });

            } catch (e) {
                console.warn("Failed to persist post-create tour completion", e);
            }

            window.__activeTour = null;
        }
    });
}
