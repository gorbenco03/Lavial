const getCurrencySymbol = (currency: string) => {
    switch(currency) {
      case 'EUR': return '€';
      case 'RON': return 'RON';
      default: return currency;
    }
  };