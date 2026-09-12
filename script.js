"use strict";

const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const desktopDevice = window.matchMedia("(hover: hover) and (pointer: fine)").matches;

const cursor = document.querySelector(".cursor");
const cursorDot = document.querySelector(".cursor-dot");
const glow = document.querySelector(".mouse-glow");
const menuButton = document.querySelector(".menu-button");
const mobileMenu = document.querySelector(".mobile-menu");
const navbar = document.querySelector(".navbar");

// CUSTOM CURSOR
if (cursor && cursorDot && desktopDevice && !prefersReducedMotion) {
    let mouseX = window.innerWidth / 2, mouseY = window.innerHeight / 2;
    let cursorX = mouseX, cursorY = mouseY;

    document.addEventListener("mousemove", (e) => {
        mouseX = e.clientX; mouseY = e.clientY;
        if (glow) { glow.style.left = mouseX + "px"; glow.style.top = mouseY + "px"; }
    });

    function animateCursor() {
        cursorX += (mouseX - cursorX) * 0.15; cursorY += (mouseY - cursorY) * 0.15;
        cursor.style.left = cursorX + "px"; cursor.style.top = cursorY + "px";
        cursorDot.style.left = mouseX + "px"; cursorDot.style.top = mouseY + "px";
        requestAnimationFrame(animateCursor);
    }
    animateCursor();

    const hoverElements = document.querySelectorAll("a, button, .matrix-card, .achieve-card, .ph-left, .dispatch-card");
    hoverElements.forEach((el) => {
        el.addEventListener("mouseenter", () => { cursor.style.width = "50px"; cursor.style.height = "50px"; });
        el.addEventListener("mouseleave", () => { cursor.style.width = "32px"; cursor.style.height = "32px"; });
    });
} else {
    if (cursor) cursor.style.display = "none";
    if (cursorDot) cursorDot.style.display = "none";
}

// SCROLL REVEAL
const revealElements = document.querySelectorAll(".reveal");
if ("IntersectionObserver" in window && !prefersReducedMotion) {
    const revealObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach((entry) => {
            if (entry.isIntersecting) {
                entry.target.classList.add("visible");
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.12 });
    revealElements.forEach((el) => revealObserver.observe(el));
} else {
    revealElements.forEach((el) => el.classList.add("visible"));
}

// MOBILE MENU
if (menuButton && mobileMenu) {
    function closeMobileMenu() {
        mobileMenu.classList.remove("active");
        menuButton.setAttribute("aria-expanded", "false");
    }
    menuButton.addEventListener("click", () => {
        const isOpen = mobileMenu.classList.toggle("active");
        menuButton.setAttribute("aria-expanded", String(isOpen));
    });
    mobileMenu.querySelectorAll("a").forEach(link => link.addEventListener("click", closeMobileMenu));
}

// NAVBAR SCROLL
if (navbar) {
    window.addEventListener("scroll", () => {
        if (window.scrollY > 50) navbar.classList.add("scrolled");
        else navbar.classList.remove("scrolled");
    }, { passive: true });
}

// TERMINAL CURSOR BLINK
const terminalCursor = document.querySelector(".typing-cursor");
if (terminalCursor && !prefersReducedMotion) {
    setInterval(() => { terminalCursor.style.opacity = terminalCursor.style.opacity === "0" ? "1" : "0"; }, 600);
}

// MAGNETIC BUTTONS
if (!prefersReducedMotion && desktopDevice) {
    const magneticElements = document.querySelectorAll(".magnetic, .primary-button, .cli-button");
    magneticElements.forEach((el) => {
        el.addEventListener("mousemove", (e) => {
            const rect = el.getBoundingClientRect();
            const x = e.clientX - (rect.left + rect.width / 2);
            const y = e.clientY - (rect.top + rect.height / 2);
            el.style.transform = `translate(${x * 0.12}px, ${y * 0.12}px)`;
        });
        el.addEventListener("mouseleave", () => el.style.transform = "");
    });
}

// SMOOTH SCROLL
document.querySelectorAll('a[href^="#"]').forEach((link) => {
    link.addEventListener("click", (e) => {
        const targetId = link.getAttribute("href");
        if (!targetId || targetId === "#") return;
        const target = document.querySelector(targetId);
        if (!target) return;
        e.preventDefault();
        target.scrollIntoView({ behavior: prefersReducedMotion ? "auto" : "smooth", block: "start" });
    });
});

// ROLE TYPING ANIMATION
const roleElement = document.querySelector(".role-text");
if (roleElement && !prefersReducedMotion) {
    const roles = ["secure", "scalable", "efficient", "deterministic"];
    let roleIndex = 0, charIndex = 0, deleting = false;

    function typeRole() {
        const currentRole = roles[roleIndex];
        if (!deleting) {
            charIndex++;
            roleElement.textContent = currentRole.substring(0, charIndex);
            if (charIndex === currentRole.length) {
                deleting = true;
                setTimeout(typeRole, 1500);
                return;
            }
        } else {
            charIndex--;
            roleElement.textContent = currentRole.substring(0, charIndex);
            if (charIndex === 0) {
                deleting = false;
                roleIndex = (roleIndex + 1) % roles.length;
            }
        }
        setTimeout(typeRole, deleting ? 55 : 90);
    }
    typeRole();
}

window.addEventListener("load", () => {
    const hero = document.querySelector(".hero");
    if (hero) hero.classList.add("loaded");
});

// SYSTEM HUD UPTIME CLOCK
const uptimeEl = document.getElementById("hud-uptime");
let startTime = Date.now();
if (uptimeEl) {
    setInterval(() => {
        const diff = Math.floor((Date.now() - startTime) / 1000);
        const h = String(Math.floor(diff / 3600)).padStart(2, '0');
        const m = String(Math.floor((diff % 3600) / 60)).padStart(2, '0');
        const s = String(diff % 60).padStart(2, '0');
        uptimeEl.innerText = `${h}:${m}:${s}`;
    }, 1000);
}

// COMMAND PALETTE (CTRL + K)
const cmdPalette = document.getElementById("cmd-palette");
const cmdInput = document.getElementById("cmd-input");
const cmdList = document.getElementById("cmd-list");
const cmdLinks = cmdList ? cmdList.querySelectorAll("li a") : [];

if (cmdPalette && cmdInput) {
    function togglePalette() {
        const isActive = cmdPalette.classList.toggle("active");
        if (isActive) {
            setTimeout(() => cmdInput.focus(), 100);
        } else {
            cmdInput.value = "";
            filterCommands("");
            cmdInput.blur();
        }
    }
    function filterCommands(query) {
        const filter = query.toLowerCase();
        cmdLinks.forEach(link => {
            const text = link.getAttribute("data-text").toLowerCase();
            link.parentElement.style.display = text.includes(filter) ? "" : "none";
        });
    }
    document.addEventListener("keydown", (e) => {
        if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
            e.preventDefault(); togglePalette();
        }
        if (e.key === "Escape" && cmdPalette.classList.contains("active")) togglePalette();
    });
    cmdPalette.addEventListener("click", (e) => { if (e.target === cmdPalette) togglePalette(); });
    cmdInput.addEventListener("input", (e) => filterCommands(e.target.value));
    cmdLinks.forEach(link => link.addEventListener("click", togglePalette));
}

