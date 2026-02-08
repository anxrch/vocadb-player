use std::process::Command;
use tauri::{Manager, Url, Webview};
use tauri_plugin_opener::OpenerExt;

const BLOCKED_HOSTS: [&str; 3] = ["nicovideo.jp", "nico.ms", "smilevideo.jp"];

#[tauri::command]
fn play_with_mpv(url: String) -> Result<(), String> {
    let trimmed = url.trim();
    if !(trimmed.starts_with("http://") || trimmed.starts_with("https://")) {
        return Err("Only http(s) URLs are supported.".into());
    }

    Command::new("mpv")
        .arg(trimmed)
        .spawn()
        .map_err(|error| format!("Failed to launch mpv: {error}"))?;

    Ok(())
}

fn is_blocked_host(host: &str) -> bool {
    BLOCKED_HOSTS
        .iter()
        .any(|blocked| host == *blocked || host.ends_with(&format!(".{blocked}")))
}

fn open_external(webview: &Webview, url: &Url) {
    if url.scheme() == "http" || url.scheme() == "https" {
        let _ = webview
            .window()
            .app_handle()
            .opener()
            .open_url(url.as_str(), None::<&str>);
    }
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .invoke_handler(tauri::generate_handler![play_with_mpv])
        .plugin(
            tauri::plugin::Builder::<_, ()>::new("navigation-guard")
                .on_navigation(|webview, url| {
                    let host = url.host_str().unwrap_or("");
                    if is_blocked_host(host) {
                        open_external(webview, url);
                        return false;
                    }

                    true
                })
                .build(),
        )
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
