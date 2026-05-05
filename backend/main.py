import io
import logging
import os
from pathlib import Path
from typing import Any, Dict, List, Optional
import json

import numpy as np
import fastapi
import fastapi.middleware.cors
import pandas as pd
from dotenv import load_dotenv
from fastapi import File, HTTPException, UploadFile, Depends
from pydantic import BaseModel
from sqlalchemy.orm import Session

# Import our new modules
from database import init_db, get_db, Record, Decision as DbDecision
from data_parser import parse_text_to_structured_data, parse_image_with_gemini
from decision_engine import generate_decisions, clean_data, get_localized_report_headline, get_localized_fallback_summary
from chat_service import get_chat_response
from voice_service import transcribe_audio

_ENV_PATH = Path(__file__).resolve().parents[1] / ".env"
load_dotenv(dotenv_path=_ENV_PATH, override=False)

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def make_json_serializable(obj: Any) -> Any:
    """Convert non-JSON-serializable objects to JSON-serializable equivalents."""
    if isinstance(obj, dict):
        return {str(k): make_json_serializable(v) for k, v in obj.items()}
    elif isinstance(obj, (list, tuple)):
        return [make_json_serializable(item) for item in obj]
    elif isinstance(obj, (pd.Timestamp, pd.Timedelta)):
        return str(obj)
    elif isinstance(obj, (pd.Series, np.ndarray)):
        return [make_json_serializable(x) for x in obj.tolist()]
    elif pd.isna(obj):
        return None
    elif isinstance(obj, (float, np.float64, np.float32)):
        if np.isnan(obj) or np.isinf(obj):
            return None
        return float(obj)
    elif isinstance(obj, (int, np.int64, np.int32)):
        return int(obj)
    elif isinstance(obj, (str, bool, type(None))):
        return obj
    else:
        return str(obj)


app = fastapi.FastAPI(title="Visionix Decisions API")

