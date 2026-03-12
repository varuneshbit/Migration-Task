const express = require('express');
const multer = require('multer');
const mammoth = require('mammoth');
const pdfParse = require('pdf-parse');
const axios = require('axios');
const fs = require('fs');
const path = require('path');

const router = express.Router();

// Configure Multer for in-memory file uploads, saving to disk is optional but using memory buffer is faster for processing
const storage = multer.memoryStorage();
const upload = multer({ 
    storage: storage,
    fileFilter: (req, file, cb) => {
        if (file.mimetype === 'application/pdf' || 
            file.mimetype === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
            cb(null, true);
        } else {
            cb(new Error("Unsupported file type. Please upload DOCX or PDF."), false);
        }
    }
});

/**
 * Endpoint 1: POST /upload
 * Accepts file upload, detects type, converts to HTML, saves to output.html
 */
router.post('/upload', upload.single('document'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ success: false, message: 'No file uploaded or unsupported file type.' });
        }

        const buffer = req.file.buffer;
        let htmlContent = '';
        let detectedStructure = [];

        // Parse depending on file type
        if (req.file.mimetype === 'application/pdf') {
            // PDF Parsing
            const pdfData = await pdfParse(buffer);
            
            // Basic text to HTML paragraphs conversion
            const rawText = pdfData.text.trim();
            htmlContent = rawText
                .split(/\n\s*\n/) // split by double newlines into paragraphs
                .map(p => `<p>${p.replace(/\n/g, '<br/>')}</p>`)
                .join('\n');
            
            detectedStructure = ["Paragraphs"]; // Simple structure for PDF text extraction

        } else {
            // DOCX Parsing using Mammoth
            const result = await mammoth.convertToHtml({ buffer: buffer });
            htmlContent = result.value;
            
            // Infer structure from the HTML
            if (htmlContent.includes('<h1>') || htmlContent.includes('<h2>') || htmlContent.includes('<h3>')) detectedStructure.push("Headings");
            if (htmlContent.includes('<p>')) detectedStructure.push("Paragraphs");
            if (htmlContent.includes('<ul>')) detectedStructure.push("Bullet Lists");
            if (htmlContent.includes('<ol>')) detectedStructure.push("Numbered Lists");
            if (htmlContent.includes('<table>')) detectedStructure.push("Tables");
            if (htmlContent.includes('<a href=')) detectedStructure.push("Hyperlinks");
        }

        // Save generated HTML to a file called output.html in the server root
        const outputPath = path.join(__dirname, '../output.html');
        fs.writeFileSync(outputPath, htmlContent, 'utf-8');

        // Return HTML to frontend
        res.json({
            success: true,
            message: 'Document parsed and saved successfully.',
            html: htmlContent,
            structure: detectedStructure
        });

    } catch (error) {
        console.error("Error during document parsing:", error);
        res.status(500).json({ 
            success: false, 
            message: error.message || 'An error occurred during file parsing.'
        });
    }
});

/**
 * Endpoint 2: POST /upload-to-document360
 * Accepts HTML content, sends POST request to Document360 API, returns response
 */
router.post('/upload-to-document360', async (req, res) => {
    try {
        const { html, title } = req.body;

        if (!html) {
            return res.status(400).json({ success: false, message: 'HTML content missing from request.' });
        }

        // For this assignment, simulate the API or use a testing placeholder API
        const apiUrl = "https://jsonplaceholder.typicode.com/posts";
        // To use real Document360, change the apiUrl to: 
        // "https://apihub.document360.io/v2/Articles" (adjust per specific projectVersion endpoint)

        const payload = {
            title: title || "Migrated Article",
            content: html,
            category_id: "CATEGORY_ID"
        };

        const response = await axios.post(apiUrl, payload, {
             headers: {
                 "Content-Type": "application/json",
                 // "api_token": "YOUR_API_TOKEN" // (uncomment when using reals API)
             }
        });

        console.log("Article uploaded successfully to Document360 endpoint (Mocked). Response ID:", response.data.id);

        res.json({
            success: true,
            message: 'Article uploaded successfully to Document360.',
            data: response.data
        });

    } catch (error) {
        console.error("Failed to upload article:", error.response ? error.response.data : error.message);
        res.status(500).json({ 
            success: false, 
            message: 'Failed to upload article to Document360.',
            error: error.response?.data || error.message
        });
    }
});

module.exports = router;
