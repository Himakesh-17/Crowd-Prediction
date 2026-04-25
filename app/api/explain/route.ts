import { GoogleGenAI } from '@google/genai';
import { NextRequest, NextResponse } from 'next/server';

// Server-side Route for AI Explanations

const apiKey = process.env.GEMINI_API_KEY;
// Fallback if not configured, though it will fail without a key in production
const ai = new GoogleGenAI({ apiKey: apiKey || 'dummy-key' });

export async function POST(req: NextRequest) {
  try {
    const data = await req.json();
    
    if (apiKey && apiKey !== 'dummy-key') {
      const prompt = `
You are an expert crowd safety and security analysis assistant for the CrowdFlow Risk Analyzer.
Input data:
${JSON.stringify(data, null, 2)}

Your primary job is to help the venue manager understand exactly what this data means for their security and safety operations in a highly user-friendly, accessible, and conversational tone.

Please structure your markdown response in the following way:
1. **🏃‍♂️ What's Happening Right Now:** Provide a brief, friendly summary of the overall crowd flow and the current scenario context (e.g. panic mode vs normal, overall risk score).
2. **⚠️ Critical Safety & Security Needs:** Identify the specific nodes or lanes (use their exact real names provided in the data) that are hitting "DANGER" or "WARNING" levels. Clearly explain *why* these are security risks (e.g. crushing hazards, stampede risks, or blocked medical access).
3. **👮 Recommended Security Actions:** Provide specific, actionable advice on where to deploy security guards, where to open emergency gates, or how to redirect flow to alleviate the specific bottlenecks you identified.
4. **✅ Safer Routing Notes:** Suggest alternatives or structural tweaks if applicable.
`;

      try {
        const response = await ai.models.generateContent({
          model: 'gemini-2.5-flash',
          contents: prompt,
        });
        return NextResponse.json({ text: response.text });
      } catch (error: any) {
        console.error("Gemini API Error:", error);
        // Fallback to local heuristic if it fails
      }
    }

    // --- LOCAL HEURISTIC FALLBACK (No API Key Required) ---
    // If we don't have a Gemini API key, we construct a smart programmatic response instead.
    const { scenario, simulation_output, edges, nodes } = data;
    
    const dangerEdges = edges.filter((e: any) => simulation_output?.edge_metrics[e.id]?.risk_category === 'DANGER');
    const warningEdges = edges.filter((e: any) => simulation_output?.edge_metrics[e.id]?.risk_category === 'WARNING');
    const dangerNodes = nodes.filter((n: any) => simulation_output?.node_metrics[n.id]?.risk_category === 'DANGER');

    let fallbackMarkdown = `
### 1. 🏃‍♂️ What's Happening Right Now
You are currently estimating a total crowd of **${scenario.total_crowd} people**, moving in a **${scenario.behavior_mode}** behavior mode.
The overall systemic risk score across your venue is **${simulation_output?.global_risk_score?.toFixed(2)}**. 
${scenario.behavior_mode === 'panic' ? "Because the crowd is in a panic state, bottlenecks are forming rapidly as people ignore normal safety caps." : "Flow is moving normally, but structural bottlenecks are being tested."}

### 2. ⚠️ Critical Safety & Security Needs
`;

    if (dangerEdges.length === 0 && dangerNodes.length === 0) {
      fallbackMarkdown += `* All simulated lanes and nodes currently show a **SAFE** status. The venue is completely capable of handling this crowd volume.\n`;
    } else {
      if (dangerNodes.length > 0) {
        fallbackMarkdown += `**Dangerous Zones (Crushing Hazard):**\n`;
        dangerNodes.forEach((n: any) => {
          fallbackMarkdown += `- **${n.name}**: This area is overwhelmed and far exceeding its safe density capacity. The risk of crushing or stampede in this specific zone is critically high.\n`;
        });
      }
      if (dangerEdges.length > 0) {
        fallbackMarkdown += `**Dangerous Paths (Severe Bottleneck):**\n`;
        dangerEdges.forEach((e: any) => {
          const m = simulation_output.edge_metrics[e.id];
          fallbackMarkdown += `- **${e.name || e.type}**: Experiencing an extreme bottleneck. Incoming flow far exceeds its strict capacity limit of ${e.max_flow}/min.\n`;
        });
      }
    }

    fallbackMarkdown += `\n### 3. 👮 Recommended Security Actions\n`;
    if (dangerEdges.length > 0 || dangerNodes.length > 0) {
      fallbackMarkdown += `- **Deploy Security Teams Immediately:** Dispatch crowd control personnel directly to the zones flagged above.\n`;
      fallbackMarkdown += `- **Halt Incoming Gates:** Pause or meter the influx of crowds at the entry gates until the dangerous paths begin to clear.\n`;
      fallbackMarkdown += `- **Open Emergency Arteries:** Command security to open any adjacent emergency exits to bleed off pressure from the worst bottlenecks.\n`;
    } else {
      fallbackMarkdown += `- Keep security deployments in standard monitoring mode. No high-stress assignments are required for this volume.\n`;
    }

    fallbackMarkdown += `\n### 4. ✅ Safer Routing Notes\n`;
    if (warningEdges.length > 0) {
      fallbackMarkdown += `- Review the physical width capacity of your warning lanes (like ${warningEdges.map((e: any) => e.name).join(', ')}). Consider widening these paths or restricting two-way motion.\n`;
    } else {
      fallbackMarkdown += `- Your current topographic layout provides excellent flow dynamics for this crowd size.\n`;
    }

    return NextResponse.json({ text: fallbackMarkdown });
  } catch (error: any) {
    console.error("API Error:", error);
    return NextResponse.json({ text: "Error generating explanation: " + error.message }, { status: 500 });
  }
}
