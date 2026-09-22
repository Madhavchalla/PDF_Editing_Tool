# PaperCraft Studio 📄✨

> **Next-Generation In-Browser PDF Editor & Toolkit**

PaperCraft Studio is a 100% client-side, privacy-focused web application that allows users to edit, annotate, organize, sign, watermark, and protect PDF documents directly in their browser—without uploading sensitive files to external servers.

---

> ⚠️ **Note on Scope & Capability**:  
> *This tool handles approximately **70% of standard PDF operations** reliably directly in the browser (inline text editing, signature placement, page reordering/rotation, watermarking, and security). Complex vector graphics, non-standard embedded font encodings, or heavy print-production workflows may have limitations.*

---

## 🌟 Features

### 1. 📝 Direct Inline Text Editing
- **Word Processor Experience**: Click on any detected text block on a PDF page to edit content inline.
- **Rich Formatting Controls**: Adjust font size, font family, text color, bold/italic styles, and text alignment.
- **Draggable & Resizable**: Drag text boxes to reposition or resize bounds with touch and mouse handles.

### 2. 📑 Page Organizer & Management
- **Thumbnail View**: Interactive sidebar thumbnail previews for every page.
- **Page Operations**:
  - **Reorder**: Drag & drop thumbnails to reorder pages.
  - **Rotate**: Rotate individual pages clockwise or counter-clockwise (90°, 180°, 270°).
  - **Duplicate**: Duplicate any page instantly.
  - **Delete**: Remove unwanted pages from the document.

### 3. ✍️ Digital Signatures & Annotations
- **Handwritten Signature**: Draw signatures on a responsive touch/mouse canvas.
- **Typed Signature**: Type your name with elegant handwriting fonts.
- **Signature Placement**: Insert signature stamps on any page, resize, reposition, and export seamlessly into final PDF.

### 4. 🔒 Security & Password Protection
- **Encrypt PDF**: Protect exported PDFs with custom Owner & User passwords.
- **Permissions Control**: Configure printing and copying permission flags.
- **Password-Protected File Reader**: Decrypt and edit password-protected input PDFs with manual password entry prompts.

### 5. 💧 Custom Watermarking
- **Text Watermarks**: Custom watermark text with adjustable font size, rotation angle (-90° to 90°), opacity, and color across all pages.
- **Image Watermarks**: Upload custom logo image overlays.

### 6. 🎨 3D Interactive Landing Page
- Built with **Three.js**: Features floating 3D paper document sheets, warm studio lighting, ambient paper particles, and dynamic mouse parallax tilt.

### 7. 📱 100% Mobile Responsive
- Touch-optimized controls for mobile and tablet editing (`onTouchStart`, `touchmove`, `touchend`).
- Mobile slide-over thumbnail sidebar drawer and floating bottom formatting toolbar.

### 8. 🛡️ 100% Client-Side Privacy
- Powered by `pdfjs-dist` and `pdf-lib`. All rendering, text extraction, and PDF binary modifications occur strictly inside the browser memory.

---

## 🛠️ Tech Stack

- **Core**: React 18, TypeScript, Vite
- **Styling**: Tailwind CSS, Lucide React Icons
- **PDF Engine**: `pdfjs-dist` (Page Rendering & Text Layer), `pdf-lib` (PDF Document Assembly, Page Reordering, Encryption & Watermarks)
- **3D Graphics**: `three` (WebGL Hero Animation)
- **Delights**: `canvas-confetti`

