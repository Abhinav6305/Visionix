import pandas as pd
import numpy as np
import json
import logging
from datetime import datetime
from typing import List, Dict, Any, Optional
from ai_service import ask_ai

logger = logging.getLogger(__name__)

def clean_data(df: pd.DataFrame) -> pd.DataFrame:
    """
    Robust data normalization layer.
    """
    try:
        # Standardize column names
        df.columns = [c.lower().strip().replace(" ", "_") for c in df.columns]
        
        # Deduplicate column names
        cols = pd.Series(df.columns)
        for dup in cols[cols.duplicated()].unique():
            cols[cols == dup] = [dup + '_' + str(i) if i != 0 else dup for i in range(sum(cols == dup))]
        df.columns = cols

        # 1. Detect date column
        date_col = None
        for col in df.columns:
            if 'date' in col or 'time' in col:
                try:
                    df[col] = pd.to_datetime(df[col], errors='coerce')
                    if df[col].notna().any():
                        date_col = col
                        break
                except:
                    continue
        
        if date_col:
            if 'date' in df.columns and date_col != 'date':
                df = df.drop(columns=['date'])
            df = df.rename(columns={date_col: 'date'})
        else:
            for col in df.columns:
                try:
                    converted = pd.to_datetime(df[col], errors='coerce')
                    if converted.notna().sum() > len(df) * 0.5:
                        df['date'] = converted
                        date_col = 'date'
                        break
                except:
                    continue

        if 'date' not in df.columns:
            df['date'] = datetime.now()

        # 2. Detect value columns
        for col in df.columns:
            if col == 'date': continue
            if any(key in col for key in ['revenue', 'sales', 'amount', 'price', 'total']):
                df[col] = pd.to_numeric(df[col].astype(str).str.replace(r'[^\d.]', '', regex=True), errors='coerce').fillna(0)
            elif any(key in col for key in ['qty', 'quantity', 'units', 'count']):
                df[col] = pd.to_numeric(df[col].astype(str).str.replace(r'[^\d.]', '', regex=True), errors='coerce').fillna(0)

        # Ensure 'revenue', 'quantity', 'price' exist
        if 'revenue' not in df.columns:
            sales_cols = [c for c in df.columns if 'sales' in c or 'amount' in c or 'total' in c]
            if sales_cols:
                df = df.rename(columns={sales_cols[0]: 'revenue'})
            else:
                df['revenue'] = 0
        
        if 'quantity' not in df.columns:
            qty_cols = [c for c in df.columns if 'qty' in c or 'units' in c or 'count' in c]
            if qty_cols:
                df = df.rename(columns={qty_cols[0]: 'quantity'})
            else:
                df['quantity'] = 1
        
        if 'price' not in df.columns:
            price_cols = [c for c in df.columns if 'price' in c or 'rate' in c]
            if price_cols:
                df = df.rename(columns={price_cols[0]: 'price'})
            else:
                df['price'] = df['revenue'] / df['quantity'].replace(0, 1)

        # 3. Handle Item column
        if 'item' not in df.columns:
            item_cols = [c for c in df.columns if any(k in c for k in ['prod', 'item', 'desc', 'name', 'category'])]
            if item_cols:
                df = df.rename(columns={item_cols[0]: 'item'})
            else:
                df['item'] = 'General'

        return df
    except Exception as e:
        logger.error(f"Error in data cleaning: {e}")
        return df

def add_time_features(df: pd.DataFrame) -> pd.DataFrame:
    """Engineer multi-level time features."""
    df['date'] = pd.to_datetime(df['date'])
    df['year'] = df['date'].dt.year
    df['month'] = df['date'].dt.month
    df['day'] = df['date'].dt.day
    df['week'] = df['date'].dt.isocalendar().week
    return df

