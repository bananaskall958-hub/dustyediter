// Get DOM elements
const editor = document.getElementById('editor');
const saveBtn = document.getElementById('saveBtn');
const clearBtn = document.getElementById('clearBtn');
const downloadBtn = document.getElementById('downloadBtn');
const statusDiv = document.getElementById('status');

// Storage key
const STORAGE_KEY = 'dustyeditor_content';
const AUTO_SAVE_INTERVAL = 30000; // 30 seconds

// Load content from localStorage on page load
window.addEventListener('DOMContentLoaded', () => {
    const savedContent = localStorage.getItem(STORAGE_KEY);
    if (savedContent) {
        editor.value = savedContent;
        showStatus('Content restored from last session', 'success');
    }
});

// Save button functionality
saveBtn.addEventListener('click', saveContent);

// Clear button functionality
clearBtn.addEventListener('click', () => {
    if (confirm('Are you sure you want to clear all content? This action cannot be undone.')) {
        editor.value = '';
        localStorage.removeItem(STORAGE_KEY);
        showStatus('Content cleared', 'success');
    }
});

// Download button functionality
downloadBtn.addEventListener('click', downloadContent);

// Keyboard shortcut: Ctrl+S or Cmd+S to save
document.addEventListener('keydown', (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        saveContent();
    }
});

// Auto-save every 30 seconds
setInterval(() => {
    if (editor.value.trim() !== '') {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved !== editor.value) {
            localStorage.setItem(STORAGE_KEY, editor.value);
            showStatus('Auto-saved', 'success');
        }
    }
}, AUTO_SAVE_INTERVAL);

/**
 * Save content to localStorage
 */
function saveContent() {
    const content = editor.value;
    if (content.trim() === '') {
        showStatus('Nothing to save. Content is empty.', 'error');
        return;
    }
    localStorage.setItem(STORAGE_KEY, content);
    showStatus('✓ Content saved successfully!', 'success');
}

/**
 * Download content as a text file
 */
function downloadContent() {
    const content = editor.value;
    if (content.trim() === '') {
        showStatus('Nothing to download. Content is empty.', 'error');
        return;
    }

    // Create blob
    const blob = new Blob([content], { type: 'text/plain' });
    
    // Create download link
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `dusty-editor-${new Date().toISOString().split('T')[0]}.txt`;
    
    // Trigger download
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
    
    showStatus('✓ File downloaded successfully!', 'success');
}

/**
 * Display status message
 * @param {string} message - The message to display
 * @param {string} type - 'success' or 'error'
 */
function showStatus(message, type = 'success') {
    statusDiv.textContent = message;
    statusDiv.className = `status ${type}`;
    
    // Auto-hide status message after 3 seconds
    setTimeout(() => {
        statusDiv.textContent = '';
        statusDiv.className = 'status';
    }, 3000);
}
