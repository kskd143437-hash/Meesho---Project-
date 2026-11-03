// Simple login session (demo): current user is kept in localStorage "current_user".
(function () {
  function getUser() { try { return JSON.parse(localStorage.getItem("current_user")) || null; } catch (e) { return null; } }
  window.getCurrentUser = getUser;

  var page = location.pathname.split("/").pop() || "index.html";
  var protectedPages = ["PaymentPage.html", "MyOrders.html"];
  if (protectedPages.indexOf(page) > -1 && !getUser()) {
    alert("Please login to continue.");
    location.replace("LogInPage.html?next=" + encodeURIComponent(page));
    return;
  }

  document.addEventListener("DOMContentLoaded", function () {
    var u = getUser();
    var prof = document.querySelector(".navProfile");
    if (!prof || !u) return;
    var label = prof.querySelector(".SignUpHover");
    if (label) label.textContent = String(u.name || u.email.split("@")[0]).split(" ")[0];
    prof.title = "Logged in as " + u.email + " (click to logout)";
    prof.onclick = function () {
      if (confirm("Logout " + u.email + "?")) { localStorage.removeItem("current_user"); window.location.href = "index.html"; }
    };
  });
})();
