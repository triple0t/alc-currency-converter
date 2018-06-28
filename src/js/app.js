/**
 * API Class
 * 
 * Handles all the Interaction with the API / Server
 * 
 * API Endpoint. https://free.currencyconverterapi.com/api/v5/countries
 */
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
        const  urlQuery = `${fromCurrency}_${toCurrency}`;

        const url = `${this.url + this.api + this.endPoints.convert}?q=${urlQuery}&compact=${mode}`

        return this.request(url)
        .then(res => res[urlQuery] )
    }

    request(url) {
        return fetch(url)
        .then(res => res.json());
    }
}

/**
 * Database Class
 * 
 * Handles all the Interaction with the Index DB Database
 * 
 * Based on the IDB lib. https://github.com/jakearchibald/idb
 */
class AppDb {
    constructor() {
        this.appName = 'the-currency-converter-app';

        this.countries = 'countries';
        this.user = 'userSelect';

        if (!('indexedDB' in window)) {
            console.log('This browser doesn\'t support IndexedDB');
            alert('This browser doesn\'t support IndexedDB');
            return;
        }

        this.dbPromise = idb.open(this.appName, 1, upgradeDb => {
            if (!upgradeDb.objectStoreNames.contains(this.countries)) {
                const conIndex = upgradeDb.createObjectStore(this.countries, {keyPath: 'id'});
                conIndex.createIndex('currencyId', 'currencyId');
            }
            if (!upgradeDb.objectStoreNames.contains(this.user)) {
                const conIndex2 = upgradeDb.createObjectStore(this.user, {keyPath: 'con'});
                conIndex2.createIndex('swarpCon', 'swarpCon');
            }
        })
    }
 
    /**
     * Add a new Item to a Database Table
     * 
     * Tables
     * 
     * countries ID-> 'id', Index -> currencyId
     * 
     * 
     * user ID-> 'con'
     * 
     * @example const appdb = new AppDb(); appdb.addItem({item}, appdb.user)
     * 
     * @param {Object} item Item to add to the Database 
     * @param {Table} table The Name of Table to add item to.
     * @returns {Promise} {Promise<String>} added 
     */
    addItem(item, table) {
        return new Promise((resolve, reject) => {
            this.dbPromise.then(db => {
                const tx = db.transaction(table, 'readwrite');
                tx.objectStore(table)
                .put(item);
                return tx.complete;
            })
            .then(_ => resolve('added'))
            .catch(err => reject(err))
        });
    }

    /**
     * 
     * Get an Item from the Database
     * 
     * Tables
     * 
     * countries ID-> 'id', Index -> currencyId
     * 
     * 
     * user ID-> 'con'
     * 
     * @param {String} id the Unique id of the item. for userSelect, this is "con": "MYR_USD"
     * @param {Table} table Table name to get item from.
     */
    getItem(id, table) {
        return new Promise((resolve, reject) => {
            this.dbPromise.then(db => {
                return db.transaction(table)
                .objectStore(table)
                .get(id);
            })
            .then(obj => obj ? resolve(obj) : reject('no data'))
            .catch(err => reject(err))
        });
    }

    /**
     * Get Item By its Index
     * 
     * Tables
     * 
     * countries ID-> 'id', Index -> currencyId
     * 
     * 
     * user ID-> 'con'
     * 
     * @param {String} id  the Index id of the item. for userSelect, this is "con": "MYR_USD"
     * @param {Table} table Table name to get item from.
     * @param {String} index The Index name. we only have currencyId, swarpCon
     */
    getItemByIndex(id, table, index) {
        return new Promise((resolve, reject) => {
            this.dbPromise.then(db => {
                return db.transaction(table)
                .objectStore(table)
                .index(index)
                .get(id)
            })
            .then(obj => obj ? resolve(obj) : reject('no data'))
            .catch(err => reject(err))
        });
    }

