'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

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

var App = function (_ApiMain) {
    _inherits(App, _ApiMain);

    function App() {
        _classCallCheck(this, App);

        //this.form = document.getElementById('appForm');
        var _this = _possibleConstructorReturn(this, (App.__proto__ || Object.getPrototypeOf(App)).call(this));

        _this.submitBtn = document.getElementById('submitBtn');

        _this.theInput = document.getElementById('fromValue');
        _this.theOutput = document.getElementById('toValue');

        _this.country1 = document.getElementById('con1');
        _this.country2 = document.getElementById('con2');

        _this.MssgBox = document.getElementById('MssgBox');

        // countries
        _this.con1 = '';
        _this.con2 = '';

        // convertion rate
        _this.exrate;

        // user selection
        _this.userSelect = {
            con1: '',
            con2: '',
            exrate: 0
        };
        return _this;
    }

    /**
     * Init The App
     */


    _createClass(App, [{
        key: 'init',
        value: function init() {
            // this.getMyCount();
            this.events();
            $('.selectpicker').selectpicker();
            this.getCountry();
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

            window.addEventListener('offline', this.handleOffline.bind(this));
        }

        /**
         * Executed when the user clicks on the Submit (Convert) Button
         * 
         * @param {Event} event 
         */

    }, {
        key: 'formSubmitted',
        value: function formSubmitted(event) {
            var _this2 = this;

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
            this.calRate(value, this.exrate).then(function (res) {
                // console.log('converted rate', res);
                _this2.theOutput.innerText = _this2.con2 + ' ' + res;
                $(_this2.theOutput).parent().parent().show(2000);
            }).catch(function (err) {
                return _this2.handleError(err);
            });
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
            var _this3 = this;

            if (event.target.id === 'con1') {
                this.con1 = event.target.value;
            }
            if (event.target.id === 'con2') {
                this.con2 = event.target.value;
            }

            if (this.con1 && this.con2) {
                this.getRate(this.con1, this.con2).then(function (res) {
                    _this3.exrate = res;

                    _this3.userSelect.con1 = _this3.con1;
                    _this3.userSelect.con2 = _this3.con2;
                    _this3.userSelect.exrate = res;

                    $('#exrate').html(res);
                    // show the rate box
                    $('#exrate').parent().parent().show(2000);
                }).catch(function (err) {
                    return _this3.handleError(err, 'Err getting Exechange Rate');
                });
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

    }, {
        key: 'calRate',
        value: function calRate(fromValue, exrate) {
            return new Promise(function (resolve, rejects) {
                var total = exrate * fromValue;
                resolve(Math.round(total * 100) / 100);
            });
        }

        /**
         * Make an Api Request to get All the Countries
         */

    }, {
        key: 'getCountry',
        value: function getCountry() {
            var _this4 = this;

            this.getAllCountries().then(function (res) {
                _this4.setSelectFields(res);
            }).catch(function (err) {
                return _this4.handleError(err, 'Err getting Countries');
            });
        }

        /**
         * Set the Select Input Field
         * 
         * This Populates the Select Fields with the Countries List
         * 
         * @param {Object} res JSON Object of Countries 
         */

    }, {
        key: 'setSelectFields',
        value: function setSelectFields(res) {
            // console.log('setting fields');

            var ele = '';

            for (var key in res.results) {
                if (res.results.hasOwnProperty(key)) {
                    var item = res.results[key];
                    ele += '<option value="' + item.currencyId + '" data-subtext="' + item.currencyName + '">' + item.name + ' (' + item.currencyId + ')</option>';
                }
            }

            $(".selectpicker").html(ele);

            $(".selectpicker").selectpicker("refresh");
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
            var _this5 = this;

            var duration = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 0;


            if (!$(this.MssgBox).hasClass('alert-' + className)) {
                $(this.MssgBox).addClass('alert-' + className).html(mssg).show();
            } else {
                $(this.MssgBox).html(mssg).show();
            }

            if (duration && duration != 0) {
                var timer = setTimeout(function () {
                    $(_this5.MssgBox).removeClass('alert-' + className).html('').hide();
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
        }
    }]);

    return App;
}(ApiMain);

var app = new App();

app.init();