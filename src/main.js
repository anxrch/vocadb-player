const { invoke } = window.__TAURI__.core;

const DEFAULT_URL = "https://vocadb.net/";
const BLOCKED_HOSTS = ["nicovideo.jp", "nico.ms", "smilevideo.jp"];
const EMBED_WARNING =
  "Embedded playback is disabled in the app. Use Open in Browser for videos.";
const MPV_PROMPT = "Enter a video or VocaDB URL to play in mpv:";

const safeWindowCall = (callback) => {
  try {
    callback();
  } catch (error) {
    console.warn("Navigation action failed", error);
  }
};

const getFrameUrl = (frame) => {
  try {
    const href = frame.contentWindow?.location?.href;
    if (href && href !== "about:blank") {
      return href;
    }
  } catch (error) {
    // Cross-origin access is expected.
  }

  return frame.getAttribute("src") || DEFAULT_URL;
};

const isBlockedUrl = (url) =>
  BLOCKED_HOSTS.some((host) => url.includes(host));

const openExternalUrl = (url) => {
  const opener = window.__TAURI__?.opener;
  if (opener?.openUrl) {
    opener.openUrl(url);
    return;
  }
  window.open(url, "_blank", "noopener");
};

window.addEventListener("DOMContentLoaded", () => {
  const frame = document.querySelector("#vocadb-frame");
  const loading = document.querySelector("#loading");
  const openExternal = document.querySelector("#open-external");
  const playMpv = document.querySelector("#play-mpv");
  const addressLabel = document.querySelector(".address-label");
  let lastSafeUrl = DEFAULT_URL;

  const updateLoading = (isLoading) => {
    loading.classList.toggle("is-hidden", !isLoading);
  };

  updateLoading(true);

  frame.addEventListener("load", () => {
    updateLoading(false);

    const currentUrl = getFrameUrl(frame);
    if (addressLabel) {
      addressLabel.textContent = currentUrl;
      addressLabel.title = EMBED_WARNING;
    }
    if (currentUrl.includes("vocadb.net")) {
      lastSafeUrl = currentUrl;
    }

    if (isBlockedUrl(currentUrl)) {
      openExternalUrl(currentUrl);
      frame.src = lastSafeUrl || DEFAULT_URL;
    }
  });

  document.querySelectorAll("[data-action]").forEach((button) => {
    button.addEventListener("click", () => {
      const action = button.dataset.action;
      if (!action) return;

      switch (action) {
        case "back":
          safeWindowCall(() => frame.contentWindow.history.back());
          break;
        case "forward":
          safeWindowCall(() => frame.contentWindow.history.forward());
          break;
        case "reload":
          safeWindowCall(() => frame.contentWindow.location.reload());
          break;
        case "home":
          updateLoading(true);
          frame.src = DEFAULT_URL;
          break;
        default:
          break;
      }
    });
  });

  openExternal.addEventListener("click", () => {
    const currentUrl = getFrameUrl(frame);
    openExternalUrl(currentUrl);
  });

  playMpv.addEventListener("click", async () => {
    let currentUrl = getFrameUrl(frame);
    if (!currentUrl || currentUrl === DEFAULT_URL) {
      const manualUrl = window.prompt(MPV_PROMPT);
      if (!manualUrl) return;
      currentUrl = manualUrl.trim();
    }

    try {
      await invoke("play_with_mpv", { url: currentUrl });
    } catch (error) {
      console.error("mpv launch failed", error);
      window.alert("Failed to launch mpv. Ensure mpv is installed.");
    }
  });
});
