import { NextRequest, NextResponse } from 'next/server';

/**
 * API endpoint to generate WhatsApp bulk message link
 * @param req - The request object containing phone numbers and message
 * @returns WhatsApp link for bulk messaging
 */
export async function POST(req: NextRequest) {
  try {
    const { phoneNumbers, message } = await req.json();

    if (!phoneNumbers || !Array.isArray(phoneNumbers) || phoneNumbers.length === 0) {
      return NextResponse.json(
        { error: 'Geçerli telefon numaraları sağlanmadı' },
        { status: 400 }
      );
    }

    if (!message || typeof message !== 'string' || message.trim() === '') {
      return NextResponse.json(
        { error: 'Geçerli bir mesaj sağlanmadı' },
        { status: 400 }
      );
    }

    // Format numbers for WhatsApp
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

    // Encode message for URL
    const encodedMessage = encodeURIComponent(message);
    
    // Generate WhatsApp links for each number
    const whatsappLinks = formattedNumbers.map(number => 
      `https://wa.me/${number}?text=${encodedMessage}`
    );

    return NextResponse.json({ 
      links: whatsappLinks,
      count: whatsappLinks.length
    });
  } catch (error) {
    console.error('WhatsApp link generation error:', error);
    return NextResponse.json(
      { error: 'WhatsApp bağlantıları oluşturulurken bir hata oluştu' },
      { status: 500 }
    );
  }
} 