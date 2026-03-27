(() => {
  const root = document.documentElement;

  // Theme
  const themeToggle = document.getElementById("themeToggle");
  const storedTheme = localStorage.getItem("theme");
  if (storedTheme === "light" || storedTheme === "dark") {
    root.setAttribute("data-theme", storedTheme);
  }

  const syncThemeA11y = () => {
    const t = root.getAttribute("data-theme") || "light";
    themeToggle?.setAttribute("aria-pressed", t === "dark" ? "true" : "false");
  };
  syncThemeA11y();

  themeToggle?.addEventListener("click", () => {
    const current = root.getAttribute("data-theme") || "light";
    const next = current === "dark" ? "light" : "dark";
    root.setAttribute("data-theme", next);
    localStorage.setItem("theme", next);
    syncThemeA11y();
  });

  // Smooth scroll
  document.addEventListener("click", (e) => {
    const target = e.target instanceof Element ? e.target.closest("[data-scroll-to]") : null;
    if (!target) return;
    const selector = target.getAttribute("data-scroll-to");
    if (!selector) return;
    const el = document.querySelector(selector);
    if (!el) return;
    e.preventDefault();
    el.scrollIntoView({ behavior: "smooth", block: "start" });
  });

  // Form validation + modal + localStorage
  const form = document.getElementById("leadForm");
  const modal = document.getElementById("successModal");
  const modalClose = document.getElementById("modalClose");
  const modalOk = document.getElementById("modalOk");

  const openModal = () => {
    if (!modal) return;
    modal.setAttribute("aria-hidden", "false");
    modal.focus?.();
    document.body.style.overflow = "hidden";
  };
  const closeModal = () => {
    if (!modal) return;
    modal.setAttribute("aria-hidden", "true");
    document.body.style.overflow = "";
  };

  modalClose?.addEventListener("click", closeModal);
  modalOk?.addEventListener("click", closeModal);
  modal?.addEventListener("click", (e) => {
    if (e.target === modal) closeModal();
  });
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") closeModal();
  });

  const setFieldError = (fieldId, message) => {
    const field = document.getElementById(fieldId);
    if (!field) return;
    field.dataset.error = message ? "1" : "0";
    const err = field.querySelector(".error");
    if (err) err.textContent = message || "";
  };

  const normalizePhone = (s) => (s || "").replace(/[^\d+]/g, "");

  form?.addEventListener("submit", (e) => {
    e.preventDefault();

    const name = document.getElementById("name")?.value?.trim() || "";
    const phoneRaw = document.getElementById("phone")?.value || "";
    const phone = normalizePhone(phoneRaw);
    const age = document.getElementById("age")?.value?.trim() || "";

    let ok = true;
    if (!name) {
      setFieldError("field-name", "Введите имя");
      ok = false;
    } else {
      setFieldError("field-name", "");
    }

    // Simple RU phone validation: at least 10 digits
    const digits = phone.replace(/[^\d]/g, "");
    if (digits.length < 10) {
      setFieldError("field-phone", "Введите корректный телефон");
      ok = false;
    } else {
      setFieldError("field-phone", "");
    }

    // Age can be optional, but keep field consistent
    setFieldError("field-age", "");

    if (!ok) return;

    const lead = {
      name,
      phone: phoneRaw.trim(),
      age,
      createdAt: new Date().toISOString(),
    };

    const key = "oksana_leads";
    const existing = (() => {
      try {
        return JSON.parse(localStorage.getItem(key) || "[]");
      } catch {
        return [];
      }
    })();
    existing.push(lead);
    localStorage.setItem(key, JSON.stringify(existing));

    form.reset();
    openModal();
  });
})();
