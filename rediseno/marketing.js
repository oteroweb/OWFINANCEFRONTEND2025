/* OW Finance marketing — shared behaviors */
(function () {
  // Theme: persist + restore
  var KEY = "ow-theme";
  function apply(t) {
    document.documentElement.setAttribute("data-theme", t);
    document.querySelectorAll("[data-theme-toggle] .material-icons").forEach(function (i) {
      i.textContent = t === "dark" ? "light_mode" : "dark_mode";
    });
  }
  try {
    var saved = localStorage.getItem(KEY);
    if (saved) apply(saved);
  } catch (e) {}

  document.addEventListener("click", function (e) {
    var t = e.target.closest("[data-theme-toggle]");
    if (t) {
      var cur = document.documentElement.getAttribute("data-theme") || "light";
      var next = cur === "dark" ? "light" : "dark";
      apply(next);
      try { localStorage.setItem(KEY, next); } catch (er) {}
      return;
    }
    var b = e.target.closest("[data-nav-burger]");
    if (b) {
      var menu = document.querySelector("[data-mobile-menu]");
      if (menu) menu.toggleAttribute("hidden");
    }
    var ml = e.target.closest("[data-mobile-menu] a");
    if (ml) {
      var m = document.querySelector("[data-mobile-menu]");
      if (m) m.setAttribute("hidden", "");
    }
  });

  // Reveal on scroll
  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (en) {
      if (en.isIntersecting) { en.target.classList.add("in"); io.unobserve(en.target); }
    });
  }, { threshold: 0.12, rootMargin: "0px 0px -8% 0px" });
  function observe() { document.querySelectorAll(".reveal:not(.in)").forEach(function (el) { io.observe(el); }); }
  if (document.readyState !== "loading") observe();
  else document.addEventListener("DOMContentLoaded", observe);
})();
