const menuToggle = document.querySelector(".menu-toggle");
const navLinks = document.querySelector(".nav-links");
const skillItems = [...document.querySelectorAll(".skill-item")];
const counters = [...document.querySelectorAll("[data-counter]")];
const radarCanvas = document.querySelector("#skillRadar");

menuToggle.addEventListener("click", () => {
  const isOpen = navLinks.classList.toggle("is-open");
  menuToggle.setAttribute("aria-expanded", String(isOpen));
});

navLinks.addEventListener("click", (event) => {
  if (event.target.tagName === "A") {
    navLinks.classList.remove("is-open");
    menuToggle.setAttribute("aria-expanded", "false");
  }
});

const animateCounters = () => {
  counters.forEach((counter) => {
    const target = Number(counter.dataset.counter);
    let current = 0;
    const step = Math.max(1, Math.ceil(target / 36));

    const tick = () => {
      current = Math.min(target, current + step);
      counter.textContent = current;

      if (current < target) {
        requestAnimationFrame(tick);
      }
    };

    tick();
  });
};

const revealSkills = () => {
  skillItems.forEach((item) => {
    const level = item.dataset.level;
    const bar = item.querySelector(".bar span");
    bar.style.width = `${level}%`;
  });
};

const drawRadarChart = () => {
  if (!radarCanvas) return;

  const ctx = radarCanvas.getContext("2d");
  const size = radarCanvas.width;
  const center = size / 2;
  const maxRadius = size * 0.34;
  const skills = skillItems.map((item) => ({
    label: item.dataset.skill,
    level: Number(item.dataset.level)
  }));
  const sides = skills.length;

  ctx.clearRect(0, 0, size, size);
  ctx.font = "15px Arial, Helvetica, sans-serif";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";

  for (let ring = 1; ring <= 4; ring += 1) {
    const radius = (maxRadius / 4) * ring;
    ctx.beginPath();

    skills.forEach((_, index) => {
      const angle = (Math.PI * 2 * index) / sides - Math.PI / 2;
      const x = center + Math.cos(angle) * radius;
      const y = center + Math.sin(angle) * radius;

      if (index === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
    });

    ctx.closePath();
    ctx.strokeStyle = ring === 4 ? "#9aacb6" : "#d8e0e4";
    ctx.stroke();
  }

  skills.forEach((skill, index) => {
    const angle = (Math.PI * 2 * index) / sides - Math.PI / 2;
    const axisX = center + Math.cos(angle) * maxRadius;
    const axisY = center + Math.sin(angle) * maxRadius;
    const labelX = center + Math.cos(angle) * (maxRadius + 42);
    const labelY = center + Math.sin(angle) * (maxRadius + 42);

    ctx.beginPath();
    ctx.moveTo(center, center);
    ctx.lineTo(axisX, axisY);
    ctx.strokeStyle = "#d8e0e4";
    ctx.stroke();

    ctx.fillStyle = "#314550";
    ctx.fillText(skill.label, labelX, labelY);
  });

  ctx.beginPath();
  skills.forEach((skill, index) => {
    const angle = (Math.PI * 2 * index) / sides - Math.PI / 2;
    const radius = maxRadius * (skill.level / 100);
    const x = center + Math.cos(angle) * radius;
    const y = center + Math.sin(angle) * radius;

    if (index === 0) {
      ctx.moveTo(x, y);
    } else {
      ctx.lineTo(x, y);
    }
  });

  ctx.closePath();
  ctx.fillStyle = "rgba(87, 109, 123, 0.24)";
  ctx.strokeStyle = "#576d7b";
  ctx.lineWidth = 3;
  ctx.fill();
  ctx.stroke();

  skills.forEach((skill, index) => {
    const angle = (Math.PI * 2 * index) / sides - Math.PI / 2;
    const radius = maxRadius * (skill.level / 100);
    const x = center + Math.cos(angle) * radius;
    const y = center + Math.sin(angle) * radius;

    ctx.beginPath();
    ctx.arc(x, y, 5, 0, Math.PI * 2);
    ctx.fillStyle = "#314550";
    ctx.fill();
  });
};

const observer = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;

      if (entry.target.classList.contains("skills")) {
        revealSkills();
        drawRadarChart();
      }

      if (entry.target.classList.contains("hero")) {
        animateCounters();
      }

      observer.unobserve(entry.target);
    });
  },
  { threshold: 0.35 }
);

document.querySelectorAll(".hero, .skills").forEach((section) => {
  observer.observe(section);
});

window.addEventListener("resize", drawRadarChart);
