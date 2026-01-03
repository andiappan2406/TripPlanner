#!/usr/bin/env node

/**
 * GlobeTrotter Smart Planner - Node.js Development Server
 * This server helps run and manage the Odoo module
 */

const express = require('express');
const { spawn, exec } = require('child_process');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = 3000;
const ODOO_PORT = 8069;

// Serve static files from module
app.use(express.static(__dirname));
app.use(express.json());

// Module information endpoint
app.get('/api/module/info', (req, res) => {
    const manifestPath = path.join(__dirname, '__manifest__.py');
    
    try {
        if (fs.existsSync(manifestPath)) {
            const manifest = fs.readFileSync(manifestPath, 'utf8');
            res.json({
                success: true,
                module: {
                    name: 'GlobeTrotter Smart Planner',
                    path: __dirname,
                    files: {
                        python: countFiles(__dirname, '.py'),
                        xml: countFiles(__dirname, '.xml'),
                        total: countAllFiles(__dirname)
                    }
                },
                manifest: extractManifestInfo(manifest)
            });
        } else {
            res.json({ success: false, error: 'Manifest not found' });
        }
    } catch (error) {
        res.json({ success: false, error: error.message });
    }
});

// Check Odoo status
app.get('/api/odoo/status', (req, res) => {
    checkOdooStatus((status) => {
        res.json(status);
    });
});

// Start Odoo endpoint
app.post('/api/odoo/start', (req, res) => {
    startOdoo((result) => {
        res.json(result);
    });
});

// Module validation endpoint
app.get('/api/module/validate', (req, res) => {
    validateModule((result) => {
        res.json(result);
    });
});

// Main page
app.get('/', (req, res) => {
    res.send(`
<!DOCTYPE html>
<html>
<head>
    <title>GlobeTrotter Smart Planner - Module Server</title>
    <style>
        body { font-family: Arial, sans-serif; max-width: 800px; margin: 50px auto; padding: 20px; }
        .status { padding: 15px; margin: 10px 0; border-radius: 5px; }
        .success { background: #d4edda; border: 1px solid #c3e6cb; }
        .error { background: #f8d7da; border: 1px solid #f5c6cb; }
        .info { background: #d1ecf1; border: 1px solid #bee5eb; }
        button { padding: 10px 20px; margin: 5px; cursor: pointer; }
        .module-info { background: #f8f9fa; padding: 20px; border-radius: 5px; margin: 20px 0; }
    </style>
</head>
<body>
    <h1>🌍 GlobeTrotter Smart Planner</h1>
    <div class="module-info">
        <h2>Module Information</h2>
        <div id="moduleInfo">Loading...</div>
    </div>
    
    <div class="module-info">
        <h2>Odoo Status</h2>
        <div id="odooStatus">Checking...</div>
        <button onclick="checkStatus()">Refresh Status</button>
        <button onclick="startOdoo()">Start Odoo</button>
    </div>
    
    <div class="module-info">
        <h2>Quick Links</h2>
        <p><a href="http://localhost:${ODOO_PORT}" target="_blank">Odoo Interface (http://localhost:${ODOO_PORT})</a></p>
        <p><a href="/api/module/info">Module Info (JSON)</a></p>
        <p><a href="/api/odoo/status">Odoo Status (JSON)</a></p>
    </div>
    
    <script>
        function loadInfo() {
            fetch('/api/module/info')
                .then(r => r.json())
                .then(data => {
                    document.getElementById('moduleInfo').innerHTML = 
                        '<pre>' + JSON.stringify(data, null, 2) + '</pre>';
                });
            
            checkStatus();
        }
        
        function checkStatus() {
            fetch('/api/odoo/status')
                .then(r => r.json())
                .then(data => {
                    const status = data.running ? 
                        '<div class="status success">✅ Odoo is RUNNING</div>' :
                        '<div class="status error">❌ Odoo is NOT running</div>';
                    document.getElementById('odooStatus').innerHTML = 
                        status + '<pre>' + JSON.stringify(data, null, 2) + '</pre>';
                });
        }
        
        function startOdoo() {
            fetch('/api/odoo/start', { method: 'POST' })
                .then(r => r.json())
                .then(data => {
                    alert(data.message || JSON.stringify(data));
                    setTimeout(checkStatus, 2000);
                });
        }
        
        loadInfo();
        setInterval(checkStatus, 10000);
    </script>
</body>
</html>
    `);
});

// Helper functions
function countFiles(dir, ext) {
    let count = 0;
    try {
        const files = fs.readdirSync(dir, { recursive: true });
        files.forEach(file => {
            if (file.endsWith(ext)) count++;
        });
    } catch (e) {}
    return count;
}

