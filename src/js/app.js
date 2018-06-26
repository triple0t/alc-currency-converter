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

        return this.request(url)
        .then(res => res[urlQuery] )
    }

    request(url) {
        return fetch(url)
        .then(res => res.json());
    }
}

class App extends ApiMain {
    
    constructor() {
        super();
        //this.form = document.getElementById('appForm');
        this.submitBtn = document.getElementById('submitBtn');

        this.theInput = document.getElementById('fromValue');
        this.theOutput = document.getElementById('toValue');

        this.country1 = document.getElementById('con1');
        this.country2 = document.getElementById('con2');

        // countries
        this.con1 = '';
        this.con2 = '';
        
        // convertion rate
        this.exrate

        // user selection
        this.userSelect = {
            con1: '',
            con2: '',
            exrate: 0
        }
    }

    /**
     * Init The App
     */
    init() {
        // this.getMyCount();
        this.events();
        $('.selectpicker').selectpicker();
        this.getCountry();
    }

    /**
     * Register Events
     */
    events() {
        // this.form.addEventListener('submit', this.formSubmitted.bind(this));
        // this.theOutput.addEventListener('keydown', this.inputField.bind(this));
        this.country1.addEventListener('change', this.inputField.bind(this));
        this.country2.addEventListener('change', this.inputField.bind(this));

        this.submitBtn.addEventListener('click', this.formSubmitted.bind(this));
    }

    /**
     * Executed when the user clicks on the Submit (Convert) Button
     * 
     * @param {Event} event 
     */
    formSubmitted(event) {  
        event.preventDefault();
        //console.log('form data: ', event);

        if (!this.con1 && !this.con2) {
            alert('Missing First Field and Second Field');
            return;
        } else if(!this.con1) {
            alert('Missing First Field');
            return;
        } else if (!this.con2) {
            alert('Missing Second Field');
            return;
        }


        const value = this.theInput.value;
        this.calRate(value, this.exrate)
        .then(res => {
            console.log('converted rate', res);
            this.theOutput.value = res;
        })
        .catch(err => this.handleError(err))
    }

    /**
     * This is Executed when the user Clicks on or Select any of the Drop Down Elements
     * 
     * Makes an API call to get the Lastest Exchange Rate
     * 
     * Update the Dom with Exchange Rate and also assign to a local variable
     * 
     * @param {Event} event 
     */
    inputField(event) {

        if (event.target.id === 'con1') {
            this.con1 = event.target.value 
        }
        if (event.target.id === 'con2') {
            this.con2 = event.target.value 
        }

        if (this.con1 && this.con2) {
            this.getRate(this.con1, this.con2)
            .then(res => {
                this.exrate = res;

                this.userSelect.con1 = this.con1;
                this.userSelect.con2 = this.con2;
                this.userSelect.exrate = res;

                $('#exrate').html(res);
            })
            .catch(err => this.handleError(err, 'Err getting Exechange Rate'))
        }
    }

    /**
     * Calculate the Exchange Rate 
     * 
     * @param {number} fromValue The Value Entered by the User.  
     * @param {number} exrate The Exchange Rate Value 
     * 
     * @returns {Promise<number>} {Promise<number>} The Exchanged Value to Display to the User
     */
    calRate(fromValue, exrate) {
        return new Promise((resolve, rejects) => {
            const total = exrate * fromValue;
            resolve( Math.round(total * 100) / 100 )
        });
    }

    /**
     * Make an Api Request to get All the Countries
     */
    getCountry() {
        this.getAllCountries()
        .then(res => {
            this.setSelectFields(res);   
        })
        .catch(err => this.handleError(err, 'Err getting Countries'))
    }

    /**
     * Set the Select Input Field
     * 
     * This Populates the Select Fields with the Countries List
     * 
     * @param {Object} res JSON Object of Countries 
     */
    setSelectFields(res) {
        console.log('setting fields');

        let ele = '';

        for (const key in res.results) {
            if (res.results.hasOwnProperty(key)) {
                const item = res.results[key];
                ele += `<option value="${item.currencyId}" data-subtext="${item.currencyName}">${item.name} (${item.currencyId})</option>`; 
            }
        }

        $(".selectpicker").html(ele);

        $(".selectpicker").selectpicker("refresh");

    }

    /**
     * Handle Error Thrown in the App
     * 
     * @param {Any} err The Error. 
     * @param {String} mssg Error Message to Log Out
     */
    handleError(err, mssg = '') {
        console.error(mssg, err);
    }
}

const app = new App();

app.init();