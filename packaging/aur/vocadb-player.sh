#!/usr/bin/env bash
export GDK_BACKEND="${GDK_BACKEND:-x11}"
export WINIT_UNIX_BACKEND="${WINIT_UNIX_BACKEND:-x11}"
exec /usr/lib/vocadb-player/vocadb-player "$@"