    /**
     * First Try to get an Element by its Id. if it fails, try to locate by index
     * 
     * @param {String} id  the Index id of the item. for userSelect, this is "con": "MYR_USD"
     * @param {Table} table Table name to get item from.
     * @param {String} index The Index name. we only have  currencyId, swarpCon
     */
    getByIdAndIndex(id, table, index) {
        return new Promise((resolve, reject) => {
            this.getItem(id, table)
            .then(res => {
                resolve(res);
            })
            .catch(err => {
                this.getItemByIndex(id, table, index)
                .then(res2 => {
                    // because we are getting in reverse, we have to resign the values
                    const old = {...res2}; 

                    res2.con = res2.swarpCon;
                    res2.con1 = res2.con2
                    res2.con1Data = res2.con2Data;
                    res2.exrate = res2.swarpExrate;

                    res2.swarpCon = old.con;
                    res2.con2 = old.con1;
                    res2.con2Data = old.con1Data;
                    res2.swarpExrate = old.exrate;

                    resolve(res2)
                })
                .catch(err2 => {
                    reject('no data')
                })
            })
        });
    }

    /**
     * Get All The Items in a Table
     * 
     * Tables
     * 
     * countries ID-> 'id', Index -> currencyId
     * 
     * 
     * user ID-> 'con'
     * 
     * @param {Table} table Name of the Table to Get all Items 
     */
    getAllItemsInATable(table) {
        return new Promise((resolve, reject) => {
            this.dbPromise.then(db => {
                return db.transaction(table)
                  .objectStore(table)
                  .getAll();
            })
            .then(obj => obj ? resolve(obj) : reject('no data'))
            .catch(err => reject(err))
        }); 
    }

    /**
     * Get the Count of all the Items in a Table
     * 
     * Tables
     * 
     * countries ID-> 'id', Index -> currencyId
     * 
     * 
     * user ID-> 'con'
     * 
     * @param {Table} table Name of the Table to Get all Items Count
     */
    getCountOfItemsInTable(table) {
        return new Promise((resolve, reject) => {
            this.dbPromise.then(db => {
                return db.transaction(table)
                  .objectStore(table)
                  .count();
            })
            .then(obj => obj ? resolve(obj) : reject('no data'))
            .catch(err => reject(err))
        }); 
    }

    /**
     * Delete a item from a Table
     * 
     * Tables
     * 
     * countries ID-> 'id', Index -> currencyId
     * 
     * 
     * user ID-> 'con'
     * 
     * @param {String} id 
     * @param {Table} table 
     */
    deleteIteminTable(id, table) {
        return new Promise((resolve, reject) => {
            this.dbPromise.then(db => {  
                return db.transaction(table, 'readwrite')
                .objectStore(table)
                .delete(id)
            })
        });
    }

    /**
     * Clear All the Items in a Table
     * 
     * Tables
     * 
     * countries ID-> 'id', Index -> currencyId
     * 
     * 
     * user ID-> 'con'
     * 
     * @param {Table} table Name of the Table to Get all Items Count
     */
    clearAllTableItems(table) {
        return new Promise((resolve, reject) => {
            this.dbPromise.then(db => {  
                return db.transaction(table, 'readwrite')
                .objectStore(table)
                .clear()
            })
        });
    }
}

/**
 * Main App Class 
 */
class App extends ApiMain {
    
    constructor() {
        super();

        // create an instance of the DB Class
        this.db = new AppDb();

        //this.form = document.getElementById('appForm');
        this.submitBtn = document.getElementById('submitBtn');
        this.swapBtn = document.getElementById('swapBtn');
        this.swapBtnSwitch = false;

        this.theInput = document.getElementById('fromValue');
        this.theOutput = document.getElementById('toValue');

        this.country1 = document.getElementById('con1');
        this.country2 = document.getElementById('con2');

        this.MssgBox = document.getElementById('MssgBox');

        // this.usenowBtn = document.querySelectorAll('.usenowBtn');

        // countries
        this.con1 = '';
        this.con2 = '';
        
        // convertion rate
        this.exrate

        // user selection
        this.userSelect = {
            con1: '',
            con2: '',
            exrate: 0,
            name: 'none',
            con: '',
            swarpCon: '',
            swarpExrate: 0,
            date: new Date(),
            con1Data: '',
            con2Data: ''
        }
    }

    /**
     * Init The App
     */
    init() {
        this.events();
        $('.selectpicker').selectpicker();
        this.getCountry();
        this.createTable();
    }

