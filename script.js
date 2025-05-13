window.onload = function () {
    // Initialize CodeMirror
    var editor = CodeMirror.fromTextArea(document.getElementById("code-editor"), {
        mode: "htmlmixed",
        theme: "default",
        lineNumbers: true
    });

    // Run code and display in iframe
    document.getElementById("run-code").addEventListener("click", function () {
        var iframe = document.getElementById("preview");
        var code = editor.getValue();
        iframe.contentWindow.document.open();
        iframe.contentWindow.document.write(code);
        iframe.contentWindow.document.close();
    });
};
