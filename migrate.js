const mammoth = require("mammoth");
const fs = require("fs");
const axios = require("axios");

// Step 1: Read Word document and convert to HTML
async function convertDocxToHTML() {
    try {
        if (!fs.existsSync("input.docx") || fs.statSync("input.docx").size === 0) {
            console.error("Error: input.docx is missing or empty. Please provide a valid Word document.");
            return null;
        }

        const result = await mammoth.convertToHtml({ path: "input.docx" });

        const html = result.value;

        // Step 2: Save HTML to file
        fs.writeFileSync("main.html", html);

        console.log("HTML file generated successfully.");

        return html;

    } catch (error) {
        console.error("Error converting document:", error);
    }
}

// Step 3: Send HTML to Document360 API
async function uploadToDocument360(htmlContent) {

    // Using JSONPlaceholder as a public mock API for testing the program flow
    // A real Document360 endpoint looks like: https://apihub.document360.io/v2/ProjectVersions/{projectVersionId}/Articles
    const apiUrl = "https://jsonplaceholder.typicode.com/posts";

    const payload = {
        title: "Migrated Article",
        content: htmlContent,
        userId: 1 // required for jsonplaceholder
    };

    try {

        const response = await axios.post(apiUrl, payload, {
            headers: {
                "Content-Type": "application/json",
                // "api_token": "YOUR_API_KEY" // (uncomment when using reals API)
            }
        });

        console.log("Article mocked-uploaded successfully!");
        console.log(response.data);

    } catch (error) {

        console.error("API upload failed:");
        console.error(error.response ? error.response.data : error.message);
    }
}

// Run program
async function runMigration() {

    const html = await convertDocxToHTML();

    if (html) {
        await uploadToDocument360(html);
    }
}

runMigration();