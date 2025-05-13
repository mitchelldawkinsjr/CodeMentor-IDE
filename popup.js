document.addEventListener("DOMContentLoaded", function () {
    document.getElementById("open-editor").addEventListener("click", function () {
        chrome.tabs.create({ url: "index.html" });
    });
});
