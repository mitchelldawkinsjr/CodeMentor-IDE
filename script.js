window.onload = function () {
    // Initialize CodeMirror
    let editors = {
        html: CodeMirror.fromTextArea(document.getElementById("html-code"), { mode: "htmlmixed", theme: "default", lineNumbers: true }),
        css: CodeMirror.fromTextArea(document.getElementById("css-code"), { mode: "css", theme: "default", lineNumbers: true }),
        js: CodeMirror.fromTextArea(document.getElementById("js-code"), { mode: "javascript", theme: "default", lineNumbers: true })
    };
   
    document.getElementById("html").addEventListener("click", function () {
        switchTab('html');
    });

    document.getElementById("css").addEventListener("click", function () {
        switchTab('css');
    });

    document.getElementById("js").addEventListener("click", function () {
        switchTab('js');
    });

    document.getElementById("run-code").addEventListener("click", function () {
        runCode();
    });

    function switchTab(tab) {
        const parentDiv = document.getElementById("tab-container");
        const children = parentDiv.querySelectorAll("*");
        for (const child of children) {
            if (child.classList.contains("active")) {
                child.classList.remove("active");
            }
        }

        const elem = document.getElementById(tab);
        document.getElementById(tab).classList.add("active");
        
        Object.keys(editors).forEach(key => {
            editors[key].getWrapperElement().style.display = (key === tab) ? "block" : "none";
        });
    }

    // Run code and display in iframe
    function runCode() {
        // Get code from editors
        const htmlCode = editors.html.getValue();
        const cssCode = editors.css.getValue();
        const jsCode = editors.js.getValue();
        
        // Display HTML/CSS in the preview container
        const previewContainer = document.getElementById("preview-container");
        previewContainer.innerHTML = htmlCode;
        
        const styleElement = document.createElement('style');
        styleElement.textContent = cssCode;
        previewContainer.appendChild(styleElement);
        
        // Add JavaScript indicator if JS code exists
        if (jsCode.trim()) {
            const jsNotice = document.createElement('div');
            jsNotice.className = 'js-notice';
            jsNotice.innerHTML = `
                <p>JavaScript detected (${jsCode.split('\n').length} lines)</p>
                <button id="run-js-button" class="run-js-button">Run with JavaScript</button>
            `;
            previewContainer.appendChild(jsNotice);
            
            // Add click handler to the button
            document.getElementById('run-js-button').addEventListener('click', function() {
                openWithJavaScript(htmlCode, cssCode, jsCode);
            });
        }
    }
    
    function openWithJavaScript(html, css, js) {
        // Create a complete HTML document
        const fullCode = `
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="UTF-8">
                <title>CodeMentor IDE - Preview</title>
                <style>
                    /* Base styles for preview */
                    body {
                        font-family: Arial, sans-serif;
                        margin: 0;
                        padding: 20px;
                    }
                    
                    /* User CSS */
                    ${css}
                </style>
            </head>
            <body>
                <!-- User HTML -->
                ${html}
                
                <!-- Console output element -->
                <div id="console-output" style="display: none; margin-top: 20px; border-top: 1px solid #ccc; padding-top: 10px; font-family: monospace;"></div>
                
                <!-- Intercept console.log and other methods -->
                <script>
                    // Store original console methods
                    const originalConsole = {
                        log: console.log,
                        error: console.error,
                        warn: console.warn,
                        info: console.info
                    };
                    
                    // Create console output element
                    function showConsoleOutput() {
                        const output = document.getElementById('console-output');
                        if (output) {
                            output.style.display = 'block';
                        }
                    }
                    
                    // Add log entry to console output
                    function logToElement(type, args) {
                        showConsoleOutput();
                        const output = document.getElementById('console-output');
                        if (output) {
                            const entry = document.createElement('div');
                            entry.className = 'console-' + type;
                            
                            // Style based on type
                            switch(type) {
                                case 'error':
                                    entry.style.color = '#e74c3c';
                                    break;
                                case 'warn':
                                    entry.style.color = '#f39c12';
                                    break;
                                case 'info':
                                    entry.style.color = '#3498db';
                                    break;
                                default:
                                    entry.style.color = '#2c3e50';
                            }
                            
                            // Format arguments
                            let content = '';
                            for (let i = 0; i < args.length; i++) {
                                if (typeof args[i] === 'object') {
                                    try {
                                        content += JSON.stringify(args[i], null, 2) + ' ';
                                    } catch (e) {
                                        content += args[i] + ' ';
                                    }
                                } else {
                                    content += args[i] + ' ';
                                }
                            }
                            
                            entry.textContent = content;
                            output.appendChild(entry);
                        }
                        
                        // Also log to original console
                        return originalConsole[type].apply(console, args);
                    }
                    
                    // Override console methods
                    console.log = function() { logToElement('log', arguments); };
                    console.error = function() { logToElement('error', arguments); };
                    console.warn = function() { logToElement('warn', arguments); };
                    console.info = function() { logToElement('info', arguments); };
                </script>
                
                <!-- User JavaScript -->
                <script>
                    // Execute in try/catch to catch errors
                    try {
                        ${js}
                    } catch (error) {
                        console.error('JavaScript Error:', error.message);
                    }
                </script>
            </body>
            </html>
        `;
        
        // Create a data URL
        const dataUrl = 'data:text/html;charset=utf-8,' + encodeURIComponent(fullCode);
        
        // Open in a new tab
        chrome.tabs.create({url: dataUrl});
    }
    
    switchTab('html');
};