def compute_signals(df: pd.DataFrame) -> Dict[str, Any]:
    """Signal Engine: Computes structured business signals with ML-based forecasting."""
    signals = {}
    
    df_sorted = df.sort_values('date')
    
    # 0. Confidence Level Calculation
    data_points = len(df)
    if data_points < 30:
        confidence = "Low"
    elif data_points < 100:
        confidence = "Medium"
    else:
        confidence = "High"
    signals['confidence_level'] = confidence
    signals['data_points_count'] = data_points
    
    # 1. Growth Rates & Trends
    has_profit = 'profit' in df.columns
    
    # Resample to monthly
    monthly_stats = df_sorted.resample('M', on='date').agg({
        'revenue': 'sum',
        'quantity': 'sum',
        **({'profit': 'sum'} if has_profit else {})
    })
    
    if len(monthly_stats) > 1:
        signals['monthly_growth_percentage'] = ((monthly_stats['revenue'].iloc[-1] / monthly_stats['revenue'].iloc[-2]) - 1) * 100
        
        x = np.arange(len(monthly_stats))
        y = monthly_stats['revenue'].values
        slope = np.polyfit(x, y, 1)[0] if len(x) > 1 else 0
        signals['trend_slope'] = float(slope)
        signals['revenue_trend'] = "Increasing" if slope > 0 else "Decreasing"
        
        if has_profit:
            p_slope = np.polyfit(x, monthly_stats['profit'].values, 1)[0] if len(x) > 1 else 0
            signals['profit_trend'] = "Increasing" if p_slope > 0 else "Decreasing"
        else:
            signals['profit_trend'] = "N/A"
            
        std = monthly_stats['revenue'].std()
        mean = monthly_stats['revenue'].mean()
        cv = std / mean if mean != 0 else 0
        signals['stability_status'] = "Stable" if cv < 0.2 else "Volatile" if cv > 0.5 else "Moderate"
    else:
        signals['monthly_growth_percentage'] = 0
        signals['trend_slope'] = 0
        signals['revenue_trend'] = "Steady (Baseline)"
        signals['profit_trend'] = "N/A"
        signals['stability_status'] = "Initializing"

    yearly_stats = df_sorted.resample('Y', on='date')['revenue'].sum()
    signals['yearly_growth_percentage'] = ((yearly_stats.iloc[-1] / yearly_stats.iloc[-2]) - 1) * 100 if len(yearly_stats) > 1 else 0

    # 2. Product Performance
    top_products = df.groupby('item')['revenue'].sum().sort_values(ascending=False).head(5).index.tolist()
    signals['top_selling_products'] = top_products
    
    last_month_boundary = df['date'].max() - pd.DateOffset(months=1)
    prev_month_boundary = df['date'].max() - pd.DateOffset(months=2)
    last_month = df[df['date'] >= last_month_boundary]
    prev_month = df[(df['date'] < last_month_boundary) & (df['date'] >= prev_month_boundary)]
    
    if not last_month.empty and not prev_month.empty:
        last_sales = last_month.groupby('item')['quantity'].sum()
        prev_sales = prev_month.groupby('item')['quantity'].sum()
        decline = (last_sales - prev_sales) / prev_sales.replace(0, 1)
        signals['declining_products'] = decline[decline < -0.1].index.tolist()
    else:
        signals['declining_products'] = []

    # 3. Seasonality
    monthly_avg = df.groupby('month')['revenue'].mean()
    signals['seasonality_patterns'] = monthly_avg.to_dict()
    
    # 4. ML-BASED FORECAST
    if len(monthly_stats) >= 2:
        x_range = np.arange(len(monthly_stats))
        y_vals = monthly_stats['revenue'].values
        poly = np.polyfit(x_range, y_vals, 1)
        next_val = np.polyval(poly, len(monthly_stats))
        signals['forecast_next_period'] = float(max(0, next_val))
        current_val = monthly_stats['revenue'].iloc[-1]
        signals['expected_percentage_change'] = ((next_val / current_val) - 1) * 100 if current_val > 0 else 0
    else:
        signals['forecast_next_period'] = float(df['revenue'].mean() * 30) if not df.empty else 0
        signals['expected_percentage_change'] = 0

    # 5. Causal Reasoning Signals
    causal_signals = []
    if len(df) > 10:
        try:
            corr = df[['price', 'quantity']].corr().iloc[0, 1]
            if corr < -0.5:
                causal_signals.append("High price sensitivity: demand drops as price increases.")
            elif corr > 0.5:
                causal_signals.append("Premium signal: higher price correlates with higher demand.")
        except:
            pass
    signals['causal_signals'] = causal_signals
    return signals

def get_localized_report_headline(language: str) -> str:
    return {
        "en": "Business Intelligence Report",
        "hi": "व्यवसायिक सूचना रिपोर्ट",
        "te": "వ్యాపార బుద్ధి నివేదిక",
    }.get(language, "Business Intelligence Report")


def get_localized_fallback_summary(language: str) -> str:
    return {
        "en": "Analysis completed with technical adjustments.",
        "hi": "तकनीकी समायोजन के साथ विश्लेषण पूरा हुआ।",
        "te": "సాంకేతిక సవరణలతో విశ్లేషణ పూర్తయింది.",
    }.get(language, "Analysis completed with technical adjustments.")


