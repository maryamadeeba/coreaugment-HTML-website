// 0. RESPONSIVE HEADER / MOBILE NAVIGATION LOGIC
function toggleMobileNav(button) {
  const header = button.closest('.header');
  if (!header) return;
  const isOpen = header.classList.toggle('nav-open');
  button.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
}

// On mobile, tapping a top-level link that has a submenu should expand
// the submenu in place instead of navigating away immediately.
document.addEventListener('DOMContentLoaded', function () {
  const topLevelLinks = document.querySelectorAll('.nav-links > li > a');

  topLevelLinks.forEach(function (link) {
    const parentLi = link.parentElement;
    const submenu = parentLi.querySelector(':scope > .dropdown-menu');
    if (!submenu) return;

    link.addEventListener('click', function (e) {
      // Only intercept the click when the mobile nav toggle is visible
      // (i.e. we're in the responsive/mobile layout).
      const toggle = document.querySelector('.nav-toggle');
      const isMobileLayout = toggle && window.getComputedStyle(toggle).display !== 'none';
      if (!isMobileLayout) return;

      e.preventDefault();
      parentLi.classList.toggle('submenu-open');
    });
  });

  // Close the mobile menu when a final (non-submenu-parent) link is tapped
  document.querySelectorAll('.nav-links a').forEach(function (link) {
    link.addEventListener('click', function () {
      const submenu = link.parentElement.querySelector(':scope > .dropdown-menu');
      if (submenu && link.parentElement.querySelector(':scope > a') === link) return;
      const header = document.querySelector('.header');
      const toggleBtn = document.querySelector('.nav-toggle');
      if (header) header.classList.remove('nav-open');
      if (toggleBtn) toggleBtn.setAttribute('aria-expanded', 'false');
    });
  });

  // Close mobile menu when resizing back up to desktop width
  window.addEventListener('resize', function () {
    const header = document.querySelector('.header');
    const toggleBtn = document.querySelector('.nav-toggle');
    if (window.innerWidth > 1240 && header) {
      header.classList.remove('nav-open');
      if (toggleBtn) toggleBtn.setAttribute('aria-expanded', 'false');
    }
  });
});

// 1. WORKFORCE COST CALCULATOR LOGIC
// Reads the role/experience/headcount inputs from the "Configure Your
// Team" panel on how-we-work.html and writes the computed comparison
// into the "Estimated Annual Comparison" panel.
//
// IMPORTANT: per the actual Investment & Pricing page, CoreAugment's price
// is driven entirely by the professional's experience/expertise tier, not
// by role or job title. So the CoreAugment side of this calculator is a
// flat lookup of the three real published tiers below (investment.html) —
// never a formula or percentage. Only the DOMESTIC comparison figure varies
// by role, since real-world domestic salaries genuinely differ by role.
//
// CORE_TIERS: annual CoreAugment cost per tier, matching investment.html
// exactly (Core Associate $1,500/mo, Core Professional $2,500/mo,
// Core Expert from $5,000/mo).
//   - domesticMultiplier: a rough adjustment applied to the role's
//     reference domestic salary to approximate what that experience tier
//     tends to cost domestically (based on typical percentile spread
//     within BLS OEWS wage data for comparable occupations — this is a
//     deliberately conservative estimate, not a precise figure).
const CORE_TIERS = {
  associate:   { annualCost: 18000, domesticMultiplier: 0.85 },
  professional:{ annualCost: 30000, domesticMultiplier: 1.05 },
  expert:      { annualCost: 60000, domesticMultiplier: 1.45 }
};

// Average U.S. employer overhead on top of base salary (payroll taxes,
// benefits, equipment). BLS Employer Costs for Employee Compensation data
// and multiple industry benchmarks consistently put this in the 25-40%
// range, with ~30% cited most often as the general planning average — so
// that's what's used here (previously this was a flat, unsourced 20%).
const DOMESTIC_OVERHEAD_MULTIPLIER = 1.30;

function updateCountDisplay() {
  const countInput = document.getElementById('calc-count');
  const countDisplay = document.getElementById('count-display');
  if (countInput && countDisplay) {
    countDisplay.textContent = countInput.value;
  }
}

