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
        return this.dbPromise.then(db => {  
            return db.transaction(table, 'readwrite')
            .objectStore(table)
            .delete(id)
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
        return this.dbPromise.then(db => {  
                return db.transaction(table, 'readwrite')
                .objectStore(table)
                .clear()
        })
      
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
            con1Data: {},
            con2Data: {}
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
        this.checkUser();
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
        window.addEventListener('online', this.handleOnline.bind(this));

        // this.usenowBtn.addEventListener('click', this.HandleuseNowClick.bind(this));
        $("#tb-body").on('click', '.usenowBtn', this.HandleuseNowClick.bind(this));
        $("#tb-body").on('click', '.renewBtn', this.HandleRenewClick.bind(this));
        $("#tb-body").on('click', '.deleteBtn', this.HandleDeleteClick.bind(this));

    }

    checkUser() {
        if ( ! localStorage.getItem('cc-name') ) {

            const title = `Hello First Time User`;
            const mssg = `
                <form class="cc-name">
                    <h5> Hello. we can see that this is the first time you are using this App. kindly provide your name </h5>
                    <div class="form-group">
                        <label for="recipient-name" class="col-form-label">Please Enter Your Name</label>
                        <input type="text" class="form-control" id="recipient-name">
                    </div>
                </form>
            `;
            const btn = [
                {
                    name: 'No Thanks',
                    callback: e => {
                        localStorage.setItem('cc-name', 'none');
                    }
                },
                {
                    name: 'Alright',
                    callback: e => {
                        // mouse event / currentTarget/ .modal-footer parentElement /.modal-body previousElementSibling /form firstElementChild / div.form-group / input#recipient-name.form-control
                        const ele = e.currentTarget.parentElement.previousElementSibling.firstElementChild.lastElementChild.lastElementChild.value
                        // console.log('user details', ele);
                        localStorage.setItem('cc-name', ele);
                        $('#app-user').html(ele);
                        $('#cc-modal').modal('hide');
                    }
                }
            ];
            this.modalControl(mssg, title, btn);
        } else {
            const user = localStorage.getItem('cc-name');
            this.userSelect.name = user;
            this.userSelect.name != 'none' ? $('#app-user').html(this.userSelect.name) : '';
        }
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
            this.modalControl('Please Select the Currency you want to Convert From and To', 'Missing First Field and Second Field', [{name: 'Try Again'}]);
            return;
        } else if(!this.con1) {
            this.modalControl('Please Select the First Currency', 'Missing First Field', [{name: 'Try Again'}]);
            return;
        } else if (!this.con2) {
            this.modalControl('Please Select the Second Currency', 'Missing Second Field', [{name: 'Try Again'}]);
            return;
        } else if (!this.theInput.value && event.type == 'click') {
            this.modalControl('Please Enter the Value to Convert', 'Missing Value to Convert', [{name: 'Try Again'}]);
            return;
        } else if(!this.userSelect.exrate && !this.userSelect.swarpExrate) {
            this.modalControl('Sorry, You Have to Convert The Currency before you can Swrap It.', '', [{name: 'Try Again'}]);
            return;
        }

        this.swapBtnSwitch ? part2(this) : part1(this)

        function part1(self) {
            const value = self.theInput.value;
            self.calRate(value, self.userSelect.swarpExrate)
            .then(res => {
                // console.log('converted rate', res);
                self.theOutput.innerText = `${self.userSelect.con1Data.currencySymbol ? self.userSelect.con1Data.currencySymbol : ''} ${self.numberWithCommas(res)}`;
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
                self.theOutput.innerText = `${self.userSelect.con2Data.currencySymbol ? self.userSelect.con2Data.currencySymbol : ''} ${self.numberWithCommas(res)}`;
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
            this.modalControl('Please Select the Currency you want to Convert From and To', 'Missing First Field and Second Field', [{name: 'Try Again'}]);
            return;
        } else if(!this.con1) {
            this.modalControl('Please Select the First Currency', 'Missing First Field', [{name: 'Try Again'}]);
            return;
        } else if (!this.con2) {
            this.modalControl('Please Select the Second Currency', 'Missing Second Field', [{name: 'Try Again'}]);
            return;
        } else if (!this.theInput.value && event.type == 'click') {
            this.modalControl('Please Enter the Value to Convert', 'Missing Value to Convert', [{name: 'Try Again'}]);
            return;
        }


        const value = this.theInput.value;
        if (value && this.exrate && this.exrate != '') {
            this.calRate(value, this.exrate)
            .then(res => {
                // console.log('converted rate', res);
                this.theOutput.innerText = `${this.userSelect.con2Data.currencySymbol ? this.userSelect.con2Data.currencySymbol : ''} ${this.numberWithCommas(res)}`;
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

    /**
     * Get The Exchange Rate
     * 
     * Caculate the Convertion
     */
    async getAndCalRate() {
        try {
            this.userSelect.con1Data = await this.db.getItem(this.con1, this.db.countries);
            this.userSelect.con2Data = await this.db.getItem(this.con2, this.db.countries);

            if (Object.keys(this.userSelect.con1Data).length != 0 && Object.keys(this.userSelect.con2Data).length != 0) {
                
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
            this.handleError(error)
        }
    }

    getLastestCurrency(con = '') {
        // show loader
        $('.marg-3').show();

        this.getRate(this.userSelect.con1, this.userSelect.con2)
        .then(res => {
            $('.marg-3').hide();

            this.exrate = parseFloat(res.toFixed(4));

            this.userSelect.exrate = this.exrate;
            this.userSelect.date = new Date();
            const exe = 1 / this.exrate;
            this.userSelect.swarpExrate = parseFloat(exe.toFixed(4))

            this.db.addItem(this.userSelect, this.db.user).then(res => {
                // regenrate the table
                this.createTable();
            })

            //console.log('new user data', this.userSelect);

            $('#exrate').html(this.exrate);
            // show the rate box
            $('#exrate').parent().parent().show(2000);
        })
        .catch(err => {
            $('.marg-3').hide();
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
     * Add commas to the numbers
     * 
     * @param {Number} number 
     */
    numberWithCommas(number) {
        return number.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
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
        // show the loader
        $('.marg-3').show();

        this.db.getAllItemsInATable(this.db.countries)
        .then(res => {
            if (res && res.length !== 0) {
                $('.marg-3').hide();
                // we have items in database. return to the user
                this.setSelectFields(res, 2); 
            } else {
                $('.marg-3').show();
                // we dont have any items in the database, make http request to get one
                this.getAllCountries()
                .then(res => {
                    $('.marg-3').hide();
                    this.setSelectFields(res, 1);   
                })
                .catch(err => {
                    $('.marg-3').hide();
                    this.handleError(err, 'Err getting Countries')
                })
            }
        })
        .catch(err => {
            $('.marg-3').hide();
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

    /**
     * Create The User Convertion History Table
     * 
     * Then Present it to the User
     * 
     * Data Gotten from the Index DB
     */
    createTable() {
        
        this.userSelect.name != 'none' ? $('#app-user').html(this.userSelect.name) : '';

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
                        <td> ${
                            this.checkForAnHour(item.date) ? 
                            'True' : 
                            `False (
                                <a href="#" class="renewBtn" 
                                data-item-con="${item.con}" 
                                data-item-con1="${item.con1}" 
                                data-item-con2="${item.con2}" 
                                data-item-exrate="${item.exrate}"
                                data-item-swarpExrate="${item.swarpExrate}"
                                data-item-user1id="${item.con1Data.id}"
                                data-item-user2id="${item.con2Data.id}"
                                data-item-user1symbol="${item.con1Data.currencySymbol}"
                                data-item-user2symbol="${item.con2Data.currencySymbol}"
                                > Renew </a>)` } </td>
                        <td> <a href="#" class="btn btn-primary usenowBtn" 
                        data-item-con="${item.con}" 
                        data-item-con1="${item.con1}" 
                        data-item-con2="${item.con2}" 
                        data-item-exrate="${item.exrate}"
                        data-item-swarpExrate="${item.swarpExrate}"
                        data-item-user1id="${item.con1Data.id}"
                        data-item-user2id="${item.con2Data.id}"
                        data-item-user1symbol="${item.con1Data.currencySymbol}"
                        data-item-user2symbol="${item.con2Data.currencySymbol}"
                        > Use Now </a> 
                        <a href="#" class="btn btn-danger deleteBtn"
                        data-item-con="${item.con}" 
                        data-item-con1="${item.con1}" 
                        data-item-con2="${item.con2}"
                        > Delete </a>
                        </td>
                    </tr>
                    <tr>
                        <th scope="row"> ${item.swarpCon} </th>
                        <td> ${item.con2} </td>
                        <td> ${item.con1} </td>
                        <td> ${item.swarpExrate} </td>
                        <td> ${
                            this.checkForAnHour(item.date) ? 
                            'True' : 
                            `False (
                                <a href="#" class="renewBtn" 
                                data-item-con="${item.swarpCon}" 
                                data-item-con1="${item.con2}" 
                                data-item-con2="${item.con1}" 
                                data-item-exrate="${item.swarpExrate}"
                                data-item-swarpExrate="${item.exrate}"
                                data-item-user1id="${item.con2Data.id}"
                                data-item-user2id="${item.con1Data.id}"
                                data-item-user1symbol="${item.con2Data.currencySymbol}"
                                data-item-user2symbol="${item.con1Data.currencySymbol}"
                                > Renew </a>)` } 
                                
                                </td>
                        <td> <a href="#" class="btn btn-primary usenowBtn" 
                        data-item-con="${item.swarpCon}" 
                        data-item-con1="${item.con2}" 
                        data-item-con2="${item.con1}" 
                        data-item-exrate="${item.swarpExrate}"
                        data-item-swarpExrate="${item.exrate}"
                        data-item-user1id="${item.con2Data.id}"
                        data-item-user2id="${item.con1Data.id}"
                        data-item-user1symbol="${item.con2Data.currencySymbol}"
                        data-item-user2symbol="${item.con1Data.currencySymbol}"
                        > Use Now </a> 
                        <a href="#" class="btn btn-danger deleteBtn"
                        data-item-con="${item.swarpCon}" 
                        data-item-con1="${item.con2}" 
                        data-item-con2="${item.con1}"
                        > Delete </a>
                        </td>
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

    handleEvent(event) {
        // the html event 
        // event.preventDefault()
        const data = event.currentTarget.dataset;

        // get the exchange rate
        this.exrate = data.itemExrate;
        this.con1 = data.itemUser1id;
        this.con2 = data.itemUser2id;

        this.userSelect.con1 = data.itemCon1;
        this.userSelect.con2 = data.itemCon2;

        this.userSelect.con = `${this.userSelect.con1}_${this.userSelect.con2}`;
        this.userSelect.swarpCon = `${this.userSelect.con2}_${this.userSelect.con1}`;

        this.userSelect.exrate = this.exrate;
        this.userSelect.swarpExrate = data.itemSwarpexrate;

        $(this.country1).val(this.con1);
        $(this.country2).val(this.con2);
        $(".selectpicker").selectpicker("refresh");

        this.userSelect.con2Data.currencySymbol = data.itemUser2symbol;
        this.userSelect.con1Data.currencySymbol = data.itemUser1symbol;

        const value = this.theInput.value;
        if (value && this.exrate && this.exrate != '') {
            this.calRate(value, this.exrate)
            .then(res => {
                // console.log('converted rate', res);
                this.theOutput.innerText = `${this.userSelect.con2Data.currencySymbol ? this.userSelect.con2Data.currencySymbol : ''} ${this.numberWithCommas(res)}`;
                $(this.theOutput).parent().parent().show(2000);

                $('#inputGroup-icon').text(`${this.userSelect.con1Data.currencySymbol ? this.userSelect.con1Data.currencySymbol : ''}`); 
            })
            .catch(err => this.handleError(err))
        }
    }

    /**
     * When User Clicks On the Use Now Button 
     * 
     * This shows up on the User Convertion History
     *  
     * @param {Event} event 
     */
    HandleuseNowClick(event) {
        // console.log('use now btn clicked', event.currentTarget.dataset);

        this.handleEvent(event);

        //console.log(this.exrate, this.con1, this.con2);
        $('#exrate').html(this.exrate);
        // show the rate box
        $('#exrate').parent().parent().show(2000);

    }

    /**
     * When User Clicks on the Renew Button
     * 
     * This shows up on the User Convertion History
     * 
     * @param {Event} event 
     */
    HandleRenewClick(event) {
        
        this.handleEvent(event);

        this.getLastestCurrency();
    }

    /**
     * When User Clicks on the Delete Button
     * 
     * This shows up on the User Convertion History
     * 
     * @param {Event} event 
     */
    HandleDeleteClick(event) {
        event.preventDefault();
        const data = event.currentTarget.dataset;
        const con = `${data.itemCon1}_${data.itemCon2}`;
        const swapcon = `${data.itemCon2}_${data.itemCon1}`;
        
        const mssg = `Are you Sure you want to Delete this Item <b> (${con}) </b> ? <br> 
                        Please Note: This Will Delete this Item as Well <b> (${swapcon}) </b> `;
        const title = `Delete Item ${con}`;
        const button = [
            {
                name: 'No'
            },
            {
                name: 'Yes',
                callback: () => {
                    this.db.deleteIteminTable(con, this.db.user);
                    this.db.deleteIteminTable(swapcon, this.db.user);
                    this.createTable();
                    $('#cc-modal').modal('hide');
                }
            }
        ];

        this.modalControl(mssg, title, button);
    }

    handleOnline(event) {
        const mssg = 'Good. You are back online';
    
        this.message('success', mssg, 5) 
    }

    /**
     * Offline Event Handler
     * 
     * @param {Event} event 
     */
    handleOffline(event) {
        const mssg = 'Sorry, You are Offline. <br/> In Offline Mode, you only have access to currencies you have prevously selected';
    
        this.message('danger', mssg, 30) 
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
     * Create the Modal 
     * 
     * @example Button = 
     * [
     *  {
     *      name: 'hello button',
     *      callback: function() {
     *          console.log('user clicked on hello button');
     *          $('#cc-modal').modal('hide'); 
     *      }
     *  }
     * ]
     * 
     * NOTE $('#cc-modal').modal('hide'); for all callbacks
     * 
     * @param {String} body The Body of the Modal
     * @param {String} title The Title of the Modal
     * @param {Array<Object>} button Modal Button
     */
    modalControl(body, title = '', button = '') {
            
            // check for modal title
            (title !== '') ? $('.modal-header').show().find('.modal-title').html(title) : $('.modal-header').hide();
            
            // by default hide the action button
            $('.action-modal').hide(); 

            (button === '') ? $('.close-modal').html('Close') : button;

            $('.modal-body').html(body);

            if (button !== '') {
                if (button.length > 1) {
                    // show the second button
                    $('.action-modal').show(); 

                    // for now we can only have two buttons

                    // close is button 1
                    $('.close-modal').html(button[0].name);
                    $('.close-modal').on('click', button[0].callback);

                    // while action is button 2
                    $('.action-modal').html(button[1].name); 
                    $('.action-modal').on('click', button[1].callback);
                     
                } else { 

                    $('.close-modal').html(button[0].name); 
                    $('.close-modal').on('click', button[0].callback);
                
                }
            }

        $('#cc-modal').modal();

        $('#cc-modal').on('hidden.bs.modal', function (e) {
            $('.close-modal').off('click');
            $('.action-modal').off('click');
        })
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