    /**
     * Register Events
     */
    events() {

        // when the user enters a value in the input field
        this.theInput.addEventListener('keydown', this.formSubmitted.bind(this));
        this.theInput.addEventListener('keyup', this.formSubmitted.bind(this));

        // select fields 
        this.country1.addEventListener('change', this.inputField.bind(this));
        this.country2.addEventListener('change', this.inputField.bind(this));

        // convert button
        this.submitBtn.addEventListener('click', this.formSubmitted.bind(this));
        // swap button
        this.swapBtn.addEventListener('click', this.swapBtnClicked.bind(this));

        window.addEventListener('offline', this.handleOffline.bind(this));

        // this.usenowBtn.addEventListener('click', this.HandleuseNowClick.bind(this));
        $("#tb-body").on('click', '.usenowBtn', this.HandleuseNowClick.bind(this));
    }

    /**
     * Executed when the user clicks on the Swrap Button
     * 
     * Swrap the Current Currency with the Alternative
     * 
     * @param {Event} event 
     */
    swapBtnClicked(event) {
        event.preventDefault();

        if (!this.con1 && !this.con2) {
            alert('Missing First Field and Second Field');
            return;
        } else if(!this.con1) {
            alert('Missing First Field');
            return;
        } else if (!this.con2) {
            alert('Missing Second Field');
            return;
        } else if (!this.theInput.value && event.type == 'click') {
            alert('Missing Value to Convert');
            return;
        } else if(!this.userSelect.exrate && !this.userSelect.swarpExrate) {
            alert('Sorry, You Have to Convert The Currency before you can Swrap It.');
            return;
        }

        this.swapBtnSwitch ? part2(this) : part1(this)

        function part1(self) {
            const value = self.theInput.value;
            self.calRate(value, self.userSelect.swarpExrate)
            .then(res => {
                // console.log('converted rate', res);
                self.theOutput.innerText = `${self.userSelect.con1Data.currencySymbol ? self.userSelect.con1Data.currencySymbol : ''} ${res}`;
                //$(self.theOutput).parent().parent().show(2000);
                self.swapBtnSwitch = !self.swapBtnClicked;
                $('#inputGroup-icon').text(`${self.userSelect.con2Data.currencySymbol ? self.userSelect.con2Data.currencySymbol : '' }`);
            })
            .catch(err => self.handleError(err))
        }

        function part2(self) {
            const value = self.theInput.value;
            this.calRate(value, self.userSelect.exrate)
            .then(res => {
                // console.log('converted rate', res);
                self.theOutput.innerText = `${self.userSelect.con2Data.currencySymbol ? self.userSelect.con2Data.currencySymbol : ''} ${res}`;
                //$(self.theOutput).parent().parent().show(2000);
                self.swapBtnSwitch = !self.swapBtnClicked;
                $('#inputGroup-icon').text(`${self.userSelect.con1Data.currencySymbol ? self.userSelect.con1Data.currencySymbol : ''}`);
            })
            .catch(err => self.handleError(err))
        }

    }

    /**
     * Executed when the user clicks on the Submit (Convert) Button
     * 
     * @param {Event} event 
     */
    formSubmitted(event) {  
        event.type == 'click' ? event.preventDefault() : ''
        // console.log('form data: ', event);

        if (!this.con1 && !this.con2) {
            alert('Missing First Field and Second Field');
            return;
        } else if(!this.con1) {
            alert('Missing First Field');
            return;
        } else if (!this.con2) {
            alert('Missing Second Field');
            return;
        } else if (!this.theInput.value && event.type == 'click') {
            alert('Missing Value to Convert');
            return;
        }


        const value = this.theInput.value;
        if (this.exrate && this.exrate != '') {
            this.calRate(value, this.exrate)
            .then(res => {
                // console.log('converted rate', res);
                this.theOutput.innerText = `${this.userSelect.con2Data.currencySymbol ? this.userSelect.con2Data.currencySymbol : ''} ${res}`;
                $(this.theOutput).parent().parent().show(2000);

                $('#inputGroup-icon').text(`${this.userSelect.con1Data.currencySymbol ? this.userSelect.con1Data.currencySymbol : ''}`); 
            })
            .catch(err => this.handleError(err))
        }
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
            // id of the country
            this.con1 = event.target.value 
        }
        if (event.target.id === 'con2') {
            // id of the country
            this.con2 = event.target.value 
        }

