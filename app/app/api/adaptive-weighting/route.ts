/**
 * API Route: Adaptive Weighting Analysis
 * POST /api/adaptive-weighting
 *
 * Analyzes scholarship descriptions to generate weighted criteria
 * for essay optimization
 */

import { NextRequest, NextResponse } from 'next/server'
import { generateAdaptiveWeights } from '../../lib/adaptive-weighting-extractor'
import {
  AdaptiveWeightingRequest,
  AdaptiveWeightingResponse,
} from '../../types/adaptive-weighting'

export async function POST(request: NextRequest) {
  try {
    // Parse request body
    const body: AdaptiveWeightingRequest = await request.json()
    const { ScholarshipName, ScholarshipDescription, EssayPrompt } = body

    // Validate inputs
    if (!ScholarshipName) {
      return NextResponse.json(
        {
          success: false,
          error: 'Missing required field: ScholarshipName',
        } as AdaptiveWeightingResponse,
        { status: 400 },
      )
    }

    if (!ScholarshipDescription) {
      return NextResponse.json(
        {
          success: false,
          error: 'Missing required field: ScholarshipDescription',
        } as AdaptiveWeightingResponse,
        { status: 400 },
      )
    }

    if (!EssayPrompt) {
      return NextResponse.json(
        {
          success: false,
          error: 'Missing required field: EssayPrompt',
        } as AdaptiveWeightingResponse,
        { status: 400 },
      )
    }

    // Generate adaptive weights using LLM
    const weights = await generateAdaptiveWeights({
      ScholarshipName,
      ScholarshipDescription,
      EssayPrompt,
    })

    // Return successful response
    return NextResponse.json(
      {
        success: true,
        data: weights,
      } as AdaptiveWeightingResponse,
      { status: 200 },
    )
  } catch (error) {
    console.error('Adaptive weighting error:', error)

    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : 'An unexpected error occurred',
      } as AdaptiveWeightingResponse,
      { status: 500 },
    )
  }
}

// Optional: Add OPTIONS for CORS
export async function OPTIONS() {
  return NextResponse.json(
    {},
    {
      status: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
      },
    },
  )
}
