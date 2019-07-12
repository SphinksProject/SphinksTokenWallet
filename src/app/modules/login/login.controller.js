import nem from 'nem-sdk';

class LoginCtrl {

    /**
     * Initialize dependencies and properties
     *
     * @params {services} - Angular services to inject
     */
    constructor($localStorage, Wallet, Login, Alert, $timeout) {
        'ngInject';

        //// Module dependencies region ////

        this._storage = $localStorage;
        this._Wallet = Wallet;
        this._Login = Login;
        this._$timeout = $timeout;
        this._Alert = Alert;

        //// End dependencies region ////

        //// Module properties region ////

        // Selected wallet
        this.selectedWallet = undefined;

        // Get wallets from local storage or set an empty array
        this._storage.wallets = this._storage.wallets || [];

        // Common object to contain our password & private key data.
        this.common = nem.model.objects.get("common");

        //// End properties region ////

        // Hide trezor button if using chrome builds
        if (typeof nw !== 'undefined') this.hideTrezor = true;

        // Caps Lock tracker
        this.capsLockIsOn = false;

        //CapsLock.addListener(function(isOn){
        //  if (isOn){
        //  }
        //});
    }

    //// Module methods region ////

    /**
     * Load a wallet in browser local storage
     *
     * @param {string} data - Base 64 string from .wlt file
     * @param {boolean} isNCC - True if NCC wallet, false otherwise
     */
    loadWallet(data, isNCC) {
        this._Wallet.load(data, isNCC);
        return;
    }

    /**
     * Log into the application if no need to upgrade
     *
     * @param {object} wallet - A wallet object
     */
    login(wallet) {
        // Check if wallet needs upgrade
        if (this._Wallet.needsUpgrade(wallet)) {
            this.needsUpgrade = true;
            return;
        }

        if (this._Login.login(this.common, wallet)) {
            // Clean common object
            this.common = nem.model.objects.get("common");
        }
    }

    /**
     * Derive a child account using bip32 for each accounts of the selected wallet
     */
    upgradeWallet() {
        // Lock button
        this.okPressed = true;
        // Upgrade
        return this._Wallet.upgrade(this.common, this.selectedWallet).then(()=> {
            this._$timeout(() => {
                // Unlock button
                this.okPressed = false;
                // Clean common object
                this.common = nem.model.objects.get("common");
                // Prepare wallet download link
                this._Wallet.prepareDownload(this.selectedWallet);
                // Store base64 format for safety protocol
                this.rawWallet = this._Wallet.base64Encode(this.selectedWallet);
                //
                this.needsUpgrade = false;
                this.showSafetyMeasure = true;
            });
        },
        (err) => {
            this._$timeout(() => {
                // Unlock button
                this.okPressed = false;
                // Clean common object
                this.common = nem.model.objects.get("common");
            });
        })
    }

    keyPressed(event) {
      this._Alert.dismiss();

      //if (CapsLock.isOn()){
      //    this._Alert.warningCapsLockON();
      //}

      if (event.getModifierState("CapsLock")) {
          this.capsLockIsOn = true;
      } else {
          this.capsLockIsOn = false;
      }

      // Enter pressed - login
      if (13 == event.keyCode) {
          this.login(this.selectedWallet);
      }
    }

    //checkCapsLock(event) {
    //  if (CapsLock.isOn()){
    //      //this._Alert.warningCapsLockON();
    //  }
    //}

    //// End methods region ////

}

/*

CapsLock.js

Allows the status of the caps lock key to be determined

Created by Kate Morley - http://code.iamkate.com/ - and released under the terms
of the CC0 1.0 Universal legal code:

http://creativecommons.org/publicdomain/zero/1.0/legalcode

*/

const CapsLock = (function(){

  const IS_MAC = /Mac/.test(navigator.platform);

  let capsLock  = false;
  let listeners = [];

  // Returns whether caps lock currently appears to be on.
  function isOn(){
    return capsLock;
  }

  // Adds a listener. When a change is detected in the status of the caps lock
  // key the listener will be called with the value true if caps lock is now on
  // and false if caps lock is now off. The parameter is:
  //
  // listener - the listener
  function addListener(listener){
    listeners.push(listener);
  }

  // Handles a key press event. The parameter is:
  //
  // e - the event
  function handleKeyPress(e){

    const charCode      = e.charCode;
    const shiftKey      = e.shiftKey;
    const priorCapsLock = capsLock;

    if (charCode >= 97 && charCode <= 122){
      capsLock = shiftKey;
    }else if (charCode >= 65 && charCode <= 90 && !(shiftKey && IS_MAC)){
      capsLock = !shiftKey;
    }

    if (capsLock !== priorCapsLock){
      listeners.forEach(listener => listener(capsLock));
    }

  }

  window.addEventListener('keypress', handleKeyPress);

  return {isOn, addListener};

})();

export default LoginCtrl;
