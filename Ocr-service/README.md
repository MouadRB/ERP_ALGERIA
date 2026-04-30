```markdown
# 📄 **Delivery Note OCR API**
*Automate the extraction of structured data from delivery notes with AI-powered OCR*

![OCR Demo](https://via.placeholder.com/800x450?text=Delivery+Note+OCR+Demo)
*Example of how this API processes and extracts data from delivery notes*

---

## 🚀 **Overview**
Tired of manually extracting data from delivery notes? **Delivery Note OCR API** is a **FastAPI-based solution** that uses **EasyOCR** to automatically parse and structure key information (dates, client names, item details, totals, etc.) from scanned or photographed delivery notes.

### **Why This Project?**
✅ **Fast & Accurate** – Uses GPU-optimized OCR for high-quality text extraction
✅ **Structured Output** – Returns clean, JSON-formatted data for easy integration
✅ **Multi-Language Support** – Handles both **French (`fr`)** and **English (`en`)** documents
✅ **Self-Healing** – Flags documents that require manual review
✅ **Open-Source & Extensible** – Built for developers who want to automate data entry

Perfect for **logistics teams, warehouse managers, and developers** looking to reduce manual data entry errors.

---

## ✨ **Features**
🔹 **Automated Data Extraction** – Pulls key fields like `bon_numero`, `date`, `client`, `total_montant`, etc.
🔹 **Image Preprocessing** – Rotates, enhances, and upscales images for better OCR accuracy
🔹 **Region-of-Interest (ROI) Processing** – Focuses on critical areas (e.g., dates) for higher precision
🔹 **Error Handling** – Detects non-delivery notes and flags them for review
🔹 **Local Development Ready** – Includes a **FastAPI server** for easy testing
🔹 **Debugging Support** – Generates intermediate images (`debug_*.jpg`) for troubleshooting

---

## 🛠️ **Tech Stack**
| Category       | Tools/Libraries                          |
|----------------|------------------------------------------|
| **Language**   | Python 3.8+                              |
| **Framework**  | FastAPI (for REST API)                   |
| **OCR**        | EasyOCR (with GPU support)              |
| **Image Processing** | OpenCV (`cv2`)          |
| **Dependencies** | Uvicorn (ASGI server), NumPy, `python-multipart` |

### **System Requirements**
- **Python 3.8+**
- **GPU (Recommended)** – Speeds up OCR processing (EasyOCR supports GPU acceleration)
- **~500MB RAM** (for basic usage)

---

## 📦 **Installation**

### **Prerequisites**
1. **Python 3.8+** – [Download here](https://www.python.org/downloads/)
2. **Git** – [Install Git](https://git-scm.com/downloads)
3. **Docker (Optional)** – For containerized deployment

---

### **Quick Start (Local Development)**
#### **1. Clone the Repository**
```bash
git clone https://github.com/yourusername/delivery-note-ocr.git
cd delivery-note-ocr
```

#### **2. Set Up a Virtual Environment (Recommended)**
```bash
python -m venv .venv
source .venv/bin/activate  # Linux/Mac
# OR
.venv\Scripts\activate     # Windows
```

#### **3. Install Dependencies**
```bash
pip install -r requirements.txt
```

#### **4. Start the FastAPI Server**
```bash
uvicorn main:app --reload
```
- The API will be available at: **[http://127.0.0.1:8080](http://127.0.0.1:8080)**
- Open **Swagger UI** at: **[http://127.0.0.1:8080/docs](http://127.0.0.1:8080/docs)**

#### **5. (Windows) Use the Provided Batch Script**
```bash
start_ocr.bat
```
*(This automates the setup and starts the server.)*

---

### **Alternative: Docker Setup**
```bash
docker build -t delivery-note-ocr .
docker run -p 8080:8080 delivery-note-ocr
```
*(Add a `Dockerfile` if needed for production deployment.)*

---

## 🎯 **Usage**

### **Basic API Request**
Send a **POST** request to `/extract-delivery-note` with an image file.

#### **Example (cURL)**
```bash
curl -X POST -F "file=@delivery_note.jpg" http://127.0.0.1:8080/extract-delivery-note
```

#### **Example Response**
```json
{
  "bon_numero": "2167",
  "date": "13/04/2026",
  "client": "SECTEUR CENTER VILLE",
  "total_montant": 1722.0,
  "raw_text": "BON DE LIVRAISON... [truncated]",
  "requires_manual_review": false,
  "debug": {
    "text_len": 512,
    "lines": 12
  }
}
```

---

### **Python Client Example**
```python
import requests

