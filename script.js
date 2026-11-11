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

  // 2. Dynamic Email Hydration & Anti-Scraper
  function getDecodedEmail(elem) {
    if (!elem) return "patrickdelayre30@gmail.com";
    const user = elem.dataset.user || "patrickdelayre30";
    const domain = elem.dataset.domain || "gmail.com";
    return `${user}@${domain}`;
  }

  // Hydrate all dynamic email links on page
  const dynamicEmailLinks = document.querySelectorAll(".dynamic-email-link");
  dynamicEmailLinks.forEach((link) => {
    const email = getDecodedEmail(link);
    if (link.tagName === "A") {
      link.href = `mailto:${email}`;
      if (link.textContent.trim() === "Loading email...") {
        link.textContent = email;
      }
    }
  });

  // Email Copy with Feedback
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
      const email = getDecodedEmail(copyBtn);
      const originalText = copyBtnText ? copyBtnText.textContent : "Copy Email Address";

      try {
        await copyToClipboard(email);
        if (copyBtnText) copyBtnText.textContent = "Copied to Clipboard!";
        if (copyFeedback) copyFeedback.textContent = "Email address copied successfully.";
      } catch (err) {
        if (copyBtnText) copyBtnText.textContent = "Failed to copy";
        if (copyFeedback) copyFeedback.textContent = `Please copy manually: ${email}`;
      }

      setTimeout(() => {
        if (copyBtnText) copyBtnText.textContent = originalText;
        if (copyFeedback) copyFeedback.textContent = "";
      }, 2500);
    });
  }

  // 2b. Interactive Contact Form Submission Handler
  const contactForm = document.querySelector("#contact-form");
  const formStatus = document.querySelector("#form-status");
  const sendBtnText = document.querySelector("#send-btn-text");

  if (contactForm) {
    contactForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const name = contactForm.querySelector("#contact-name")?.value.trim();
      const senderEmail = contactForm.querySelector("#contact-email")?.value.trim();
      const message = contactForm.querySelector("#contact-message")?.value.trim();

      if (!name || !senderEmail || !message) {
        if (formStatus) {
          formStatus.textContent = "Please fill in all fields before sending.";
          formStatus.className = "form-status is-error";
        }
        return;
      }

      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(senderEmail)) {
        if (formStatus) {
          formStatus.textContent = "Please provide a valid email address.";
          formStatus.className = "form-status is-error";
        }
        return;
      }

      const recipient = "patrickdelayre30@gmail.com";
      const subject = encodeURIComponent(`Portfolio Inquiry from ${name}`);
      const body = encodeURIComponent(
        `Hi Patrick,\n\n${message}\n\n---\nSender Name: ${name}\nSender Email: ${senderEmail}`
      );

      if (sendBtnText) sendBtnText.textContent = "Opening Email Client...";
      if (formStatus) {
        formStatus.textContent = "Opening your email app with pre-filled details...";
        formStatus.className = "form-status is-success";
      }

      // Launch mailto with structured payload
      window.location.href = `mailto:${recipient}?subject=${subject}&body=${body}`;

      setTimeout(() => {
        if (sendBtnText) sendBtnText.textContent = "Send Message \u2192";
        contactForm.reset();
      }, 3500);
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

  // 4. Project Category Filter (Race-Condition Free)
  const filterButtons = document.querySelectorAll(".filter-btn");
  const projectCards = document.querySelectorAll(".project-card[data-category]");
  const cardTimers = new WeakMap();

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
          const prevTimer = cardTimers.get(card);
          if (prevTimer) {
            clearTimeout(prevTimer);
            cardTimers.delete(card);
          }

          const category = card.dataset.category;
          const shouldShow = filter === "all" || category === filter;

          if (shouldShow) {
            card.classList.remove("is-hidden");
            requestAnimationFrame(() => {
              requestAnimationFrame(() => {
                card.classList.remove("fade-out");
              });
            });
          } else {
            card.classList.add("fade-out");
            const hideTimer = setTimeout(() => {
              card.classList.add("is-hidden");
              cardTimers.delete(card);
            }, 180);
            cardTimers.set(card, hideTimer);
          }
        });
      });
    });
  }

  // 5. 3D Stacked Interactive Carousels & Full-Screen Lightbox Inspector
  const carousels = document.querySelectorAll("[data-carousel]");
  const lightboxModal = document.querySelector("#lightbox-modal");
  const lightboxImg = document.querySelector("#lightbox-img");
  const lightboxTitle = document.querySelector("#lightbox-title");
  const lightboxCounter = document.querySelector("#lightbox-counter");
  const lightboxClose = document.querySelector("#lightbox-close");
  const lightboxPrev = document.querySelector("#lightbox-prev");
  const lightboxNext = document.querySelector("#lightbox-next");

  let activeLightboxController = null;

  function openLightbox(controller) {
    if (!lightboxModal || !lightboxImg) return;
    activeLightboxController = controller;
    controller.syncLightbox();
    if (typeof lightboxModal.showModal === "function") {
      if (!lightboxModal.open) lightboxModal.showModal();
    } else {
      lightboxModal.setAttribute("open", "");
    }
  }

  function closeLightbox() {
    if (!lightboxModal) return;
    if (typeof lightboxModal.close === "function" && lightboxModal.open) {
      lightboxModal.close();
    } else {
      lightboxModal.removeAttribute("open");
    }
    activeLightboxController = null;
  }

  if (lightboxClose) {
    lightboxClose.addEventListener("click", closeLightbox);
  }
  if (lightboxPrev) {
    lightboxPrev.addEventListener("click", () => {
      if (activeLightboxController) activeLightboxController.step(-1);
    });
  }
  if (lightboxNext) {
    lightboxNext.addEventListener("click", () => {
      if (activeLightboxController) activeLightboxController.step(1);
    });
  }
  if (lightboxModal) {
    lightboxModal.addEventListener("click", (e) => {
      if (e.target === lightboxModal) closeLightbox();
    });
    document.addEventListener("keydown", (e) => {
      if (!lightboxModal.open || !activeLightboxController) return;
      if (e.key === "ArrowLeft") {
        e.preventDefault();
        activeLightboxController.step(-1);
      } else if (e.key === "ArrowRight") {
        e.preventDefault();
        activeLightboxController.step(1);
      }
    });
  }

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

    const controller = {
      step(delta) {
        goTo(activeIndex + delta);
      },
      syncLightbox() {
        if (!lightboxImg) return;
        const currentCard = cards[activeIndex];
        const imgEl = currentCard ? currentCard.querySelector("img") : null;
        if (!imgEl) return;
        lightboxImg.src = imgEl.getAttribute("src") || "";
        lightboxImg.alt = imgEl.getAttribute("alt") || "";
        if (lightboxCounter) {
          lightboxCounter.textContent = `${activeIndex + 1} / ${total}`;
        }
        if (lightboxTitle) {
          lightboxTitle.textContent = currentCard.dataset.caption || "Project Screenshot";
        }
      },
    };

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

      if (activeLightboxController === controller && lightboxModal && lightboxModal.open) {
        controller.syncLightbox();
      }
    }

    function goTo(index) {
      activeIndex = (index + total) % total;
      updatePositions();
    }

    if (prevBtn) prevBtn.addEventListener("click", () => goTo(activeIndex - 1));
    if (nextBtn) nextBtn.addEventListener("click", () => goTo(activeIndex + 1));

    // Keyboard Left/Right navigation when focus is inside carousel
    carousel.addEventListener("keydown", (e) => {
      if (e.key === "ArrowLeft") {
        e.preventDefault();
        goTo(activeIndex - 1);
      } else if (e.key === "ArrowRight") {
        e.preventDefault();
        goTo(activeIndex + 1);
      }
    });

    // Clicking a side/back card spins the carousel; clicking the active card opens the full-screen lightbox
    cards.forEach((card, i) => {
      card.addEventListener("click", () => {
        if (i !== activeIndex) {
          goTo(i);
        } else {
          openLightbox(controller);
        }
      });
    });

    // Wire "Inspect Full-Screen UI" button inside the parent project card if present
    const parentArticle = carousel.closest(".project-card");
    if (parentArticle) {
      const inspectBtn = parentArticle.querySelector("[data-inspect-project]");
      if (inspectBtn) {
        inspectBtn.addEventListener("click", () => openLightbox(controller));
      }
    }

    // Touch swipe support (ignores vertical page scroll)
    let touchStartX = 0;
    let touchStartY = 0;
    carousel.addEventListener(
      "touchstart",
      (e) => {
        if (e.touches.length > 0) {
          touchStartX = e.touches[0].clientX;
          touchStartY = e.touches[0].clientY;
        }
      },
      { passive: true }
    );
    carousel.addEventListener(
      "touchend",
      (e) => {
        if (e.changedTouches.length > 0) {
          const deltaX = e.changedTouches[0].clientX - touchStartX;
          const deltaY = e.changedTouches[0].clientY - touchStartY;
          if (Math.abs(deltaX) > 36 && Math.abs(deltaX) > Math.abs(deltaY) * 1.2) {
            goTo(deltaX < 0 ? activeIndex + 1 : activeIndex - 1);
          }
        }
      },
      { passive: true }
    );

    updatePositions();
  });
})();
