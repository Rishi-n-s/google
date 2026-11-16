import http.server
import json
import os
import sys
import threading
import time
import urllib.parse

PORT = 8000
DATA_FILE = os.path.join(os.path.dirname(os.path.abspath(__file__)), "requests.json")
CLIENT_QUEUES = []
CLIENT_LOCK = threading.Lock()

def load_requests():
    if not os.path.exists(DATA_FILE):
        return []
    try:
        with open(DATA_FILE, "r", encoding="utf-8") as f:
            return json.load(f)
    except Exception as e:
        print("Error loading requests:", e)
        return []

def save_requests(requests_list):
    try:
        with open(DATA_FILE, "w", encoding="utf-8") as f:
            json.dump(requests_list, f, indent=2)
    except Exception as e:
        print("Error saving requests:", e)

def broadcast_event(event_type, data):
    payload = f"event: {event_type}\ndata: {json.dumps(data)}\n\n"
    with CLIENT_LOCK:
        dead = []
        for q in CLIENT_QUEUES:
            try:
                q.append(payload)
            except Exception:
                dead.append(q)
        for d in dead:
            if d in CLIENT_QUEUES:
                CLIENT_QUEUES.remove(d)

class GSAHandler(http.server.SimpleHTTPRequestHandler):
    def end_headers(self):
        # Enable CORS for local dev
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
        self.send_header("Access-Control-Allow-Headers", "Content-Type")
        super().end_headers()

    def do_OPTIONS(self):
        self.send_response(200)
        self.end_headers()

    def do_GET(self):
        parsed = urllib.parse.urlparse(self.path)

        if parsed.path == "/api/requests":
            requests_list = load_requests()
            data = json.dumps(requests_list).encode("utf-8")
            self.send_response(200)
            self.send_header("Content-Type", "application/json")
            self.send_header("Content-Length", str(len(data)))
            self.send_header("Cache-Control", "no-cache, no-store, must-revalidate")
            self.end_headers()
            self.wfile.write(data)
            return

        elif parsed.path == "/api/requests/stream":
            self.send_response(200)
            self.send_header("Content-Type", "text/event-stream")
            self.send_header("Cache-Control", "no-cache")
            self.send_header("Connection", "keep-alive")
            self.end_headers()

            q = []
            with CLIENT_LOCK:
                CLIENT_QUEUES.append(q)

            # Send initial state
            initial_data = json.dumps({"type": "init", "requests": load_requests()})
            try:
                self.wfile.write(f"data: {initial_data}\n\n".encode("utf-8"))
                self.wfile.flush()
            except Exception:
                with CLIENT_LOCK:
                    if q in CLIENT_QUEUES:
                        CLIENT_QUEUES.remove(q)
                return

            try:
                while True:
                    if q:
                        msg = q.pop(0)
                        self.wfile.write(msg.encode("utf-8"))
                        self.wfile.flush()
                    else:
                        # Heartbeat every 15s to keep connection alive
                        time.sleep(0.5)
            except (BrokenPipeError, ConnectionResetError):
                pass
            finally:
                with CLIENT_LOCK:
                    if q in CLIENT_QUEUES:
                        CLIENT_QUEUES.remove(q)
            return

        super().do_GET()

    def do_POST(self):
        parsed = urllib.parse.urlparse(self.path)

        if parsed.path in ["/api/requests", "/api/requests/approve", "/api/requests/reject"]:
            content_length = int(self.headers.get("Content-Length", 0))
            body = self.rfile.read(content_length).decode("utf-8")
            try:
                payload = json.loads(body)
            except Exception:
                payload = {}

            requests_list = load_requests()

            if parsed.path == "/api/requests":
                # Create or update request
                req_id = payload.get("id") or ("GSA-REQ-" + str(int(time.time()*1000)))
                payload["id"] = req_id
                payload["requestedAt"] = payload.get("requestedAt") or time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime())
                payload["status"] = payload.get("status", "pending")
                
                # Check if existing
                existing_idx = next((i for i, r in enumerate(requests_list) if r.get("id") == req_id or (r.get("participantEmail") and r.get("participantEmail") == payload.get("participantEmail"))), None)
                if existing_idx is not None:
                    requests_list[existing_idx] = payload
                else:
                    requests_list.insert(0, payload)

                save_requests(requests_list)
                broadcast_event("new_request", payload)

                resp_data = json.dumps({"success": True, "request": payload, "requests": requests_list}).encode("utf-8")
                self.send_response(200)
                self.send_header("Content-Type", "application/json")
                self.send_header("Content-Length", str(len(resp_data)))
                self.end_headers()
                self.wfile.write(resp_data)
                return

            elif parsed.path == "/api/requests/approve":
                req_id = payload.get("id")
                target = next((r for r in requests_list if r.get("id") == req_id), None)
                if target:
                    target["status"] = "approved"
                    target["decidedAt"] = time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime())
                    if not target.get("verificationId"):
                        target["verificationId"] = "GSA-PT-" + os.urandom(3).hex().upper()
                    save_requests(requests_list)
                    broadcast_event("request_approved", target)

                resp_data = json.dumps({"success": True, "request": target, "requests": requests_list}).encode("utf-8")
                self.send_response(200)
                self.send_header("Content-Type", "application/json")
                self.send_header("Content-Length", str(len(resp_data)))
                self.end_headers()
                self.wfile.write(resp_data)
                return

            elif parsed.path == "/api/requests/reject":
                req_id = payload.get("id")
                target = next((r for r in requests_list if r.get("id") == req_id), None)
                if target:
                    target["status"] = "rejected"
                    target["decidedAt"] = time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime())
                    save_requests(requests_list)
                    broadcast_event("request_rejected", target)

                resp_data = json.dumps({"success": True, "request": target, "requests": requests_list}).encode("utf-8")
                self.send_response(200)
                self.send_header("Content-Type", "application/json")
                self.send_header("Content-Length", str(len(resp_data)))
                self.end_headers()
                self.wfile.write(resp_data)
                return

        self.send_response(404)
        self.end_headers()

def run_server():
    os.chdir(os.path.dirname(os.path.abspath(__file__)))
    server_address = ("", PORT)
    httpd = http.server.ThreadingHTTPServer(server_address, GSAHandler)
    print(f"GSA Real-Time Server running at http://localhost:{PORT}")
    try:
        httpd.serve_forever()
    except KeyboardInterrupt:
        pass
    finally:
        httpd.server_close()

if __name__ == "__main__":
    run_server()
