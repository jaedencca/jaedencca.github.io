const menuIcon = document.getElementById("menu-icon");
const navLinks = document.getElementById("nav-links");

// create a backdrop to dim content when menu is open (mobile)
let backdrop = document.querySelector('.nav-backdrop');
if (!backdrop) {
  backdrop = document.createElement('div');
  backdrop.className = 'nav-backdrop';
  document.body.appendChild(backdrop);
}

function openMenu() {
  navLinks.classList.add('active');
  menuIcon.setAttribute('aria-expanded', 'true');
  backdrop.classList.add('active');
}

function closeMenu() {
  navLinks.classList.remove('active');
  menuIcon.setAttribute('aria-expanded', 'false');
  backdrop.classList.remove('active');
}

menuIcon.addEventListener('click', (e) => {
  const expanded = menuIcon.getAttribute('aria-expanded') === 'true';
  if (expanded) closeMenu();
  else openMenu();
});

// Close when clicking on a link
navLinks.addEventListener('click', (e) => {
  if (e.target.tagName === 'A') closeMenu();
});

// Close when clicking the backdrop
backdrop.addEventListener('click', closeMenu);

// Close or reset state on resize to avoid menu sticking when switching to desktop
let resizeTimeout = null;
window.addEventListener('resize', () => {
  clearTimeout(resizeTimeout);
  resizeTimeout = setTimeout(() => {
    // if desktop layout (over 600px), ensure menu is visible and aria reflects that
    if (window.innerWidth > 600) {
      navLinks.classList.remove('active');
      backdrop.classList.remove('active');
      menuIcon.setAttribute('aria-expanded', 'false');
    } else {
      // on small screens keep it closed by default
      navLinks.classList.remove('active');
      backdrop.classList.remove('active');
      menuIcon.setAttribute('aria-expanded', 'false');
    }
  }, 120);
});

// Populate footer year dynamically
const footerYearEl = document.getElementById('footer-year');
if (footerYearEl) {
  footerYearEl.textContent = new Date().getFullYear();
}

// Skills: load from external JSON (optional) and initialize accordion via event delegation
async function loadSkillsFromJSON() {
  const list = document.querySelector('.skills-list[data-skills-src]');
  if (!list) return; // no external source configured
  const src = list.getAttribute('data-skills-src');
  try {
    const res = await fetch(src, { cache: 'no-cache' });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const skills = await res.json();
    if (!Array.isArray(skills)) return;
    // Build markup
    const items = skills.map(s => {
      const title = (s.title || s.name || '').toString();
      const details = (s.details || s.description || '').toString();
      return `
        <li class="skill-item">
          <button class="skill-toggle" aria-expanded="false">
            <span class="skill-name">${title}</span>
            <span class="skill-icon">+</span>
          </button>
          <div class="skill-details">
            <p>${details}</p>
          </div>
        </li>`;
    }).join('');
    list.innerHTML = items;
  } catch (err) {
    console.warn('Skills JSON load failed; leaving fallback content in place.', err);
  }
}

function initSkillsAccordion() {
  const skillsList = document.querySelector('.skills-list');
  if (!skillsList) return;
  skillsList.addEventListener('click', (e) => {
    const toggle = e.target.closest('.skill-toggle');
    if (!toggle || !skillsList.contains(toggle)) return;
    const skillItem = toggle.closest('.skill-item');
    const isExpanded = toggle.getAttribute('aria-expanded') === 'true';

    // Close all other skill items
    skillsList.querySelectorAll('.skill-item').forEach(item => {
      if (item !== skillItem) {
        item.classList.remove('expanded');
        const otherToggle = item.querySelector('.skill-toggle');
        if (otherToggle) otherToggle.setAttribute('aria-expanded', 'false');
      }
    });

    // Toggle current item
    if (isExpanded) {
      skillItem.classList.remove('expanded');
      toggle.setAttribute('aria-expanded', 'false');
      skillsList.classList.remove('has-expanded');
    } else {
      skillItem.classList.add('expanded');
      toggle.setAttribute('aria-expanded', 'true');
      skillsList.classList.add('has-expanded');
    }
  });
}

document.addEventListener('DOMContentLoaded', async () => {
  await loadSkillsFromJSON();
  initSkillsAccordion();
});

// Handle skills section repositioning for mobile
function handleSkillsPosition() {
  const skillsSection = document.querySelector('.skills-section');
  const photoSlot = document.querySelector('.photo-slot');
  const bioSlot = document.querySelector('.bio-slot');
  const isMobile = window.innerWidth <= 1042;
  
  if (!skillsSection || !photoSlot || !bioSlot) return;
  
  if (isMobile) {
    // Move skills to bio-slot and add separator
    if (!bioSlot.contains(skillsSection)) {
      bioSlot.appendChild(skillsSection);
      skillsSection.classList.add('mobile-skills');
    }
  } else {
    // Move skills back to photo-slot and remove separator
    if (!photoSlot.contains(skillsSection)) {
      photoSlot.appendChild(skillsSection);
      skillsSection.classList.remove('mobile-skills');
    }
  }
}

// Run on load and resize
window.addEventListener('DOMContentLoaded', handleSkillsPosition);
window.addEventListener('resize', handleSkillsPosition);

