import { NextResponse } from "next/server";
import { checkLegalAid, legalAidReference, type LegalAidCategoryId } from "@/lib/legalAid";
import { lookupDlsa } from "@/lib/dlsa";

export const runtime = "nodejs";

/** Reference data: s.12 categories + the NALSA income table. */
export async function GET() {
  return NextResponse.json(legalAidReference());
}

/**
 * Screen one person against s.12 of the Legal Services Authorities Act, 1987.
 * The result is a screening aid; s.13(1) still requires a genuine case and the
 * DLSA decides. No phone number or office is invented.
 */
export async function POST(req: Request) {
  let body: {
    categories?: LegalAidCategoryId[];
    state?: string;
    district?: string;
    annualIncome?: number;
    court?: "district" | "high" | "supreme";
  };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "JSON body required." }, { status: 400 });
  }

  if (!body.categories?.length) {
    return NextResponse.json(
      { error: "Select at least one Section 12 category." },
      { status: 400 }
    );
  }

  const result = checkLegalAid({
    categories: body.categories,
    state: body.state,
    annualIncome: body.annualIncome,
    court: body.court,
  });

  const dlsa = body.state
    ? lookupDlsa(body.state, body.district ?? "")
    : null;

  return NextResponse.json({
    ...result,
    dlsa,
    disclaimer:
      "Legal information tool, not legal advice. The DLSA decides eligibility under s.12 and s.13 of the Legal Services Authorities Act, 1987.",
  });
}
