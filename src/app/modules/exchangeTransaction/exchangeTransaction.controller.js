import nem from 'nem-sdk';
import Helpers from '../../utils/helpers';

class ExchangeTransactionCtrl {

    /**
     * Initialize dependencies and properties
     *
     * @params {services} - Angular services to inject
     */
    constructor(Wallet, Alert, DataStore, AppConstants, $timeout, $http, $filter, $scope) {
        'ngInject';

        //// Module dependencies region ////

        this._Alert = Alert;
        this._Wallet = Wallet;
        this._DataStore = DataStore;
        this._AppConstants = AppConstants;
        this._$timeout = $timeout;
        this._$http = $http;
        this._$filter = $filter;
        this._$scope = $scope;
        this._Helpers = Helpers;

        //// End dependencies region ////

        // Initialization
        this.init(null);
    }

    //// Module methods region ////

    /**
     * Initialize module properties
     */
    init(res) {
        this.okPressed = false;

        this.address = this._Wallet.currentAccount.address;
        this.btc_sender = "";
        this.eth_sender = "";
        this.url = this._AppConstants.tis_url;

        this.apiIrresponsive = true;
        this.showHistory = false;
        this.externalIP = "0.0.0.0";

        // Current page for request history pagination
        this.currentPage = 0;

        // Page size for all paginated elements
        this.pageSize = 5;

        this._$http.get(this.url + "/api/sphinks/addresses").then((res) => {
            // Enable the POST REQUEST button if the API is accessible
            this.apiIrresponsive = false;
            this.nem_sender = res.data.nem;
            this.btc_receiver = res.data.btc;
            this.eth_receiver = res.data.eth;

            this.messageType = 1;
            // Get the message types
            this.messageTypes = this.translateMessageTypes(nem.model.objects.get("messageTypes"));

            // Object to contain our password & private key data
            this.common = nem.model.objects.get("common");
            // Store the prepared transaction
            this.preparedTransaction = {};
            // Update the fee in view
            this.prepareTransaction();
         });

        if (res)
        {
            if (res.data.status === 'SUCCESS') {
                this._Alert.showRequestStatus(res.data.status + "&nbsp;-&nbsp;" + res.data.msg + ";&nbsp;" + this._$filter('translate')('EXCHANGE_ID') + ":&nbsp;" + res.data.id);
            } else {
                this._Alert.showBadRequestStatus(res.data.status + "&nbsp;-&nbsp;" + res.data.msg);
            }
        } else {
            this.isON = true;

            this._$scope.$on("$destroy", () => {
                this.isON = false;
            });

            this.getRequestHistory();
        }
    }

    getRequestHistory() {
        if (!this.isON) {
            return;
        }

        this._$http.get(this.url + "/api/sphinks/request/" + this.address).then((res) => {
            this._DataStore.token_issuance_requests = res.data;
          });

        var json = 'http://myexternalip.com/json';
        this._$http.get(json).then((res) => {
            this.externalIP = res.data.ip;
        }, function(e) {
            alert("error");
        });

        this._$timeout(()=>{
             this.getRequestHistory();
         }, 60000);
    }

