---
title: "Agentic Multi-Node Operations Simulation on a Laptop"
date: "2025-08-09"
tags:
  - "Cloud Infrastructure"
  - "Agentic AI"
  - "OATS"
  - "Self-Healing Systems"
  - "Simulation"
  - "Learning Journey"
status: "in-progress"
kind: "project"
published: true
visibility: "public"
institution: "Independent"
duration: "August 2025 – ongoing"
---



# Introduction

This is my first project in the field of Distrubuted Systems. After a lot of brainstorming, I have finally internalised the scope of the project. Now, I have to start learning things and implement them as quickly as possible. The goal is not to take any help of AI assistance at all. 

I’m starting with no prior experience in Docker, APIs, HTTP, containers… In short: Zero. Zip. Nada.

> Today is 14th August. I am starting the project today.. I will be posting a daily update of what the plan is.. What I have executed.. What I have learnt and how is this relevant to the project. 

### 14th August

# Checklist

- [ ] Write Python HTTP servers and clients from scratch
- [ ] Handle JSON request/response cycles flawlessly
- [ ] Debug network communication issues
- [ ] Understand the foundation for all microservice communication

# Lets start from the basics.. 

### HTTP – HyperText Transfer Protocol

HTTP is the set of rules that determines how web browsers and web servers communicate. It specifies exactly how a request for information should be written and how the server’s reply should be formatted.

### HTTPS – The Secure Version of HTTP

HTTPS works exactly like HTTP, but it wraps every request and response in encryption using TLS (Transport Layer Security). This keeps the conversation private and ensures that no one can alter it while in transit.

### TCP – Transmission Control Protocol

TCP is the delivery system that carries HTTP or HTTPS messages between two computers. It guarantees that data arrives completely, in the correct order, and without errors. TCP doesn’t care what the data means — its job is simply to move bytes reliably.

### IP – Internet Protocol

IP is the addressing system of the internet. Every connected device has a unique IP address, just like every house has a unique street address. TCP uses these addresses to figure out where to send data and where to receive it from.

### How They Work Together

When I open Google Chrome and type https://google.com, my browser creates an HTTPS request — a carefully structured message asking Google’s servers for the homepage. Before sending it, HTTPS encrypts the message so that it’s private.

This encrypted message is handed to TCP. TCP makes sure it reaches Google’s servers without loss or corruption. To do this, TCP uses IP addresses to know exactly where Google is on the internet.

Once the request arrives, Google’s server decrypts it, processes it, and prepares a response containing the homepage data. That response is sent back over TCP — again using IP to address it — and my browser decrypts and displays the page.

### The Ring-and-Thread Analogy

Imagine I have a ring I want to send from Point A (me) to Point B (the server).

First, I tie a thread between A and B — this is TCP, creating a reliable path.

The coordinates of A and B are like IP addresses, telling me where each point is.

The ring itself is the HTTP message — the content I want to send.

If I put the ring in a locked box before sending it, that’s HTTPS (encryption).

The knots at each end of the thread are the sockets — they’re the connection points that let me attach the message to the TCP line.

<div style="text-align: center; margin: 20px 0;">
  <img src="assets/http_analogy.gif" alt="HTTP Analogy Animation" width="100%" style="max-width: 800px; border: 2px solid #ddd; border-radius: 8px;" />
</div>

<p style="text-align: center;">
  <em>Visual Aid to help you understand the theory better</em>
</p>


### In this analogy:

- HTTP/HTTPS is the format and security of the object you’re sending.

- TCP is the reliable physical link carrying it.

- IP is the addressing system that tells you where the ends of the thread are.

- Sockets are the attachment points at each end where the message enters or leaves the TCP connection.



#### Now that the theory is clear, lets get to the first task. 

For barebones HTTP servers, the only library need is the *socket* library. So, lets start with 

```python
import socket
```

Now, since we intend to do this completely using this system alone, the special IP address which makes your sytem act as both Server and Client in a loop is 

```python
HOST = "127.0.0.1"
PORT = 8080 
```
You might be wondering what the hell a PORT is.. It is the sub address after the IP Address which is like the door number to your apartment address.

> We have now decided who our host is.. Lets start developing the knots (sockets). 

```python
with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as server:
```
Lets strip the jargon here. This creates a socket object.. the knot at point A, ready to be tied to something... but haven’t tied it anywhere yet.