app.add_middleware(
    fastapi.middleware.cors.CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize DB on startup
@app.on_event("startup")
def startup():
    init_db()

# Models
class QueryRequest(BaseModel):
    query: str = "What should I do next?"
    history: Optional[List[Dict[str, str]]] = []
    language: str = "en"

class ChatRequest(BaseModel):
    message: str
    history: Optional[List[Dict[str, str]]] = []
    context: Optional[Dict[str, Any]] = None
    language: str = "en"

# Shared state for legacy support (CSV upload)
uploaded_df: Optional[pd.DataFrame] = None

@app.get("/health")
async def health():
    return {"status": "ok", "app": "Visionix Decisions"}

@app.post("/upload")
async def upload_file(file: UploadFile = File(...), db: Session = Depends(get_db)):
    global uploaded_df
    if not file.filename.lower().endswith(".csv"):
        raise HTTPException(status_code=400, detail="Only CSV files are supported")

    def safe_float(value: Any, default: Optional[float] = 0.0) -> Optional[float]:
        try:
            if value is None:
                return default
            return float(value)
        except (TypeError, ValueError):
            return default

    try:
        # Clear old records for a fresh analysis of the new file
        db.query(Record).delete()
        db.commit()

        contents = await file.read()
        decoded = contents.decode("utf-8", errors="replace")
        df = pd.read_csv(io.StringIO(decoded))
        df = clean_data(df)
        uploaded_df = df
        
        # Save records to DB
        # Flexible mapping for various CSV formats
        for _, row in df.iterrows():
            row_dict = row.to_dict()
            # Make all values JSON-serializable before storing
            row_dict = make_json_serializable(row_dict)
            
            item_val = row_dict.get('item', row_dict.get('product', row_dict.get('product_purchased', row_dict.get('category', 'Unknown'))))
            qty_val = row_dict.get('quantity', row_dict.get('qty', row_dict.get('orders', 1)))
            price_val = row_dict.get('price', row_dict.get('amount', row_dict.get('spend_amount', row_dict.get('cost', 0))))
            cat_val = row_dict.get('category', row_dict.get('city', row_dict.get('gender', 'General')))
            
            record = Record(
                source='csv',
                item=str(item_val),
                quantity=safe_float(qty_val, 0.0),
                price=safe_float(price_val, None),
                category=str(cat_val),
                raw_data=row_dict
            )
            db.add(record)
        db.commit()
        
        return {
            "message": "File uploaded and processed",
            "columns": df.columns.tolist(),
            "preview": df.head(5).fillna("").to_dict("records")
        }
    except Exception as exc:
        logger.exception("Upload failed")
        raise HTTPException(status_code=400, detail=f"Error processing file: {exc}")

@app.post("/voice-input")
async def voice_input(file: UploadFile = File(...), db: Session = Depends(get_db)):
    """
    Receives audio file, transcribes with Gemini 1.5 Flash, and parses to JSON.
    """
    try:
        audio_bytes = await file.read()
        transcribed_text = await transcribe_audio(audio_bytes, file.content_type or "audio/webm")
        
        if not transcribed_text:
            raise HTTPException(status_code=400, detail="Could not transcribe audio")
            
        structured_data = await parse_text_to_structured_data(transcribed_text)
        
        # Save to DB
        for item in structured_data:
            record = Record(
                source='voice',
                item=item.get('item', 'Unknown'),
                quantity=float(item.get('quantity', 1)),
                raw_data={'original_text': transcribed_text}
            )
            db.add(record)
        db.commit()
        
        return {
            "text": transcribed_text,
            "data": structured_data
        }
    except Exception as exc:
        logger.error(f"Voice input failed: {exc}")
        raise HTTPException(status_code=500, detail=f"Voice processing failed: {str(exc)}")

@app.post("/ocr-input")
async def ocr_input(file: UploadFile = File(...), db: Session = Depends(get_db)):
    """
    Receives image file, parses with Gemini Vision.
    """
    try:
        image_bytes = await file.read()
        structured_data = await parse_image_with_gemini(image_bytes, file.content_type or "image/jpeg")
        
        if not structured_data:
            raise HTTPException(status_code=400, detail="Could not parse image")
            
        # Save to DB
        for item in structured_data:
            record = Record(
                source='ocr',
                item=item.get('item', 'Unknown'),
                quantity=float(item.get('quantity', 1)),
                price=float(item.get('price', 0)) if item.get('price') else None,
                raw_data={'source': 'gemini_vision'}
            )
            db.add(record)
        db.commit()
        
        return {
            "message": "OCR data processed",
            "data": structured_data
        }
    except Exception as exc:
        logger.error(f"OCR input failed: {exc}")
        raise HTTPException(status_code=500, detail=f"Image processing failed: {str(exc)}")

@app.post("/query")
async def query_decisions(request: QueryRequest, db: Session = Depends(get_db)):
    # Combine CSV data with DB data
    all_records = db.query(Record).all()
    
    if not all_records and uploaded_df is None:
        raise HTTPException(status_code=400, detail="No data available. Upload a CSV or use Voice/OCR.")
        
    if all_records:
        records_data = []
        for r in all_records:
            base = {
                "item": r.item,
                "quantity": r.quantity,
                "price": r.price,
                "source": r.source,
                "timestamp": r.timestamp,
                "category": r.category or "General"
            }
            # Merge raw_data if it exists to preserve all original columns for AI
            if r.raw_data and isinstance(r.raw_data, dict):
                base.update(r.raw_data)
            records_data.append(base)
        df = pd.DataFrame(records_data)
    else:
        df = uploaded_df
    
    # 1. Deterministic KPIs
    total_revenue = 0.0
    total_orders = len(df)
    
    if 'quantity' in df.columns and 'price' in df.columns:
        total_revenue = float((df['quantity'] * df['price']).sum())
    elif 'price' in df.columns:
        total_revenue = float(df['price'].sum())
    elif 'quantity' in df.columns:
        total_revenue = float(df['quantity'].sum()) # Fallback if price missing but quantity exists
        
    avg_order_value = total_revenue / total_orders if total_orders > 0 else 0.0
    margin_total = total_revenue * 0.25 # Mock margin for demo
    
    # 2. Generate Decisions
    decision_data = await generate_decisions(df, request.language)
    decision_data = make_json_serializable(decision_data)

    # 3. Save decisions to DB for history
    db_decision = DbDecision(
        business_state=decision_data.get('business_state', {}),
        trend_analysis=decision_data.get('trend_analysis', {}),
        root_causes=decision_data.get('root_causes', []),
        impact=decision_data.get('impact', ''),
        forecast=decision_data.get('forecast', {}),
        recommendations=decision_data.get('recommendations', []),
        risks=decision_data.get('risks', [])
    )
    db.add(db_decision)
    db.commit()
    
    # 4. Generate Charts (Adaptive Resampling)
    charts = []
    df_work = df.copy()
    if "quantity" in df_work.columns:
        df_work["quantity"] = pd.to_numeric(df_work["quantity"], errors="coerce").fillna(0)
    if "price" in df_work.columns:
        df_work["price"] = pd.to_numeric(df_work["price"], errors="coerce").fillna(0)

    chart_titles = {
        "en": {"top_performers": "Top Performers", "trend": "Performance Trend"},
        "hi": {"top_performers": "शीर्ष प्रदर्शन", "trend": "प्रदर्शन प्रवृत्ति"},
        "te": {"top_performers": "ఉత్తమ ప్రదర్శన", "trend": "ప్రదర్శన ధోరణి"},
    }
    bar_dim_labels = {
        "en": {"item": "item", "category": "category"},
        "hi": {"item": "आइटम", "category": "श्रेणी"},
        "te": {"item": "అంశం", "category": "వర్గం"},
    }
    chart_descriptions = {
        "en": {"top_performers": "Highest top performers by quantity.", "trend": "Adaptive trend analysis."},
        "hi": {"top_performers": "अनुकूली रुझान विश्लेषण.", "trend": "अनुकूली रुझान विश्लेषण."},
        "te": {"top_performers": "అనుకూల ధోరణి విశ్లేషణ.", "trend": "అనుకూల ధోరణి విశ్లేషణ."},
    }

    # BAR: top categories/items by quantity
    bar_dim = "item" if "item" in df_work.columns else ("category" if "category" in df_work.columns else None)
    if bar_dim:
        bar_series = df_work.groupby(bar_dim)["quantity"].sum().sort_values(ascending=False).head(8)
        if not bar_series.empty:
            bar_dim_label = bar_dim_labels[request.language][bar_dim]
            chart_descriptions = {
                "en": {"top_performers": f"Highest {bar_dim} by quantity.", "trend": "Adaptive trend analysis."},
                "hi": {"top_performers": f"मात्रा द्वारा सबसे अधिक {bar_dim_label}.", "trend": "अनुकूली रुझान विश्लेषण."},
                "te": {"top_performers": f"పరిమాణం ఆధారంగా అత్యధిక {bar_dim_label}.", "trend": "అనుకూల ధోరణి విశ్లేషణ."},
            }
            charts.append({
                "type": "bar",
                "title": chart_titles[request.language]["top_performers"],
                "description": chart_descriptions[request.language]["top_performers"],
                "data": [{"label": str(k), "value": float(v)} for k, v in bar_series.items()]
            })

    # LINE: Adaptive trend
    line_data = []
    time_col = "timestamp" if "timestamp" in df_work.columns else ("date" if "date" in df_work.columns else None)
    if time_col:
        parsed = pd.to_datetime(df_work[time_col], errors="coerce")
        temp = df_work.copy()
        temp["_time"] = parsed
        temp = temp[temp["_time"].notna()]
        if not temp.empty:
            date_range = temp["_time"].max() - temp["_time"].min()
            # If range > 90 days, use Monthly, else Daily
            resample_rule = "M" if date_range.days > 90 else "D"
            trend = temp.set_index("_time")["quantity"].resample(resample_rule).sum()
            fmt = "%Y-%m" if resample_rule == "M" else "%Y-%m-%d"
            line_data = [{"label": idx.strftime(fmt), "value": float(val)} for idx, val in trend.tail(30).items()]
    
    if not line_data and len(df_work) > 1:
        q = df_work["quantity"] if "quantity" in df_work.columns else pd.Series([1] * len(df_work))
        rolling = q.reset_index(drop=True).rolling(window=min(7, max(2, len(q))), min_periods=1).mean()
        line_data = [{"label": str(i + 1), "value": float(v)} for i, v in enumerate(rolling.tail(30).tolist())]
    
    if line_data:
        charts.append({
            "type": "line",
            "title": chart_titles[request.language]["trend"],
            "description": chart_descriptions[request.language]["trend"],
            "data": line_data
        })

    localized_fallback = get_localized_fallback_summary(request.language)
    localized_status = {
        "en": {"analyzing": "Analyzing...", "calculating": "Calculating..."},
        "hi": {"analyzing": "विश्लेषण हो रहा है...", "calculating": "गणना की जा रही है..."},
        "te": {"analyzing": "విశ్లేషణ జరుగుతోంది...", "calculating": "లెక్కించడం జరుగుతోంది..."},
    }[request.language]

    # 5. Build Final Response (Decision Intelligence Report)
    response = {
        "business_state": decision_data.get("business_state", {
            "summary": localized_fallback,
            "growth_metrics": {"monthly": "0%", "yearly": "0%"},
            "confidence": "Medium"
        }),
        "trend_analysis": decision_data.get("trend_analysis", {
            "revenue": localized_status["analyzing"],
            "profit": localized_status["analyzing"],
            "stability": localized_status["calculating"]
        }),
        "root_causes": decision_data.get("root_causes", []),
        "impact": decision_data.get("impact", ""),
        "forecast": decision_data.get("forecast", {
            "prediction": localized_status["calculating"],
            "expected_change": "0%"
        }),
        "recommendations": decision_data.get("recommendations", []),
        "risks": decision_data.get("risks", []),
        "signals": decision_data.get("signals", {}),
        
        # Legacy/Support data
        "dataset_summary": decision_data.get("dataset_summary", {
            "headline": get_localized_report_headline(request.language),
            "summary": decision_data.get("business_state", {}).get("summary", localized_fallback),
            "business_health": decision_data.get("signals", {}).get("stability_status", "Stable"),
            "query": request.query
        }),
        "kpis": {
            "total_revenue": total_revenue,
            "total_orders": total_orders,
            "avg_order_value": avg_order_value,
            "margin_total": margin_total,
            "rows_analyzed": total_orders
        },
        "charts": charts,
        "raw_preview": df.head(10).fillna("").to_dict("records")
    }
    
    return make_json_serializable(response)

@app.post("/chat")
async def chat(request: ChatRequest, db: Session = Depends(get_db)):
    # Get recent records for context
    records = db.query(Record).order_by(Record.timestamp.desc()).limit(20).all()
    context = {
        "recent_records": [
            {"item": r.item, "qty": r.quantity, "source": r.source} for r in records
        ]
    }
    
    reply = await get_chat_response(request.message, request.history, context)
    return {"reply": reply}

@app.get("/records")
async def get_records(db: Session = Depends(get_db)):
    records = db.query(Record).order_by(Record.timestamp.desc()).all()
    return [{"id": r.id, "item": r.item, "quantity": r.quantity, "source": r.source, "timestamp": r.timestamp} for r in records]

if __name__ == "__main__":
    import uvicorn
    port = int(os.getenv("PORT", 8001))
    uvicorn.run(app, host="0.0.0.0", port=port)
