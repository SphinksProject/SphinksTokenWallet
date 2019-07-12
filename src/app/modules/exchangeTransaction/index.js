import angular from 'angular';

// Create the module where our functionality can attach to
let exchangeTransactionModule = angular.module('app.exchangeTransaction', []);

// Include our UI-Router config settings
import ExchangeTransactionConfig from './exchangeTransaction.config';
exchangeTransactionModule.config(ExchangeTransactionConfig);

// Controllers
import ExchangeTransactionCtrl from './exchangeTransaction.controller';
exchangeTransactionModule.controller('ExchangeTransactionCtrl', ExchangeTransactionCtrl);

export default exchangeTransactionModule;
