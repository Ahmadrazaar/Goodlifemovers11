(() => {
  "use strict";

  document.documentElement.classList.remove("no-js");
  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const header = document.querySelector("[data-header]");
  const navToggle = document.querySelector("[data-nav-toggle]");
  const nav = document.querySelector("[data-nav]");

  const updateHeader = () => header?.classList.toggle("scrolled", window.scrollY > 24);
  updateHeader();
  window.addEventListener("scroll", updateHeader, { passive: true });

  navToggle?.addEventListener("click", () => {
    const open = document.body.classList.toggle("nav-open");
    navToggle.setAttribute("aria-expanded", String(open));
  });

  document.querySelectorAll(".nav-group > button").forEach((button) => {
    button.addEventListener("click", () => {
      if (window.innerWidth <= 820) {
        button.parentElement.classList.toggle("open");
      }
    });
  });

  nav?.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => {
      document.body.classList.remove("nav-open");
      navToggle?.setAttribute("aria-expanded", "false");
    });
  });

  const revealObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("in-view");
        revealObserver.unobserve(entry.target);
      });
    },
    { threshold: 0.12 }
  );
  document.querySelectorAll(".reveal, .process-line").forEach((element) => revealObserver.observe(element));

  const countObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        const element = entry.target;
        const target = Number(element.dataset.count);
        const suffix = target === 98 ? "" : target >= 1000 ? "+" : "+";
        const duration = 1500;
        const start = performance.now();
        const tick = (time) => {
          const progress = Math.min((time - start) / duration, 1);
          const eased = 1 - Math.pow(1 - progress, 3);
          const value = Math.floor(target * eased);
          element.textContent = target >= 1000 ? value.toLocaleString() + suffix : value + suffix;
          if (progress < 1) requestAnimationFrame(tick);
        };
        requestAnimationFrame(tick);
        countObserver.unobserve(element);
      });
    },
    { threshold: 0.6 }
  );
  document.querySelectorAll("[data-count]").forEach((element) => countObserver.observe(element));

  document.querySelectorAll(".accordion article button").forEach((button) => {
    button.addEventListener("click", () => {
      const item = button.closest("article");
      const accordion = item.parentElement;
      accordion.querySelectorAll("article").forEach((other) => {
        if (other !== item) other.classList.remove("open");
      });
      item.classList.toggle("open");
    });
  });

  const testimonials = [...document.querySelectorAll(".testimonial")];
  const testimonialDots = [...document.querySelectorAll(".testimonial-dots button")];
  let activeTestimonial = 0;
  let testimonialTimer;

  const showTestimonial = (index) => {
    if (!testimonials.length) return;
    activeTestimonial = (index + testimonials.length) % testimonials.length;
    testimonials.forEach((item, itemIndex) => item.classList.toggle("active", itemIndex === activeTestimonial));
    testimonialDots.forEach((dot, dotIndex) => dot.classList.toggle("active", dotIndex === activeTestimonial));
  };

  const startTestimonials = () => {
    if (prefersReducedMotion || !testimonials.length) return;
    clearInterval(testimonialTimer);
    testimonialTimer = setInterval(() => showTestimonial(activeTestimonial + 1), 5200);
  };

  testimonialDots.forEach((dot, index) => {
    dot.addEventListener("click", () => {
      showTestimonial(index);
      startTestimonials();
    });
  });
  startTestimonials();

  document.querySelectorAll("[data-lead-form]").forEach((form) => {
    form.addEventListener("submit", async (event) => {
      event.preventDefault();
      if (!form.reportValidity()) return;

      const button = form.querySelector('button[type="submit"]');
      const originalText = button.innerHTML;
      button.disabled = true;
      button.textContent = "Preparing your request...";

      try {
        const isLocal = ["localhost", "127.0.0.1", ""].includes(window.location.hostname);
        if (!isLocal) {
          const body = new URLSearchParams(new FormData(form)).toString();
          const response = await fetch("/", {
            method: "POST",
            headers: { "Content-Type": "application/x-www-form-urlencoded" },
            body,
          });
          if (!response.ok) throw new Error("Form endpoint is not available");
        } else {
          await new Promise((resolve) => setTimeout(resolve, 700));
        }
        form.classList.add("submitted");
        form.reset();
        button.textContent = "Request received";
      } catch {
        form.classList.add("submitted");
        form.querySelector(".form-success").textContent =
          "Your details are ready. Connect this form to your hosting provider to receive live enquiries.";
        button.innerHTML = originalText;
        button.disabled = false;
      }
    });
  });

  if (!prefersReducedMotion && window.matchMedia("(pointer: fine)").matches) {
    const cursor = document.querySelector("[data-cursor]");
    if (cursor) {
      window.addEventListener("pointermove", (event) => {
        cursor.style.opacity = "1";
        cursor.style.transform = `translate(${event.clientX - 7}px, ${event.clientY - 7}px)`;
      });
      document.querySelectorAll("a, button, input, select, textarea").forEach((element) => {
        element.addEventListener("pointerenter", () => cursor.classList.add("active"));
        element.addEventListener("pointerleave", () => cursor.classList.remove("active"));
      });
    }

    document.querySelectorAll(".tilt-card").forEach((card) => {
      card.addEventListener("pointermove", (event) => {
        const rect = card.getBoundingClientRect();
        const x = (event.clientX - rect.left) / rect.width - 0.5;
        const y = (event.clientY - rect.top) / rect.height - 0.5;
        card.style.transform = `perspective(900px) rotateX(${-y * 7}deg) rotateY(${x * 8}deg) translateY(-3px)`;
      });
      card.addEventListener("pointerleave", () => {
        card.style.transform = "";
      });
    });

    document.querySelectorAll("[data-magnetic]").forEach((element) => {
      element.addEventListener("pointermove", (event) => {
        const rect = element.getBoundingClientRect();
        const x = event.clientX - rect.left - rect.width / 2;
        const y = event.clientY - rect.top - rect.height / 2;
        element.style.transform = `translate(${x * 0.08}px, ${y * 0.12}px)`;
      });
      element.addEventListener("pointerleave", () => {
        element.style.transform = "";
      });
    });
  }

  class CargoWorld {
    constructor(canvas) {
      this.canvas = canvas;
      this.context = canvas.getContext("2d");
      this.pointer = { x: 0, y: 0 };
      this.smoothPointer = { x: 0, y: 0 };
      this.time = 0;
      this.boxes = Array.from({ length: 14 }, (_, index) => ({
        x: -2.8 + Math.random() * 5.6,
        y: -1.7 + Math.random() * 3.4,
        z: 2 + Math.random() * 13,
        size: 0.2 + Math.random() * 0.36,
        spin: Math.random() * Math.PI * 2,
        speed: 0.004 + Math.random() * 0.008,
        accent: index % 5 === 0,
      }));
      this.stars = Array.from({ length: 90 }, () => ({
        x: Math.random(),
        y: Math.random(),
        r: Math.random() * 1.1 + 0.2,
        a: Math.random() * 0.4 + 0.08,
      }));

      this.resize = this.resize.bind(this);
      this.render = this.render.bind(this);
      this.onPointer = this.onPointer.bind(this);
      this.resize();
      window.addEventListener("resize", this.resize);
      window.addEventListener("pointermove", this.onPointer, { passive: true });
      if (!prefersReducedMotion) requestAnimationFrame(this.render);
      else this.draw();
    }

    resize() {
      const rect = this.canvas.getBoundingClientRect();
      this.width = rect.width;
      this.height = rect.height;
      this.dpr = Math.min(window.devicePixelRatio || 1, 1.7);
      this.canvas.width = Math.max(1, Math.floor(this.width * this.dpr));
      this.canvas.height = Math.max(1, Math.floor(this.height * this.dpr));
      this.context.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);
      this.focal = Math.min(this.width, this.height) * 0.82;
    }

    onPointer(event) {
      this.pointer.x = (event.clientX / window.innerWidth - 0.5) * 2;
      this.pointer.y = (event.clientY / window.innerHeight - 0.5) * 2;
    }

    project(point) {
      const z = Math.max(0.6, point.z);
      const scale = this.focal / (z * 110);
      return {
        x: this.width * 0.69 + point.x * this.focal * scale + this.smoothPointer.x * 18,
        y: this.height * 0.48 + point.y * this.focal * scale + this.smoothPointer.y * 12,
        scale,
      };
    }

    rotate(point, ax, ay) {
      const cosy = Math.cos(ay);
      const siny = Math.sin(ay);
      const cosx = Math.cos(ax);
      const sinx = Math.sin(ax);
      const x = point.x * cosy - point.z * siny;
      const z1 = point.x * siny + point.z * cosy;
      const y = point.y * cosx - z1 * sinx;
      const z = point.y * sinx + z1 * cosx;
      return { x, y, z };
    }

    drawBox(box) {
      const half = box.size;
      const vertices = [
        [-half, -half, -half], [half, -half, -half], [half, half, -half], [-half, half, -half],
        [-half, -half, half], [half, -half, half], [half, half, half], [-half, half, half],
      ].map(([x, y, z]) => {
        const rotated = this.rotate({ x, y, z }, box.spin * 0.55, box.spin);
        return this.project({ x: rotated.x + box.x, y: rotated.y + box.y, z: rotated.z + box.z });
      });

      const faces = [
        { indices: [0, 1, 2, 3], shade: 0.42 },
        { indices: [4, 5, 6, 7], shade: 0.18 },
        { indices: [0, 1, 5, 4], shade: 0.28 },
        { indices: [2, 3, 7, 6], shade: 0.12 },
        { indices: [1, 2, 6, 5], shade: 0.33 },
        { indices: [0, 3, 7, 4], shade: 0.2 },
      ];

      faces.forEach((face) => {
        const points = face.indices.map((index) => vertices[index]);
        this.context.beginPath();
        this.context.moveTo(points[0].x, points[0].y);
        points.slice(1).forEach((point) => this.context.lineTo(point.x, point.y));
        this.context.closePath();
        const color = box.accent ? `247,147,30` : `90,132,190`;
        this.context.fillStyle = `rgba(${color},${face.shade})`;
        this.context.strokeStyle = box.accent ? "rgba(255,194,115,.42)" : "rgba(185,212,247,.18)";
        this.context.lineWidth = 0.7;
        this.context.fill();
        this.context.stroke();
      });
    }

    drawGrid() {
      const ctx = this.context;
      ctx.save();
      ctx.strokeStyle = "rgba(123,166,220,.07)";
      ctx.lineWidth = 1;
      for (let z = 2; z < 18; z += 1.2) {
        const left = this.project({ x: -7, y: 2.4, z });
        const right = this.project({ x: 7, y: 2.4, z });
        ctx.beginPath();
        ctx.moveTo(left.x, left.y);
        ctx.lineTo(right.x, right.y);
        ctx.stroke();
      }
      for (let x = -7; x <= 7; x += 1) {
        const near = this.project({ x, y: 2.4, z: 2 });
        const far = this.project({ x, y: 2.4, z: 18 });
        ctx.beginPath();
        ctx.moveTo(near.x, near.y);
        ctx.lineTo(far.x, far.y);
        ctx.stroke();
      }
      ctx.restore();
    }

    draw() {
      const ctx = this.context;
      ctx.clearRect(0, 0, this.width, this.height);
      this.stars.forEach((star) => {
        ctx.fillStyle = `rgba(235,241,251,${star.a})`;
        ctx.beginPath();
        ctx.arc(star.x * this.width, star.y * this.height, star.r, 0, Math.PI * 2);
        ctx.fill();
      });
      this.drawGrid();
      [...this.boxes].sort((a, b) => b.z - a.z).forEach((box) => this.drawBox(box));
    }

    render() {
      this.time += 0.01;
      this.smoothPointer.x += (this.pointer.x - this.smoothPointer.x) * 0.035;
      this.smoothPointer.y += (this.pointer.y - this.smoothPointer.y) * 0.035;
      this.boxes.forEach((box, index) => {
        box.spin += box.speed;
        box.y += Math.sin(this.time * 1.2 + index) * 0.0008;
      });
      this.draw();
      requestAnimationFrame(this.render);
    }
  }

  document.querySelectorAll("[data-hero-canvas]").forEach((canvas) => new CargoWorld(canvas));
})();
