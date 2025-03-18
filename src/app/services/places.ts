export const searchBusinesses = async (query: string, location: string) => {
  try {
    const response = await fetch(
      `/api/places?action=search&query=${encodeURIComponent(query)}&location=${encodeURIComponent(location)}`
    );
    
    const data = await response.json();
    console.log('Search Response:', data);
    
    if (data.error) {
      throw new Error(data.error);
    }
    
    if (!data.results || data.results.length === 0) {
      console.log('No results found');
      return [];
    }
    
    return data.results || [];
  } catch (error) {
    console.error('Error fetching places:', error);
    throw error;
  }
};

export const getBusinessDetails = async (placeId: string) => {
  try {
    const response = await fetch(
      `/api/places?action=details&placeId=${placeId}`
    );
    
    const data = await response.json();
    console.log('Details Response:', data);
    
    if (data.error) {
      throw new Error(data.error);
    }

    if (!data.result) {
      throw new Error('No details found');
    }

    return {
      name: data.result.name,
      formatted_phone_number: data.result.formatted_phone_number || null,
      website: data.result.website || null,
      place_id: placeId
    };
  } catch (error) {
    console.error('Error fetching place details:', error);
    throw error;
  }
}; 