'use strict';

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

/**
 * API Class
 * 
 * Handles all the Interaction with the API / Server
 * 
 * API Endpoint. https://free.currencyconverterapi.com/api/v5/countries
 */
var ApiMain = function () {
    function ApiMain() {
        _classCallCheck(this, ApiMain);

        // main api site url
        this.url = 'https://free.currencyconverterapi.com/';

        // api version
        this.api = 'api/v5/';

        // endpoints we will be using
        this.endPoints = {
            currencies: "currencies",
            countries: "countries",
            convert: "convert"

            // the url query params
        };this.query = {
            compact: {
                none: "",
                part: "y",
                full: "ultra"
            }
        };
    }

    /**
     * Get All the Countries
     * 
     * @returns {Promise}
     */


    _createClass(ApiMain, [{
        key: 'getAllCountries',
        value: function getAllCountries() {
            var url = this.url + this.api + this.endPoints.countries;
            return this.request(url);
        }

        /**
         * Get All the Currencies
         * 
         * @returns {Promise}
         */

    }, {
        key: 'getAllCurrencies',
        value: function getAllCurrencies() {
            var url = this.url + this.api + this.endPoints.currencies;
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

    }, {
        key: 'getRate',
        value: function getRate(fromCurrency, toCurrency) {
            var mode = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : this.query.compact.full;

            var urlQuery = fromCurrency + '_' + toCurrency;

            var url = this.url + this.api + this.endPoints.convert + '?q=' + urlQuery + '&compact=' + mode;

            return this.request(url).then(function (res) {
                return res[urlQuery];
            });
        }
    }, {
        key: 'request',
        value: function request(url) {
            return fetch(url).then(function (res) {
                return res.json();
            });
        }
    }]);

    return ApiMain;
}();

/**
 * Database Class
 * 
 * Handles all the Interaction with the Index DB Database
 * 
 * Based on the IDB lib. https://github.com/jakearchibald/idb
 */


var AppDb = function () {
    function AppDb() {
        var _this = this;

        _classCallCheck(this, AppDb);

        this.appName = 'the-currency-converter-app';

        this.countries = 'countries';
        this.user = 'userSelect';

        if (!('indexedDB' in window)) {
            console.log('This browser doesn\'t support IndexedDB');
            alert('This browser doesn\'t support IndexedDB');
            return;
        }

        this.dbPromise = idb.open(this.appName, 1, function (upgradeDb) {
            if (!upgradeDb.objectStoreNames.contains(_this.countries)) {
                var conIndex = upgradeDb.createObjectStore(_this.countries, { keyPath: 'id' });
                conIndex.createIndex('currencyId', 'currencyId');
            }
            if (!upgradeDb.objectStoreNames.contains(_this.user)) {
                var conIndex2 = upgradeDb.createObjectStore(_this.user, { keyPath: 'con' });
                conIndex2.createIndex('swarpCon', 'swarpCon');
            }
        });
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


    _createClass(AppDb, [{
        key: 'addItem',
        value: function addItem(item, table) {
            var _this2 = this;

            return new Promise(function (resolve, reject) {
                _this2.dbPromise.then(function (db) {
                    var tx = db.transaction(table, 'readwrite');
                    tx.objectStore(table).put(item);
                    return tx.complete;
                }).then(function (_) {
                    return resolve('added');
                }).catch(function (err) {
                    return reject(err);
                });
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

    }, {
        key: 'getItem',
        value: function getItem(id, table) {
            var _this3 = this;

            return new Promise(function (resolve, reject) {
                _this3.dbPromise.then(function (db) {
                    return db.transaction(table).objectStore(table).get(id);
                }).then(function (obj) {
                    return obj ? resolve(obj) : reject('no data');
                }).catch(function (err) {
                    return reject(err);
                });
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

    }, {
        key: 'getItemByIndex',
        value: function getItemByIndex(id, table, index) {
            var _this4 = this;

            return new Promise(function (resolve, reject) {
                _this4.dbPromise.then(function (db) {
                    return db.transaction(table).objectStore(table).index(index).get(id);
                }).then(function (obj) {
                    return obj ? resolve(obj) : reject('no data');
                }).catch(function (err) {
                    return reject(err);
                });
            });
        }

        /**
         * First Try to get an Element by its Id. if it fails, try to locate by index
         * 
         * @param {String} id  the Index id of the item. for userSelect, this is "con": "MYR_USD"
         * @param {Table} table Table name to get item from.
         * @param {String} index The Index name. we only have  currencyId, swarpCon
         */

    }, {
        key: 'getByIdAndIndex',
        value: function getByIdAndIndex(id, table, index) {
            var _this5 = this;

            return new Promise(function (resolve, reject) {
                _this5.getItem(id, table).then(function (res) {
                    resolve(res);
                }).catch(function (err) {
                    _this5.getItemByIndex(id, table, index).then(function (res2) {
                        // because we are getting in reverse, we have to resign the values
                        var old = _extends({}, res2);

                        res2.con = res2.swarpCon;
                        res2.con1 = res2.con2;
                        res2.con1Data = res2.con2Data;
                        res2.exrate = res2.swarpExrate;

                        res2.swarpCon = old.con;
                        res2.con2 = old.con1;
                        res2.con2Data = old.con1Data;
                        res2.swarpExrate = old.exrate;

                        resolve(res2);
                    }).catch(function (err2) {
                        reject('no data');
                    });
                });
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

    }, {
        key: 'getAllItemsInATable',
        value: function getAllItemsInATable(table) {
            var _this6 = this;

            return new Promise(function (resolve, reject) {
                _this6.dbPromise.then(function (db) {
                    return db.transaction(table).objectStore(table).getAll();
                }).then(function (obj) {
                    return obj ? resolve(obj) : reject('no data');
                }).catch(function (err) {
                    return reject(err);
                });
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

    }, {
        key: 'getCountOfItemsInTable',
        value: function getCountOfItemsInTable(table) {
            var _this7 = this;

            return new Promise(function (resolve, reject) {
                _this7.dbPromise.then(function (db) {
                    return db.transaction(table).objectStore(table).count();
                }).then(function (obj) {
                    return obj ? resolve(obj) : reject('no data');
                }).catch(function (err) {
                    return reject(err);
                });
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

    }, {
        key: 'deleteIteminTable',
        value: function deleteIteminTable(id, table) {
            var _this8 = this;

            return new Promise(function (resolve, reject) {
                _this8.dbPromise.then(function (db) {
                    return db.transaction(table, 'readwrite').objectStore(table).delete(id);
                });
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

    }, {
        key: 'clearAllTableItems',
        value: function clearAllTableItems(table) {
            var _this9 = this;

            return new Promise(function (resolve, reject) {
                _this9.dbPromise.then(function (db) {
                    return db.transaction(table, 'readwrite').objectStore(table).clear();
                });
            });
        }
    }]);

    return AppDb;
}();

/**
 * Main App Class 
 */


var App = function (_ApiMain) {
    _inherits(App, _ApiMain);

    function App() {
        _classCallCheck(this, App);

        // create an instance of the DB Class
        var _this10 = _possibleConstructorReturn(this, (App.__proto__ || Object.getPrototypeOf(App)).call(this));

        _this10.db = new AppDb();

        //this.form = document.getElementById('appForm');
        _this10.submitBtn = document.getElementById('submitBtn');
        _this10.swapBtn = document.getElementById('swapBtn');
        _this10.swapBtnSwitch = false;

        _this10.theInput = document.getElementById('fromValue');
        _this10.theOutput = document.getElementById('toValue');

        _this10.country1 = document.getElementById('con1');
        _this10.country2 = document.getElementById('con2');

        _this10.MssgBox = document.getElementById('MssgBox');

        // this.usenowBtn = document.querySelectorAll('.usenowBtn');

        // countries
        _this10.con1 = '';
        _this10.con2 = '';

        // convertion rate
        _this10.exrate;

        // user selection
        _this10.userSelect = {
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
        };
        return _this10;
    }

    /**
     * Init The App
     */


    _createClass(App, [{
        key: 'init',
        value: function init() {
            this.events();
            $('.selectpicker').selectpicker();
            this.getCountry();
            this.createTable();
        }

        /**
         * Register Events
         */

    }, {
        key: 'events',
        value: function events() {

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

    }, {
        key: 'swapBtnClicked',
        value: function swapBtnClicked(event) {
            event.preventDefault();

            if (!this.con1 && !this.con2) {
                alert('Missing First Field and Second Field');
                return;
            } else if (!this.con1) {
                alert('Missing First Field');
                return;
            } else if (!this.con2) {
                alert('Missing Second Field');
                return;
            } else if (!this.theInput.value && event.type == 'click') {
                alert('Missing Value to Convert');
                return;
            } else if (!this.userSelect.exrate && !this.userSelect.swarpExrate) {
                alert('Sorry, You Have to Convert The Currency before you can Swrap It.');
                return;
            }

            this.swapBtnSwitch ? part2(this) : part1(this);

            function part1(self) {
                var value = self.theInput.value;
                self.calRate(value, self.userSelect.swarpExrate).then(function (res) {
                    // console.log('converted rate', res);
                    self.theOutput.innerText = (self.userSelect.con1Data.currencySymbol ? self.userSelect.con1Data.currencySymbol : '') + ' ' + self.numberWithCommas(res);
                    //$(self.theOutput).parent().parent().show(2000);
                    self.swapBtnSwitch = !self.swapBtnClicked;
                    $('#inputGroup-icon').text('' + (self.userSelect.con2Data.currencySymbol ? self.userSelect.con2Data.currencySymbol : ''));
                }).catch(function (err) {
                    return self.handleError(err);
                });
            }

            function part2(self) {
                var value = self.theInput.value;
                this.calRate(value, self.userSelect.exrate).then(function (res) {
                    // console.log('converted rate', res);
                    self.theOutput.innerText = (self.userSelect.con2Data.currencySymbol ? self.userSelect.con2Data.currencySymbol : '') + ' ' + self.numberWithCommas(res);
                    //$(self.theOutput).parent().parent().show(2000);
                    self.swapBtnSwitch = !self.swapBtnClicked;
                    $('#inputGroup-icon').text('' + (self.userSelect.con1Data.currencySymbol ? self.userSelect.con1Data.currencySymbol : ''));
                }).catch(function (err) {
                    return self.handleError(err);
                });
            }
        }

        /**
         * Executed when the user clicks on the Submit (Convert) Button
         * 
         * @param {Event} event 
         */

    }, {
        key: 'formSubmitted',
        value: function formSubmitted(event) {
            var _this11 = this;

            event.type == 'click' ? event.preventDefault() : '';
            // console.log('form data: ', event);

            if (!this.con1 && !this.con2) {
                alert('Missing First Field and Second Field');
                return;
            } else if (!this.con1) {
                alert('Missing First Field');
                return;
            } else if (!this.con2) {
                alert('Missing Second Field');
                return;
            } else if (!this.theInput.value && event.type == 'click') {
                alert('Missing Value to Convert');
                return;
            }

            var value = this.theInput.value;
            if (this.exrate && this.exrate != '') {
                this.calRate(value, this.exrate).then(function (res) {
                    // console.log('converted rate', res);
                    _this11.theOutput.innerText = (_this11.userSelect.con2Data.currencySymbol ? _this11.userSelect.con2Data.currencySymbol : '') + ' ' + _this11.numberWithCommas(res);
                    $(_this11.theOutput).parent().parent().show(2000);

                    $('#inputGroup-icon').text('' + (_this11.userSelect.con1Data.currencySymbol ? _this11.userSelect.con1Data.currencySymbol : ''));
                }).catch(function (err) {
                    return _this11.handleError(err);
                });
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

    }, {
        key: 'inputField',
        value: function inputField(event) {

            if (event.target.id === 'con1') {
                // id of the country
                this.con1 = event.target.value;
            }
            if (event.target.id === 'con2') {
                // id of the country
                this.con2 = event.target.value;
            }

            if (this.con1 && this.con2) {
                // use the country id to get the currency id
                // pass the currency id to the get rate method
                // console.log('trying to get the rate with data: con1 id: ', this.con1, ' con2 id: ', this.con2);
                this.exrate = '';
                $(this.theOutput).parent().parent().hide();

                this.getAndCalRate();
            }
        }
    }, {
        key: 'getAndCalRate',
        value: function () {
            var _ref = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee() {
                var _this12 = this;

                return regeneratorRuntime.wrap(function _callee$(_context) {
                    while (1) {
                        switch (_context.prev = _context.next) {
                            case 0:
                                _context.prev = 0;
                                _context.next = 3;
                                return this.db.getItem(this.con1, this.db.countries);

                            case 3:
                                this.userSelect.con1Data = _context.sent;
                                _context.next = 6;
                                return this.db.getItem(this.con2, this.db.countries);

                            case 6:
                                this.userSelect.con2Data = _context.sent;


                                if (Object.keys(this.userSelect.con1Data).length != 0 && Object.keys(this.userSelect.con2Data).length != 0) {

                                    this.userSelect.con1 = this.userSelect.con1Data.currencyId;
                                    this.userSelect.con2 = this.userSelect.con2Data.currencyId;

                                    this.userSelect.con = this.userSelect.con1Data.currencyId + '_' + this.userSelect.con2Data.currencyId;
                                    this.userSelect.swarpCon = this.userSelect.con2Data.currencyId + '_' + this.userSelect.con1Data.currencyId;

                                    this.db.getByIdAndIndex(this.userSelect.con, this.db.user, 'swarpCon').then(function (con) {
                                        //console.log('got currency from db', con);
                                        // check if the currency is older than an hour 
                                        if (!_this12.checkForAnHour(con.date)) {
                                            // it is greater than an hour. do not use. try to get new
                                            //console.log('older than an hour getting new from api');
                                            // in cases of error i.e no internet, use old data.
                                            _this12.getLastestCurrency(con);
                                        } else {
                                            // currency is not greater than an hour. use the one in db
                                            //console.log('NOT older than an hour');
                                            _this12.exrate = parseFloat(con.exrate.toFixed(4));

                                            _this12.userSelect.exrate = _this12.exrate;
                                            var exe = 1 / _this12.exrate;
                                            _this12.userSelect.swarpExrate = parseFloat(exe.toFixed(4));

                                            $('#exrate').html(_this12.exrate);
                                            // show the rate box
                                            $('#exrate').parent().parent().show(2000);
                                        }
                                    }).catch(function (ercon) {
                                        //console.log('sorry currency not avaliable in db', ercon);
                                        _this12.getLastestCurrency();
                                    });
                                }

                                _context.next = 13;
                                break;

                            case 10:
                                _context.prev = 10;
                                _context.t0 = _context['catch'](0);

                                this.handleError(err);

                            case 13:
                            case 'end':
                                return _context.stop();
                        }
                    }
                }, _callee, this, [[0, 10]]);
            }));

            function getAndCalRate() {
                return _ref.apply(this, arguments);
            }

            return getAndCalRate;
        }()
    }, {
        key: 'getLastestCurrency',
        value: function getLastestCurrency() {
            var _this13 = this;

            var con = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : '';

            // show loader
            $('.marg-3').show();

            this.getRate(this.userSelect.con1, this.userSelect.con2).then(function (res) {
                $('.marg-3').hide();

                _this13.exrate = parseFloat(res.toFixed(4));

                _this13.userSelect.exrate = _this13.exrate;
                _this13.userSelect.date = new Date();
                var exe = 1 / _this13.exrate;
                _this13.userSelect.swarpExrate = parseFloat(exe.toFixed(4));

                _this13.db.addItem(_this13.userSelect, _this13.db.user).then(function (res) {
                    // regenrate the table
                    _this13.createTable();
                });

                //console.log('new user data', this.userSelect);

                $('#exrate').html(_this13.exrate);
                // show the rate box
                $('#exrate').parent().parent().show(2000);
            }).catch(function (err) {
                $('.marg-3').hide();
                // fallback. if currency exist in db but fetch failed i.e internet reasons, return old data
                if (con && con != '') {
                    _this13.exrate = parseFloat(con.exrate.toFixed(4));

                    _this13.userSelect.exrate = _this13.exrate;
                    var exe = 1 / _this13.exrate;
                    _this13.userSelect.swarpExrate = parseFloat(exe.toFixed(4));

                    $('#exrate').html(_this13.exrate);
                    // show the rate box
                    $('#exrate').parent().parent().show(2000);
                }
                _this13.handleError(err, 'Err getting Exechange Rate');
            });
        }

        /**
         * Checks if an Hour as Passed from the Date given
         * 
         * if false, no. you are good
         * 
         * if true, sorry, an hour as passed
         */

    }, {
        key: 'checkForAnHour',
        value: function checkForAnHour(myDate) {
            var ONE_HOUR = 60 * 60 * 1000;
            return new Date() - new Date(myDate) < ONE_HOUR;
        }

        /**
         * Add commas to the numbers
         * 
         * @param {Number} number 
         */

    }, {
        key: 'numberWithCommas',
        value: function numberWithCommas(number) {
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

    }, {
        key: 'calRate',
        value: function calRate(fromValue, exrate) {
            return new Promise(function (resolve, rejects) {
                var total = exrate * fromValue;
                var res = Math.round(total * 100) / 100;
                resolve(parseFloat(res.toFixed(4)));
            });
        }

        /**
         * Make an Api Request to get All the Countries
         */

    }, {
        key: 'getCountry',
        value: function getCountry() {
            var _this14 = this;

            // show the loader
            $('.marg-3').show();

            this.db.getAllItemsInATable(this.db.countries).then(function (res) {
                if (res && res.length !== 0) {
                    $('.marg-3').hide();
                    // we have items in database. return to the user
                    _this14.setSelectFields(res, 2);
                } else {
                    $('.marg-3').show();
                    // we dont have any items in the database, make http request to get one
                    _this14.getAllCountries().then(function (res) {
                        $('.marg-3').hide();
                        _this14.setSelectFields(res, 1);
                    }).catch(function (err) {
                        $('.marg-3').hide();
                        _this14.handleError(err, 'Err getting Countries');
                    });
                }
            }).catch(function (err) {
                $('.marg-3').hide();
                _this14.handleError(err, 'Err getting Items from DB');
            });
        }

        /**
         * Set the Select Input Field
         * 
         * This Populates the Select Fields with the Countries List
         * 
         * @param {Object} res JSON Object of Countries 
         * @param {Number} type Type of Input. 1 -> Object, 2 -> Array
         */

    }, {
        key: 'setSelectFields',
        value: function setSelectFields(res, type) {
            // console.log('setting fields');

            var ele = '';

            if (type === 1) {
                // we have an object type
                for (var key in res.results) {
                    if (res.results.hasOwnProperty(key)) {
                        var item = res.results[key];

                        // save in countries database
                        this.db.addItem(item, this.db.countries);

                        // save in array to add to DOM
                        ele += '<option value="' + item.id + '" data-subtext="' + item.currencyName + '">' + item.name + ' (' + item.currencyId + ')</option>';
                    }
                }
            } else {
                // we have an array type
                var _iteratorNormalCompletion = true;
                var _didIteratorError = false;
                var _iteratorError = undefined;

                try {
                    for (var _iterator = res[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
                        var _item = _step.value;


                        // save in array to add to DOM
                        ele += '<option value="' + _item.id + '" data-subtext="' + _item.currencyName + '">' + _item.name + ' (' + _item.currencyId + ')</option>';
                    }
                } catch (err) {
                    _didIteratorError = true;
                    _iteratorError = err;
                } finally {
                    try {
                        if (!_iteratorNormalCompletion && _iterator.return) {
                            _iterator.return();
                        }
                    } finally {
                        if (_didIteratorError) {
                            throw _iteratorError;
                        }
                    }
                }
            }

            $(".selectpicker").html(ele);

            $(".selectpicker").selectpicker("refresh");
        }
    }, {
        key: 'createTable',
        value: function createTable() {
            var _this15 = this;

            // check if there is entries in the database.
            this.db.getAllItemsInATable(this.db.user).then(function (res) {
                if (res && res.length != 0) {
                    $('.marg-2').show();

                    var ele = '';

                    var _iteratorNormalCompletion2 = true;
                    var _didIteratorError2 = false;
                    var _iteratorError2 = undefined;

                    try {
                        for (var _iterator2 = res[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
                            var item = _step2.value;


                            // save in array to add to DOM
                            //ele += `<option value="${item.id}" data-subtext="${item.currencyName}">${item.name} (${item.currencyId})</option>`; 
                            ele += '  \n                    <tr>\n                        <th scope="row"> ' + item.con + ' </th>\n                        <td> ' + item.con1 + ' </td>\n                        <td> ' + item.con2 + ' </td>\n                        <td> ' + item.exrate + ' </td>\n                        <td> ' + (_this15.checkForAnHour(item.date) ? 'True' : 'False') + ' </td>\n                        <td> <a href="#" class="btn btn-primary usenowBtn" \n                        data-item-con="' + item.con + '" \n                        data-item-con1="' + item.con1 + '" \n                        data-item-con2="' + item.con2 + '" \n                        data-item-exrate="' + item.exrate + '"\n                        data-item-swarpExrate="' + item.swarpExrate + '"\n                        data-item-user1symbol="' + item.con1Data.currencySymbol + '"\n                        data-item-user2symbol="' + item.con2Data.currencySymbol + '"\n                        > Use Now </a> </td>\n                    </tr>\n                    <tr>\n                        <th scope="row"> ' + item.swarpCon + ' </th>\n                        <td> ' + item.con2 + ' </td>\n                        <td> ' + item.con1 + ' </td>\n                        <td> ' + item.swarpExrate + ' </td>\n                        <td> ' + (_this15.checkForAnHour(item.date) ? 'True' : 'False') + ' </td>\n                        <td> <a href="#" class="btn btn-primary usenowBtn" \n                        data-item-con="' + item.swarpCon + '" \n                        data-item-con1="' + item.con2 + '" \n                        data-item-con2="' + item.con1 + '" \n                        data-item-exrate="' + item.swarpExrate + '"\n                        data-item-swarpExrate="' + item.exrate + '"\n                        data-item-user1symbol="' + item.con2Data.currencySymbol + '"\n                        data-item-user2symbol="' + item.con1Data.currencySymbol + '"\n                        > Use Now </a> </td>\n                    </tr>\n                    ';
                        }
                    } catch (err) {
                        _didIteratorError2 = true;
                        _iteratorError2 = err;
                    } finally {
                        try {
                            if (!_iteratorNormalCompletion2 && _iterator2.return) {
                                _iterator2.return();
                            }
                        } finally {
                            if (_didIteratorError2) {
                                throw _iteratorError2;
                            }
                        }
                    }

                    $('#tb-body').html(ele);
                } else {
                    $('.marg-2').hide();
                }
            }).catch(function (err) {
                return _this15.handleError(err);
            });
        }
    }, {
        key: 'HandleuseNowClick',
        value: function HandleuseNowClick(event) {
            // console.log('use now btn clicked', event.currentTarget.dataset);
            var data = event.currentTarget.dataset;

            this.exrate = data.itemExrate;
            this.con1 = data.itemCon1;
            this.con2 = data.itemCon2;

            this.userSelect.exrate = this.exrate;
            this.userSelect.swarpExrate = data.itemSwarpexrate;
            this.userSelect.con2Data.currencySymbol = data.itemUser2symbol;
            this.userSelect.con1Data.currencySymbol = data.itemUser1symbol;

            //console.log(this.exrate, this.con1, this.con2);
            $('#exrate').html(this.exrate);
            // show the rate box
            $('#exrate').parent().parent().show(2000);
        }
    }, {
        key: 'handleOffline',
        value: function handleOffline(event) {
            var mssg = 'Sorry, You are Offline. <br/> In Offline Mode, you only have access to currencies you have prevously selected';

            this.message('danger', mssg, 5);
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

    }, {
        key: 'message',
        value: function message(className, mssg) {
            var _this16 = this;

            var duration = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 0;


            if (!$(this.MssgBox).hasClass('alert-' + className)) {
                $(this.MssgBox).addClass('alert-' + className).html(mssg).show();
            } else {
                $(this.MssgBox).html(mssg).show();
            }

            if (duration && duration != 0) {
                var timer = setTimeout(function () {
                    $(_this16.MssgBox).removeClass('alert-' + className).html('').hide();
                }, 1000 * duration);
            }
        }

        /**
         * Handle Error Thrown in the App
         * 
         * @param {Any} err The Error. 
         * @param {String} mssg Error Message to Log Out
         */

    }, {
        key: 'handleError',
        value: function handleError(err) {
            var mssg = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : '';

            console.error(mssg, err);

            if (!navigator.onLine) {
                this.message('danger', 'Sorry try again when you are online', 2);
                if (!this.exrate) {
                    $('#exrate').html('');
                    $('#exrate').parent().parent().hide();
                }
            }
        }
    }]);

    return App;
}(ApiMain);

var app = new App();

app.init();