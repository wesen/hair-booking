#!/usr/bin/env python3
"""devctl plugin for the hair-booking repo.

This plugin intentionally keeps stdout as NDJSON protocol frames only. All
human-readable diagnostics go to stderr so devctl can parse the protocol.
"""

from __future__ import annotations

import json
import os
import shutil
import sys
from pathlib import Path
from typing import Any

PLUGIN_NAME = "hair-booking"
DEFAULT_BACKEND_HOST = "127.0.0.1"
DEFAULT_BACKEND_PORT = "19080"
DEFAULT_WEB_HOST = "127.0.0.1"
DEFAULT_WEB_PORT = "5175"


def emit(frame: dict[str, Any]) -> None:
    sys.stdout.write(json.dumps(frame, separators=(",", ":")) + "\n")
    sys.stdout.flush()


def log(message: str) -> None:
    print(f"[{PLUGIN_NAME}] {message}", file=sys.stderr, flush=True)


def env_str(name: str, default: str) -> str:
    value = os.environ.get(name, "").strip()
    return value if value else default


def env_services() -> set[str]:
    raw = env_str("HAIR_BOOKING_DEVCTL_SERVICES", "backend,web")
    return {part.strip().lower() for part in raw.split(",") if part.strip()}


def settings() -> dict[str, str]:
    backend_host = env_str("HAIR_BOOKING_DEVCTL_BACKEND_HOST", DEFAULT_BACKEND_HOST)
    backend_port = env_str("HAIR_BOOKING_DEVCTL_BACKEND_PORT", DEFAULT_BACKEND_PORT)
    web_host = env_str("HAIR_BOOKING_DEVCTL_WEB_HOST", DEFAULT_WEB_HOST)
    web_port = env_str("HAIR_BOOKING_DEVCTL_WEB_PORT", DEFAULT_WEB_PORT)
    backend_url = env_str("HAIR_BOOKING_BACKEND_URL", f"http://{backend_host}:{backend_port}")
    web_url = f"http://{web_host}:{web_port}"
    return {
        "backend_host": backend_host,
        "backend_port": backend_port,
        "backend_url": backend_url,
        "web_host": web_host,
        "web_port": web_port,
        "web_url": web_url,
        "services": ",".join(sorted(env_services())),
    }


def repo_root(req: dict[str, Any]) -> Path:
    ctx = req.get("ctx") or {}
    root = ctx.get("repo_root") or os.getcwd()
    return Path(root).resolve()


def ok(request_id: str, output: dict[str, Any]) -> None:
    emit({"type": "response", "request_id": request_id, "ok": True, "output": output})


def unsupported(request_id: str, op: str) -> None:
    emit({
        "type": "response",
        "request_id": request_id,
        "ok": False,
        "error": {"code": "E_UNSUPPORTED", "message": f"unsupported op: {op}"},
    })


def handle_config_mutate(request_id: str) -> None:
    s = settings()
    ok(request_id, {
        "config_patch": {
            "set": {
                "env.HAIR_BOOKING_BACKEND_URL": s["backend_url"],
                "services.hair-booking-backend.host": s["backend_host"],
                "services.hair-booking-backend.port": int(s["backend_port"]),
                "services.hair-booking-backend.url": s["backend_url"],
                "services.hair-booking-web.host": s["web_host"],
                "services.hair-booking-web.port": int(s["web_port"]),
                "services.hair-booking-web.url": s["web_url"],
                "services.hair-booking-web.demo_url": f"{s['web_url']}/dsl-goja-demo",
                "devctl.hair-booking.services": s["services"],
            },
            "unset": [],
        }
    })


def missing_tool_errors(tools: list[str]) -> list[dict[str, str]]:
    errors = []
    for tool in tools:
        if shutil.which(tool) is None:
            errors.append({"code": "E_MISSING_TOOL", "message": f"missing required tool: {tool}"})
    return errors