function calculateSavings() {
  const roleSelect = document.getElementById('calc-role');
  const levelSelect = document.getElementById('calc-level');
  const countInput = document.getElementById('calc-count');
  if (!roleSelect || !levelSelect || !countInput) return;

  // calc-role's value is the role's reference domestic annual salary.
  const roleDomesticBase = parseFloat(roleSelect.value) || 0;
  // calc-level's value is one of the CORE_TIERS keys above.
  const tier = CORE_TIERS[levelSelect.value] || CORE_TIERS.professional;
  const count = parseInt(countInput.value, 10) || 1;

  const domesticPerRole = roleDomesticBase * tier.domesticMultiplier * DOMESTIC_OVERHEAD_MULTIPLIER;
  const corePerRole = tier.annualCost; // flat, matches real published pricing exactly

  const domesticTotal = Math.round(domesticPerRole * count);
  const coreTotal = Math.round(corePerRole * count);
  const savings = domesticTotal - coreTotal;
  const savingsPercent = domesticTotal > 0 ? Math.round((savings / domesticTotal) * 100) : 0;

  const domesticEl = document.getElementById('domestic-cost');
  const coreEl = document.getElementById('coreaugment-cost');
  const savingsEl = document.getElementById('annual-savings');
  const percentEl = document.getElementById('savings-percent');

  if (domesticEl) domesticEl.textContent = `$${domesticTotal.toLocaleString()}`;
  if (coreEl) coreEl.textContent = `$${coreTotal.toLocaleString()}`;
  if (savingsEl) savingsEl.textContent = `$${savings.toLocaleString()}`;
  if (percentEl) percentEl.textContent = `${savingsPercent}% Cost Reduction`;
}

// Make sure the panel reflects the default selections as soon as the
// page loads, rather than only updating after the user touches a control.
document.addEventListener('DOMContentLoaded', function () {
  if (document.getElementById('calc-role')) {
    updateCountDisplay();
    calculateSavings();
  }
});

// 2. TEAM STRUCTURE BUILDER LOGIC
function buildTeam() {
  const checkedCount = document.querySelectorAll('.dept-check:checked').length;
  const teamSize = checkedCount > 0 ? checkedCount : 1;
  const investment = teamSize * 2500; // Average calculation based on Core Professional benchmark

  document.getElementById('team-size').innerText = `${teamSize} Dedicated Professional${teamSize > 1 ? 's' : ''}`;
  document.getElementById('team-investment').innerText = `$${investment.toLocaleString()} USD/mo`;
}

// 3. GROWTH PLANNER LOGIC
function updateGrowthPlan() {
  const stage = document.getElementById('company-stage').value;
  const recElement = document.getElementById('growth-recommendation');

  if (stage === 'early') {
    recElement.innerText = "Start with 1x Core Associate (EA/Ops) and 1x Core Professional (Growth/Marketing) to free up founder bandwidth.";
  } else if (stage === 'scaling') {
    recElement.innerText = "Build functional pods across Finance, Customer Support, and Tech to build dedicated departmental capability and reduce unit costs.";
  } else if (stage === 'enterprise') {
    recElement.innerText = "Departmental expansion led by Core Experts managing integrated remote execution teams without adding local overhead.";
  }
}

// 4. HIRING TIMELINE ESTIMATOR LOGIC
function estimateTimeline() {
  const req = document.getElementById('experience-req').value;
  const timelineOutput = document.getElementById('timeline-output');

  if (req === 'entry' || req === 'mid') {
    timelineOutput.innerText = "2 – 3 Weeks";
  } else {
    timelineOutput.innerText = "3 – 4 Weeks";
  }
}

// 5. COST OF A BAD HIRE CALCULATOR LOGIC
function calculateBadHireCost() {
  const salary = parseFloat(document.getElementById('bad-hire-salary').value) || 0;
  const estimatedLoss = salary * 0.5; // Standard benchmark calculated as ~50% of annual salary in lost time, fees & replacement
  
  document.getElementById('bad-hire-loss').innerText = `$${estimatedLoss.toLocaleString()} USD`;
}

// 6. REMOTE READINESS ASSESSMENT LOGIC
function evaluateReadiness() {
  const questions = document.querySelectorAll('.assess-q');
  let score = 0;
  
  questions.forEach(q => {
    score += parseInt(q.value);
  });

  const resultContainer = document.getElementById('assessment-result');
  const statusElement = document.getElementById('readiness-status');
  const textElement = document.getElementById('readiness-text');

  resultContainer.style.display = 'block';

  if (score >= 8) {
    statusElement.innerText = "Fully Remote Ready";
    textElement.innerText = "Your workflows and technology base are ready to integrate dedicated remote professionals immediately.";
  } else {
    statusElement.innerText = "Foundation Building Recommended";
    textElement.innerText = "CoreAugment can help you establish remote onboarding frameworks and collaboration processes.";
  }
}