### 15th August

Today I wanted to try something new --- setting up Docker together with LM Studio, and pulling down the Qwen model. The plan was simple: keep the plumbing minimal but real, just enough to see things running.

I installed Docker Desktop, got LM Studio running locally, and managed to pull Qwen. But once I tried wiring them together, everything became about Docker quirks on Windows --- socket errors, persistence issues, and container access problems. I spent hours debugging small details instead of learning anything new about the project itself.

The demo only worked in fragments, never fully. At that point, I realised the cost of fighting with Docker was higher than the learning value I was getting. I decided to shelve Docker for now.

The key insight for today: I am not actually excited about containers. What excites me is seeing agents make decisions under stress --- Villain versus Felix. The more I try to polish the plumbing, the less energy I have for building the actual arena.

- **Visual aid (placeholder)**
  - [Figure: "Docking failure" scratchpad --- Docker whale bumping into a locked LM Studio icon. Caption: "When the dock isn't the destination."] [TODO: add doodle/gif]

---

### 17th August

After dropping Docker, I turned my focus to the arena itself. The goal was to stand up five simple services and create a tool that could reliably start, stop, and kill them. I also wanted to redirect logs to files and add a health check so I could confirm when a service was really alive.

I wrote `SuperTool.start_service` to launch services with the same Python interpreter (so it stays venv-safe). I redirected stdout and stderr into a `service_logs/` folder, which makes it easy to tail logs later. Then I added a health check: if the service doesn't respond to `/healthz` or `/status` within three seconds, I consider it failed and record the stderr tail for debugging.

```python
# super_tool.py
# Prepare log files
stdout_log = self.service_logs_dir / f"{service_name}_stdout.log"
stderr_log = self.service_logs_dir / f"{service_name}_stderr.log"

try:
    with open(stdout_log, 'a') as stdout_f, open(stderr_log, 'a') as stderr_f:
        # Use the same Python interpreter as the current process (venv-safe)
        cmd = [sys.executable, str(script_path)]
        print(f"[SUPER_TOOL] launching: {' '.join(cmd)} (cwd={self.project_root}) -> stdout={stdout_log.name}, stderr={stderr_log.name}")
        process = subprocess.Popen(
            cmd,
            cwd=self.project_root,
            stdout=stdout_f,
            stderr=stderr_f,
            text=True
        )

```

```
# super_tool.py
# Wait for health check (up to 3 seconds)
for i in range(10):
    time.sleep(0.3)
    healthy = self._verify_service_health(service_name)
    print(f"[SUPER_TOOL] health[{i}] service={service_name} pid={process.pid} healthy={healthy}")
    if healthy:
        result = {"ok": True, "pid": process.pid, "port": service_config["port"]}
        self.record_action_event(service_name, "start", time.time() - start_time, result)
        return result

# Health check failed
tail = self._read_log_tail(stderr_log)

```

But then Windows surprised me. After I killed a service, the port wasn't free. I hit WinError 10048 --- "Only one usage of each socket address is normally permitted." Basically, Windows doesn't release ports instantly after a kill. To handle this, I wrote a preflight function that scans which process is using a port and surfaces the PID and command line. That way, I know exactly what is blocking me.

```
# super_tool.py
def _find_process_on_port(self, port):
    """Return (pid, cmdline) of process using the given port, or None if free."""
    import psutil
    for proc in psutil.process_iter(['pid', 'cmdline']):
        try:
            for conn in proc.connections(kind='inet'):
                if conn.status == psutil.CONN_LISTEN and conn.laddr.port == port:
                    return proc.info['pid'], ' '.join(proc.info.get('cmdline', []))
        except Exception:
            continue
    return None

```

By the end of the day, I had five services that could boot, report health, and log to disk. When a port was stuck, I could see exactly who was holding it.

The key learning here: on Windows, "kill" does not mean "free." The OS has its own habits. Instead of fighting it, I added visibility (PID + cmdline) and a user path to resolve conflicts.

-   **Visual aids (placeholders)**

<div style="text-align: center; margin: 20px 0;">
  <img src="assets/ALLservices_Overview.png" alt="All Services Overview" width="100%" style="max-width: 800px; border: 2px solid #ddd; border-radius: 8px;" />
