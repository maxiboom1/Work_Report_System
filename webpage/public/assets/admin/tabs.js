export function initTabs() {
    const tabs = Array.from(document.querySelectorAll(".nav-tab"));
    const panels = Array.from(document.querySelectorAll(".tab-panel"));
  
    // Accordion behavior for <details> sections:
    // - only one open at a time per visible panel
    // - start with all closed
    function closeAllDetails(scope = document) {
      scope.querySelectorAll("details").forEach((d) => { d.open = false; });
    }
  
    function wireAccordion(scope = document) {
      const all = Array.from(scope.querySelectorAll("details"));
      for (const d of all) {
        if (d.dataset.accWired === "1") continue;
        d.dataset.accWired = "1";
        d.addEventListener("toggle", () => {
          if (!d.open) return;
          // Close other details in the same tab-panel (preferred), otherwise in provided scope.
          const panel = d.closest(".tab-panel") || scope;
          panel.querySelectorAll("details").forEach((other) => {
            if (other !== d) other.open = false;
          });
        });
      }
    }
  
    function show(key) {
      tabs.forEach((t) => t.classList.toggle("active", t.dataset.tab === key));
      panels.forEach((p) => p.classList.toggle("is-active", p.dataset.panel === key));
  
      // When switching tabs, ensure all <details> are closed.
      closeAllDetails(document);
    }
  
    tabs.forEach((t) => t.addEventListener("click", () => show(t.dataset.tab)));
    // Wire accordion behavior once, then start from a fully collapsed state.
    wireAccordion(document);
    closeAllDetails(document);
    show("employees");
}
