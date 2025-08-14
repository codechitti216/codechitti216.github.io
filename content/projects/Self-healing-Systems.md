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