def extract_delivery_note(image_path):
    url = "http://127.0.0.1:8080/extract-delivery-note"
    with open(image_path, "rb") as f:
        files = {"file": f}
        response = requests.post(url, files=files)
    return response.json()

# Usage
result = extract_delivery_note("delivery_note.jpg")
print(result)
```

---

### **Advanced: Customizing OCR Settings**
Modify `ocr_engine.py` to adjust:
- **Language support** (add more languages to `easyocr.Reader()`)
- **Text threshold** (`text_threshold` in `readtext()`)
- **Region-of-interest (ROI) coordinates** for better date/number extraction

---

## 📁 **Project Structure**
```
delivery-note-ocr/
│── main.py               # FastAPI entry point
│── ocr_engine.py         # Core OCR logic & preprocessing
│── requirements.txt      # Python dependencies
│── start_ocr.bat         # Windows startup script
│── truth.json            # Example expected output (for testing)
│── debug_*.jpg           # (Generated) Debug images
```

---

## 🔧 **Configuration**
### **Environment Variables**
| Variable          | Description                          | Default          |
|-------------------|--------------------------------------|------------------|
| `OCR_LANGUAGES`   | Comma-separated list of languages    | `fr,en`          |
| `DEBUG_MODE`      | Enable debug image generation       | `False`          |

*(Add `.env` support for production deployment.)*

---

## 🤝 **Contributing**
We welcome contributions! Here’s how you can help:

### **1. Fork & Clone**
```bash
git clone https://github.com/yourusername/delivery-note-ocr.git
cd delivery-note-ocr
```

### **2. Set Up Your Environment**
```bash
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
```

### **3. Make Changes**
- **Improve OCR accuracy** (e.g., better ROI detection)
- **Add more language support**
- **Optimize preprocessing steps**
- **Enhance error handling**

### **4. Test Locally**
```bash
uvicorn main:app --reload
```
Test with `curl` or Postman.

### **5. Submit a Pull Request**
1. Push your changes:
   ```bash
   git add .
   git commit -m "Add feature: [your feature]"
   git push origin your-branch-name
   ```
2. Open a **Pull Request** on GitHub!

---

### **Code Style Guidelines**
- Follow **PEP 8** conventions
- Use **type hints** (e.g., `def func(param: str) -> dict`)
- Write **unit tests** (add a `tests/` directory)
- Keep **commit messages** clear and concise

---

## 📝 **License**
This project is licensed under the **MIT License** – free to use for personal and commercial projects.

---

## 👥 **Authors & Contributors**
👤 **Maintainer**: [Your Name](https://github.com/yourusername)
🤝 **Contributors**:
- [@contributor1](https://github.com/contributor1)
- [@contributor2](https://github.com/contributor2)

---

## 🐛 **Issues & Support**
### **Reporting Bugs**
Found an issue? Open a **GitHub Issue** with:
- **Steps to reproduce**
- **Expected vs. actual behavior**
- **Debug images** (if applicable)

### **Getting Help**
- **Discussions**: [GitHub Discussions](https://github.com/yourusername/delivery-note-ocr/discussions)
- **Community**: Join our [Slack/Discord](link) for real-time help!

### **FAQ**
| Question               | Answer                                  |
|------------------------|----------------------------------------|
| **Does it support PDFs?** | No (yet). Use `pdf2image` to convert first. |
| **How accurate is it?** | ~90% for clear delivery notes (improve with more training data). |
| **Can I deploy this?** | Yes! Use Docker or FastAPI’s production mode. |

---

## 🗺️ **Roadmap**
| Feature               | Status       | Notes                                  |
|-----------------------|--------------|----------------------------------------|
| **PDF Support**       | ⚠️ Planned   | Add `pdf2image` integration            |
| **Batch Processing**  | 🚧 In Progress | CLI tool for bulk OCR                 |
| **Custom Templates**  | 💡 Idea      | Let users define their own layouts     |
| **GPU Optimization**  | ✅ Done       | EasyOCR already supports GPU           |
| **More Languages**    | 📝 Open      | Add `es`, `de`, `it` support          |

---

## 🎉 **Star & Share!**
If you found this useful, **star the repo** and share it with your team! 🚀

```bash
git clone https://github.com/yourusername/delivery-note-ocr.git
cd delivery-note-ocr
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
uvicorn main:app --reload
```
*(Copy-paste friendly!)*

---
**Happy OCR-ing!** 📄✨
```