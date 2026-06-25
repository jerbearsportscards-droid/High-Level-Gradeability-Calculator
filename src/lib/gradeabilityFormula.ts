// Gradeability Score v2.1 — 11 weighted factors, output 0–100

export interface CardInputs {
  // Financial
  rawCost: number;        // $ paid for raw card
  gradingFee: number;     // $ PSA/BGS fee (service level)
  psa10Value: number;     // $ market value PSA 10
  psa9Value: number;      // $ market value PSA 9
  psa8Value: number;      // $ market value PSA 8

  // Grading odds
  gemRate: number;        // % chance of PSA 10 (0–100)
  nineRate: number;       // % chance of PSA 9 (0–100)
  eightRate: number;      // % chance of PSA 8 (0–100)

  // Market factors
  popTotal: number;       // total PSA 10 pop count
  athleteDemand: number;  // 1–10 athlete demand/hype score
  cardLiquidity: number;  // 1–10 ease of selling graded card
}

export interface GradeabilityResult {
  score: number;
  verdict: "STRONG BUY" | "GRADE IT" | "BORDERLINE" | "SKIP IT" | "HARD PASS";
  verdictColor: string;
  expectedROI: number;        // % return
  expectedProfit: number;     // $ profit
  breakEvenGrade: string;     // minimum grade needed to profit
  factorScores: FactorScore[];
  riskLevel: "LOW" | "MEDIUM" | "HIGH" | "VERY HIGH";
}

export interface FactorScore {
  name: string;
  score: number;       // 0–100
  weight: number;      // % weight in final score
  contribution: number; // weighted points contributed
  label: string;
}

