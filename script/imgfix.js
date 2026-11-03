// Fallback for product photos: if an online photo fails, show the local placeholder.
// Online URLs end with "#<category>_<n>"  ->  ./img/products/<category>_<n>.svg
document.addEventListener("error", function (e) {
  var t = e.target;
  if (!t || t.tagName !== "IMG" || t.dataset.fb) return;
  var m = (t.src || "").match(/#(\w+_\d+)$/);
  if (m) { t.dataset.fb = "1"; t.src = "./img/products/" + m[1] + ".svg"; }
}, true);
