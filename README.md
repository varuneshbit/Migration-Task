# DocxtoHTML Converter

A full-stack web application that allows users to upload Microsoft Word (`.docx`) documents, extracts structured content (headings, paragraphs, lists, tables), converts it to clean HTML, and dynamically uploads the output to Document360 via API.

## Approach & Architecture

### Backend (Node.js & Express)
- Serves as the middle layer to process `.docx` files securely without exposing API keys on the frontend.
- Uses `multer` to handle in-memory multipart/form-data file uploads.
- Uses `mammoth` to extract raw semantic structures from the Word document and convert them strictly into valid HTML (`<h1>`, `<p>`, `<ul>`, `<table>`, etc.).
- Uses `axios` to push the generated HTML string directly to the Document360 (or Mock) API Endpoint.

### Frontend (React & Vite)
- Provides a clean, professional, and intuitive user interface built with React.
- Uses **Tailwind CSS** for responsive design, glassmorphism UI components, and smooth micro-animations.
- Features a Drag-and-Drop zone for easy file uploads, built using custom React hooks and `lucide-react` iconography.
- Displays a real-time Markdown/HTML preview of the converted document side-by-side with the raw code and API response confirmation.

## Technologies Used
- **Frontend:** React 18, Vite, Tailwind CSS, Axios, Lucide-React.
- **Backend:** Node.js, Express, Multer, Mammoth (for `.docx` parsing), Axios, CORS.

## How to Run the Application

This project requires two terminals to run the frontend and backend servers simultaneously.

### 1. Start the Backend Server
```bash
cd server
npm install
node index.js
```
*The backend will run on `http://localhost:5000`.*

### 2. Start the Frontend Client
Open a **new terminal window** in the root project folder:
```bash
cd client
npm install
npm run dev
```
*Vite will start the client on `http://localhost:3000`. Open this URL in your browser.*

### 3. Usage & Testing
1. Drag and drop any `.docx` file into the upload zone in your browser.
2. Click **Convert & Upload**.
3. View the successful API response, the raw generated HTML, and the live visual preview of the extracted content.
4. *Note: By default, the application is configured to test the payload against a public Mock API (`JSONPlaceholder`) to prevent errors if you do not have a Document360 key yet. To enable real Document360 sync, update the `apiUrl` and `headers` in `server/index.js`.*