export function calculateGradeability(inputs: CardInputs): GradeabilityResult {
  const {
    rawCost, gradingFee, psa10Value, psa9Value, psa8Value,
    gemRate, nineRate, eightRate, popTotal, athleteDemand, cardLiquidity
  } = inputs;

  const totalCost = rawCost + gradingFee;

  // Normalize rates to decimals
  const gemDecimal = gemRate / 100;
  const nineDecimal = nineRate / 100;
  const eightDecimal = eightRate / 100;
  const belowEightDecimal = Math.max(0, 1 - gemDecimal - nineDecimal - eightDecimal);

  // Expected value of grading (weighted avg of grade outcomes)
  const expectedValue =
    gemDecimal * psa10Value +
    nineDecimal * psa9Value +
    eightDecimal * psa8Value +
    belowEightDecimal * (rawCost * 0.6); // below 8 = ~60% of raw cost

  const expectedProfit = expectedValue - totalCost;
  const expectedROI = totalCost > 0 ? (expectedProfit / totalCost) * 100 : 0;

  // ── FACTOR SCORING ──────────────────────────────────────────────
  const factors: FactorScore[] = [];

  // 1. ROI Potential (25% weight)
  // Score based on expected ROI: >100% = 100, 50–100% = 80, 20–50% = 60, 0–20% = 40, negative = 0–30
  let roiScore = 0;
  if (expectedROI >= 150) roiScore = 100;
  else if (expectedROI >= 100) roiScore = 90;
  else if (expectedROI >= 50) roiScore = 75;
  else if (expectedROI >= 25) roiScore = 60;
  else if (expectedROI >= 10) roiScore = 45;
  else if (expectedROI >= 0) roiScore = 30;
  else if (expectedROI >= -20) roiScore = 15;
  else roiScore = 0;
  factors.push({ name: "ROI Potential", score: roiScore, weight: 25, contribution: roiScore * 0.25, label: `${expectedROI >= 0 ? "+" : ""}${expectedROI.toFixed(0)}%` });

  // 2. PSA 10 Premium (20% weight)
  // How much more is the 10 worth vs raw?
  const tenPremium = rawCost > 0 ? ((psa10Value - rawCost) / rawCost) * 100 : 0;
  let premiumScore = 0;
  if (tenPremium >= 400) premiumScore = 100;
  else if (tenPremium >= 200) premiumScore = 85;
  else if (tenPremium >= 100) premiumScore = 70;
  else if (tenPremium >= 50) premiumScore = 55;
  else if (tenPremium >= 20) premiumScore = 35;
  else premiumScore = 15;
  factors.push({ name: "PSA 10 Premium", score: premiumScore, weight: 20, contribution: premiumScore * 0.20, label: `${tenPremium >= 0 ? "+" : ""}${tenPremium.toFixed(0)}% vs raw` });

  // 3. Gem Rate (15% weight)
  let gemScore = 0;
  if (gemRate >= 60) gemScore = 100;
  else if (gemRate >= 45) gemScore = 85;
  else if (gemRate >= 30) gemScore = 65;
  else if (gemRate >= 20) gemScore = 45;
  else if (gemRate >= 10) gemScore = 25;
  else gemScore = 10;
  factors.push({ name: "Gem Rate (PSA 10%)", score: gemScore, weight: 15, contribution: gemScore * 0.15, label: `${gemRate}% chance` });

  // 4. Population Control (10% weight)
  // Lower pop = more scarce = better
  let popScore = 0;
  if (popTotal <= 10) popScore = 100;
  else if (popTotal <= 25) popScore = 90;
  else if (popTotal <= 50) popScore = 75;
  else if (popTotal <= 100) popScore = 60;
  else if (popTotal <= 250) popScore = 40;
  else if (popTotal <= 500) popScore = 25;
  else if (popTotal <= 1000) popScore = 15;
  else popScore = 5;
  factors.push({ name: "Population Control", score: popScore, weight: 10, contribution: popScore * 0.10, label: `${popTotal} PSA 10s` });

  // 5. Athlete Demand (10% weight)
  const demandScore = (athleteDemand / 10) * 100;
  factors.push({ name: "Athlete Demand", score: demandScore, weight: 10, contribution: demandScore * 0.10, label: `${athleteDemand}/10` });

  // 6. Grading Cost Efficiency (8% weight)
  // Fee as % of expected value — lower is better
  const feeRatio = expectedValue > 0 ? (gradingFee / expectedValue) * 100 : 100;
  let costScore = 0;
  if (feeRatio <= 5) costScore = 100;
  else if (feeRatio <= 10) costScore = 80;
  else if (feeRatio <= 15) costScore = 60;
  else if (feeRatio <= 25) costScore = 40;
  else if (feeRatio <= 40) costScore = 20;
  else costScore = 5;
  factors.push({ name: "Grading Cost Efficiency", score: costScore, weight: 8, contribution: costScore * 0.08, label: `Fee = ${feeRatio.toFixed(1)}% of EV` });

  // 7. Downside Protection (7% weight)
  // If it grades PSA 8, do you still profit?
  const eightProfit = psa8Value - totalCost;
  let downsideScore = 0;
  if (eightProfit > rawCost * 0.5) downsideScore = 100;
  else if (eightProfit > 0) downsideScore = 75;
  else if (eightProfit > -rawCost * 0.2) downsideScore = 50;
  else if (eightProfit > -rawCost * 0.5) downsideScore = 25;
  else downsideScore = 5;
  factors.push({ name: "Downside Protection", score: downsideScore, weight: 7, contribution: downsideScore * 0.07, label: eightProfit >= 0 ? `+$${eightProfit.toFixed(0)} at PSA 8` : `-$${Math.abs(eightProfit).toFixed(0)} at PSA 8` });

  // 8. Liquidity (5% weight)
  const liquidityScore = (cardLiquidity / 10) * 100;
  factors.push({ name: "Market Liquidity", score: liquidityScore, weight: 5, contribution: liquidityScore * 0.05, label: `${cardLiquidity}/10` });

  // ── TOTAL SCORE ──────────────────────────────────────────────────
  const rawScore = factors.reduce((sum, f) => sum + f.contribution, 0);
  const score = Math.min(100, Math.max(0, Math.round(rawScore)));

  // Verdict
  let verdict: GradeabilityResult["verdict"];
  let verdictColor: string;
  if (score >= 80) { verdict = "STRONG BUY"; verdictColor = "#00d4aa"; }
  else if (score >= 65) { verdict = "GRADE IT"; verdictColor = "#39d353"; }
  else if (score >= 45) { verdict = "BORDERLINE"; verdictColor = "#f59e0b"; }
  else if (score >= 30) { verdict = "SKIP IT"; verdictColor = "#f97316"; }
  else { verdict = "HARD PASS"; verdictColor = "#ef4444"; }

  // Risk level
  let riskLevel: GradeabilityResult["riskLevel"];
  if (expectedROI >= 50 && gemRate >= 30) riskLevel = "LOW";
  else if (expectedROI >= 20 && gemRate >= 20) riskLevel = "MEDIUM";
  else if (expectedROI >= 0) riskLevel = "HIGH";
  else riskLevel = "VERY HIGH";

  // Break-even grade
  const tenBreakEven = psa10Value >= totalCost;
  const nineBreakEven = psa9Value >= totalCost;
  const eightBreakEven = psa8Value >= totalCost;
  let breakEvenGrade: string;
  if (eightBreakEven) breakEvenGrade = "PSA 8+";
  else if (nineBreakEven) breakEvenGrade = "PSA 9+";
  else if (tenBreakEven) breakEvenGrade = "PSA 10";
  else breakEvenGrade = "No grade covers cost";

  return { score, verdict, verdictColor, expectedROI, expectedProfit, breakEvenGrade, factorScores: factors, riskLevel };
}

export const DEFAULT_INPUTS: CardInputs = {
  rawCost: 50,
  gradingFee: 25,
  psa10Value: 300,
  psa9Value: 120,
  psa8Value: 60,
  gemRate: 35,
  nineRate: 40,
  eightRate: 15,
  popTotal: 45,
  athleteDemand: 7,
  cardLiquidity: 7,
};
