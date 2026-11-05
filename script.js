/**
 * Patrick Del Ayre — Portfolio Scripts
 * Lightweight, accessible interactions: mobile menu, clipboard copy, active scrollspy.
 */

(() => {
  "use strict";

  // 1. Mobile Menu Navigation
  const menuToggle = document.querySelector(".menu-toggle");
  const siteNav = document.querySelector("#site-nav");
  const navLinks = siteNav ? siteNav.querySelectorAll("a") : [];

  function setNavOpen(isOpen) {
    if (!menuToggle || !siteNav) return;
    siteNav.classList.toggle("is-open", isOpen);
    menuToggle.setAttribute("aria-expanded", String(isOpen));
    const label = menuToggle.querySelector(".menu-label");
    if (label) {
      label.textContent = isOpen ? "Close" : "Menu";
    }
  }

  if (menuToggle && siteNav) {
    menuToggle.addEventListener("click", () => {
      const isCurrentlyOpen = siteNav.classList.contains("is-open");
      setNavOpen(!isCurrentlyOpen);
    });

    // Close menu when clicking any nav link
    navLinks.forEach((link) => {
      link.addEventListener("click", () => setNavOpen(false));
    });

    // Close on Escape key
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && siteNav.classList.contains("is-open")) {
        setNavOpen(false);
        menuToggle.focus();
      }
    });

    // Close when clicking outside
    document.addEventListener("click", (e) => {
      if (!siteNav.contains(e.target) && !menuToggle.contains(e.target)) {
        setNavOpen(false);
      }
    });

    // Auto close on window resize past tablet breakpoint
    window.addEventListener("resize", () => {
      if (window.innerWidth > 768 && siteNav.classList.contains("is-open")) {
        setNavOpen(false);
      }
    });
  }

  // 2. Email Copy with Feedback
  const copyBtn = document.querySelector("#copy-email-btn");
  const copyFeedback = document.querySelector("#copy-feedback");
  const copyBtnText = document.querySelector("#copy-btn-text");

  async function copyToClipboard(text) {
    if (navigator.clipboard) {
      try {
        await navigator.clipboard.writeText(text);
        return;
      } catch (err) {
        // Fallback to execCommand below
      }
    }
    const textarea = document.createElement("textarea");
    textarea.value = text;
    textarea.setAttribute("readonly", "");
    textarea.style.position = "fixed";
    textarea.style.top = "0";
    textarea.style.left = "0";
    textarea.style.opacity = "0";
    document.body.appendChild(textarea);
    textarea.focus();
    textarea.select();
    const successful = document.execCommand("copy");
    textarea.remove();
    if (!successful) throw new Error("Fallback copy failed");
  }

  if (copyBtn) {
    copyBtn.addEventListener("click", async () => {
      const email = copyBtn.dataset.email || "patrickdelayre30@gmail.com";
      const originalText = copyBtnText ? copyBtnText.textContent : "Copy Email Address";

      try {
        await copyToClipboard(email);
        if (copyBtnText) copyBtnText.textContent = "Copied to Clipboard!";
        if (copyFeedback) copyFeedback.textContent = "Email address copied successfully.";
      } catch (err) {
        if (copyBtnText) copyBtnText.textContent = "Failed to copy";
        if (copyFeedback) copyFeedback.textContent = "Please copy manually: patrickdelayre30@gmail.com";
      }

      setTimeout(() => {
        if (copyBtnText) copyBtnText.textContent = originalText;
        if (copyFeedback) copyFeedback.textContent = "";
      }, 2500);
    });
  }

  // 3. Active Section Scrollspy
  if ("IntersectionObserver" in window) {
    const sections = document.querySelectorAll("section[id]");
    const navMap = new Map();

    navLinks.forEach((link) => {
      const href = link.getAttribute("href");
      if (href && href.startsWith("#")) {
        navMap.set(href.slice(1), link);
      }
    });

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const activeId = entry.target.id;
            navLinks.forEach((link) => link.removeAttribute("aria-current"));
            const activeLink = navMap.get(activeId);
            if (activeLink) {
              activeLink.setAttribute("aria-current", "page");
            }
          }
        });
      },
      { rootMargin: "-25% 0px -65% 0px", threshold: 0 }
    );

    sections.forEach((sec) => observer.observe(sec));
  }

  // 4. Project Category Filter
  const filterButtons = document.querySelectorAll(".filter-btn");
  const projectCards = document.querySelectorAll(".project-card[data-category]");

  if (filterButtons.length > 0 && projectCards.length > 0) {
    filterButtons.forEach((btn) => {
      btn.addEventListener("click", () => {
        const filter = btn.dataset.filter;

        filterButtons.forEach((b) => {
          const isActive = b === btn;
          b.classList.toggle("active", isActive);
          b.setAttribute("aria-selected", String(isActive));
        });

        projectCards.forEach((card) => {
          const category = card.dataset.category;
          const shouldShow = filter === "all" || category === filter;

          if (shouldShow) {
            card.classList.remove("is-hidden");
            // Allow display change to take effect before removing fade-out class
            setTimeout(() => {
              card.classList.remove("fade-out");
            }, 20);
          } else {
            card.classList.add("fade-out");
            setTimeout(() => {
              card.classList.add("is-hidden");
            }, 200);
          }
        });
      });
    });
  }
})();
