import { NextResponse } from 'next/server';

const BASE_URL = 'https://maps.googleapis.com/maps/api/place';
const API_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const action = searchParams.get('action');
  const query = searchParams.get('query');
  const location = searchParams.get('location');
  const placeId = searchParams.get('placeId');

  try {
    let url;
    if (action === 'search') {
      const searchQuery = `${query} in ${location}`;
      url = `${BASE_URL}/textsearch/json?query=${encodeURIComponent(searchQuery)}&key=${API_KEY}`;
      
      const response = await fetch(url);
      const data = await response.json();

      if (data.status === 'ZERO_RESULTS') {
        return NextResponse.json({ results: [] });
      }

      if (data.status !== 'OK') {
        throw new Error(data.status);
      }
      
      const allResults = [...(data.results || [])];
      const nextPageToken = data.next_page_token;
      
      // Sadece ilk sayfayı alalım, çok fazla istek atmayalım
      if (nextPageToken) {
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        const nextPageUrl = `${BASE_URL}/textsearch/json?pagetoken=${nextPageToken}&key=${API_KEY}`;
        const nextPageResponse = await fetch(nextPageUrl);
        const nextPageData = await nextPageResponse.json();
        
        if (nextPageData.results) {
          allResults.push(...nextPageData.results);
        }
      }
      
      return NextResponse.json({ results: allResults });
      
    } else if (action === 'details' && placeId) {
      // Places API'den tüm detayları alalım
      url = `${BASE_URL}/details/json?place_id=${placeId}&key=${API_KEY}`;
      
      const response = await fetch(url);
      const data = await response.json();

      if (data.status !== 'OK' || !data.result) {
        console.error('Place details error:', data);
        return NextResponse.json({ error: 'No details found' }, { status: 404 });
      }

      // Sonuçları düzgün formatta döndürelim
      const result = {
        name: data.result.name || '',
        formatted_phone_number: data.result.formatted_phone_number || null,
        website: data.result.website || null,
        // Google Places API email bilgisini direkt vermiyor, bu yüzden null döndürüyoruz
        email: null
      };

      // Debug için
      console.log('Place details response:', {
        status: data.status,
        result: result,
        rawResult: data.result
      });
      
      return NextResponse.json({ result });
    } else {
      return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }
  } catch (error) {
    console.error('Error in Places API:', error);
    return NextResponse.json({ error: 'Failed to fetch data' }, { status: 500 });
  }
} 