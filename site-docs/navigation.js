const desktopNavigation = window.matchMedia("(min-width: 1041px)");

function syncNavigationDisclosure() {
  document.querySelectorAll("details.docs-navigation, details.docs-toc").forEach((disclosure) => {
    if (disclosure instanceof HTMLDetailsElement) {
      disclosure.open = desktopNavigation.matches;
    }
  });
}

syncNavigationDisclosure();
desktopNavigation.addEventListener("change", syncNavigationDisclosure);