function countAllFiles(dir) {
    let count = 0;
    try {
        const files = fs.readdirSync(dir, { recursive: true });
        count = files.length;
    } catch (e) {}
    return count;
}

function extractManifestInfo(manifest) {
    const nameMatch = manifest.match(/'name':\s*['"]([^'"]+)['"]/);
    const versionMatch = manifest.match(/'version':\s*['"]([^'"]+)['"]/);
    return {
        name: nameMatch ? nameMatch[1] : 'Unknown',
        version: versionMatch ? versionMatch[1] : 'Unknown'
    };
}

function checkOdooStatus(callback) {
    // Check if port is open
    exec(`curl -s -o /dev/null -w "%{http_code}" http://localhost:${ODOO_PORT}`, (error, stdout) => {
        const running = !error && (stdout === '200' || stdout === '303' || stdout === '404');
        
        // Check process
        exec('pgrep -f odoo', (err, pid) => {
            callback({
                running: running || !err,
                port: ODOO_PORT,
                accessible: running,
                process: pid ? pid.trim() : null,
                url: `http://localhost:${ODOO_PORT}`
            });
        });
    });
}

function startOdoo(callback) {
    const modulePath = __dirname;
    const parentPath = path.dirname(modulePath);
    const moduleName = path.basename(modulePath);
    
    // Check if virtual environment exists
    const venvPython = path.join(modulePath, 'venv', 'bin', 'python3');
    const useVenv = fs.existsSync(venvPython);
    const pythonCmd = useVenv ? venvPython : 'python3';
    
    // First check if Odoo is installed
    exec(`${pythonCmd} -c "import odoo" 2>&1`, (checkError) => {
        if (checkError) {
            callback({
                success: false,
                message: 'Odoo is not installed.',
                error: 'Odoo Python package not found',
                solution: {
                    step1: 'Run: npm run setup',
                    step2: 'Or manually: source venv/bin/activate && pip install odoo',
                    step3: 'Or use Docker: docker run -d -p 8069:8069 -v $(pwd):/mnt/extra-addons odoo:latest'
                },
                hint: 'Use the setup script: node setup-odoo.js'
            });
            return;
        }
        
        // Odoo is installed, try to start it
        console.log(`Starting Odoo with: ${pythonCmd}`);
        const odooProcess = spawn(pythonCmd, [
            '-m', 'odoo',
            '-d', 'globetrotter_db',
            '--addons-path', parentPath,
            '-i', moduleName,
            '--http-port', ODOO_PORT.toString()
        ], {
            detached: true,
            stdio: 'ignore'
        });
        
        odooProcess.unref();
        
        // Wait a moment and check if it started
        setTimeout(() => {
            checkOdooStatus((status) => {
                if (status.running) {
                    callback({
                        success: true,
                        message: 'Odoo started successfully!',
                        url: `http://localhost:${ODOO_PORT}`,
                        pid: status.process
                    });
                } else {
                    callback({
                        success: false,
                        message: 'Odoo process started but not responding yet.',
                        hint: 'Wait a few seconds and check again. Odoo may need time to initialize.',
                        url: `http://localhost:${ODOO_PORT}`
                    });
                }
            });
        }, 3000);
    });
}

function validateModule(callback) {
    const pythonFiles = countFiles(__dirname, '.py');
    const xmlFiles = countFiles(__dirname, '.xml');
    const hasManifest = fs.existsSync(path.join(__dirname, '__manifest__.py'));
    
    callback({
        valid: hasManifest && pythonFiles > 0 && xmlFiles > 0,
        files: {
            python: pythonFiles,
            xml: xmlFiles,
            manifest: hasManifest
        },
        message: hasManifest ? 'Module structure is valid' : 'Manifest missing'
    });
}

// Start server
app.listen(PORT, () => {
    console.log('==========================================');
    console.log('GlobeTrotter Smart Planner - Node Server');
    console.log('==========================================');
    console.log('');
    console.log(`✅ Server running on: http://localhost:${PORT}`);
    console.log(`📦 Module path: ${__dirname}`);
    console.log('');
    console.log('Endpoints:');
    console.log(`  - Main page: http://localhost:${PORT}`);
    console.log(`  - Module info: http://localhost:${PORT}/api/module/info`);
    console.log(`  - Odoo status: http://localhost:${PORT}/api/odoo/status`);
    console.log('');
    console.log('To access Odoo (when running):');
    console.log(`  http://localhost:${ODOO_PORT}`);
    console.log('');
});

