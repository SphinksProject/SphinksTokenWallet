import nem from "nem-sdk";
import Helpers from '../utils/helpers';

class ExchangeDataCtrl {

    /**
     * Initialize dependencies and properties
     *
     * @params {services} - Angular services to inject
     */
    constructor(AppConstants, Alert, $timeout, $scope, $http) {
        'ngInject';

        //// Component dependencies region ////

        this._AppConstants = AppConstants;
        this._Alert = Alert;
        this._$timeout = $timeout;
        this._Helpers = Helpers;
        this._$http = $http;
        this._$scope = $scope;

        this.url = this._AppConstants.tis_url;

        this.isON = true;

        this._$scope.$on("$destroy", () => {
            this.isON = false;
        });

        this.refreshRatesInfo();
    }

    //// Component methods region ////

	/**
	 * Refresh market information
	 */
  	refreshRatesInfo() {
        if (!this.isON) {
            return;
        }
/*
        var req = {
          method: 'GET',
          url: 'https://api.coinmarketcap.com/v1/ticker/bitcoin/',
          headers: {
            'Content-Type': 'application/json'
          },
        }
*/
        //this._$http.get('https://api.coinmarketcap.com/v1/ticker/bitcoin/').then((res) => {
        this._$http.get(this.url + "/api/rates/btc").then((res) => {
              this._$timeout(() => {
                  //this.btc_rate = parseFloat(res.data[0].price_usd);
                  this.btc_rate = parseFloat(res.data.price_usd);
              });
            },
            (err) => {
                this._$timeout(() => {
                    this._Alert.errorGetRatesInfo();
                });
              });

        //this._$http.get('https://api.coinmarketcap.com/v1/ticker/ethereum/').then((res) => {
        this._$http.get(this.url + "/api/rates/eth").then((res) => {
              this._$timeout(() => {
                  //this.eth_rate = parseFloat(res.data[0].price_usd);
                  this.eth_rate = parseFloat(res.data.price_usd);
              });
            },
            (err) => {
                this._$timeout(() => {
                    this._Alert.errorGetRatesInfo();
                });
            });

        this._$timeout(()=>{
              this.refreshRatesInfo();
          }, 60000);

  	}

    //// End methods region ////

}

// ExchangeData config
let ExchangeData = {
    controller: ExchangeDataCtrl,
    templateUrl: 'layout/partials/exchangeData.html'
};

export default ExchangeData;
