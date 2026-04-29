import cv2
import easyocr
import re
import numpy as np
import os

_reader = easyocr.Reader(['fr', 'en'], gpu=False)

def preprocess_image(image_bytes: bytes):
    print("--- Starting Preprocessing ---")
    nparr = np.frombuffer(image_bytes, np.uint8)
    image = cv2.imdecode(nparr, cv2.IMREAD_COLOR)

    if image is None:
        raise ValueError("Could not decode image.")

    if image.shape[0] > image.shape[1]:
        image = cv2.rotate(image, cv2.ROTATE_90_CLOCKWISE)

    return image

def extract_delivery_note_data(image_bytes: bytes) -> dict:
    try:
        image = preprocess_image(image_bytes)

        current_dir = os.path.dirname(os.path.abspath(__file__))
        cv2.imwrite(os.path.join(current_dir, "debug_processed.jpg"), image)

        print("Running EasyOCR...")
        upscaled = cv2.resize(image, None, fx=2, fy=2, interpolation=cv2.INTER_CUBIC)
        results = _reader.readtext(
            upscaled,
            detail=0,
            paragraph=True,
            text_threshold=0.5,
            low_text=0.3,
        )
        raw_text = "\n".join(results)

        if not re.search(r"BON|LIVRAISON", raw_text, re.I):
            return {"error": "Invalid document. Not a recognized Delivery Note.", "requires_manual_review": True}

        h, w = upscaled.shape[:2]
        date_roi = upscaled[int(h * 0.20):int(h * 0.50), int(w * 0.60):]
        gray = cv2.cvtColor(date_roi, cv2.COLOR_BGR2GRAY)
        clahe = cv2.createCLAHE(clipLimit=3.0, tileGridSize=(8, 8))
        enhanced = clahe.apply(gray)
        sharpen_kernel = np.array([[0, -1, 0], [-1, 5, -1], [0, -1, 0]])
        sharpened = cv2.filter2D(enhanced, -1, sharpen_kernel)
        date_roi_big = cv2.resize(sharpened, None, fx=3, fy=3, interpolation=cv2.INTER_CUBIC)
        cv2.imwrite(os.path.join(current_dir, "debug_date_roi.jpg"), date_roi_big)
        date_results = _reader.readtext(
            date_roi_big,
            detail=0,
            paragraph=False,
            text_threshold=0.2,
            low_text=0.1,
            allowlist='0123456789/: ',
        )
        raw_text += "\n" + " ".join(date_results)
        print(f"OCR finished. Length: {len(raw_text)}")

        data = {
            "debug": {"text_len": len(raw_text), "lines": len(results)},
            "bon_numero": None,
            "date": None,
            "time": None,
            "client": None,
            "colis": None,
            "condi": None,
            "qte": None,
            "designation": None,
            "prix_vente": None,
            "montant": None,
            "total_montant": None,
            "raw_text": raw_text[:800],
            "requires_manual_review": True
        }

        num_match = re.search(r"Bon\s*N[°o'\"`]?\s*(\d{3,})", raw_text, re.I)
        if num_match: data["bon_numero"] = num_match.group(1)

        date_match = re.search(r"(\d{2}/\d{2}/\d{4})", raw_text)
        if date_match: data["date"] = date_match.group(1)

        time_match = re.search(r"(\d{2}:\d{2})", raw_text)
        if time_match: data["time"] = time_match.group(1)

        client_match = re.search(r"Client\s*[:;]?\s*([A-Z][A-Z ]+[A-Z])", raw_text)
        if client_match: data["client"] = client_match.group(1).strip()

        amount_pattern = re.findall(r"\d{1,3}(?:[\s.]\d{3})+[.,]\d{2}", raw_text)
        if amount_pattern:
            floats = []
            for m in amount_pattern:
                try:
                    floats.append(float(m.replace(" ", "").replace(".", "").replace(",", ".")))
                except ValueError:
                    pass
            if floats:
                data["total_montant"] = max(floats)
                data["montant"] = max(floats)

        colis_match = re.search(r"^\s*(\d{1,3})\s*$", raw_text, re.M)
        if colis_match: data["colis"] = int(colis_match.group(1))

        table_nums = re.search(r"(\d{1,3})\s+(\d{1,3})\s+BRILEX", raw_text, re.I)
        if table_nums:
            data["condi"] = int(table_nums.group(1))
            data["qte"] = int(table_nums.group(2))

        desig_match = re.search(r"(BRILEX[\s\w]+?)(?=\s+(?:Nor|Nbr|Total)|$)", raw_text, re.I)
        if desig_match:
            desig = desig_match.group(1).strip().upper()
            desig = re.sub(r"(\d+)4L\b", r"\g<1>ML", desig)
            desig = re.sub(r"\s+", " ", desig)
            data["designation"] = desig

        prix_match = re.search(r"(?<!\d)(\d{1,4}[.,]\d{2})(?!\d)", raw_text)
        if prix_match:
            try:
                data["prix_vente"] = float(prix_match.group(1).replace(",", "."))
            except ValueError:
                pass

        if data["prix_vente"] and data["montant"]:
            try:
                derived_qte = round(data["montant"] / data["prix_vente"])
                if derived_qte > 0:
                    data["qte"] = derived_qte
            except (TypeError, ZeroDivisionError):
                pass

        if data["bon_numero"] and data["client"] and data["total_montant"] is not None:
            data["requires_manual_review"] = False

        return data
    except Exception as global_e:
        print(f"CRITICAL ERROR in extraction: {global_e}")
        return {"error": str(global_e)}
