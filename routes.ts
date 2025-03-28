

  const getReturnDepartureTime = (city: string) => {
    const departureTimes: Record<string, string> = {
      'Timișoara': '16:00',
      'Lugoj': '17:00',
      'Deva': '18:00',
      'Alba Iulia': '19:15',
      'Sibiu': '20:30',
      'Brașov': '23:01',
      'Onești': '01:30',
      'Adjud': '02:15',
      'Bârlad': '03:30',
      'Huși': '04:00',
    };
    
    return departureTimes[city] || '16:00'; // Default time if city not found
  };