        if (this.con1 && this.con2) {
            // use the country id to get the currency id
            // pass the currency id to the get rate method
            // console.log('trying to get the rate with data: con1 id: ', this.con1, ' con2 id: ', this.con2);
            this.exrate = '';
            $(this.theOutput).parent().parent().hide();

            this.getAndCalRate()
        }
    }

    async getAndCalRate() {
        try {
            this.userSelect.con1Data = await this.db.getItem(this.con1, this.db.countries);
            this.userSelect.con2Data = await this.db.getItem(this.con2, this.db.countries);

            if (this.userSelect.con1Data && this.userSelect.con2Data) {
                
                this.userSelect.con1 = this.userSelect.con1Data.currencyId;
                this.userSelect.con2 = this.userSelect.con2Data.currencyId;

                this.userSelect.con = `${this.userSelect.con1Data.currencyId}_${this.userSelect.con2Data.currencyId}`;
                this.userSelect.swarpCon = `${this.userSelect.con2Data.currencyId}_${this.userSelect.con1Data.currencyId}`;

                this.db.getByIdAndIndex(this.userSelect.con, this.db.user, 'swarpCon')
                .then(con => {
                    //console.log('got currency from db', con);
                    // check if the currency is older than an hour 
                    if (!this.checkForAnHour(con.date)) {
                        // it is greater than an hour. do not use. try to get new
                        //console.log('older than an hour getting new from api');
                        // in cases of error i.e no internet, use old data.
                        this.getLastestCurrency(con);
                    } else {
                        // currency is not greater than an hour. use the one in db
                        //console.log('NOT older than an hour');
                        this.exrate = parseFloat(con.exrate.toFixed(4));

                        this.userSelect.exrate = this.exrate;
                        const exe = 1 / this.exrate;
                        this.userSelect.swarpExrate = parseFloat(exe.toFixed(4))

                        $('#exrate').html(this.exrate);
                        // show the rate box
                        $('#exrate').parent().parent().show(2000);
                    }
                })
                .catch(ercon => {
                    //console.log('sorry currency not avaliable in db', ercon);
                    this.getLastestCurrency();
                })

                

            }

            

        } catch (error) {
            this.handleError(err)
        }
    }

    getLastestCurrency(con = '') {
        this.getRate(this.userSelect.con1, this.userSelect.con2)
        .then(res => {
            this.exrate = parseFloat(res.toFixed(4));

            this.userSelect.exrate = this.exrate;
            this.userSelect.date = new Date();
            const exe = 1 / this.exrate;
            this.userSelect.swarpExrate = parseFloat(exe.toFixed(4))

            this.db.addItem(this.userSelect, this.db.user);

            //console.log('new user data', this.userSelect);

            $('#exrate').html(this.exrate);
            // show the rate box
            $('#exrate').parent().parent().show(2000);
        })
        .catch(err => {
            // fallback. if currency exist in db but fetch failed i.e internet reasons, return old data
            if (con && con != '') {
                this.exrate = parseFloat(con.exrate.toFixed(4));

                this.userSelect.exrate = this.exrate;
                const exe = 1 / this.exrate;
                this.userSelect.swarpExrate = parseFloat(exe.toFixed(4))

                $('#exrate').html(this.exrate);
                // show the rate box
                $('#exrate').parent().parent().show(2000);
            }
            this.handleError(err, 'Err getting Exechange Rate')
        })
    }

    /**
     * Checks if an Hour as Passed from the Date given
     * 
     * if false, no. you are good
     * 
     * if true, sorry, an hour as passed
     */
    checkForAnHour(myDate) {
        const ONE_HOUR = 60 * 60 * 1000;
        return ((new Date) - new Date(myDate)) < ONE_HOUR
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
            const res = Math.round(total * 100) / 100
            resolve( parseFloat(res.toFixed(4)) );
        });
    }

    /**
     * Make an Api Request to get All the Countries
     */
    getCountry() {
        this.db.getAllItemsInATable(this.db.countries)
        .then(res => {
            if (res && res.length !== 0) {
                // we have items in database. return to the user
                this.setSelectFields(res, 2); 
            } else {
                // we dont have any items in the database, make http request to get one
                this.getAllCountries()
                .then(res => {
                    this.setSelectFields(res, 1);   
                })
                .catch(err => this.handleError(err, 'Err getting Countries'))
            }
        })
        .catch(err => {
            this.handleError(err, 'Err getting Items from DB');
        })
    }

    /**
     * Set the Select Input Field
     * 
     * This Populates the Select Fields with the Countries List
     * 
     * @param {Object} res JSON Object of Countries 
     * @param {Number} type Type of Input. 1 -> Object, 2 -> Array
     */
    setSelectFields(res, type) {
        // console.log('setting fields');

        let ele = '';

        if (type === 1) {
            // we have an object type
            for (const key in res.results) {
                if (res.results.hasOwnProperty(key)) {
                    const item = res.results[key];
                    
                    // save in countries database
                    this.db.addItem(item, this.db.countries);
    
                    // save in array to add to DOM
                    ele += `<option value="${item.id}" data-subtext="${item.currencyName}">${item.name} (${item.currencyId})</option>`; 
                }
            }
        } else {
            // we have an array type
            for (const item of res) {
                
                // save in array to add to DOM
                ele += `<option value="${item.id}" data-subtext="${item.currencyName}">${item.name} (${item.currencyId})</option>`; 
                
            }
        }

        $(".selectpicker").html(ele);

        $(".selectpicker").selectpicker("refresh");

    }

    createTable() {
        // check if there is entries in the database.
        this.db.getAllItemsInATable(this.db.user)
        .then(res => {
            if (res && res.length != 0) {
                $('.marg-2').show();

                let ele = '';

                for (const item of res) {
                
                    // save in array to add to DOM
                    //ele += `<option value="${item.id}" data-subtext="${item.currencyName}">${item.name} (${item.currencyId})</option>`; 
                    ele += `  
                    <tr>
                        <th scope="row"> ${item.con} </th>
                        <td> ${item.con1} </td>
                        <td> ${item.con2} </td>
                        <td> ${item.exrate} </td>
                        <td> <a href="#" class="btn btn-primary usenowBtn" 
                        data-item-con="${item.con}" 
                        data-item-con1="${item.con1}" 
                        data-item-con2="${item.con2}" 
                        data-item-exrate="${item.exrate}"
                        > Use Now </a> </td>
                    </tr>
                    `
                }

                $('#tb-body').html(ele);
            } else {
                $('.marg-2').hide();
            }
            
        })
        .catch(err => this.handleError(err))
    }

    HandleuseNowClick(event) {
        //console.log('use now btn clicked', event.currentTarget.dataset);
        const data = event.currentTarget.dataset;

        this.exrate = data.itemExrate;
        this.con1 = data.itemCon1;
        this.con2 = data.itemCon2;

        //console.log(this.exrate, this.con1, this.con2);
        $('#exrate').html(this.exrate);
        // show the rate box
        $('#exrate').parent().parent().show(2000);

    }

    handleOffline(event) {
        const mssg = 'Sorry, You are Offline. <br/> In Offline Mode, you only have access to currencies you have prevously selected';
    
        this.message('danger', mssg, 5) 
    }

    /**
     * The Message Method.
     * 
     * Display an alert message to the user.
     * 
     * @example The ClassName may be primary, secondary, success, danger, warning, info, light, dark
     * 
     * @param {String} className The Class Name
     * @param {HTML} mssg The HTML Message to display to the user
     * @param {Number} duration How Long in Seconds (s) the Message show stay in view
     */
    message(className, mssg, duration = 0) {

        if (!$(this.MssgBox).hasClass(`alert-${className}`)) {
            $(this.MssgBox)
            .addClass(`alert-${className}`)
            .html(mssg)
            .show();
        } else {
            $(this.MssgBox)
            .html(mssg)
            .show();
        }

        if (duration && duration != 0) {
            const timer = setTimeout(() => {
                $(this.MssgBox)
                .removeClass(`alert-${className}`)
                .html('')
                .hide();
            }, 1000 * duration);
        }
    }

    /**
     * Handle Error Thrown in the App
     * 
     * @param {Any} err The Error. 
     * @param {String} mssg Error Message to Log Out
     */
    handleError(err, mssg = '') {
        console.error(mssg, err);

        if (!navigator.onLine) {
            this.message('danger', 'Sorry try again when you are online', 2);
            if (!this.exrate) {
                $('#exrate').html('');
                $('#exrate').parent().parent().hide();
            }
        }
    }
}

const app = new App();

app.init();