    /**
     * Prepare and broadcast the transaction to the network
     */
    send() {
        // Disable send button
        this.okPressed = true;

        // Get account private key for preparation or return
        if (!this._Wallet.decrypt(this.common)) {
            return this.okPressed = false;
        }

        if(!confirm(this._$filter("translate")("EXCHANGE_WARNING"))) {
            this.okPressed = false;
            return;
        }

        // Prepare the transaction
        let entity = this.prepareTransaction();

        // Sending will be blocked if recipient is an exchange and no message set
        if (!this._Helpers.isValidForExchanges(entity)) {
            this.okPressed = false;
            this._Alert.exchangeNeedsMessage();
            return;
        }

        // Use wallet service to serialize and send
        this._Wallet.transact(this.common, entity).then(() => {
            this._$timeout(() => {
                // Enable send button
                this.okPressed = false;
                // Reset all
                this.init();
            });
        }, () => {
            this._$timeout(() => {
                // Delete private key in common
                this.common.privateKey = '';
                // Enable send button
                this.okPressed = false;
            });
        });

        var parameter = JSON.stringify({ip_address:this.externalIP,nem_address:this.address, btc_address:this.btc_sender, eth_address:this.eth_sender});
        this._$http.post(this.url + "/api/sphinks", parameter).then((res) => {
              this._$timeout(() => {
                  // Enable send button
                  this.okPressed = false;
                  // Reset all
                  this.init(res);
                  return;
              });
          }, (err) => {
              this._$timeout(() => {
                  // Enable send button
                  this.okPressed = false;
                  return;
              });
          });
    }

    /**
     * Copy the account address to clipboard
     */
    copyAddress(address) {
        var dummy = document.createElement("input");
        document.body.appendChild(dummy);
        dummy.setAttribute("id", "dummy_id");
        dummy.setAttribute('value', address);
        dummy.select();
        document.execCommand("copy");
        document.body.removeChild(dummy);
        alert("Address copied!");
    }

    copyBtcReciever() {
        this.copyAddress(this.btc_receiver);
    }

    copyEthReciever() {
        this.copyAddress(this.eth_receiver);
    }

    /**
     * Translate message types from nem-sdk
     *
     * @param {array} array - A message types array
     */
    translateMessageTypes(array) {
        array[2].name = this._$filter("translate")("GENERAL_ENCRYPTED");
        array[1].name = this._$filter("translate")("GENERAL_UNENCRYPTED");
        array[0].name = this._$filter("translate")("GENERAL_HEXADECIMAL");
        return array;
    }

    /**
     * Prepare the transaction
     */
    prepareTransaction() {
        // Create a new object to not affect the view
        let cleanTransferTransaction = nem.model.objects.get("transferTransaction");

        // Clean recipient
        cleanTransferTransaction.recipient = this.nem_sender.toUpperCase().replace(/-/g, '');

        // Check entered amount
        if(!nem.utils.helpers.isTextAmountValid(0)) {
            return this._Alert.invalidAmount();
        } else {
            // Set cleaned amount
            cleanTransferTransaction.amount = nem.utils.helpers.cleanTextAmount(0);
        }

        // If user selected encrypted message but it is a multisig tx or the recipient has no public key, it reset to unencrypted
        if(!this.recipientPublicKey && this.messageType === 2) {
            this._Alert.recipientHasNoPublicKey();
            this.messageType = 1;
        }

        // Set recipient public key
        cleanTransferTransaction.recipientPublicKey = this.recipientPublicKey;

        // Set the message
        cleanTransferTransaction.message = this.btc_sender;
        if (!cleanTransferTransaction.message) {
          cleanTransferTransaction.message = this.eth_sender;
        }
        cleanTransferTransaction.messageType = this.messageType;

        // Prepare transaction object according to transfer type
        let entity;
        cleanTransferTransaction.mosaics = null;
        // Prepare
        entity = nem.model.transactions.prepare("transferTransaction")(this.common, cleanTransferTransaction, this._Wallet.network);

        // Arrange message type if encrypted
        if(this.messageType === 2) {
            entity.message.type = this.messageType;
        }

        // Set the entity for fees in view
        this.preparedTransaction = entity;

        // Return prepared transaction
        return entity;
    }

    sendDisabled() {
        let retval =  this.apiIrresponsive || this.okPressed ||
                      (this.btc_sender && this.eth_sender) || (!this.btc_sender && !this.eth_sender) ||
                      (this._Wallet.algo !== 'trezor' && !this.common.password.length) ||
                      (this.messageType === 2 && this.recipientPublicKey.length !== 64) ||
                      false;

        return retval;
    }

    //// End methods region ////
}

export default ExchangeTransactionCtrl;
