import { NextResponse } from 'next/server'
import { APP_VERSION, BUILD_DATE, COMMIT_SHA } from '@/lib/version'

export async function GET() {
  return NextResponse.json({ version: APP_VERSION, commit: COMMIT_SHA, buildDate: BUILD_DATE })
}