// TERMINAL EASTER EGG & DRAGGABLE
const terminalBody = document.querySelector(".terminal-body");
let terminalActive = false;

if (terminalBody && desktopDevice) {
    terminalBody.addEventListener("click", () => {
        if (terminalActive) return;
        terminalActive = true;

        const inputLine = document.createElement("div");
        inputLine.className = "terminal-input-wrapper";
        inputLine.innerHTML = `<span class="green">hardik@vit:~$</span> <input type="text" id="term-input" autocomplete="off" spellcheck="false">`;
        terminalBody.appendChild(inputLine);

        const termInput = document.getElementById("term-input");
        termInput.focus();

        termInput.addEventListener("keydown", (e) => {
            if (e.key === "Enter") {
                const val = termInput.value.trim().toLowerCase();
                const response = document.createElement("p");
                response.style.color = "#888"; response.style.marginTop = "5px"; response.style.marginBottom = "10px";

                if (val === "help") {
                    response.innerHTML = `Available commands:<br><span class="yellow">about</span>    - Who is Hardik?<br><span class="yellow">sudo</span>     - Gain root access<br><span class="yellow">contact</span>  - Get email`;
                } else if (val === "about") {
                    response.innerHTML = `> Hardik Vikas Jain.<br>> B.Tech CSE InfoSec @ VIT Vellore.<br>> I build secure scalable systems.`;
                } else if (val === "sudo" || val === "sudo su") {
                    response.innerHTML = `🚨 <span style="color:#ff3333">Access Denied.</span> This incident will be reported.`;
                } else if (val === "contact") {
                    response.innerHTML = `> Drop a mail at: <span class="green">hardikvikasjain@gmail.com</span>`;
                } else if (val !== "") {
                    response.innerHTML = `bash: ${val}: command not found. Type <span class="green">help</span>`;
                }

                if (val !== "") terminalBody.insertBefore(response, inputLine.nextSibling);
                termInput.value = "";
            }
        });
    });
}

// DRAGGABLE HERO TERMINAL
const terminal = document.querySelector(".terminal");
const terminalTop = document.querySelector(".terminal-top");

if (terminal && terminalTop && desktopDevice) {
    let isDragging = false, currentX, currentY, initialX, initialY, xOffset = 0, yOffset = 0;
    terminalTop.style.cursor = "grab";

    terminalTop.addEventListener("mousedown", (e) => {
        initialX = e.clientX - xOffset;
        initialY = e.clientY - yOffset;
        if (e.target === terminalTop || terminalTop.contains(e.target)) {
            isDragging = true;
            terminal.classList.add("dragging");
            terminalTop.style.cursor = "grabbing";
        }
    });

    document.addEventListener("mouseup", () => {
        isDragging = false;
        terminal.classList.remove("dragging");
        if(terminalTop) terminalTop.style.cursor = "grab";
    });

    document.addEventListener("mousemove", (e) => {
        if (isDragging) {
            e.preventDefault();
            currentX = e.clientX - initialX;
            currentY = e.clientY - initialY;
            xOffset = currentX;
            yOffset = currentY;
            terminal.style.transform = `translate(${currentX}px, ${currentY}px) rotate(0deg)`;
        }
    });
}