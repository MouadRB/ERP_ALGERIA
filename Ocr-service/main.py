from typing import Any, Optional

from fastapi import FastAPI, File, UploadFile
from pydantic import BaseModel

from ocr_engine import extract_delivery_note_data

app = FastAPI(title="OCR Delivery Note Service")


class DeliveryNoteResponse(BaseModel):
    bon_numero: str
    date: str
    time: str
    client: str
    colis: int
    condi: int
    qte: int
    prix_vente: float
    montant: float
    total_montant: float
    designation: str
    raw_text: str
    requires_manual_review: bool
    error: Optional[str] = None


def _to_int(value: Any, default: int = 0) -> int:
    try:
        if value is None or value == "":
            return default
        return int(value)
    except (ValueError, TypeError):
        return default


def _to_float(value: Any, default: float = 0.0) -> float:
    try:
        if value is None or value == "":
            return default
        return float(value)
    except (ValueError, TypeError):
        return default


def map_to_contract(payload: dict[str, Any]) -> DeliveryNoteResponse:
    return DeliveryNoteResponse(
        bon_numero=str(payload.get("bon_numero") or ""),
        date=str(payload.get("date") or ""),
        time=str(payload.get("time") or ""),
        client=str(payload.get("client") or ""),
        colis=_to_int(payload.get("colis"), 0),
        condi=_to_int(payload.get("condi"), 0),
        qte=_to_int(payload.get("qte"), 0),
        prix_vente=_to_float(payload.get("prix_vente"), 0.0),
        montant=_to_float(payload.get("montant"), 0.0),
        total_montant=_to_float(payload.get("total_montant"), 0.0),
        designation=str(payload.get("designation") or ""),
        raw_text=str(payload.get("raw_text") or ""),
        requires_manual_review=bool(payload.get("requires_manual_review", True)),
        error=payload.get("error"),
    )


@app.post("/extract-delivery-note", response_model=DeliveryNoteResponse)
async def extract_delivery_note(file: UploadFile = File(...)) -> DeliveryNoteResponse:
    file_bytes = await file.read()

    if not file_bytes:
        return map_to_contract(
            {
                "requires_manual_review": True,
                "error": "Empty uploaded file.",
            }
        )

    try:
        ocr_output = extract_delivery_note_data(file_bytes)
    except Exception as exc:
        ocr_output = {
            "requires_manual_review": True,
            "error": f"OCR processing failed: {exc}",
        }

    if not isinstance(ocr_output, dict):
        ocr_output = {
            "requires_manual_review": True,
            "error": "Invalid OCR output format.",
        }

    return map_to_contract(ocr_output)


if __name__ == "__main__":
    import uvicorn

    uvicorn.run("main:app", host="0.0.0.0", port=8085, reload=False)