</div>
<p style="text-align: center;">
  <em>All Services Overview</em>
</p>
* * * * *

### 18th August

Today I tackled something subtle but important: the "two brains" problem. Initially, both the monitor and the dashboard had their own `SuperTool`. That meant two different places were trying to be the source of truth. The monitor said one thing, the dashboard said another. It felt like watching two scoreboards showing different results for the same game.

I fixed this by making the monitor the only truth-teller. The monitor now writes `data/status.json` every second. The dashboard simply reads this file for `/api/status` and `/api/metrics`. Actions are also forwarded to the monitor through a lightweight control API (running on port 9000). In short: one brain, one scoreboard.

```
# dashboard_api.py
@self.app.get("/api/status")
async def api_status():
    try:
        with open('data/status.json', 'r', encoding='utf-8') as f:
            status = json.load(f)
        return status['services']
    except Exception as e:
        print('[DASHBOARD_API] status.json error:', e)
        return {}

```

```
# main.py
def start_control_api(self, host: str = "127.0.0.1", port: int = 9000):
    if self.api_app is not None:
        return
    app = FastAPI(title="Chaos Monitor Control API")

    @app.get("/api/health")
    async def api_health():
        payload = {"status": "ok"}
        return payload

    @app.post("/api/actions/start/{service_name}")
    async def api_start(service_name: str):
        result = self.super_tool.start_service(service_name)
        return result

```

With this setup, when I press Start/Stop/Kill in the UI, the action is routed to the monitor, executed there, and reflected immediately in status.json. The UI only mirrors reality --- no more contradictions.

One funny bug I ran into: I kept clicking "Recover" on a dead service. Nothing happened, of course. Then it hit me: recovery only makes sense if the process is alive. No process → no port → no `/recover`. Start is like a defibrillator; Recover is rehab.

The big insight for today: truth must live in one place. Everything else --- dashboards, logs, buttons --- are just windows into that truth.

-   **Visual aids (placeholders)**

<div style="text-align: center; margin: 20px 0;">
  <img src="assets/one_brain.png" alt="One Brain Architecture" width="100%" style="max-width: 800px; border: 2px solid #ddd; border-radius: 8px;" />
</div>
<p style="text-align: center;">
  <em>One Brain Architecture</em>
</p>


    <div style="text-align: center; margin: 20px 0;">
  <video src="assets/chaos_dashboard_2025-08-18T17-14-16-440Z.webm" controls width="100%" style="max-width: 800px; border: 2px solid #ddd; border-radius: 8px;"></video>
</div>
<p style="text-align: center;">
  <em>Chaos Dashboard Demo</em>
</p>
* * * * *

### 19th August

By today, the arena was behaving much more consistently, so I shifted my focus to ergonomics --- making the operator's job clearer.

At first, my console logs were noisy. Every button update, every background poll, every small status change spammed the logs. It was like listening to static. I trimmed it down: now only actions and errors are loud, while background events stay quiet.

I also added explicit messages in the UI about why a button is enabled or disabled. For example, if "Recover" is greyed out, the UI now says: *"Recover disabled: service is not running."* That way I don't keep clicking blindly.

```
# dashboard/index.html
async function performAction(event, action, serviceName, param = null) {
    const button = event.target;
    const originalText = button.textContent;
    console.log(`[DASH] User clicked ${action} for ${serviceName}`);
    // ... request + toast + refresh ...
}

```

After running several start/stop/kill cycles, the charts finally tell a coherent story. They are not polished yet, but they are honest --- and that matters more right now.

The lesson today: consistency beats cleverness. A clear explanation of *why* a button is disabled is worth more than a complicated heuristic. And I finally understood the semantics: "Recover" is only for living services; "Start" is for dead ones. I had been arguing with physics, and physics always wins.

* * * * *

### What's Next

Now that the plumbing is stable, the next step is the exciting part: bringing in the agents. I want to integrate an LLM or an agentic framework (LangChain/AutoGen) so that Villain can inject failures on a policy, and Felix can plan recoveries under constraints.

This means I need to define an observation/action schema, choose what rewards matter (mean-time-to-recovery, containment, collateral damage), and wire the control API to accept agent commands.

The insight here is that the plumbing is only the minimum viable arena. The real research is in the loops --- imperfect telemetry, delayed effects, and trade-offs. That's where Felix earns the name.