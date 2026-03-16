import { NextRequest, NextResponse } from "next/server";

type RouteParams = {
  route?: string[];
};

export async function GET(_request: NextRequest, { params }: { params: RouteParams }) {
  const action = params.route?.[0] ?? "status";
  return NextResponse.json({ action, status: "ok" });
}

export async function POST(_request: NextRequest, { params }: { params: RouteParams }) {
  const action = params.route?.[0] ?? "login";
  return NextResponse.json({ action, status: "ok" });
}
