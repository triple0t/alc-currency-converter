
class ApiMain {

    constructor() {
        // main api site url
        this.url = 'https://free.currencyconverterapi.com/';
        
        // api version
        this.api = 'api/v5/';
        
        // endpoints we will be using
        this.endPoints = {
            currencies: "currencies",
            countries: "countries",
            convert: "convert"
        }

        // the url query params
        this.query = {
            compact: {
                none: "",
                part: "y",
                full: "ultra"
            }
        }
    }

    /**
     * Get All the Countries
     * 
     * @returns {Promise}
     */
    getAllCountries() {
        const url = this.url + this.api + this.endPoints.countries; 
        return this.request(url);
    }

    /**
     * Get All the Currencies
     * 
     * @returns {Promise}
     */
    getAllCurrencies() {
        const url = this.url + this.api + this.endPoints.currencies;
        return this.request(url);
    }

    /**
     * 
     * @param {String} fromCurrency the Currency to Convert from
     * @param {String} toCurrency  the Currency to Convert to
     * @param {String} mode The Compact mode. Default to ultra
     * 
     * @example getRate(USD, NGN)
     * 
     * @returns {Promise}
     */
    getRate(fromCurrency, toCurrency, mode = this.query.compact.full) {
        const urlQuery = `${fromCurrency}_${toCurrency}`;

        const url = `${this.url + this.api + this.endPoints.convert}?q=${urlQuery}&compact=${mode}`

        return this.request(url);
    }

    request(url) {
        return fetch(url)
        .then(res => res.json());
    }
}

export default ApiMain;