def handle_validate_run(request_id: str, req: dict[str, Any]) -> None:
    root = repo_root(req)
    errors: list[dict[str, str]] = []
    warnings: list[dict[str, str]] = []

    errors.extend(missing_tool_errors(["go", "pnpm", "bash"]))

    for rel in ["cmd/hair-booking", "web/package.json", "web/pnpm-lock.yaml", "web/vite.config.ts"]:
        if not (root / rel).exists():
            errors.append({"code": "E_MISSING_PATH", "message": f"missing expected path: {rel}"})

    if not (root / "web" / "node_modules").exists():
        warnings.append({
            "code": "W_WEB_DEPS_MISSING",
            "message": "web/node_modules is missing; run `cd web && pnpm install` before starting the web service",
        })

    s = settings()
    if env_services() - {"backend", "web"}:
        errors.append({
            "code": "E_UNKNOWN_SERVICE_SELECTION",
            "message": f"HAIR_BOOKING_DEVCTL_SERVICES must contain backend and/or web, got {s['services']}",
        })

    ok(request_id, {"valid": not errors, "errors": errors, "warnings": warnings})


def handle_launch_plan(request_id: str) -> None:
    s = settings()
    selected = env_services()
    services: list[dict[str, Any]] = []

    if "backend" in selected:
        services.append({
            "name": "hair-booking-backend",
            "cwd": ".",
            "command": [
                "bash",
                "--noprofile",
                "--norc",
                "-lc",
                "mkdir -p var/uploads .devctl/tmp && exec go run ./cmd/hair-booking serve --auth-mode dev --listen-host ${HAIR_BOOKING_DEVCTL_BACKEND_HOST:-127.0.0.1} --listen-port ${HAIR_BOOKING_DEVCTL_BACKEND_PORT:-19080}",
            ],
            "env": {
                "HAIR_BOOKING_DEVCTL_BACKEND_HOST": s["backend_host"],
                "HAIR_BOOKING_DEVCTL_BACKEND_PORT": s["backend_port"],
                "HAIR_BOOKING_STORAGE_LOCAL_DIR": "./var/uploads",
                "HAIR_BOOKING_PUBLIC_BASE_URL": s["backend_url"],
            },
            "health": {"type": "http", "url": f"{s['backend_url']}/healthz", "timeout_ms": 60000},
        })

    if "web" in selected:
        services.append({
            "name": "hair-booking-web",
            "cwd": "web",
            "command": [
                "bash",
                "--noprofile",
                "--norc",
                "-lc",
                "exec pnpm dev:backend --host ${HAIR_BOOKING_DEVCTL_WEB_HOST:-127.0.0.1} --port ${HAIR_BOOKING_DEVCTL_WEB_PORT:-5175} --strictPort",
            ],
            "env": {
                "VITE_ENABLE_MSW": "false",
                "HAIR_BOOKING_BACKEND_URL": s["backend_url"],
                "HAIR_BOOKING_DEVCTL_WEB_HOST": s["web_host"],
                "HAIR_BOOKING_DEVCTL_WEB_PORT": s["web_port"],
            },
            "health": {"type": "http", "url": s["web_url"], "timeout_ms": 60000},
        })

    ok(request_id, {"services": services})


def main() -> None:
    emit({
        "type": "handshake",
        "protocol_version": "v2",
        "plugin_name": PLUGIN_NAME,
        "capabilities": {"ops": ["config.mutate", "validate.run", "launch.plan"]},
    })

    for line in sys.stdin:
        line = line.strip()
        if not line:
            continue
        try:
            req = json.loads(line)
            request_id = req.get("request_id", "")
            op = req.get("op", "")
            if op == "config.mutate":
                handle_config_mutate(request_id)
            elif op == "validate.run":
                handle_validate_run(request_id, req)
            elif op == "launch.plan":
                handle_launch_plan(request_id)
            else:
                unsupported(request_id, op)
        except Exception as exc:  # noqa: BLE001 - protocol boundary
            rid = ""
            try:
                rid = json.loads(line).get("request_id", "")
            except Exception:
                pass
            emit({
                "type": "response",
                "request_id": rid,
                "ok": False,
                "error": {"code": "E_PLUGIN_EXCEPTION", "message": str(exc)},
            })


if __name__ == "__main__":
    main()