async def generate_decisions(df: pd.DataFrame, language: str = "en") -> Dict[str, Any]:
    """
    Upgraded Decision Engine with strict reasoning and structured output.
    """
    df = clean_data(df)
    df = add_time_features(df)
    signals = compute_signals(df)
    
    language_name = {"hi": "Hindi", "te": "Telugu", "en": "English"}.get(language, "English")
    translation_instruction = ""
    if language != "en":
        translation_instruction = (
            f"Translate all JSON string values into {language_name}, "
            f"while preserving JSON object keys and numeric values exactly. "
            f"Respond using {language_name} text for all summary, recommendation, and explanation fields."
        )

    system_prompt = """
    You are a Senior Business Intelligence Analyst. 
    You are NOT allowed to give generic answers. 
    You MUST use ONLY the provided computed signals.
    
    Every insight MUST follow the strict framework:
    TREND → CAUSE → IMPACT → ACTION
    
    REQUIRED OUTPUT JSON SCHEMA:
    {
      "business_state": {
        "summary": "High-level status (grounded in numbers)",
        "growth_metrics": { "monthly": "%", "yearly": "%" },
        "confidence": "Low/Medium/High"
      },
      "trend_analysis": {
        "revenue": "Increasing/Decreasing/Stable - explanation with numbers",
        "profit": "Increasing/Decreasing/Stable - explanation with numbers",
        "stability": "Status and what it means for operations"
      },
      "root_causes": ["Direct cause-effect findings based on price, demand, or seasonality"],
      "impact": "The operational or financial consequence of these trends",
      "forecast": {
        "prediction": "Numeric prediction for next period",
        "expected_change": "percentage change with logic"
      },
      "recommendations": ["STRICT ACTIONABLE STEPS only"],
      "risks": ["Specific threats grounded in data"]
    }
    
    If data is limited (Confidence: Low):
    - Provide analysis based on available points.
    - Reduce the certainty of language but DO NOT say 'insufficient data'.
    """
    
    user_input = f"""
    ANALYSIS DATA SIGNALS:
    - Confidence Level: {signals.get('confidence_level')} ({signals.get('data_points_count')} points)
    - Monthly Growth: {signals.get('monthly_growth_percentage', 0):.1f}%
    - Yearly Growth: {signals.get('yearly_growth_percentage', 0):.1f}%
    - Revenue Trend: {signals.get('revenue_trend')} (Slope: {signals.get('trend_slope', 0):.2f})
    - Profit Trend: {signals.get('profit_trend')}
    - Stability: {signals.get('stability_status')}
    - Top Products: {', '.join(signals.get('top_selling_products', []))}
    - Declining Products: {', '.join(signals.get('declining_products', []))}
    - Forecast Prediction: {signals.get('forecast_next_period', 0):.2f}
    - Expected Change: {signals.get('expected_percentage_change', 0):.1f}%
    - Causal Findings: {'; '.join(signals.get('causal_signals', []))}
    - Seasonality Patterns: {json.dumps(signals.get('seasonality_patterns', {}))}
    
    Produce the strict JSON BI report now.
    """
    if translation_instruction:
        user_input += f"\n\n{translation_instruction}"
    
    messages = [
        {"role": "system", "content": system_prompt},
        {"role": "user", "content": user_input}
    ]
    
    response = await ask_ai(messages)
    
    try:
        if response:
            content = response.strip()
            if "```json" in content:
                content = content.split("```json")[1].split("```")[0].strip()
            elif "```" in content:
                content = content.split("```")[1].split("```")[0].strip()
            
            start = content.find('{')
            end = content.rfind('}')
            if start != -1 and end != -1:
                content = content[start:end+1]
                report_data = json.loads(content)
                report_data['signals'] = signals
                
                # Maintain legacy summary for simple components
                report_data['dataset_summary'] = {
                    "headline": get_localized_report_headline(language),
                    "summary": report_data.get("business_state", {}).get("summary", ""),
                    "business_health": signals.get('stability_status', 'Stable'),
                }
                return report_data
    except Exception as e:
        logger.error(f"Failed to parse upgraded decision JSON: {e}")
        
    return {
      "business_state": {
        "summary": get_localized_fallback_summary(language),
        "growth_metrics": { "monthly": f"{signals.get('monthly_growth_percentage', 0):.1f}%", "yearly": "0%" },
        "confidence": signals.get('confidence_level', 'Low')
      },
      "trend_analysis": {
        "revenue": f"Trend is {signals.get('revenue_trend', 'Unknown')}",
        "profit": f"Trend is {signals.get('profit_trend', 'Unknown')}",
        "stability": signals.get('stability_status', 'Initializing')
      },
      "root_causes": ["Technical parsing issue in AI response"],
      "impact": "Awaiting deeper reasoning synthesis.",
      "forecast": {
        "prediction": str(signals.get('forecast_next_period', 0)),
        "expected_change": f"{signals.get('expected_percentage_change', 0):.1f}%"
      },
      "recommendations": ["Review recent data uploads manually"],
      "risks": ["Data interpretation delay"],
      "signals": signals,
      "dataset_summary": {"headline": get_localized_report_headline(language), "summary": get_localized_fallback_summary(language), "business_health": "Error"}
    }
