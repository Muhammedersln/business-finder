import { NextRequest, NextResponse } from 'next/server';

/**
 * API endpoint to export phone numbers as CSV
 * @param req - The request object containing phone numbers in the request body
 * @returns CSV file as a response
 */
export async function POST(req: NextRequest) {
  try {
    const { phoneNumbers } = await req.json();

    if (!phoneNumbers || !Array.isArray(phoneNumbers) || phoneNumbers.length === 0) {
      return NextResponse.json(
        { error: 'Geçerli telefon numaraları sağlanmadı' },
        { status: 400 }
      );
    }

    // Format phone numbers for WhatsApp (remove spaces, dashes, etc.)
    const formattedNumbers = phoneNumbers.map(number => {
      // Remove non-numeric characters
      const cleanedNumber = number.replace(/\D/g, '');
      
      // Ensure number starts with country code (default to Turkey +90)
      if (cleanedNumber.startsWith('90')) {
        return cleanedNumber;
      } else if (cleanedNumber.startsWith('0')) {
        return `90${cleanedNumber.substring(1)}`;
      } else {
        return `90${cleanedNumber}`;
      }
    });

    // Create CSV content
    const csvContent = formattedNumbers.join('\n');
    
    // Create and return CSV file
    return new NextResponse(csvContent, {
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': 'attachment; filename="whatsapp-numbers.csv"'
      }
    });
  } catch (error) {
    console.error('CSV export error:', error);
    return NextResponse.json(
      { error: 'CSV oluşturulurken bir hata oluştu' },
      { status: 500 }
    );
  }
} 