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

  // 5. 3D Rounded / Stacked Interactive Carousels
  const carousels = document.querySelectorAll("[data-carousel]");

  carousels.forEach((carousel) => {
    const cards = Array.from(carousel.querySelectorAll(".carousel-card"));
    const prevBtn = carousel.querySelector(".carousel-arrow--prev");
    const nextBtn = carousel.querySelector(".carousel-arrow--next");
    const captionEl = carousel.querySelector(".carousel-caption");
    const dotsContainer = carousel.querySelector(".carousel-dots");
    const total = cards.length;
    if (total === 0) return;

    let activeIndex = 0;

    // Build pagination dots
    const dots = cards.map((card, i) => {
      const dot = document.createElement("button");
      dot.type = "button";
      dot.className = "carousel-dot" + (i === 0 ? " is-active" : "");
      dot.setAttribute("role", "tab");
      dot.setAttribute("aria-label", `Slide ${i + 1}: ${card.dataset.caption || ""}`);
      dot.setAttribute("aria-selected", String(i === 0));
      dot.addEventListener("click", () => goTo(i));
      if (dotsContainer) dotsContainer.appendChild(dot);
      return dot;
    });

    function updatePositions() {
      cards.forEach((card, i) => {
        const diff = (i - activeIndex + total) % total;
        let pos = "back";
        if (diff === 0) pos = "active";
        else if (diff === 1) pos = "next";
        else if (diff === total - 1) pos = "prev";

        card.setAttribute("data-pos", pos);
        card.setAttribute("aria-hidden", String(pos !== "active"));
      });

      dots.forEach((dot, i) => {
        const isActive = i === activeIndex;
        dot.classList.toggle("is-active", isActive);
        dot.setAttribute("aria-selected", String(isActive));
      });

      if (captionEl) {
        const label = cards[activeIndex].dataset.caption || "";
        captionEl.textContent = `${activeIndex + 1} / ${total} — ${label}`;
      }
    }

    function goTo(index) {
      activeIndex = (index + total) % total;
      updatePositions();
    }

    if (prevBtn) prevBtn.addEventListener("click", () => goTo(activeIndex - 1));
    if (nextBtn) nextBtn.addEventListener("click", () => goTo(activeIndex + 1));

    // Clicking a side/back card spins the carousel to that card
    cards.forEach((card, i) => {
      card.addEventListener("click", () => {
        if (i !== activeIndex) goTo(i);
      });
    });

    // Touch swipe support
    let touchStartX = 0;
    carousel.addEventListener(
      "touchstart",
      (e) => {
        if (e.touches.length > 0) touchStartX = e.touches[0].clientX;
      },
      { passive: true }
    );
    carousel.addEventListener(
      "touchend",
      (e) => {
        if (e.changedTouches.length > 0) {
          const deltaX = e.changedTouches[0].clientX - touchStartX;
          if (Math.abs(deltaX) > 40) {
            goTo(deltaX < 0 ? activeIndex + 1 : activeIndex - 1);
          }
        }
      },
      { passive: true }
    );

    updatePositions();
  });
})();
